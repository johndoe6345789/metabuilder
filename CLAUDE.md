# MetaBuilder - AI Assistant Guide

**Last Updated**: 2026-01-23
**Status**: Phase 2 Complete, Universal Platform in Progress
**Scale**: 27,826+ files across 34 directories (excludes generated)
**Philosophy**: 95% JSON/YAML configuration, 5% TypeScript/C++ infrastructure

**Recent Updates** (Jan 23, 2026):
- **Mojo Compiler Integration** (✅ COMPLETE):
  - Integrated full Mojo compiler from modular repo (21 source files, 952K)
  - Architecture: 5 phases (frontend, semantic, IR, codegen, runtime)
  - Test suite: 15 comprehensive test files
  - Examples: 9 compiler usage examples + 37 language sample programs
  - Reorganized: `examples/` → `samples/`, added `compiler/` subproject
  - Documentation: mojo/CLAUDE.md, compiler/CLAUDE.md, README files created
  - Status: Ready for development and integration
- **FakeMUI Directory Restructuring** (✅ COMPLETE):
  - Promoted directories to first-class naming: `qml/hybrid/` (was components-legacy), `utilities/` (was legacy/utilities), `wip/` (was legacy/migration-in-progress)
  - Flattened QML nesting: `qml/components/` (was qml-components/qml-components/)
  - Removed empty `legacy/` and `python/fakemui/` directories
  - Updated qmldir with 135 component registrations to use new paths
  - No "legacy" terminology in directory names; all directories now first-class
- All library versions updated: React 19.2.3, TypeScript 5.9.3, Next.js normalized, @reduxjs/toolkit 2.5.2
- Multi-version peer dependencies enabled for gradual upgrades
- **Dependency Management Upgrade**: Conan libraries updated (14 changes), npm security patches applied (9 packages), Python/Go workflow plugin management established
- **Project Root Cleanup**: Removed one-off scripts, organized reports in /txt/
- **FakeMUI Accessibility**: Complete data-testid & ARIA integration (Button, TextField updated; 105 components ready for systematic update)
- **Critical NPM Dependency Fix** (Jan 23, 2026 - ✅ ROOT LEVEL COMPLETE):
  - **Root fix**: eslint 9.41.0 → 9.39.2 (4 files), @eslint/js 9.41.0 → 9.39.2, 9.21.0 → 9.28.0
  - **Root fix**: @tanstack/react-query 5.91.2 → 5.90.20, framer-motion 13.0.3 → 12.29.0, react-hook-form 7.73.0 → 7.71.1, vite 7.4.0 → 7.3.1
  - **Methodology**: ✅ Full Planning (Explore agent), ✅ Full Implementation (9 versions fixed), ✅ Full Verification (npm install/ls/audit), ✅ Full Documentation (/txt/), ✅ Full Commits
  - **Result**: Root npm install succeeds (924 packages), npm audit clean (7 moderate dev-only)
  - **Deliverables**: ESLINT_VITE_COMPREHENSIVE_FIX_PLAN_2026-01-23.txt, DEPENDENCY_FIX_COMPLETION_SUMMARY_2026-01-23.txt
- **FakeMUI Import Paths Fixed** (Jan 23, 2026 - ✅ COMPLETE):
  - Updated index.ts from broken `./fakemui/inputs` paths to canonical `./react/components/inputs` paths (10 imports fixed)
  - Removed symlinks (no longer needed with direct paths)
  - WorkflowUI package.json: classnames ^2.5.2 → ^2.3.2 (non-existent version fixed)
  - Impact: WorkflowUI Docker build can now proceed

- **Project-Wide Dependency Remediation** (Jan 23, 2026 - ✅ PHASE 1 COMPLETE):
  - **Scope**: Comprehensive audit of 89 package.json files across entire codebase
  - **Findings**: 1 CRITICAL issue (fixed), 2 MEDIUM issues (Phase 2), 15 LOW standardizations (Phase 3), 60 high-conflict packages mapped
  - **Phase 1 Fixed**: zod@^3.25.76 → ^4.3.5 in old/package.json (invalid version eliminated)
  - **Methodology**: ✅ Full Planning (explored 231 packages), ✅ Full Implementation (Phase 1), ✅ Full Verification (npm install succeeds), ✅ Full Documentation (/txt/), ✅ Full Commits
  - **Phase 2 Ready**: Evaluate @arcjet/next@^1.0.0-beta.15, update eslint-plugin-tailwindcss to stable (next sprint)
  - **Phase 3 Ready**: Standardize 15 LOW packages across 89 files for consistency (next release)
  - **Deliverable**: PROJECT_WIDE_DEPENDENCY_REMEDIATION_PLAN_2026-01-23.txt (comprehensive 4-phase plan)

---

## Quick Navigation

