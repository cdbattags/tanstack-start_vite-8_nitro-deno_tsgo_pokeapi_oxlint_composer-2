# PokéAPI search

The home page loads data with **TanStack Query** and **tRPC** (`pokeapi.search`):

1. The browser calls `/api/trpc` (Nitro route in `routes/api/trpc/[...path].ts`, registered in `nitro.config.ts`).
2. The tRPC router lives under `src/trpc/` and delegates to `runPokeSearch` in `src/server/poke-search-service.ts`.
3. That service uses a small **Axios** client (`src/server/pokeapi-client.ts`) for PokéAPI HTTP.
4. It reads the [PokéAPI](https://pokeapi.co/) v2 root document, fetches each list with a high `limit`, caches the flattened index for ten minutes, then filters by name, resource key, or numeric id in the URL.

Fair use: cache keeps traffic low after the first warm-up. See [PokéAPI fair use](https://pokeapi.co/docs/v2#information).

The React tree is wrapped in `TrpcProvider` (`src/integrations/trpc/react.tsx`), which creates the tRPC client and `QueryClient`.

# Nitro and Deno

`nitro.config.ts` sets the default Nitro preset to the Deno server runtime (`deno_server` / `deno-server`).

- **Develop**: `pnpm dev` (Vite; Node).
- **Build**: `pnpm build` produces `.output/server/index.mjs` for Deno.
- **Run (Deno)**: install [Deno](https://deno.com/), then `pnpm start:deno`.

To emit a Node server bundle instead:

```bash
pnpm build:node
```

Then run the file Nitro prints after the build (often under `.output/server/`).

# Typechecking

This repo uses **`tsgo`** ([`@typescript/native-preview`](https://www.npmjs.com/package/@typescript/native-preview)), the TypeScript native (Go-based) compiler preview, via `pnpm typecheck`. Vite and editors still rely on the regular **`typescript`** package; use `pnpm typecheck:tsc` if you need the classic Node `tsc` binary.

# Vite 8

The app builds on **Vite 8**. **`resolve.tsconfigPaths: true`** replaces the old `vite-tsconfig-paths` plugin. **Vitest** is pinned to **4.x** (Vite 8–compatible) and uses **`vitest.config.ts`** alone so tests do not merge the full Start + Nitro Vite config.

# Lint (Oxlint)

**Oxlint** is configured in **`.oxlintrc.json`**: `typescript`, `unicorn`, `oxc`, `react`, `import`, `promise`, and **vitest** plugins; **correctness** as errors; **suspicious** and **perf** as warnings. **`options.typeAware`** is on and requires **`oxlint-tsgolint`** for rules that need type information.

Use **`pnpm lint`** / **`pnpm lint:fix`**. Full program types stay on **`pnpm typecheck`** (`tsgo`); Oxlint does not run the full TypeScript checker by default.
