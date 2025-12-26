# Next.js to Lua Conversion TODO

## Table of Contents

- [TODOs by Phase](#todos-by-phase)
- [Prep Checklist](#prep-checklist)
- [Audit Results](#audit-results)
- [Quick File References](#quick-file-references)
- [Next Steps](#next-steps)
- [Phase Deliverables](#phase-deliverables)
- [Support Notes](#support-notes)
- [Tracking & Templates](#tracking--templates)
- [Package Design Notes](#package-design-notes)
- [Metadata Design Notes](#metadata-design-notes)


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

## Prep Checklist

- [ ] Confirm tooling (Lua runtime, `luacheck`, etc.) is installed if needed before creating helpers.
- [ ] Backup critical TypeScript files via comments or notes before starting ports.
- [ ] Share the plan with the team and gather quick approvals for folder names (`lua/`, `packages/static_content`).
- [ ] Identify one “safe” helper to convert first, ideally small and well-tested.

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

## God Panel / Package Mapping Notes

- Level 4’s `Level4Tabs` exposes a “Packages” tab that renders `PackageManager`, so God-level users open that tab when they need to install, enable, or disable packages (`frontends/nextjs/src/components/level4/Level4Tabs.tsx`).
- `PackageManager` loads the catalog from `PACKAGE_CATALOG`, shows installed/available packages, and calls APIs (`installPackage`, `togglePackageEnabled`, `uninstallPackage`, `listInstalledPackages`) that persist package state (`frontends/nextjs/src/components/PackageManager.tsx`).
- `PACKAGE_CATALOG` lives in `frontends/nextjs/src/lib/packages/package-catalog.ts` and contains the manifest content (schemas, pages, workflows, Lua scripts, seed data) that the God panel presents when a package is selected.
- The reusable packages under `packages/` follow the structure described in `packages/README.md`: each package has `seed/metadata.json`, `components.json`, and optional `static_content/examples.json`, so new package metadata can align with what `PackageManager` expects.
- Default packages are enumerated in `frontends/nextjs/src/lib/packages/package-glue/default-packages.ts` (admin_dialog, dashboard, forum_forge, etc.), and God panel UI relies on those definitions to match catalog entries with metadata stored in `packages/`.

## Next Steps

1. Create the companion metadata folder (e.g., `lua/` or `packages/static_content`) with placeholder single-function files that mirror the above references.
2. Run the audit across the identified folders. Mark each file as “port to Lua”, “adapter only”, or “leave in TypeScript” before editing.

## Phase Deliverables

- **Phase 0**: Audit spreadsheet/list with tags for each entry. Lua boundary doc with endpoints and metadata goals.
- **Phase 1**: Mapping sheet (spreadsheet or Markdown) documenting TypeScript helper → Lua micro-function mapping and file categorization.
- **Phase 2**: Adapter interface stubs plus placeholder Lua files under the new metadata folder.
- **Phase 3**: One working Lua helper wired through an adapter, with updated unit test coverage or manual verification notes.
- **Phase 4**: Documentation updates, test run results, and a summary of which files moved versus stayed.

## Support Notes

- **Risks**: The Next.js frontend is large; do not remove TypeScript pages until their Lua replacements exist. Keep unit/e2e tests running in TypeScript during transition.
- **Owner**: Track who updates each phase and keep a note in this doc or comments for accountability.
- **Validation tips**: After a Lua helper is added, run `npm run lint` and `npm run test:unit` from `frontends/nextjs/`. Keep logs of failing tests if you defer them.
- **Documentation**: Update READMEs in `components/`, `hooks/`, and `lib/` with pointers to the new Lua package once core content moves.
- **Checkpoint**: Before Phase 3, ensure adapter interfaces exist for data access and that seed data has been migrated to the metadata folder.

- **Toolbelt**
  - `npm run lint` (in `frontends/nextjs/`)
  - `npm run test:unit`
  - `npm run test:e2e` (only after Lua helpers are wired)
  - `npm run build` to verify core app still compiles

- **Folder sketch**
  - `lua/metadata/` – metadata + seed descriptors per package
  - `lua/functions/` – single-function files (one helper per file)
  - `lua/adapters/` – TypeScript adapters that relay calls into Lua micro-functions
  - `packages/static_content/` – optional storage for JSON seeds already living in the frontend

## Tracking & Templates

- **Audit table**:
  1. File path
  2. Current role (page, API, hook, lib)
  3. Port target (Lua, adapter, stay TS)
  4. Notes/risks
  5. Owner/ETA
- **Mapping sheet**:
  1. Helper name
  2. Inputs/outputs
  3. Proposed Lua file path
  4. Adapter needed (yes/no)
  5. Test expectations
- **Documentation reminders**: keep the doc updated with any new folder names, helper descriptions, or decisions so new contributors can follow the trail.
 
## Package Design Notes

- Keep packages lean: each folder under `packages/` should contain `seed/`, optional `static_content/`, and light JSON/metadata entries.
- Store metadata (name, version, packageId) in `seed/metadata.json`; keep `packageId` snake_case and version semver.
- Avoid coupling packages to UI; they should expose data scripts for Lua/metadata consumers.
- Use `package/glue` logic in `frontends/nextjs/src/lib/packages` as reference when designing new packages so metadata matches runtime expectations.
- Document every package’s dependencies and optional scripts so Lua adapters can load/distribute them predictably.

## Metadata Design Notes

- Define metadata per route/component via JSON tables describing inputs, outputs, Lua helper references, and UI states.
- Keep metadata separate from implementation; store static descriptors in `lua/metadata/*` and reference them via adapters.
- Version metadata files to make rollbacks easier and ensure seeds stay synchronized with database migrations.
- Use small, focused metadata files so the single-function Lua helpers can import only the data they need.
- Track metadata ownership (which team, file) inside each descriptor to simplify future audits.

## Reference Resources

- **AGENTS.md**: follow repo guidelines and nested agent notes before touching `dbal/` or other special folders.
- **UI_STANDARDS.md**: reference for UI design rules while documenting Lua metadata that may affect styling.
- **packages/**: inspect existing JSON-driven package structure for inspiration (seed/metadata.json, static_content/).
- **tools/**: reuse scripts from this folder when building new metadata loaders or conversion helpers.
- **frontends/nextjs/src/lib/packages/package-glue/**: examine default packages and loaders to keep Lua metadata compatible.

## Decision Log

- Document every key decision (phase changes, Lua structure choices, package additions) below with date/owner for easy onboarding.
  1. [date] - [owner] - [decision summary]
  2. ...

## Collaboration Notes

- Post updates to this doc before merging any changes, especially new folder names or metadata formats.
- Tag @owner in relevant PR comments when handing off a phase or requesting review.
