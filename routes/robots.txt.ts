import { defineHandler } from 'nitro/h3'
import { runtimeSiteUrl } from './_site-url'

export default defineHandler(() => {
  const base = runtimeSiteUrl()
  const body = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

Sitemap: ${base}/sitemap.xml
`
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})
