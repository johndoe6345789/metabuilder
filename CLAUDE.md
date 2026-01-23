# MetaBuilder - AI Assistant Guide

**Last Updated**: 2026-01-23
**Status**: Phase 2 Complete, Universal Platform in Progress
**Scale**: 27,826+ files across 34 directories (excludes generated)
**Philosophy**: 95% JSON/YAML configuration, 5% TypeScript/C++ infrastructure

**Recent Updates** (Jan 23, 2026):
- FakeMUI reorganized by implementation type (react/, qml/, python/, legacy/, icons/, theming/, styles/)
- All library versions updated: React 19.2.3, TypeScript 5.9.3, Next.js normalized, @reduxjs/toolkit 2.5.2
- Multi-version peer dependencies enabled for gradual upgrades

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
| `mojo/` | 82 | Standalone | Mojo language examples |
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

### Redux State Management

**Current Status**: 9 separate packages consolidating into single entry point

**Packages**:
- `@metabuilder/core-hooks` - Generic hooks
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

## AI Assistant Workflow

**Primary Directives**:
1. **Always read CLAUDE.md first** - before starting any work or replying
2. **Use the Explore agent** - for codebase audits, pattern discovery, feasibility checks
3. **Plan before coding** - outline affected files, use txt folder for task lists
4. **Minimize documentation** - avoid summary documents, keep documentation focused
5. **Per-subproject docs** - each subproject can have its own `docs/` folder (not root)
6. **Preserve code** - never delete unused code, organize it well instead
7. **Use subagents** - for complex, independent work (audits, refactoring, migrations)
8. **Update CLAUDE.md** - when finding bugs, gotchas, or new patterns

**When to Use Subagents**:
- Large codebase audits (use Explore agent)
- Cross-project dependency analysis
- Systematic refactoring across multiple files
- Schema/configuration migrations
- Framework/library consolidation
- Performance profiling and optimization

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

### Root-Level Docs
Keep `/docs/` focused on project-wide guidance:
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
- etc.

**Rule**: New detailed documentation → place in subproject `/docs/`, not root

### File Organization
- **No deletion of code** - just organize well
- **Implementation type first** - react/, python/, qml/, cpp/ folders
- **Component categorization** - atoms/, inputs/, surfaces/, navigation/, etc.
- **Preserve legacy code** - in legacy/ or archived folders with clear purpose
- **Keep things browseable** - short file lists per directory

---

**Status**: Production Ready (Phase 2 Complete)
**Next**: Universal Platform - Core Infrastructure (State Machine, Command Bus, Event Stream, VFS, Frontend Bus)
