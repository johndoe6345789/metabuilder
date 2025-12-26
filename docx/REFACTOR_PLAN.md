# Next.js to Lua Conversion Plan

## Objective

- Break the frontend refactor request into atomic, achievable chunks that respect the current Next.js/TypeScript architecture while preparing for a future metadata/seed-focused Lua layer.

## Task Breakdown

1. **Audit current Next.js surface**  
   - List all entry points under `frontends/nextjs/src/`, noting pages, components, and data-fetching hooks.
   - Capture existing build/test commands tied to that folder to understand dependencies.

2. **Define Lua boundary**  
   - Specify what metadata/static content/seed data the Lua layer would own (e.g., folder structure under `packages/` or new `lua/` workspace).
   - Sketch a minimal runtime API that Lua micro-functions would need to expose to the rest of the repo.

3. **Map TypeScript → Lua functions**  
   - Identify reusable logic in TypeScript that could be refactored into 1-function-per-file Lua utilities (e.g., serializers, validators).
   - Document the inputs/outputs for each candidate utility to guide future porting.

4. **Extend the core framework**  
   - Determine missing framework hooks (data loading, metadata resolution, routing stubs) that the Lua layer requires.
   - Draft minimal TypeScript interfaces that act as adapters between Next.js and the Lua utilities.

5. **Pilot conversion proof-of-concept**  
   - Choose one small TypeScript helper and rewrite it as a Lua micro-function, keeping the rest in sync via a thin adapter.
   - Validate by wiring it into the Next.js app in a way that doesn’t break the current build.

6. **Review and iterate**  
   - Gather feedback from the team about the proposed Lua bundle structure and adapters.
   - Update documentation and tests to reflect the evolving division between Next.js and Lua content.

## Detailed File-Level Breakdown

### 1. App routes & API surface (`frontends/nextjs/src/app`)
These files drive the current Next.js experience; each route, provider, and API handler will need a metadata equivalent or adapter.

- `page.tsx`, `layout.tsx`, `level1-client.tsx`, `providers.tsx`, `providers/providers-component.tsx`, `providers/theme-context.ts`, `providers/use-theme.ts` – central shell and theme/auth wiring.
- `(auth)/builder/supergod/admin/dashboard pages`, plus `login/page.tsx` – entrypoints for each experience tier.
- `levels/page.tsx`, `levels/LevelsClient.tsx`, `levels/levels-data.ts` – game-style flows to capture as metadata definitions.
- `codegen/page.tsx`, `codegen/CodegenStudioClient.tsx` – experimental tooling that should become Lua-defined transformations.
- API folders under `api/` (auth, health, packages, levels, power-transfers, users, screenshot, github actions logs) – every route (and its handler glue) must be mapped to metadata commands.
- Provider scaffolding (`_components/auth-provider`) and `packages/[...path]/route.ts` – need to become static metadata declarations or server-side Lua dispatchers.

### 2. UI components (`frontends/nextjs/src/components`)
 Convert UI-heavy components into data-first definitions and isolate helper logic that can become Lua utilities.

- High-level views: `Builder.tsx`, `Level[1-5].tsx`, `NerdModeIDE.tsx`, `WorkflowEditor.tsx`, `WorkflowRunCard.tsx`, `WorkflowRunStatus.tsx`.
- Configuration/management: `ComponentCatalog.tsx`, `ComponentConfigDialog.tsx`, `ComponentHierarchyEditor.tsx`, `PropertyInspector.tsx`, `ComponentConfigDialog.tsx`, `PackageManager.tsx`, `PackageImportExport.tsx`.
- Editors: `LuaEditor.tsx`, `LuaBlocksEditor.tsx`, `LuaSnippetLibrary.tsx`, `CodeEditor.tsx`, `JsonEditor.tsx`, `SchemaEditor*.tsx`, `CssClassBuilder.tsx`, `ThemeEditor.tsx`, `DatabaseManager.tsx`.
- Integrations: `GitHubActionsFetcher.tsx`, `IRCWebchat*.tsx`, `DBALDemo.tsx`, `UnifiedLogin.tsx`, `Login.tsx`.
- Support / scaffolding atoms/molecules/organisms directories – each helper file (e.g., under `components/atoms/`, `components/molecules/`, `components/organisms/`) is a candidate for single-function Lua adapter (e.g., `components/atoms/ActionButton.tsx` would map to `lua/functions/action-button.lua`).

### 3. Hooks & state helpers (`frontends/nextjs/src/hooks`)
 Every hook becomes a Lua micro-function that either reads metadata or exposes derived state.

- Auth layer: `useAuth.ts`, `useAuth.test.ts`, `hooks/auth/` tree (store/types) – convert login/session logic into Lua "auth decision" functions.
- Data helpers: `useAutoRefresh.ts`, `useKV.ts`, `useLevelRouting.ts`, `useDBAL.ts`, `useFileTree.ts`, `useCodeEditor.ts`, `useResolvedUser.ts`, `useGitHubFetcher.ts`, `use-mobile.ts` – each currently asynchronous logic should be expressed as a Lua micro-function with clear inputs/outputs.
- Reusable factories under `hooks/use-dbal/` (blob storage, kv store, cached data) – treat as candidate functions for the Lua runtime, one per file.

### 4. Library utilities (`frontends/nextjs/src/lib`)
 This directory contains almost all reusable business logic; we need to catalog each sub-area so we can map to Lua functions.

- Authentication/security: `lib/auth/*`, `lib/security/*`, `lib/security/functions/*`, and their tests – re-implement as Lua validators/scanners (`lua/security/*.lua`).
- Database/DBAL: `lib/db/*`, `lib/dbal/*`, `lib/dba…` – every CRUD helper should become a metadata seed (e.g., `lua/db/users/get-users.lua`). Keep Prisma-only adapters in TypeScript but expose metadata boundaries.
- Packages & seed: `lib/packages/`, `lib/package-*`, `lib/seed/*`, `lib/packages/package-glue/*` – move metadata definitions (package catalog, manifests) into the Lua area, leaving only minimal TypeScript glue.
- Lua engine/support: `lib/lua/*`, `lib/lua/functions/*`, `lib/lua/snippets/*` – reorganize as the future Lua-first bundle (function-per-file just as requested).
- Workflow/rendering: `lib/workflow/*`, `lib/rendering/*`, `lib/component-registry/*` – capture builder flows as metadata definitions; convert helper logic (execution nodes, component registration) into single Lua functions where possible.
- Infrastructure: `lib/prisma.ts`, `lib/database.ts`, `lib/api/*`, `lib/utils.*` – wrap them with metadata descriptors and adapters.
- Additional catalogs: `lib/github/*`, `lib/schema/*`, `lib/package-*` – document each file to know where conversions will happen.

### 5. Supporting folders

- `frontends/nextjs/src/seed-data/` – existing seed JSON files that should become the initial Lua metadata/seed package (note each file name for later re-encoding).
- `frontends/nextjs/src/components/README.md`, `hooks/README.md`, `lib/README.md` – update documentation sections to describe the Lua transition plan.
- E2E/Unit tests (`src/tests/`, `src/lib/**/*test.ts`, `components/get-component-icon.test.tsx`, `hooks/*.test.ts`, `app/api/*/*.test.tsx`) – note where tests need to follow logic rewrites.

## Next Steps

- Produce a companion metadata folder (e.g., `lua/` or `packages/static_content`) that mirrors these files as single-function stubs.
- Schedule the audit described above and report back with which TypeScript files can be retired, which remain as adapters, and which need new Lua micro-functions.
