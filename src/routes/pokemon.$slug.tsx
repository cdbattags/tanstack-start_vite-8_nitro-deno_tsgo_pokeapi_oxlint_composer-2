import { createFileRoute, Link } from '@tanstack/react-router'
import { isTRPCClientError, TRPCClientError } from '@trpc/client'
import { ExternalLink, ImageOff } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { trpc } from '../integrations/trpc/react'
import { APP_TITLE } from '../site'

const TYPE_HEX: Record<string, string> = {
  normal: '#a8a878',
  fire: '#f08030',
  water: '#6890f0',
  electric: '#f8d030',
  grass: '#78c850',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
}

function typePillStyle(name: string): CSSProperties {
  const hex = TYPE_HEX[name.toLowerCase()] ?? '#6b7280'
  return {
    background: `color-mix(in oklab, ${hex} 42%, var(--chip-bg))`,
    borderColor: `color-mix(in oklab, ${hex} 65%, var(--line))`,
    color: 'var(--sea-ink)',
  }
}

function formatStatName(raw: string): string {
  return raw
    .split('-')
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(' ')
}

export const Route = createFileRoute('/pokemon/$slug')({
  head: ({ params }) => {
    const slug = params.slug
    const label = slug.replace(/-/g, ' ')
    const title = label.length ? label.slice(0, 1).toUpperCase() + label.slice(1) : slug
    return {
      meta: [
        { title: `${title} · Pokémon · ${APP_TITLE}` },
        {
          name: 'description',
          content: `Sprites, types, stats, and Pokédex flavor text for ${title} from the public PokéAPI.`,
        },
      ],
    }
  },
  component: PokemonDetailPage,
})

type SpriteKey = 'official' | 'front' | 'shiny' | 'dream' | 'home'

const SPRITE_ORDER: SpriteKey[] = ['official', 'home', 'front', 'dream', 'shiny']

const SPRITE_LABEL: Record<SpriteKey, string> = {
  official: 'Artwork',
  home: 'Home',
  front: 'Sprite',
  shiny: 'Shiny',
  dream: 'Dream world',
}