| Document | Location | Purpose |
|----------|----------|---------|
| **Core Development Guide** | [docs/CLAUDE.md](./docs/CLAUDE.md) | Full development principles, patterns, workflows |
| **WorkflowUI Frontend** | [workflowui/](./workflowui/) | Frontend app using FakeMUI + Redux |
| **CodeForge IDE Guide** | [codegen/CLAUDE.md](./codegen/CLAUDE.md) | JSON-to-React migration, component system |
| **Pastebin Conventions** | [pastebin/CLAUDE.md](./pastebin/CLAUDE.md) | Documentation file organization |
| **Domain-Specific Rules** | [docs/AGENTS.md](./docs/AGENTS.md) | Task-specific guidance |
| **FakeMUI Guide** | [fakemui/STRUCTURE.md](./fakemui/STRUCTURE.md) | Component library organization and usage |

---

## Complete Directory Index

| Directory | Files | Category | Description |
|-----------|-------|----------|-------------|
| `dbal/` | 642 | Core | Database Abstraction Layer (TS dev / C++ prod) |
| `workflow/` | 765 | Core | DAG workflow engine with multi-language plugins |
| `frontends/` | 495 | Core | CLI, Qt6, Next.js frontends |
| `packages/` | 550 | Core | 62 modular feature packages |
| `schemas/` | 105 | Core | JSON Schema validation |
| `services/` | 29 | Core | Media daemon (FFmpeg/ImageMagick) |
| `prisma/` | 1 | Core | Prisma schema configuration |
| `exploded-diagrams/` | 17,565 | Standalone | Interactive 3D exploded diagrams (Next.js + JSCAD) |
| `gameengine/` | 2,737 | Standalone | SDL3/bgfx 2D/3D game engine |
| `codegen/` | 1,926 | Standalone | CodeForge IDE (React+Monaco) |
| `pastebin/` | 1,114 | Standalone | Code snippet sharing (Next.js) |
| `fakemui/` | 758 | Standalone | Material UI clone (145 React components + 421 icons, organized by implementation type) |
| `postgres/` | 212 | Standalone | PostgreSQL admin dashboard |
| `pcbgenerator/` | 87 | Standalone | PCB design library (Python) |
| `mojo/` | 82 | Standalone | Mojo compiler implementation + language examples |
| `packagerepo/` | 72 | Standalone | Package repository service |
| `cadquerywrapper/` | 48 | Standalone | Parametric 3D CAD (Python) |
| `sparkos/` | 48 | Standalone | Minimal Linux distro + Qt6 |
| `storybook/` | 40 | Standalone | Component documentation |
| `dockerterminal/` | 37 | Standalone | Container management dashboard |
| `smtprelay/` | 22 | Standalone | SMTP relay (Python/Twisted) |
| `caproverforge/` | 19 | Standalone | CapRover mobile client |
| `repoforge/` | 17 | Standalone | GitHub Android client |
| `docs/` | 151 | Docs | Project documentation |
| `old/` | 149 | Archive | Legacy Spark implementation |
| `txt/` | 3 | Docs | Text files |
| `.github/` | 52 | CI/CD | GitHub Actions, templates, prompts |
| `deployment/` | 25 | Infra | Docker, deployment configs |
| `spec/` | 15 | Docs | TLA+ formal specifications |
| `scripts/` | 13 | Tooling | Build and migration scripts |
| `config/` | 12 | Config | Lint, test configuration |
| `e2e/` | 6 | Testing | Playwright E2E infrastructure |
| `.claude/` | 2 | Config | Claude AI settings |
| `.openhands/` | 1 | Config | OpenHands AI agent config |

*Note: Generated directories excluded: `node_modules/`, `playwright-report/`, `test-results/`, `.git/`, `.idea/`, `.vscode/`*

---

## Core Principles

### 1. 95% Data, 5% Code
- UI components, workflows, pages, business logic = **JSON**
- TypeScript/C++ only handles rendering and persistence

### 2. Schema-First Development
```
dbal/shared/api/schema/entities/    # YAML entities (SOURCE OF TRUTH)
schemas/package-schemas/            # JSON validation schemas
```

### 3. Multi-Tenant by Default
```typescript
// EVERY query must filter by tenantId - no exceptions
const records = await db.users.list({ filter: { tenantId } })
```

### 4. DBAL > Prisma > Raw SQL
```typescript
const db = getDBALClient()       // Highest - handles ACL, caching
const prisma = getPrismaClient() // Middle - only if DBAL doesn't support
// Raw SQL - never do this
```

### 5. One Lambda Per File
```
src/lib/users/createUser.ts   // One function per file
src/lib/users/listUsers.ts    // One function per file
```

### 6. JSON Script for Business Logic
```json
{
  "version": "2.2.0",
  "nodes": [
    { "id": "filter", "type": "operation", "op": "filter",
      "condition": "{{ $json.status === 'active' }}" }
  ]
}
```

---

## Key Subsystems

### DBAL - Database Abstraction Layer (`dbal/`)

