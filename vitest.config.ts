import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

/**
 * Vitest uses this config only (see package.json). It avoids loading the full app
 * Vite stack (Start + Nitro) from vite.config.ts, which breaks Vitest 4 + Vite 8 module runner.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
  },
})
