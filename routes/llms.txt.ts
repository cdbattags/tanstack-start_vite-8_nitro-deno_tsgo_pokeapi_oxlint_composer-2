import { defineHandler } from 'nitro/h3'
import { APP_LLM_SUMMARY, APP_TITLE, SOURCE_REPO_URL } from '../src/site'
import { runtimeSiteUrl } from './_site-url'

export default defineHandler(() => {
  const base = runtimeSiteUrl()
  const body = `# ${APP_TITLE}

${APP_LLM_SUMMARY}

## Key URLs
- ${base}/ — main search (query params: q, resource)
- ${base}/about — stack and data flow
- ${base}/pokemon/{slug} — Pokémon detail (slug: species name or numeric id)

## Machine API
- ${base}/api/trpc — tRPC HTTP endpoint used by the SPA

## Source
- ${SOURCE_REPO_URL}
`
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
})