**Structure**:
```
dbal/
├── development/          # TypeScript implementation (Phase 2 - CURRENT)
│   └── src/
│       ├── adapters/     # Prisma, Memory, ACL adapters
│       ├── blob/         # S3, filesystem, memory storage
│       ├── core/         # Client, types, errors
│       └── workflow/     # DAG executor, node executors
├── production/           # C++ implementation (Phase 3 - FUTURE)
└── shared/
    └── api/schema/       # YAML entity definitions (SOURCE OF TRUTH)
        ├── entities/     # 18 entity definitions
        └── operations/   # Operation specifications
```

**Entity Categories**:
| Category | Entities |
|----------|----------|
| Core | `user`, `session`, `workflow`, `package`, `ui_page` |
| Access | `credential`, `component_node`, `page_config` |
| Packages | `forum`, `notification`, `audit_log`, `media`, `irc`, `streaming` |
| Domain | `product`, `game`, `artist`, `video` |

### Workflow Engine (`workflow/`)

**Structure**:
```
workflow/
├── executor/             # Multi-language executors
│   ├── ts/               # TypeScript (primary)
│   ├── python/           # Python executor
│   └── cpp/              # C++ (planned)
├── plugins/              # Multi-language plugins
│   ├── cpp/              # 16 plugin categories
│   ├── python/           # Python plugins
│   ├── ts/               # TypeScript plugins
│   ├── go/               # Go plugins
│   ├── rust/             # Rust plugins
│   └── mojo/             # Mojo plugins
└── examples/             # 19 example workflows
```

**C++ Plugin Categories**: control, convert, core, dict, list, logic, math, string, notifications, test, tools, utils, var, web

### Frontends (`frontends/`)

| Frontend | Tech | Purpose |
|----------|------|---------|
| `cli/` | C++ | Command-line interface |
| `nextjs/` | React/Next.js | **Primary** web application |
| `qt6/` | C++/QML | Desktop application (22 packages) |

### Game Engine (`gameengine/`)

**Tech Stack**:
- **Graphics**: SDL 3.2.20, bgfx 1.129, MaterialX 1.39.1
- **3D/Physics**: Assimp, Bullet3, Box2D, GLM
- **Media**: FFmpeg 8.0.1, libvips, OGG/Vorbis/Theora
- **ECS**: EnTT 3.16.0

**Services** (36 interfaces): application_loop, lifecycle, audio, config, crash_recovery, graphics_backend, gui, input, materialx, render_graph, scene, shader_compiler, soundboard, workflow

### CodeForge IDE (`codegen/`)

Browser-based low-code IDE migrating to JSON-driven architecture:

- **~420 TSX files** (legacy) → **338 JSON definitions** (target)
- **Pattern**: JSON components + custom hooks
- **Framework layer** (173 TSX): Radix/Shadcn primitives - must stay TSX
- **Application layer** (256+ files): Business logic - converting to JSON

See [codegen/CLAUDE.md](./codegen/CLAUDE.md) for migration details.

### FakeMUI Component Library (`fakemui/`)

Material Design 3 component library with multi-implementation support:

**Current Organization** (Jan 23, 2026):
```
fakemui/
├── react/components/    # 145 production-ready React/TypeScript components
│   ├── atoms/          # Basic building blocks (9)
│   ├── inputs/         # Form controls (30)
│   ├── surfaces/       # Containers & cards (15)
│   ├── layout/         # Grid, Flex, Box, Stack (8)
│   ├── data-display/   # Tables, Lists, Trees (26)
│   ├── feedback/       # Alerts, Progress, Snackbars (6)
│   ├── navigation/     # Tabs, Drawers, Breadcrumbs (22)
│   ├── utils/          # Portals, Popovers, Tooltips (15)
│   ├── lab/            # Experimental features (11)
│   ├── x/              # Advanced components (11)
│   ├── theming/        # Material Design 3 theme
│   └── workflows/      # Workflow-specific components
├── qml/                # Desktop QML components (104+)
├── python/             # Python bindings (15 modules)
├── icons/              # 421 SVG icons
├── styles/             # 78 SCSS modules
├── theming/            # Theme configuration
└── legacy/             # Legacy utilities and migrations
```

**Component Coverage**: 145 total components across 9 categories
**Usage**: Import from `@metabuilder/fakemui` - all components exported from `index.ts`
**Status**: ✅ Production-ready, actively used in workflowui
**See**: [fakemui/STRUCTURE.md](./fakemui/STRUCTURE.md) for detailed layout and component mapping

### React Hooks (`hooks/`)

**Status**: ✅ Centralized hooks package (Jan 23, 2026)

**Package**: `@metabuilder/hooks@1.0.0` - 30 custom React hooks consolidated from across codebase

