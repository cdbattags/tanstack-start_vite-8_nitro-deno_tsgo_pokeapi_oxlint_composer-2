# Index

Web UI to search the public [PokéAPI](https://pokeapi.co/) v2 list index: one query over every catalog endpoint, optional list filter, recents, and copyable URLs.

## Documentation

- [Architecture and tooling](docs/overview.md)

## Nix (optional)

[`flake.nix`](flake.nix) pins **nixos-unstable** and a **devShell** with Node **22**, **pnpm**, and **Deno** (for `pnpm start:deno` and Nitro **`deno_deploy`** output). Run **`nix develop`** or install [direnv](https://direnv.net/) and allow **`.envrc`** (`use flake`).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Local development |
| `pnpm build` | `vite build` → `.output/server/index.mjs` (`deno_server`) |
| `pnpm build:deno-deploy` | Nitro `deno_deploy` (see root `deno.json` for Deploy) |
| `pnpm start:deno` | Run **`deno_server`** build (`.output/server/index.mjs`) |
| `pnpm start:deno:deploy` | Run **`deno_deploy`** build from **`.output`** (`server/index.ts`) |
| `pnpm test` | Vitest (dedicated `vitest.config.ts`) |
| `pnpm lint` / `pnpm lint:fix` | Oxlint |
| `pnpm typecheck` | `tsgo` |
| `pnpm typecheck:tsc` | Classic `tsc` |
| `pnpm check` | Lint + typecheck |

## Stack (short)

React, Vite 8, Nitro on Deno, tRPC, React Query, Tailwind CSS 4, Oxlint, TypeScript.

## Fair use

The server caches the merged index to limit traffic to PokéAPI. See [their docs](https://pokeapi.co/docs/v2#information).
