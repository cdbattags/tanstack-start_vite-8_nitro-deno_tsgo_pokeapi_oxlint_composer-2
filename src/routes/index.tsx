import { createFileRoute, Link } from '@tanstack/react-router'
import { TRPCClientError } from '@trpc/client'
import { FileJson, Link2, Loader2, Sparkles, Star } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { trpc } from '../integrations/trpc/react'
import { pokemonDetailSlugFromHit } from '../lib/pokemon-routes'

const RECENTS_KEY = 'pokeapi-search-recents'
const RECENTS_MAX = 8
const FAVORITES_KEY = 'pokeapi-favorites'
const FAVORITES_MAX = 14

const SUGGESTED = ['pikachu', 'dragon', 'berry', 'machine', 'kanto', 'legendary'] as const

const QUICK_SCOPES = ['pokemon', 'item', 'move', 'ability', 'type'] as const

export const Route = createFileRoute('/')({
  validateSearch: (raw: Record<string, unknown>) => ({
    q: typeof raw.q === 'string' ? raw.q.trim().slice(0, 120) : '',
    resource: typeof raw.resource === 'string' ? raw.resource.trim().slice(0, 64) : '',
  }),
  component: PokeSearchHome,
})

type FavoriteRow = { resource: string; label: string; url: string }

function loadRecents(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string').slice(0, RECENTS_MAX)
  } catch {
    return []
  }
}

function saveRecents(next: string[]) {
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next.slice(0, RECENTS_MAX)))
  } catch {
    /* ignore quota */
  }
}

function isFavoriteRow(x: unknown): x is FavoriteRow {
  if (typeof x !== 'object' || x === null) return false
  if (!('resource' in x && 'label' in x && 'url' in x)) return false
  return (
    typeof (x as { resource: unknown }).resource === 'string' &&
    typeof (x as { label: unknown }).label === 'string' &&
    typeof (x as { url: unknown }).url === 'string'
  )
}

function loadFavorites(): FavoriteRow[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isFavoriteRow).slice(0, FAVORITES_MAX)
  } catch {
    return []
  }
}

function saveFavorites(rows: FavoriteRow[]) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(rows.slice(0, FAVORITES_MAX)))
  } catch {
    /* ignore */
  }
}

function favKey(row: FavoriteRow) {
  return `${row.resource}\0${row.url}`
}

type HitRowStyle = React.CSSProperties & { '--hit-accent'?: string }