**Hook Categories** (by functionality):
- **Authentication** (4 hooks): useLoginLogic, useRegisterLogic, usePasswordValidation, useAuthForm
- **Dashboard & UI** (4 hooks): useDashboardLogic, useResponsiveSidebar, useHeaderLogic, useProjectSidebarLogic
- **Storage & Data** (3 hooks): useStorageDataHandlers, useStorageSettingsHandlers, useStorageSwitchHandlers
- **Design Tools** (2 hooks): useFaviconDesigner, useDragResize
- **Development** (1 hook): useGithubBuildStatus
- **Utilities**: Redux hooks (useAppDispatch, useAppSelector), Context utilities (ToastContext, I18nNavigation)

**Usage**:
```typescript
// Default import - all hooks
import { useDashboardLogic } from '@metabuilder/hooks'

// Conditional exports - tree-shaking
import { useLoginLogic } from '@metabuilder/hooks/useLoginLogic'
```

**Workspace Setup** (Jan 23, 2026):
- Added to root `package.json` workspaces array
- Properly configured `exports` in hooks/package.json for named imports
- Supports multi-version peer dependencies (React 18/19, Redux 8/9)
- Location: `/hooks/` at project root

### Utility Hooks (`redux/hooks-utils/`, `redux/hooks-forms/`)

**Status**: ✅ New high-priority utilities (Jan 23, 2026)

**Packages Created**:
- `@metabuilder/hooks-utils@1.0.0` - Data table, async operations, and timing utilities
  - `useTableState` - Unified data grid: pagination + sorting + filtering + search
  - `useAsyncOperation` - Non-Redux async with retry and caching
  - `useDebounced` - Value debouncing with leading/trailing options
  - `useThrottled` - Value throttling for continuous updates

- `@metabuilder/hooks-forms@1.0.0` - Form management with validation
  - `useFormBuilder` - Complete form state with field arrays and validation
  - Field-level and form-level error tracking
  - Touched/dirty state management
  - Submit state and error handling

**Impact**: Eliminates ~1,500 lines of duplicate code across codegen, workflowui, pastebin

**Usage**:
```typescript
import { useTableState, useAsyncOperation } from '@metabuilder/hooks-utils'
import { useFormBuilder } from '@metabuilder/hooks-forms'

// Data grid with all operations
const table = useTableState(items, { pageSize: 10, searchFields: ['name'] })
table.setSearch('filter')
table.sort('name')
table.addFilter({ field: 'status', operator: 'eq', value: 'active' })

// Non-Redux async
const { data, isLoading, execute } = useAsyncOperation(apiCall, { cacheKey: 'data' })

// Form with validation
const form = useFormBuilder({ initialValues: {}, onSubmit: submitForm })
```

---

### Redux State Management

**Current Status**: 12 packages total (10 Redux-specific + 2 utility packages)

**Packages**:
- `@metabuilder/hooks` - Centralized custom React hooks (30 total)
- `@metabuilder/hooks-utils` - Utility hooks with data/async helpers (NEW - Jan 23, 2026)
- `@metabuilder/hooks-forms` - Form management hooks (NEW - Jan 23, 2026)
- `@metabuilder/core-hooks` - Generic Redux hooks
- `@metabuilder/api-clients` - API client hooks
- `@metabuilder/hooks-*` - Feature-specific hooks (auth, canvas, data, core)
- `@metabuilder/redux-slices` - Redux reducers
- `@metabuilder/service-adapters` - Service adapters
- `@metabuilder/timing-utils` - Timing utilities

**Multi-Version Support** (Jan 23, 2026):
```json
{
  "peerDependencies": {
    "react": "18.0 || 19.0",
    "react-redux": "8.0 || 9.0",
    "@reduxjs/toolkit": "1.9.7 || 2.5.2"
  }
}
```

**Active Users**: workflowui, frontends/nextjs, codegen, pastebin, frontends/dbal

---

## Package System (`packages/`)

**62 packages** organized by category:

| Category | Packages |
|----------|----------|
| **Admin** | `admin`, `admin_dialog`, `database_manager`, `package_manager`, `user_manager`, `role_editor`, `route_manager` |
| **UI Core** | `ui_auth`, `ui_database_manager`, `ui_dialogs`, `ui_footer`, `ui_header`, `ui_home`, `ui_login`, `ui_pages` |
| **Dev Tools** | `code_editor`, `codegen_studio`, `component_editor`, `schema_editor`, `theme_editor`, `workflow_editor`, `nerd_mode_ide` |
| **Features** | `forum_forge`, `irc_webchat`, `media_center`, `notification_center`, `social_hub`, `stream_cast` |
| **Testing** | `api_tests`, `smoke_tests`, `testing`, `system_critical_flows` |

**Standard Package Structure**:
```
packages/{packageId}/
├── package.json              # Metadata + file inventory
├── components/ui.json        # UI component definitions
├── page-config/              # Route definitions
├── permissions/roles.json    # RBAC definitions
├── workflow/*.jsonscript     # JSON Script workflows
├── styles/tokens.json        # Design tokens
└── tests/                    # Test definitions
```

