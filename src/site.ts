/** Default search params for the home route (required on typed `<Link to="/">`). */
export const INDEX_SEARCH_DEFAULT = { q: '', resource: '' } as const

/** `theme-color` meta for light / dark (PWA chrome, some browsers). */
export const THEME_COLOR_LIGHT = '#1a4a52'
export const THEME_COLOR_DARK = '#070b10'

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
