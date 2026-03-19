import { defineNitroConfig } from 'nitro/config'

/**
 * Default production build targets the Deno server runtime.
 * Override with NITRO_PRESET (for example `node-server`) if you deploy elsewhere.
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