function resourceAccent(resource: string): HitRowStyle {
  let h = 0
  for (let i = 0; i < resource.length; i++) {
    h = Math.imul(31, h) + resource.charCodeAt(i)
  }
  const hue = Math.abs(h) % 360
  return { '--hit-accent': `hsl(${hue} 52% 46%)` }
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M9 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="m13.2 13.2 3.8 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ResultSkeleton({ i }: { i: number }) {
  return (
    <li
      className="hit-row hit-row--skeleton flex overflow-hidden rounded-2xl"
      style={{ animationDelay: `${i * 55}ms` }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-4">
        <span className="skeleton-line h-4 w-[min(72%,14rem)] rounded-md" />
        <span className="skeleton-line h-3 w-24 rounded-md opacity-80" />
      </div>
      <div className="w-16 shrink-0 border-l border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,transparent)]" />
    </li>
  )
}

function PokeSearchHome() {
  const inputId = useId()
  const selectId = useId()
  const statusId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = Route.useNavigate()

  const { q: urlQ, resource: urlResource } = Route.useSearch()
  const [query, setQuery] = useState(urlQ)
  const [debounced, setDebounced] = useState(() => urlQ.trim())
  const [resource, setResource] = useState(urlResource)
  const [recents, setRecents] = useState<string[]>([])
  const [favorites, setFavorites] = useState<FavoriteRow[]>([])
  const [copiedHitKey, setCopiedHitKey] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [exportCopied, setExportCopied] = useState(false)

  useEffect(() => {
    setQuery(urlQ)
    setDebounced(urlQ.trim())
  }, [urlQ])

  useEffect(() => {
    setResource(urlResource)
  }, [urlResource])

  useEffect(() => {
    setRecents(loadRecents())
    setFavorites(loadFavorites())
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 320)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => {
    const next: { q?: string; resource?: string } = {}
    if (debounced) next.q = debounced
    if (resource) next.resource = resource
    void navigate({
      search: next as unknown as { q: string; resource: string },
      replace: true,
    })
  }, [debounced, resource, navigate])

  const typesQuery = trpc.pokeapi.resourceTypes.useQuery()

  const search = trpc.pokeapi.search.useQuery(
    {
      q: debounced,
      limit: 100,
      resource: resource || undefined,
    },
    { enabled: debounced.length > 0 },
  )

  const hits = search.data?.hits ?? []
  const indexSize = search.data?.indexSize ?? null
  const loading = search.isFetching
  const error =
    search.error instanceof TRPCClientError
      ? search.error.message
      : search.error?.message ?? null

  const favoriteSet = useMemo(() => new Set(favorites.map(favKey)), [favorites])

  const pushRecent = useCallback((term: string) => {
    const t = term.trim()
    if (t.length < 2) return
    setRecents((prev) => {
      const without = prev.filter((x) => x.toLowerCase() !== t.toLowerCase())
      const next = [t, ...without].slice(0, RECENTS_MAX)
      saveRecents(next)
      return next
    })
  }, [])

  const toggleFavorite = useCallback((row: FavoriteRow) => {
    setFavorites((prev) => {
      const key = favKey(row)
      const exists = prev.some((p) => favKey(p) === key)
      const next = exists ? prev.filter((p) => favKey(p) !== key) : [row, ...prev].slice(0, FAVORITES_MAX)
      saveFavorites(next)
      return next
    })
  }, [])

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const next = query.trim()
      setDebounced(next)
      pushRecent(next)
    },
    [query, pushRecent],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      const el = document.activeElement
      const tag = el?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el?.getAttribute('contenteditable') === 'true'
      ) {
        return
      }
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!copiedHitKey) return
    const t = window.setTimeout(() => setCopiedHitKey(null), 2000)
    return () => window.clearTimeout(t)
  }, [copiedHitKey])

  useEffect(() => {
    if (!shareCopied) return
    const t = window.setTimeout(() => setShareCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [shareCopied])

  useEffect(() => {
    if (!exportCopied) return
    const t = window.setTimeout(() => setExportCopied(false), 2200)
    return () => window.clearTimeout(t)
  }, [exportCopied])

  const copyHitLink = useCallback(async (text: string, hitKey: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedHitKey(hitKey)
    } catch {
      setCopiedHitKey(null)
    }
  }, [])

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareCopied(true)
    } catch {
      setShareCopied(false)
    }
  }, [])

  const copyHitsJson = useCallback(async () => {
    const rows = search.data?.hits ?? []
    if (rows.length === 0) return
    const payload = {
      query: debounced,
      resource: resource || null,
      exportedAt: new Date().toISOString(),
      count: rows.length,
      hits: rows.slice(0, 120),
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      setExportCopied(true)
    } catch {
      setExportCopied(false)
    }
  }, [debounced, resource, search.data])

  const applySuggestion = useCallback(
    (term: string) => {
      setQuery(term)
      setDebounced(term.trim())
      pushRecent(term.trim())
    },
    [pushRecent],
  )

  const listCount = typesQuery.data?.length ?? null
  const showSkeleton = debounced.length > 0 && loading
  const showEmpty = !loading && debounced && hits.length === 0 && !error

  return (
    <main className="page-wrap px-4 pb-16 pt-8 sm:pt-12">
      <section className="hero-panel rise-in relative overflow-hidden px-6 py-10 sm:px-11 sm:py-12">
        <div className="relative z-[1]">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="island-kicker m-0">PokéAPI v2 · merged lists</p>
            {listCount !== null && !typesQuery.isError ? (
              <span className="glass-stat">{listCount} resource lists</span>
            ) : null}
            {debounced ? (
              <>
                <button
                  type="button"
                  onClick={() => void copyShareLink()}
                  className="share-chip inline-flex items-center gap-1.5"
                >
                  <Link2 className="h-3.5 w-3.5 opacity-80" aria-hidden />
                  {shareCopied ? 'Link copied' : 'Copy link'}
                </button>
                {!showSkeleton && hits.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => void copyHitsJson()}
                    className="share-chip inline-flex items-center gap-1.5"
                  >
                    <FileJson className="h-3.5 w-3.5 opacity-80" aria-hidden />
                    {exportCopied ? 'JSON copied' : 'Export JSON'}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>

          <h1 className="display-title mb-4 max-w-2xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.12] text-[var(--sea-ink)]">
            One search across every catalog endpoint
          </h1>
          <p className="mb-8 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--sea-ink-soft)] sm:text-base">
            The server warms a single in-memory index from{' '}
            <a
              href="https://pokeapi.co/"
              className="font-semibold text-[var(--lagoon-deep)] underline decoration-[color-mix(in_oklab,var(--lagoon-deep)_40%,transparent)] underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              pokeapi.co
            </a>
            , keeps it fresh for ten minutes, then matches names, list keys, and numeric ids. Your
            browser only talks to this app; the heavy lifting stays on the host.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor={inputId}
                  className="mb-2 block text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]"
                >
                  Search{' '}
                  <span className="font-semibold normal-case tracking-normal text-[var(--sea-ink-soft)] opacity-75">
                    · press / · Esc clears
                  </span>
                </label>
                <span className="input-shell">
                  <SearchGlyph />
                  <input
                    ref={inputRef}
                    id={inputId}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Escape') return
                      e.preventDefault()
                      setQuery('')
                      setDebounced('')
                    }}
                    placeholder="Pikachu, ability, berry, 25…"
                    autoComplete="off"
                    className="input-field"
                  />
                </span>
              </div>
              <div className="min-w-0 lg:w-52">
                <label
                  htmlFor={selectId}
                  className="mb-2 block text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]"
                >
                  Scope
                </label>
                <select
                  id={selectId}
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  disabled={typesQuery.isLoading}
                  className="select-field"
                >
                  <option value="">All lists</option>
                  {(typesQuery.data ?? []).map((r) => (
                    <option key={r} value={r}>
                      {r.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary shrink-0 self-stretch lg:self-end lg:px-8">
                Run
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="m-0 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                Quick scope
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SCOPES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`scope-chip ${resource === key ? 'is-active' : ''}`}
                    onClick={() => setResource(resource === key ? '' : key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {!debounced ? (
              <div className="flex flex-col gap-2">
                <p className="m-0 inline-flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" aria-hidden />
                  Try
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="suggest-chip"
                      onClick={() => applySuggestion(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {recents.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="m-0 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                  Recent
                </p>
                <div className="flex flex-wrap gap-2">
                  {recents.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3.5 py-1.5 text-xs font-bold text-[var(--sea-ink)] transition hover:border-[color-mix(in_oklab,var(--lagoon-deep)_40%,var(--chip-line))]"
                      onClick={() => applySuggestion(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </form>

          <div
            id={statusId}
            className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-[var(--sea-ink-soft)]"
            aria-live="polite"
          >
            {typesQuery.isError ? <span className="text-danger">Could not load list names.</span> : null}
            {loading && debounced ? (
              <span className="inline-flex items-center gap-2 text-[var(--lagoon-deep)]">
                <Loader2 className="motion-spinner h-4 w-4 animate-spin" aria-hidden />
                Fetching matches…
              </span>
            ) : null}
            {error ? <span className="text-danger">{error}</span> : null}
            {!loading && indexSize !== null && debounced ? (
              <span>
                {hits.length} hit{hits.length === 1 ? '' : 's'} · {indexSize.toLocaleString()} rows in
                index
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {favorites.length > 0 ? (
        <section className="mt-8" aria-label="Saved favorites">
          <p className="mb-2 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
            Saved
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {favorites.map((f) => (
              <li key={favKey(f)}>
                <div className="fav-pill flex items-stretch overflow-hidden rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_92%,transparent)]">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex max-w-[14rem] items-center truncate px-3 py-2 text-xs font-semibold text-[var(--sea-ink)] no-underline hover:bg-[var(--link-bg-hover)]"
                  >
                    {f.label}
                  </a>
                  <button
                    type="button"
                    className="border-l border-[var(--line)] px-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-amber-600"
                    aria-label={`Remove ${f.label} from saved`}
                    onClick={() => toggleFavorite(f)}
                  >
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showSkeleton ? (
        <ul className="mt-10 grid list-none gap-3 p-0 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ResultSkeleton key={i} i={i} />
          ))}
        </ul>
      ) : null}

      {!showSkeleton && hits.length > 0 ? (
        <ul className="mt-10 grid list-none gap-3 p-0 sm:grid-cols-2">
          {hits.map((hit, i) => {
            const row: FavoriteRow = {
              resource: hit.resource,
              label: hit.label,
              url: hit.url,
            }
            const isFav = favoriteSet.has(favKey(row))
            const pokeSlug = pokemonDetailSlugFromHit(hit)
            const hitCopyKey = `${hit.resource}\0${hit.url}`
            const primaryClassName =
              'flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3.5 text-sm no-underline'
            const primaryInner = (
              <>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-[var(--sea-ink)]">{hit.label}</span>
                  <span className="mt-0.5 block text-xs font-medium capitalize text-[var(--sea-ink-soft)]">
                    {hit.resource.replace(/-/g, ' ')}
                  </span>
                </span>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider"
                  style={{
                    background: 'color-mix(in oklab, var(--hit-accent, var(--lagoon)) 22%, transparent)',
                    color: 'var(--sea-ink)',
                  }}
                  aria-hidden
                >
                  {pokeSlug ? 'View' : 'Open'}
                </span>
              </>
            )
            return (
              <li
                key={`${hit.resource}-${hit.url}`}
                className="hit-stagger"
                style={{ animationDelay: `calc(var(--stagger-base, 35ms) * ${i})` }}
              >
                <div
                  className="hit-row flex items-stretch gap-0 overflow-hidden rounded-2xl"
                  style={resourceAccent(hit.resource)}
                >
                  {pokeSlug ? (
                    <Link to="/pokemon/$slug" params={{ slug: pokeSlug }} className={primaryClassName}>
                      {primaryInner}
                    </Link>
                  ) : (
                    <a href={hit.url} target="_blank" rel="noreferrer" className={primaryClassName}>
                      {primaryInner}
                    </a>
                  )}
                  <button
                    type="button"
                    className="fav-toggle border-l border-[var(--line)] px-2.5 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)]"
                    aria-label={isFav ? `Remove ${hit.label} from saved` : `Save ${hit.label}`}
                    onClick={() => toggleFavorite(row)}
                  >
                    <Star
                      className={`h-4 w-4 ${isFav ? 'fill-amber-400 text-amber-500' : 'text-[var(--sea-ink-soft)]'}`}
                      strokeWidth={isFav ? 0 : 2}
                      aria-hidden
                    />
                  </button>
                  <button
                    type="button"
                    className="border-l border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_90%,transparent)] px-3.5 text-xs font-bold text-[var(--lagoon-deep)] transition hover:bg-[var(--link-bg-hover)]"
                    onClick={() => {
                      const text =
                        pokeSlug != null
                          ? new URL(`/pokemon/${pokeSlug}`, window.location.href).href
                          : hit.url
                      void copyHitLink(text, hitCopyKey)
                    }}
                    aria-label={`Copy URL for ${hit.label}`}
                  >
                    {copiedHitKey === hitCopyKey ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}

      {showEmpty ? (
        <div className="empty-state mt-12 rounded-2xl border border-dashed border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_55%,transparent)] px-6 py-10 text-center">
          <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">No matches</p>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Nothing for &ldquo;{debounced}&rdquo;. Widen scope to all lists or try another term from{' '}
            <span className="font-medium text-[var(--sea-ink)]">Try</span> above.
          </p>
        </div>
      ) : null}
    </main>
  )
}
