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

[Deno Deploy][deno-deploy] has two products: **new** ([console.deno.com][deno-console],
**Apps**) and **Classic** ([dash.deno.com][deno-dash], **Projects**). The
[deployctl README][deployctl-gh] says **`deployctl` is Classic only**; new
organizations should use hosted GitHub builds or the **`deno deploy`** CLI.

### New Deno Deploy (recommended for this app)

Root **`deno.json`** defines **`deploy.install`**, **`deploy.build`**
(`pnpm run build:deno-deploy`), and **`deploy.runtime`**: dynamic entrypoint
**`.output/server/index.ts`** plus **`cwd`: `.output`**. That working directory is
required so Nitro’s static handler can open **`./public/assets/*`** (Vite JS/CSS).
If **`cwd`** stays the repo root, only repo **`public/`** files load and **`/assets/*`**
returns **500**. Link the repo under **Deploy from GitHub**; pushes build on **Deno’s
builders** (see [builds][deno-builds]).

**`.github/workflows/deno-deploy.yml`** only **checks** the same install + build on
GitHub-hosted runners. It does **not** call `deployctl` (that would target Classic
only and fail with permission errors on new Deploy).

### Deploy Classic only

Run **`pnpm build:deno-deploy`**, then use **`deployctl`** against a Classic
project with [access tokens][deno-tokens] or GitHub OIDC. See
[deployctl][deployctl-doc].

[deno-deploy]: https://deno.com/deploy
[deno-console]: https://console.deno.com/
[deno-dash]: https://dash.deno.com/
[deno-builds]: https://docs.deno.com/deploy/reference/builds/
[deno-tokens]: https://dash.deno.com/account#access-tokens
[deployctl-doc]: https://deno.com/deploy/docs/deployctl
[deployctl-gh]: https://github.com/denoland/deployctl#readme

# Typechecking

This repo uses **`tsgo`** ([`@typescript/native-preview`](https://www.npmjs.com/package/@typescript/native-preview)), the TypeScript native (Go-based) compiler preview, via `pnpm typecheck`. Vite and editors still rely on the regular **`typescript`** package; use `pnpm typecheck:tsc` if you need the classic Node `tsc` binary.

# Vite 8

The app builds on **Vite 8**. **`resolve.tsconfigPaths: true`** replaces the old `vite-tsconfig-paths` plugin. **Vitest** is pinned to **4.x** (Vite 8–compatible) and uses **`vitest.config.ts`** alone so tests do not merge the full Start + Nitro Vite config.

# Lint (Oxlint)

**Oxlint** is configured in **`.oxlintrc.json`**: `typescript`, `unicorn`, `oxc`, `react`, `import`, `promise`, and **vitest** plugins; **correctness** as errors; **suspicious** and **perf** as warnings. **`options.typeAware`** is on and requires **`oxlint-tsgolint`** for rules that need type information.

Use **`pnpm lint`** / **`pnpm lint:fix`**. Full program types stay on **`pnpm typecheck`** (`tsgo`); Oxlint does not run the full TypeScript checker by default.
