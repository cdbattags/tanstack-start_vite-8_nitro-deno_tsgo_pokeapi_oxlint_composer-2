import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ABOUT_DESCRIPTION,
  APP_TITLE,
  INDEX_SEARCH_DEFAULT,
  SOURCE_REPO_URL,
  absoluteUrl,
} from '../site'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: `About · ${APP_TITLE}` },
      { name: 'description', content: ABOUT_DESCRIPTION },
      { property: 'og:title', content: `About · ${APP_TITLE}` },
      { property: 'og:description', content: ABOUT_DESCRIPTION },
      { property: 'og:url', content: absoluteUrl('/about') },
    ],
    links: [{ rel: 'canonical', href: absoluteUrl('/about') }],
  }),
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-10 sm:py-14">
      <article className="hero-panel relative overflow-hidden p-6 sm:p-10">
        <div className="relative z-[1]">
          <p className="island-kicker mb-3">How it works</p>
          <h1 className="display-title mb-6 text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-[var(--sea-ink)]">
            Built for quick lookups, not for scraping the dex
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-[var(--sea-ink-soft)]">
            The search box asks your server for matches. The server holds one flattened list of every
            named row exposed by the public API root, refreshes that snapshot on a timer, and filters in
            memory so repeat visits stay cheap for you and for PokéAPI.
          </p>

          <ul className="about-list mb-10 max-w-2xl">
            <li>
              <strong>Runtime</strong>: React 19, Vite 8, file routes, SSR-friendly shell.
            </li>
            <li>
              <strong>Server</strong>: Nitro with the Deno preset; HTTP handler for typed RPC at{' '}
              <code>/api/trpc</code>.
            </li>
            <li>
              <strong>Data</strong>: Axios on the server, Zod at the boundary, client cache for requests.
            </li>
            <li>
              <strong>Quality</strong>: Oxlint (type-aware where enabled) and native-preview{' '}
              <code>tsgo</code> for <code>pnpm typecheck</code>.
            </li>
          </ul>

          <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold">
            <Link
              to="/"
              search={INDEX_SEARCH_DEFAULT}
              className="inline-flex rounded-full bg-[color-mix(in_oklab,var(--lagoon)_24%,var(--chip-bg))] px-4 py-2 no-underline text-[var(--sea-ink)] ring-1 ring-[color-mix(in_oklab,var(--lagoon-deep)_30%,transparent)] transition hover:-translate-y-0.5"
            >
              Back to search
            </Link>
            <a
              href={SOURCE_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--lagoon-deep)] underline decoration-[color-mix(in_oklab,var(--lagoon-deep)_45%,transparent)] underline-offset-2"
            >
              Clone or fork on GitHub
            </a>
          </p>
        </div>
      </article>
    </main>
  )
}
