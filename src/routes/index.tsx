import { createFileRoute } from '@tanstack/react-router'
import { TRPCClientError } from '@trpc/client'
import { useCallback, useEffect, useId, useState } from 'react'
import { trpc } from '../integrations/trpc/react'

export const Route = createFileRoute('/')({ component: PokeSearchHome })

function PokeSearchHome() {
  const inputId = useId()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 320)
    return () => window.clearTimeout(t)
  }, [query])

  const search = trpc.pokeapi.search.useQuery(
    { q: debounced, limit: 100 },
    { enabled: debounced.length > 0 },
  )

  const hits = search.data?.hits ?? []
  const indexSize = search.data?.indexSize ?? null
  const loading = search.isFetching
  const error =
    search.error instanceof TRPCClientError
      ? search.error.message
      : search.error?.message ?? null

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setDebounced(query.trim())
    },
    [query],
  )

  return (
    <main className="page-wrap px-4 pb-12 pt-10">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,203,5,0.35),transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(204,0,0,0.12),transparent_70%)]" />
        <p className="island-kicker mb-2">Open PokéAPI</p>
        <h1 className="display-title mb-4 max-w-3xl text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          Search across every list resource
        </h1>
        <p className="mb-6 max-w-2xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Results come from the public{' '}
          <a
            href="https://pokeapi.co/"
            className="font-semibold text-[var(--lagoon-deep)] underline decoration-[rgba(50,143,151,0.35)] underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            PokéAPI
          </a>{' '}
          v2 index. The server loads all resource lists (cached for ten minutes),
          then matches your query against names, resource keys, and numeric ids.
          Data loads through{' '}
          <span className="font-semibold text-[var(--sea-ink)]">tRPC</span> and{' '}
          <span className="font-semibold text-[var(--sea-ink)]">TanStack Query</span>.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor={inputId}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]"
            >
              Query
            </label>
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try pikachu, fire, machine, berry…"
              autoComplete="off"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--sea-ink)] shadow-[0_8px_28px_rgba(30,90,72,0.06)] outline-none ring-[rgba(79,184,178,0.35)] placeholder:text-[var(--sea-ink-soft)] focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-2xl border border-[rgba(50,143,151,0.35)] bg-[rgba(79,184,178,0.2)] px-6 py-3 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.3)]"
          >
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--sea-ink-soft)]">
          {loading ? <span>Loading…</span> : null}
          {error ? <span className="text-red-700">{error}</span> : null}
          {!loading && indexSize !== null && debounced ? (
            <span>
              {hits.length} match{hits.length === 1 ? '' : 'es'} · {indexSize.toLocaleString()}{' '}
              indexed entries
            </span>
          ) : null}
        </div>
      </section>

      {hits.length > 0 ? (
        <ul className="mt-8 grid list-none gap-2 p-0 sm:grid-cols-2">
          {hits.map((hit) => (
            <li key={`${hit.resource}-${hit.url}`}>
              <a
                href={hit.url}
                target="_blank"
                rel="noreferrer"
                className="island-shell flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm no-underline transition hover:-translate-y-0.5"
              >
                <span className="min-w-0 font-medium text-[var(--sea-ink)]">
                  <span className="block truncate">{hit.label}</span>
                  <span className="mt-0.5 block text-xs font-normal text-[var(--sea-ink-soft)]">
                    {hit.resource.replace(/-/g, ' ')}
                  </span>
                </span>
                <span
                  className="shrink-0 rounded-full bg-[rgba(79,184,178,0.15)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--lagoon-deep)]"
                  aria-hidden
                >
                  API
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && debounced && hits.length === 0 && !error ? (
        <p className="mt-8 text-center text-sm text-[var(--sea-ink-soft)]">
          No results for &ldquo;{debounced}&rdquo;. Try another name, resource type, or id.
        </p>
      ) : null}
    </main>
  )
}
