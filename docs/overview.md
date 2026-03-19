# PokéAPI search

The home page loads data through **tRPC** (`pokeapi.search`) and the **React Query** client wired in `TrpcProvider`:

1. The browser calls `/api/trpc` (Nitro route in `routes/api/trpc/[...path].ts`, registered in `nitro.config.ts`).
2. The tRPC router lives under `src/trpc/` and delegates to `runPokeSearch` in `src/server/poke-search-service.ts`.
3. That service uses a small **Axios** client (`src/server/pokeapi-client.ts`) for PokéAPI HTTP.
4. It reads the [PokéAPI](https://pokeapi.co/) v2 root document, fetches each list with a high `limit`, caches the flattened index for ten minutes, then filters by name, resource key, or numeric id in the URL.

Fair use: cache keeps traffic low after the first warm-up. See [PokéAPI fair use](https://pokeapi.co/docs/v2#information).

The React tree is wrapped in `TrpcProvider` (`src/integrations/trpc/react.tsx`), which creates the tRPC client and `QueryClient`.

# Nitro and Deno

`nitro.config.ts` sets the default Nitro preset to the Deno server runtime (`deno_server`).

- **Develop**: `pnpm dev` (Vite; Node).
- **Build (local / VM Deno)**: `pnpm build` produces `.output/server/index.mjs`.
- **Run (Deno)**: install [Deno](https://deno.com/), then `pnpm start:deno`.

To emit a Node server bundle instead:

```bash
pnpm build:node
```

Then run the file Nitro prints after the build (often under `.output/server/`).

## Deno Deploy

This app targets [Deno Deploy][deno-deploy] using Nitro preset **`deno_deploy`**.
The build emits **`.output/server/index.ts`** (and chunks) for `deployctl`, not
`index.mjs`.

1. **Build**

   ```bash
   pnpm build:deno-deploy
   ```

2. **CLI upload**  
   Install [deployctl][deployctl-doc] and create a project on the
   [Deploy dashboard][deno-dash].

   ```bash
   export DENO_DEPLOY_TOKEN=…   # from Deploy dashboard → Access tokens
   cd .output
   deployctl deploy --project=YOUR_PROJECT_NAME server/index.ts
   ```

3. **GitHub Actions** (recommended)  
   Enable **GitHub Actions** as the deploy source for your Deploy project and link
   this repository. Workflow: `.github/workflows/deno-deploy.yml`. It runs
   `pnpm build:deno-deploy`, then `denoland/deployctl@v1` with `root: .output` and
   `entrypoint: server/index.ts`. Set a repository **Actions variable**
   **`DENO_DEPLOY_PROJECT`** to your **exact** Deno Deploy project name (same as in
   the dashboard URL). If unset, the workflow falls back to `tstack-start`.

If the action fails with auth errors, add a **`DENO_DEPLOY_TOKEN`** repository secret.
See [deployctl CI][deployctl-doc].

[deno-deploy]: https://deno.com/deploy
[deno-dash]: https://dash.deno.com/
[deployctl-doc]: https://deno.com/deploy/docs/deployctl

# Typechecking

This repo uses **`tsgo`** ([`@typescript/native-preview`](https://www.npmjs.com/package/@typescript/native-preview)), the TypeScript native (Go-based) compiler preview, via `pnpm typecheck`. Vite and editors still rely on the regular **`typescript`** package; use `pnpm typecheck:tsc` if you need the classic Node `tsc` binary.

# Vite 8

The app builds on **Vite 8**. **`resolve.tsconfigPaths: true`** replaces the old `vite-tsconfig-paths` plugin. **Vitest** is pinned to **4.x** (Vite 8–compatible) and uses **`vitest.config.ts`** alone so tests do not merge the full Start + Nitro Vite config.

# Lint (Oxlint)

**Oxlint** is configured in **`.oxlintrc.json`**: `typescript`, `unicorn`, `oxc`, `react`, `import`, `promise`, and **vitest** plugins; **correctness** as errors; **suspicious** and **perf** as warnings. **`options.typeAware`** is on and requires **`oxlint-tsgolint`** for rules that need type information.

Use **`pnpm lint`** / **`pnpm lint:fix`**. Full program types stay on **`pnpm typecheck`** (`tsgo`); Oxlint does not run the full TypeScript checker by default.