---

## Schema System

### Two-Layer Architecture

**Layer 1: YAML Entity Schemas** (Source of Truth)
```
dbal/shared/api/schema/entities/
├── core/           # user, session, workflow, package, ui_page
├── access/         # credential, component_node, page_config
├── packages/       # forum, notification, audit_log, media, irc, streaming
└── domain/         # product, game, artist, video
```

**Layer 2: JSON Validation Schemas**
```
schemas/package-schemas/
├── metadata_schema.json      # Package metadata
├── entities_schema.json      # Database entities
├── components_schema.json    # UI components
├── script_schema.json        # JSON Script v2.2.0
├── workflow.schema.json      # Workflow definitions
├── permissions_schema.json   # RBAC definitions
└── ... (27 total)
```

---

## Library Versions (Updated Jan 23, 2026)

| Library | Version | Notes |
|---------|---------|-------|
| **React** | 18.2.0 or 19.2.3 | Multi-version support via peer dependencies |
| **Next.js** | 14.2.0 - 16.1.2 | Normalized across subprojects |
| **TypeScript** | 5.9.3 | Consistent across all packages |
| **@reduxjs/toolkit** | 1.9.7 or 2.5.2 | Multi-version support |
| **react-redux** | 8.1.3 or 9.1.2 | Multi-version support |
| **Tailwind CSS** | 4.1.x | Normalized version |
| **ESLint** | 9.41.x | Latest stable |
| **Vite** | 7.4.x | Build tool for web apps |
| **Playwright** | Latest | E2E testing framework |

**Multi-Version Peer Dependencies**: Enable gradual upgrades without forcing all consumers to update together.

---

## Common Commands

```bash
# Development
npm run dev                 # Start Next.js dev server
npm run build               # Build for production
npm run typecheck           # TypeScript check
npm run lint                # ESLint check
npm run test:e2e            # Run Playwright E2E tests
npm run test:e2e:ui         # Playwright UI debug mode

# Database
npm --prefix dbal/development run codegen:prisma  # YAML → Prisma schema
npm --prefix dbal/development run db:push         # Apply schema changes
npm --prefix dbal/development run db:studio       # Prisma Studio UI

# CodeForge (in codegen/)
npm run audit:json          # Check JSON migration status
npm run build               # Build CodeForge IDE

# Monorepo
npm install                 # Install all dependencies
npm run build --workspaces  # Build all packages
```

---

## API Routing Pattern

```
/api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]

GET    /api/v1/acme/forum_forge/posts          → List
POST   /api/v1/acme/forum_forge/posts          → Create
GET    /api/v1/acme/forum_forge/posts/123      → Get
PUT    /api/v1/acme/forum_forge/posts/123      → Update
DELETE /api/v1/acme/forum_forge/posts/123      → Delete
POST   /api/v1/acme/forum_forge/posts/123/like → Custom action
```

**Rate Limits**: Login (5/min), Register (3/min), List (100/min), Mutations (50/min)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           FRONTENDS                              │
├─────────────────┬─────────────────────┬─────────────────────────┤
│   CLI (C++)     │   Qt6 (QML)         │   Next.js (React)       │
└────────┬────────┴──────────┬──────────┴──────────────┬──────────┘
         │                   │                          │
         └───────────────────┼──────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   DBAL Layer    │  TypeScript (Phase 2)
                    │   ACL, Caching  │  C++ (Phase 3)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    Database     │  SQLite (dev)
                    │                 │  PostgreSQL (prod)
                    └─────────────────┘
