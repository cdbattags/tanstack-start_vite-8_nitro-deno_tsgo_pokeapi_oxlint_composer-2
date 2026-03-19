import { defineHandler } from 'nitro/h3'
import { runtimeSiteUrl } from './_site-url'

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default defineHandler(() => {
  const base = runtimeSiteUrl()
  const entries: { path: string; priority: string }[] = [
    { path: '/', priority: '1.0' },
    { path: '/about', priority: '0.8' },
  ]
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(({ path, priority }) => {
    const loc = path === '/' ? base : `${base}${path}`
    return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  })
  .join('\n')}
</urlset>
`
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})
