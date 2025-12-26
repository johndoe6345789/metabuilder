# Next.js to Lua Conversion TODO

## Table of Contents

- [TODOs by Phase](#todos-by-phase)
- [Audit Results](#audit-results)


## TODOs by Phase

### Phase 0 – Foundation

- [ ] Audit all `frontends/nextjs/src/` entry points (pages, components, hooks, lib) so we know exactly what needs to be ported or adapted.
- [ ] Document the Lua boundary—what metadata/static/seed assets we expect to own and what runtime API each function will expose.

### Phase 1 – Mapping

- [ ] Map reusable TypeScript helpers to single-function Lua targets (one file, one function) and describe their inputs/outputs for future porting.
- [ ] Categorize each file as “port to Lua”, “adapter only”, or “keep in TypeScript”.

###
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

- `frontends/nextjs/src/app` contains 40+ route files (pages/levels/login/auth dashboards) plus `providers.tsx`, theme hooks, and the `packages/[...path]` catch-all route; each route ties into multiple `api/` handlers (`auth`, `users`, `packages`, `levels`, `power-transfers`, `github/actions`, `screenshot`, `health`) so capturing their metadata equivalents is critical.
- API handlers rely on supporting modules under `frontends/nextjs/src/lib/api` and `lib packages/loader`, `db`, and `dbal` directories (see `route.ts` graph) for data access; these modules will be the first candidates for Lua metadata wrappers.

### UI components

- `frontends/nextjs/src/components` includes ~60 heavy React files: builder views (`Builder.tsx`, `Level[1-5].tsx`, `NerdModeIDE.tsx`), editors (`LuaEditor`, `CodeEditor`, `JsonEditor`, `SchemaEditor*`), management screens (`PackageManager`, `DatabaseManager`, `ComponentCatalog`, `WorkflowEditor`), and integrations (`GitHubActionsFetcher`, `IRCWebchat`, `DBALDemo`, `UnifiedLogin`). Each file typically imports utility hooks from `hooks/` and helpers from `lib/`.
- Atoms/molecules/organisms subfolders hold additional reusable UI pieces (not enumerated here) but will be flagged individually during Phase 1 mapping.

### Hooks & libraries

- Hooks: `useAuth`, `useAutoRefresh`, `useKV`, `useLevelRouting`, `useDBAL`, `useFileTree`, `useCodeEditor`, `useResolvedUser`, `useGitHubFetcher`, `use-mobile`, plus the `hooks/auth/` store and the `hooks/use-dbal/` utility folders (blob storage, kv store, cached data). Each hook is mostly pure logic that can become a Lua micro-function.
- Libraries: dozens of files under `frontends/nextjs/src/lib` cover auth (`lib/auth`), security scanning (`lib/security`), db/DBAL modules, package/seed management (`lib/packages`, `lib/seed`), Lua engine/functions, workflow/rendering, API helpers (`lib/api`), schema utilities, GitHub helpers, and general helpers (`lib/utils`, `lib/prisma`). These will need to be categorized as “adapter” versus “port” in Phase 1.

### Supporting assets

- `frontends/nextjs/src/seed-data`: JSON seeds (names not enumerated) representing packages and data baseline—prime candidates for metadata import.
- Tests: unit/e2e coverage exists across `app/api/*/*.test.tsx`, `lib/**/*test.ts`, `components/get-component-icon.test.tsx`, and `hooks/*.test.ts`—each should either operate against Lua stubs/adapters or stay attached to TypeScript logic.

## Quick File References

- `frontends/nextjs/src/app`: every route/provider/API handler will need metadata equivalents or thin Lua adapters (`page.tsx`, `layout.tsx`, auth/dashboards, `codegen/`, `api/*`, providers, etc.).
- `frontends/nextjs/src/components`: move UI-heavy builders (`Builder.tsx`, `Level[1-5].tsx`, `NerdModeIDE.tsx`, `Workflow*`, manager/editor panels) into metadata-driven definitions, with atoms/molecules/organisms turning into per-file Lua adapters.
- `frontends/nextjs/src/hooks`: treat every hook (`useAuth`, `useAutoRefresh`, `useKV`, `useDBAL`, `useFileTree`, etc.) as a Lua micro-function plus any factory files in `hooks/use-dbal/`.
- `frontends/nextjs/src/lib`: catalog authentication/security, db/DBAL, package/seed, Lua engine, workflow/rendering, infra/API, schema, and helper files to decide which remain TypeScript adapters.
- Supporting assets: seed JSONs, README docs in components/hooks/lib, and unit/e2e tests must reflect the Lua theta once conversions begin.

## Next Steps

1. Create the companion metadata folder (e.g., `lua/` or `packages/static_content`) with placeholder single-function files that mirror the above references.
2. Run the audit across the identified folders and mark each file as “port to Lua”, “adapter only”, or “leave in TypeScript” before touching the code.
