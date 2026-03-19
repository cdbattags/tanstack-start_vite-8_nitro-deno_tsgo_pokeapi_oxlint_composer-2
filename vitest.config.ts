import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

/**
 * Vitest uses this config only (see package.json). It avoids loading TanStack Start
 * and Nitro from vite.config.ts, which breaks under Vitest 4 + Vite 8 module runner.
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
