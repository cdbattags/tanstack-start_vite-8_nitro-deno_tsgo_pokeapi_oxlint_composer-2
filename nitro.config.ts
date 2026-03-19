import { defineNitroConfig } from 'nitro/config'

/**
 * Default production build targets the Deno server runtime (`.output/server/index.mjs`, `pnpm start:deno`).
 * For Deno Deploy, build with `pnpm build:deno-deploy` (preset `deno_deploy`, entry `.output/server/index.ts`).
 * Override with NITRO_PRESET (for example `node-server`) for Node hosting.
 */
export default defineNitroConfig({
  preset: process.env.NITRO_PRESET ?? 'deno_server',
  handlers: [
    {
      route: '/api/trpc/**',
      handler: './routes/api/trpc/[...path].ts',
    },
  ],
})
