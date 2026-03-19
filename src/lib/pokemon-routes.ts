/** When true, search hits link to our `/pokemon/$slug` page instead of the raw API URL. */
export function pokemonDetailSlugFromHit(hit: { resource: string; url: string }): string | null {
  if (hit.resource !== 'pokemon') return null
  try {
    const u = new URL(hit.url)
    const parts = u.pathname.replace(/\/$/, '').split('/').filter(Boolean)
    const last = parts[parts.length - 1]
    if (!last || last === 'pokemon') return null
    if (!/^[\w-]+$/i.test(last)) return null
    return last
  } catch {
    return null
  }
}
