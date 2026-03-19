/** Runtime site origin for Nitro handlers (no Vite `import.meta` in this file). */
const FALLBACK = 'https://tstack-start.cdbattags.deno.net'

export function runtimeSiteUrl(): string {
  const raw = process.env.SITE_URL ?? process.env.VITE_SITE_URL
  if (typeof raw === 'string' && raw.length > 0) {
    return raw.replace(/\/$/, '')
  }
  return FALLBACK
}