```

---

## Key Documentation

| Document | Purpose |
|----------|---------|
| [docs/CLAUDE.md](./docs/CLAUDE.md) | **Start here** - Full development guide |
| [docs/AGENTS.md](./docs/AGENTS.md) | Domain-specific rules |
| [docs/SCHEMAS_COMPREHENSIVE.md](./docs/SCHEMAS_COMPREHENSIVE.md) | All 27 JSON + 27 YAML schemas |
| [docs/PACKAGES_INVENTORY.md](./docs/PACKAGES_INVENTORY.md) | All 62 packages with files |
| [docs/RATE_LIMITING_GUIDE.md](./docs/RATE_LIMITING_GUIDE.md) | API rate limiting patterns |
| [docs/MULTI_TENANT_AUDIT.md](./docs/MULTI_TENANT_AUDIT.md) | Multi-tenant filtering |
| [spec/*.tla](./spec/) | TLA+ formal specifications |

---

## Coding Best Practices

### Pre-Commit Verification (Mandatory)

From [docs/CONTRACT.md](./docs/CONTRACT.md) - **ALL checks must pass**:

```bash
npm run build         # 1. Build Compliance
npm run typecheck     # 2. Type Safety (0 errors)
npm run lint          # 3. Code Quality
npm run test:e2e      # 4. E2E Tests
```

### Code Quality Rules

| Rule | Correct | Wrong |
|------|---------|-------|
| **One lambda per file** | `createUser.ts` with single function | Multiple functions in one file |
| **No @ts-ignore** | Fix type errors properly | Suppress with `@ts-ignore` |
| **No implicit any** | Concrete types for all values | Untyped variables |
| **No dead code** | All code is executed | Unused functions/variables |
| **Self-documenting** | Clear variable/function names | Cryptic abbreviations |
| **JSDoc on public APIs** | Document function signatures | Missing documentation |

### UI/Styling Standards

**For workflowui and new FakeMUI projects** (Primary):
```typescript
// ✅ ALWAYS use FakeMUI
import { Dialog, Button, Box } from '@metabuilder/fakemui'
<Button variant="contained">Click</Button>
<Box sx={{ display: 'flex', gap: 2 }}>Content</Box>
```

**For established projects** (Radix UI + Tailwind acceptable):
```typescript
// ✅ ACCEPTABLE - Radix + Tailwind in legacy projects
import { Dialog } from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
```

**Component Mapping**:
- FakeMUI Dialog ↔ MUI Dialog ↔ Radix Dialog
- FakeMUI Select ↔ MUI Select ↔ Radix Select
- FakeMUI sx prop ↔ MUI sx ↔ Tailwind classes

**❌ DO NOT USE**: Direct @mui/material imports (use FakeMUI instead). This is specifically prohibited in workflowui.

See [.github/copilot-instructions.md](./.github/copilot-instructions.md) for detailed guidelines.

### Known Issues and Exceptions

**postgres dashboard** - Currently uses @mui/material directly (P1 conflict identified Jan 23, 2026)
- Status: Should migrate to FakeMUI but not yet completed
- Impact: Creates competing UI framework in codebase
- Effort estimate: 2-4 hours to migrate
- Action: Use FakeMUI components instead of @mui/material

**Dependency Vulnerabilities** (Jan 23, 2026 - Status: NEEDS FULL FIX)
- **Verified (local npm audit)**: 7 moderate vulnerabilities (lodash 4.17.21 prototype pollution in @prisma/dev)
- **GitHub Dependabot claims**: 56 vulnerabilities (3 critical, 11 high, 36 moderate, 6 low)
- **Root causes identified**:
  - Invalid version: `eslint@^9.41.0` (doesn't exist, valid: 9.28.0) - Found in: dbal/development/package.json, codegen/package.json
  - Invalid version: `@eslint/js@^9.41.0` (doesn't exist)
  - Invalid version: `classnames@^2.5.2` (doesn't exist, valid: 2.3.2) - Found in: workflowui/package.json
  - vite override conflict in workspace prevents npm install
  - lodash only in dev chain (@prisma/dev) - LOW production risk
- **Current blocking issues**: npm install fails, npm audit fix fails
- **Fix status**: PARTIAL (eslint in dbal/development updated to 9.28.0, classnames in workflowui updated to 2.3.2, vite unresolved)
- **Required for FULL fix**:
  1. Find ALL workspaces with invalid versions (grep all package.json)
  2. Update eslint/eslint-js to ^9.28.0 everywhere
  3. Find vite override conflict (grep for "overrides", "resolutions")
  4. Align vite versions across all workspaces
  5. Clean install: rm -rf node_modules package-lock.json && npm install
  6. Run: npm audit fix --force (will update Prisma)
  7. Test ALL packages: build, tests pass
- **Time estimate**: 3-4 hours for FULL fix (cannot be done in shortcuts)
- **Documents**: txt/DEPENDENCY_AUDIT_DETAILS_2026-01-23.txt, txt/DEPENDENCY_FIX_PLAN_2026-01-23.txt
- **Action**: Use Explore agent to find ALL version constraints before fixing

### Testing Standards

```typescript
// Parameterized tests for all functions
it.each([
  { input: 'case1', expected: 'result1' },
  { input: 'case2', expected: 'result2' },
])('should handle $input', ({ input, expected }) => {
  expect(myFunction(input)).toBe(expected)
})
```

- Test files next to source: `utils.ts` + `utils.test.ts`
- Run `npm run test:coverage:report` to auto-generate coverage markdown
- All functions need test coverage

### Security Checklist

From [.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md):

- [ ] Input validation implemented
- [ ] No XSS vulnerabilities (no innerHTML with user data)
- [ ] No SQL injection (use DBAL, not raw queries)
- [ ] Passwords hashed with SHA-512
- [ ] No secrets committed to code
- [ ] Multi-tenant safety verified (tenantId filtering)

### PR Best Practices

From [.github/workflows/README.md](./.github/workflows/README.md):

1. **Descriptive titles** - Used for automatic labeling
2. **Link issues** - Enables automatic issue closing
3. **Keep PRs small** - Easier to review and merge
4. **No console.log** - Will be flagged in review
5. **No debugger statements** - Treated as blocking issues
6. **Test locally** - Run lint and tests before pushing

### Declarative-First Development

```typescript
// ❌ Hardcoded component
<UserForm user={user} onSave={handleSave} />

