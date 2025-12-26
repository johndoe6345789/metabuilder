# Next.js to Lua Conversion TODO

## Table of Contents

- [TODOs by Phase](#todos-by-phase)
- [Audit Results](#audit-results)
- [Quick File References](#quick-file-references)
- [Next Steps](#next-steps)


## TODOs by Phase

### Phase 0 – Foundation

[ ] Audit all `frontends/nextjs/src/` entry points (pages, components, hooks, lib) so we know exactly what needs to be ported or adapted.
[ ] Document the Lua boundary—what metadata/static/seed assets we expect to own and what runtime API each function will expose.

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

- `frontends/nextjs/src/app` has 40+ routes. Each route needs metadata. Core files: `page.tsx`, `layout.tsx`, levels, auth, dashboards, `providers`, `packages/[...path]`, and the API handlers for auth, users, packages, levels, power-transfers, GitHub actions, screenshots, health.
- API handlers use code under `frontends/nextjs/src/lib/api`, `lib/packages/loader`, `db`, and `dbal`. Those helpers can become Lua wrappers.

### UI components

- `frontends/nextjs/src/components` holds about 60 React files. These include builders (`Builder`, `Level1-5`, `NerdModeIDE`), editors (`LuaEditor`, `CodeEditor`, `JsonEditor`, `SchemaEditor*`), management views (`PackageManager`, `DatabaseManager`, `ComponentCatalog`, `WorkflowEditor`), and integrations (`GitHubActionsFetcher`, `IRCWebchat`, `DBALDemo`, `UnifiedLogin`). They all use hooks and helpers.
- Atoms, molecules, and organisms are in nested directories. We will tag each file in Phase 1.

### Hooks & libraries

- Hooks: `useAuth`, `useAutoRefresh`, `useKV`, `useLevelRouting`, `useDBAL`, `useFileTree`, `useCodeEditor`, `useResolvedUser`, `useGitHubFetcher`, `use-mobile`, the `hooks/auth` store, and the `hooks/use-dbal` helpers (blob storage, kv store, cached data). These can be Lua micro-functions.
- Libraries: `frontends/nextjs/src/lib` contains auth, security, db/DBAL, package/seed management, Lua engine/functions, workflow/rendering, API helpers, schema utilities, GitHub helpers, and utilities (`lib/utils`, `lib/prisma`). Phase 1 will label each file as “adapter” or “port”.

### Supporting assets

- `frontends/nextjs/src/seed-data` has JSON seeds for packages and baseline data. These can move to metadata.
- Tests live in `app/api/*/*.test.tsx`, `lib/**/*test.ts`, `components/get-component-icon.test.tsx`, and `hooks/*.test.ts`. We will decide which tests follow Lua stubbed logic or stay with TypeScript.

## Quick File References

- `frontends/nextjs/src/app`: each route, page, provider, and API handler needs a metadata equivalent or a Lua adapter (`page`, `layout`, auth portals, `codegen`, `api`, providers, etc.).
- `frontends/nextjs/src/components`: shift builders (`Builder`, `Level1-5`, `NerdModeIDE`, `Workflow*`, manager/editor panels) to metadata-driven definitions. Atoms/molecules/organisms become per-file Lua adapters.
- `frontends/nextjs/src/hooks`: convert hooks (`useAuth`, `useAutoRefresh`, `useKV`, `useDBAL`, `useFileTree`, etc.) into Lua micro-functions. Include the `hooks/use-dbal` factories.
- `frontends/nextjs/src/lib`: catalogue auth/security, db/DBAL, package/seed, Lua engine, workflow/rendering, API helpers, schema utilities, and helpers to decide what stays in TypeScript adapters.
- Supporting assets: seed JSON data, README docs, and tests must match the Lua plan once conversions start.

## Next Steps

1. Create the companion metadata folder (e.g., `lua/` or `packages/static_content`) with placeholder single-function files that mirror the above references.
2. Run the audit across the identified folders. Mark each file as “port to Lua”, “adapter only”, or “leave in TypeScript” before editing.