function PokemonDetailPage() {
  const { slug } = Route.useParams()
  const q = trpc.pokeapi.pokemonDetail.useQuery(slug, { retry: false })

  const detail = q.data
  const notFound = q.isError && isTRPCClientError(q.error) && q.error.data?.code === 'NOT_FOUND'

  const gallery = useMemo(() => {
    if (!detail) return [] as { key: SpriteKey; label: string; url: string }[]
    return SPRITE_ORDER.map((key) => {
      const url = detail.sprites[key]
      return url ? { key, label: SPRITE_LABEL[key], url } : null
    }).filter((x): x is { key: SpriteKey; label: string; url: string } => x !== null)
  }, [detail])

  const [activeSprite, setActiveSprite] = useState<SpriteKey | null>(null)

  const defaultSpriteKey = useMemo(() => {
    if (!detail) return null
    for (const key of SPRITE_ORDER) {
      if (detail.sprites[key]) return key
    }
    return null
  }, [detail])

  const currentSpriteKey =
    detail && activeSprite && detail.sprites[activeSprite] ? activeSprite : defaultSpriteKey

  const mainSrc = useMemo(() => {
    if (!detail) return null
    if (currentSpriteKey) return detail.sprites[currentSpriteKey]
    return null
  }, [detail, currentSpriteKey])

  if (q.isPending) {
    return (
      <main className="page-wrap px-4 pb-20 pt-8">
        <div className="poke-detail-skeleton hero-panel rounded-3xl p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
            <div className="skeleton-line mx-auto aspect-square w-full max-w-[min(100%,320px)] rounded-3xl" />
            <div className="flex flex-col gap-4">
              <div className="skeleton-line h-10 w-48 rounded-lg" />
              <div className="skeleton-line h-4 w-full max-w-md rounded-md" />
              <div className="skeleton-line h-4 w-full max-w-lg rounded-md" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (q.isError && !notFound) {
    return (
      <main className="page-wrap px-4 pb-20 pt-10">
        <div className="empty-state rounded-3xl px-8 py-14 text-center">
          <p className="m-0 text-lg font-semibold text-[var(--sea-ink)]">Could not load this Pokémon</p>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            {q.error instanceof TRPCClientError ? q.error.message : 'Something went wrong. Try again.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn-primary"
              onClick={() => void q.refetch()}
            >
              Retry
            </button>
            <Link
              to="/"
              search={{ q: '', resource: '' }}
              className="inline-flex items-center rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2.5 text-sm font-bold text-[var(--sea-ink)] no-underline"
            >
              Back to search
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !detail) {
    return (
      <main className="page-wrap px-4 pb-20 pt-10">
        <div className="empty-state rounded-3xl px-8 py-14 text-center">
          <ImageOff className="mx-auto mb-4 h-14 w-14 text-[var(--sea-ink-soft)]" aria-hidden />
          <p className="m-0 text-lg font-semibold text-[var(--sea-ink)]">No Pokémon at &ldquo;{slug}&rdquo;</p>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Try a National Dex number or species name from the search page.
          </p>
          <Link
            to="/"
            search={{ q: '', resource: '' }}
            className="mt-6 inline-flex rounded-full bg-[color-mix(in_oklab,var(--lagoon)_24%,var(--chip-bg))] px-5 py-2.5 text-sm font-bold text-[var(--sea-ink)] no-underline ring-1 ring-[color-mix(in_oklab,var(--lagoon-deep)_30%,transparent)]"
          >
            Back to search
          </Link>
        </div>
      </main>
    )
  }

  const maxStat = Math.max(...detail.stats.map((s) => s.base), 1)

  return (
    <main className="page-wrap px-4 pb-20 pt-8 sm:pt-10">
      <nav className="mb-6 text-sm font-semibold text-[var(--sea-ink-soft)]">
        <Link to="/" search={{ q: '', resource: '' }} className="text-[var(--lagoon-deep)] no-underline hover:underline">
          Search
        </Link>
        <span className="mx-2 opacity-50" aria-hidden>
          /
        </span>
        <span className="text-[var(--sea-ink)]">Pokémon</span>
        <span className="mx-2 opacity-50" aria-hidden>
          /
        </span>
        <span className="text-[var(--sea-ink)]">{detail.displayName}</span>
      </nav>

      <article className="hero-panel overflow-hidden rounded-3xl">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
          <div className="flex flex-col items-center gap-4 lg:sticky lg:top-24">
            <div className="relative w-full max-w-[320px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_90%,black)] p-4 shadow-[0_24px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_56px_rgba(0,0,0,0.45)]">
              {mainSrc ? (
                <img
                  src={mainSrc}
                  alt={`${detail.displayName} artwork`}
                  className="mx-auto h-auto w-full max-h-[min(52vh,360px)] object-contain"
                  width={320}
                  height={320}
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 text-[var(--sea-ink-soft)]">
                  <ImageOff className="h-12 w-12" aria-hidden />
                  <span className="text-sm font-medium">No artwork in API</span>
                </div>
              )}
            </div>

            {gallery.length > 1 ? (
              <div className="flex w-full max-w-[320px] flex-wrap justify-center gap-2">
                {gallery.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide transition ${
                      currentSpriteKey === g.key
                        ? 'border-[var(--lagoon-deep)] bg-[color-mix(in_oklab,var(--lagoon)_22%,var(--chip-bg))]'
                        : 'border-[var(--line)] bg-[var(--chip-bg)] opacity-90 hover:opacity-100'
                    }`}
                    onClick={() => setActiveSprite(g.key)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="island-kicker m-0">#{detail.id}</span>
              {detail.types.map((t) => (
                <span
                  key={`${t.slot}-${t.name}`}
                  className="poke-type-pill rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide"
                  style={typePillStyle(t.name)}
                >
                  {t.name}
                </span>
              ))}
            </div>

            <h1 className="display-title m-0 text-[clamp(2rem,5vw,3rem)] font-semibold text-[var(--sea-ink)]">
              {detail.displayName}
            </h1>

            {detail.species.genus ? (
              <p className="mt-2 text-lg font-medium text-[var(--lagoon-deep)]">{detail.species.genus}</p>
            ) : null}

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--sea-ink-soft)]">
              <div>
                <dt className="font-extrabold uppercase tracking-wider text-[0.65rem] text-[var(--sea-ink-soft)]">
                  Height
                </dt>
                <dd className="m-0 font-semibold text-[var(--sea-ink)]">{detail.heightM.toFixed(1)} m</dd>
              </div>
              <div>
                <dt className="font-extrabold uppercase tracking-wider text-[0.65rem] text-[var(--sea-ink-soft)]">
                  Weight
                </dt>
                <dd className="m-0 font-semibold text-[var(--sea-ink)]">{detail.weightKg.toFixed(1)} kg</dd>
              </div>
              {detail.species.color ? (
                <div>
                  <dt className="font-extrabold uppercase tracking-wider text-[0.65rem] text-[var(--sea-ink-soft)]">
                    Color
                  </dt>
                  <dd className="m-0 font-semibold capitalize text-[var(--sea-ink)]">{detail.species.color}</dd>
                </div>
              ) : null}
              {detail.species.habitat ? (
                <div>
                  <dt className="font-extrabold uppercase tracking-wider text-[0.65rem] text-[var(--sea-ink-soft)]">
                    Habitat
                  </dt>
                  <dd className="m-0 font-semibold capitalize text-[var(--sea-ink)]">
                    {detail.species.habitat.replace(/-/g, ' ')}
                  </dd>
                </div>
              ) : null}
            </dl>

            {detail.species.flavorText ? (
              <blockquote className="mt-6 border-l-4 border-[color-mix(in_oklab,var(--lagoon)_55%,transparent)] pl-4 text-base italic leading-relaxed text-[var(--sea-ink-soft)]">
                {detail.species.flavorText}
              </blockquote>
            ) : null}

            <section className="mt-8" aria-labelledby="abilities-heading">
              <h2 id="abilities-heading" className="island-kicker mb-3">
                Abilities
              </h2>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {detail.abilities.map((a) => (
                  <li
                    key={`${a.name}-${a.hidden}`}
                    className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 text-sm font-semibold capitalize text-[var(--sea-ink)]"
                  >
                    {a.name.replace(/-/g, ' ')}
                    {a.hidden ? (
                      <span className="ml-1.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                        (hidden)
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8" aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="island-kicker mb-4">
                Base stats
              </h2>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {detail.stats.map((s) => (
                  <li key={s.name} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-36 shrink-0 text-xs font-bold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                      {formatStatName(s.name)}
                    </span>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="poke-stat-track h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--line)_55%,transparent)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--btn-primary-from)] to-[var(--btn-primary-to)]"
                          style={{ width: `${Math.min(100, Math.round((s.base / maxStat) * 100))}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm font-bold tabular-nums text-[var(--sea-ink)]">
                        {s.base}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/"
                search={{ q: detail.name, resource: 'pokemon' }}
                className="btn-primary inline-flex no-underline"
              >
                Search similar
              </Link>
              <a
                href={detail.apiUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2.5 text-sm font-bold text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Raw PokéAPI JSON
              </a>
            </div>
          </div>
        </div>
      </article>
    </main>
  )
}