// ✅ Declarative from JSON
<RenderComponent component={{
  type: 'form',
  props: { schema: formSchema },
  children: [/* field components */]
}} />
```

**Questions to ask before coding**:
1. Could this be JSON configuration instead of TypeScript?
2. Could a generic renderer handle this instead of custom TSX?
3. Is this filtering by tenantId?
4. Does this follow one-lambda-per-file pattern?

---

## Dependency Management

### Conan (C++/System Libraries)

**Update Strategy**: All Conan dependencies follow semantic versioning with zero breaking changes. Updates completed:

| Subsystem | Changes | Status |
|-----------|---------|--------|
| CLI Frontend | cpr 1.10.0→1.14.1, lua 5.4.6→5.4.7, sol2 3.3.1→3.4.1, cmake 3.27.1→3.30.0 | ✓ Updated |
| Qt6 Frontend | qt 6.7.0→6.8.1, cmake 3.27.1→3.30.0, ninja 1.11.1→1.12.1 | ✓ Updated |
| DBAL | sqlite3 3.45.0→3.46.0 | ✓ Updated |
| Media Daemon | fmt 10.2.1→12.0.1, spdlog 1.12.0→1.16.0 | ✓ Updated |
| GameEngine | shaderc 2023.6→2024.3, rapidjson, stb, libalsa snapshots | ✓ Updated |

**Files**: See `txt/conan_updates_2026-01-23.txt` for complete list

### npm/Node.js (JavaScript/TypeScript)

**Security Focus**: 9 critical/high-priority packages updated

**Critical Security Patches**:
- Prisma 7.2.0→7.3.0 (lodash prototype pollution fix)
- Next.js 16.1.2→16.1.4

**High-Priority Updates**:
- @reduxjs/toolkit 1.9.7→2.5.2 (major version)
- jest: alpha.6→29.7.0 (unstable→stable)
- octokit 4.1.2→5.0.5
- React 19.0.0→19.2.3 (security patches)

**Files**: See `txt/npm_security_fixes_2026-01-23.txt` for complete list

### Workflow Plugin Dependencies (Multi-Language)

**Python Plugins** (138 files, 15 categories):
- Master `requirements.txt` + 7 category-specific files
- Core deps: python-dotenv, tenacity
- Runtime: Python 3.9+
- Location: `workflow/plugins/python/requirements*.txt`

**Go Plugins** (51 files, 14 categories):
- `go.mod` (root) + `go.work` (workspace coordination)
- Zero external dependencies (stdlib only)
- Runtime: Go 1.21+
- Location: `workflow/plugins/go/`

**TypeScript Plugins** (25 files, 9 categories):
- 94% standardized on `@metabuilder/workflow: ^3.0.0`
- 1 non-standard file uses `workspace:*` (minor issue, documented)
- Location: `workflow/plugins/ts/`

**Documentation**: See `txt/plugin_dependency_setup_2026-01-23.txt` and `workflow/plugins/DEPENDENCY_MANAGEMENT.md`

### Dependency Update Workflow

1. **Conan Updates**: Run `conan install . --build=missing` after updating versions
2. **npm Updates**: Run `npm install` at root, then `npm run build && npm run test:e2e`
3. **Python Plugins**: `pip install -r workflow/plugins/python/requirements.txt`
4. **Go Plugins**: `go work init`, then `go work use ./workflow/plugins/go`

### Known Issues & Gotchas

- **Jest Alpha in workflowui**: Was using unstable jest 30.0.0-alpha.6, now updated to 29.7.0. If tests fail, check jest.config.js compatibility.
- **Prisma Multi-Package Setup**: DBAL uses workspace dependencies; ensure `npm install` runs from root
- **Python Plugin Categories**: Some plugins may have conditional imports (e.g., Flask only imported when creating web services). Install full `requirements.txt` to avoid import errors.
- **Go Module Path**: Currently uses `github.com/metabuilder/workflow-plugins-go`; update if you change the GitHub organization

---

## AI Assistant Workflow

**CRITICAL: Must-Follow Directives** (No Exceptions):
1. **ALWAYS read CLAUDE.md first** - before starting any work or replying
2. **ALWAYS use Explore agent** - for feasibility checks, codebase analysis, planning
3. **ALWAYS plan before coding** - list affected files in txt/, determine scope
4. **ALWAYS full implementation** - no partial fixes, no shortcuts, no stubs
5. **ALWAYS use subagents** - for complex work (don't do it alone)
6. **UPDATE CLAUDE.md** - when finding bugs, gotchas, or new patterns discovered
7. **NO SUMMARY DOCUMENTS** - keep things organized, not documented to death
8. **SUBPROJECT DOCS** - each project owns its /docs/, not root
9. **GIT WORKFLOW** - when user says "git push", do `git add` on project root first, then commit
10. **CLEANUP** - regularly maintain project root (no orphaned files)
11. **CODE ORGANIZATION** - don't care if code unused, DO care if disorganized
12. **FEASIBILITY CHECKS** - outline what files will be edited before starting

**Gotchas & Lessons Learned** (Jan 23, 2026):
| Gotcha | Impact | Prevention |
|--------|--------|-----------|
| **Partial fixes committed** | Blocks full resolution, creates merge conflicts | Plan FULL solution before committing |
| **Skipping Explore agent** | Miss dependencies, make wrong decisions | Always use Explore for planning |
| **No planning document** | Don't know scope, make mistakes | Create plan in txt/ BEFORE coding |
| **Version conflicts (eslint, vite)** | npm install fails, blocks all work | Check ALL workspaces upfront |
| **Workspace issues isolated** | Problems not discovered until too late | Use `grep -r` across ALL workspaces |
| **Assuming fixes are simple** | Complex issues need comprehensive approach | Start with Explore, then plan |

**When to Use Subagents**:
- Large codebase audits (use Explore agent)
- Cross-project dependency analysis
- Systematic refactoring across multiple files
- Schema/configuration migrations
- Framework/library consolidation
- Performance profiling and optimization
- **Feasibility analysis BEFORE any implementation**

---

## Before Starting Any Task

1. **Read the relevant CLAUDE.md** for your work area
2. **Use the Explore agent** for codebase questions
3. **Check existing patterns** - find 2-3 similar implementations
4. **Plan affected files** - determine scope before coding
5. **Verify multi-tenant filtering** on all database queries
6. **Apply rate limiting** on API endpoints

**Full workflow details**: [docs/CLAUDE.md](./docs/CLAUDE.md)

---

## Project Organization Guidelines

### Root Directory (Clean)
Keep project root minimal - only essential files:
- Configuration: `.env.local`, `.gitignore`, `.npmrc`, `lefthook.yml`
- CI/CD: `Jenkinsfile`, `.gitlab-ci.yml`
- Build: `docker-compose.ghcr.yml`, `.dockerignore`
- Package: `package.json`, `package-lock.json`
- Testing: `playwright.config.ts`
- Docs: `CLAUDE.md` (AI Assistant Guide)

**Rule**: Move one-off scripts and old reports to `/txt/` folder

### Task Lists & Reports (`/txt/`)
For progress tracking, analysis documents, and delivery summaries:
- Current task lists (dated: `TASKNAME_2026-01-23.txt`)
- Dependency update reports
- Delivery and audit summaries
- Old reports archived with clear purpose

**Current Contents** (Jan 23, 2026):
- `ROOT_CLEANUP_PLAN_2026-01-23.txt` - Project root cleanup strategy
- `COMPLETION_STATUS.txt` - Task completion tracking
- `DEPENDENCY_UPDATES_INDEX_2026-01-23.txt` - Dependency management index
- `DEPENDENCY_AUDIT_DETAILS_2026-01-23.txt` - Vulnerability analysis (7 moderate verified)
- `DEPENDENCY_FIX_PLAN_2026-01-23.txt` - FULL fix plan (3-4 hours, all workspaces)
- `plugin_dependency_setup_2026-01-23.txt` - Workflow plugin dependencies
- `conan_updates_2026-01-23.txt` - C++ library updates
- `npm_security_fixes_2026-01-23.txt` - npm patches applied
- `README.md` - Organization guide

See: `txt/README.md` for organization guide

### Root-Level Docs (`/docs/`)
Keep `/docs/` focused on project-wide guidance:
- Core principles and patterns
- Architecture documentation
- Setup and installation
- Development workflows
- Schemas and API patterns
- Cross-project standards

### Per-Subproject Docs
Each standalone subproject maintains its own `/docs/` folder:
- `workflowui/docs/` - Workflow UI specific guides
- `codegen/docs/` - CodeForge IDE documentation
- `gameengine/docs/` - Game engine technical details
- `postgres/docs/` - PostgreSQL dashboard guides
- `fakemui/docs/` - Component library guides
- `packages/*/docs/` - Package-specific documentation

**Rule**: New detailed documentation → place in subproject `/docs/`, not root

### File Organization
- **No deletion of code** - just organize well
- **Implementation type first** - react/, python/, qml/, cpp/ folders
- **Component categorization** - atoms/, inputs/, surfaces/, navigation/, etc.
- **Preserve legacy code** - in legacy/ or archived folders with clear purpose
- **Keep things browseable** - short file lists per directory
- **Clean root** - move reports and utilities out of project root

---

**Status**: Production Ready (Phase 2 Complete)
**Next**: Universal Platform - Core Infrastructure (State Machine, Command Bus, Event Stream, VFS, Frontend Bus)
