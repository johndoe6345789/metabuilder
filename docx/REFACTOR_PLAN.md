# Next.js to Lua Conversion TODO

## Table of Contents

- [TODOs by Phase](#todos-by-phase)
- [Audit Results](#audit-results)
- [Quick File References](#quick-file-references)
- [Next Steps](#next-steps)


## TODOs by Phase

### Phase 0 – Foundation

- [ ] Audit all `frontends/nextjs/src/` entry points (pages, components, hooks, lib). Determine what goes to Lua.
- [ ] Define the Lua boundary. List metadata, static, and seed assets plus their API surface.

### Phase 1 – Mapping

- [ ] Map reusable TypeScript helpers to single-function Lua targets (one file, one function) and describe their inputs/outputs for future porting.
- [ ] Categorize each file as “port to Lua”, “adapter only”, or “keep in TypeScript”.

### Phase 2 – Framework Bridge

- [ ] Extend the core framework only where gaps remain (data loading, metadata resolution, routing) with tiny TypeScript adapters to Lua if needed.
- [ ] Align metadata/seed folder structure with the requirements (consider `lua/` or `packages/static_content`) and add placeholder files.

### Phase 3 – Pilot Conversion

- [ ] Pilot a TypeScript → Lua helper conversion (choose one small helper, wrap it with an adapter, and keep the rest of the build intact).
- [ ] Ensure the pilot is wired into the Next.js app without breaking the current build or tests.

### Phase 4 – Stabilize

- [ ] Update documentation/tests to reflect the new Lua metadata focus and ensure existing CI steps continue to pass with the new structure.
- [ ] Iterate with feedback—confirm the team agrees on the folder layout, metadata ownership, and which TypeScript files stay as adapters.

## Audit Results

### App surface

- `frontends/nextjs/src/app` has 40+ routes.
- Each route needs metadata.
- Key files:
  - `page.tsx`
  - `layout.tsx`
  - `levels` tree
  - auth/dashboards
  - `providers.tsx` and theme hooks
  - `packages/[...path]/route.ts`
- API handlers touch auth, users, packages, levels, power-transfers, GitHub actions, screenshot, and health.
- They depend on helpers under `frontends/nextjs/src/lib/api`, `lib/packages/loader`, `db`, and `dbal`.

### UI components

- `frontends/nextjs/src/components` holds ~60 React files.
- Builders:
  - `Builder`
  - `Level1`, `Level2`, `Level3`, `Level4`, `Level5`
  - `NerdModeIDE`
- Editors:
  - `LuaEditor`
  - `LuaBlocksEditor`
  - `CodeEditor`
  - `JsonEditor`
  - `SchemaEditor`s
- Management views:
  - `PackageManager`
  - `DatabaseManager`
  - `ComponentCatalog`
  - `WorkflowEditor`
- Integrations and tools:
  - `GitHubActionsFetcher`
  - `IRCWebchat` variants
  - `DBALDemo`
  - `UnifiedLogin`
- Atoms, molecules, and organisms live in nested folders. We will tag each file in Phase 1.

### Hooks & libraries

- Hooks:
  - `useAuth`
  - `useAutoRefresh`
  - `useKV`
  - `useLevelRouting`
  - `useDBAL`
  - `useFileTree`
  - `useCodeEditor`
  - `useResolvedUser`
  - `useGitHubFetcher`
  - `use-mobile`
  - `hooks/auth` store
  - `hooks/use-dbal` helpers (blob storage, kv store, cached data)
- Libraries cover:
  - auth and security (`lib/auth`, `lib/security`)
  - database and DBAL helpers
  - package, seed, and metadata tooling (`lib/packages`, `lib/seed`)
  - Lua engine and functions
  - workflow and rendering helpers
  - API helpers and schema utilities
  - GitHub and general utilities (`lib/utils`, `lib/prisma`)
- Phase 1 will tag each file as “adapter” or “port”.

### Supporting assets

- `frontends/nextjs/src/seed-data` has JSON seeds for packages and baseline data. These can move to metadata.
- Tests live in `app/api/*/*.test.tsx`, `lib/**/*test.ts`, `components/get-component-icon.test.tsx`, and `hooks/*.test.ts`. We will decide which tests follow Lua stubbed logic or stay with TypeScript.

## Quick File References

- `frontends/nextjs/src/app`: each route, page, provider, and API handler needs metadata or a Lua adapter.
- `frontends/nextjs/src/components`: move builders, editors, and managers to metadata-driven definitions.
- `frontends/nextjs/src/hooks`: turn each hook into a Lua micro-function.
- `frontends/nextjs/src/lib`: catalogue auth, security, db/DBAL, packages, Lua, workflow, API, schema, GitHub, and utility modules.
- Supporting assets: seed JSONs, README docs, and tests must align with the Lua transition.

## Next Steps

1. Create the companion metadata folder (e.g., `lua/` or `packages/static_content`) with placeholder single-function files that mirror the above references.
2. Run the audit across the identified folders. Mark each file as “port to Lua”, “adapter only”, or “leave in TypeScript” before editing.
