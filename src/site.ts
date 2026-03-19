/** Default search params for the home route (required on typed `<Link to="/">`). */
export const INDEX_SEARCH_DEFAULT = { q: '', resource: '' } as const

/** `theme-color` meta for light / dark (PWA chrome, some browsers). */
export const THEME_COLOR_LIGHT = '#1a4a52'
export const THEME_COLOR_DARK = '#070b10'

/**
 * Canonical origin for absolute URLs (OG, canonical links, sitemap).
 * Prefer `SITE_URL` at runtime on the server, or `VITE_SITE_URL` at build time.
 */
const SITE_URL_FALLBACK = 'https://tstack-start.cdbattags.deno.net'

/** Source repository for this app. */
export const SOURCE_REPO_URL =
  'https://github.com/cdbattags/tanstack-start_vite-8_nitro-deno_tsgo_pokeapi_oxlint_composer-2'

/** Short product name shown in the shell. */
export const APP_NAME = 'Index'

/** Browser tab / OG title (no framework branding). */
export const APP_TITLE = `${APP_NAME} · PokéAPI search`

/** Meta description for head tags. */
export const APP_DESCRIPTION =
  'Search names and ids across every public PokéAPI v2 list. Fast server-side index, optional resource filter, and keyboard-friendly lookup.'

/** Longer blurb for `llms.txt` and similar. */
export const APP_LLM_SUMMARY =
  'Unofficial web app: search every public PokéAPI v2 resource list from one place, with optional filters and Pokémon detail pages backed by the same public API. Not affiliated with Nintendo, Game Freak, or The Pokémon Company.'

/** About page meta description. */
export const ABOUT_DESCRIPTION =
  'How this PokéAPI search app works: Nitro on Deno, TanStack Start, tRPC, cached server-side index, and fair-use caching.'

export function getSiteUrl(): string {
  if (
    typeof process !== 'undefined' &&
    typeof process.env?.SITE_URL === 'string' &&
    process.env.SITE_URL.length > 0
  ) {
    return process.env.SITE_URL.replace(/\/$/, '')
  }
  const v = import.meta.env.VITE_SITE_URL
  if (typeof v === 'string' && v.length > 0) {
    return v.replace(/\/$/, '')
  }
  return SITE_URL_FALLBACK
}

/** Absolute URL for a path (e.g. `/about`). */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  if (!path || path === '/') {
    return base
  }
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
