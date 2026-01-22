# MetaBuilder - AI Assistant Guide

**Last Updated**: 2026-01-22
**Status**: Phase 2 Complete, Universal Platform in Progress
**Scale**: 27,826+ files across 34 directories (excludes generated)
**Philosophy**: 95% JSON/YAML configuration, 5% TypeScript/C++ infrastructure

---

## Quick Navigation

| Document | Location | Purpose |
|----------|----------|---------|
| **Core Development Guide** | [docs/CLAUDE.md](./docs/CLAUDE.md) | Full development principles, patterns, workflows |
| **CodeForge IDE Guide** | [codegen/CLAUDE.md](./codegen/CLAUDE.md) | JSON-to-React migration, component system |
| **Pastebin Conventions** | [pastebin/CLAUDE.md](./pastebin/CLAUDE.md) | Documentation file organization |
| **Domain-Specific Rules** | [docs/AGENTS.md](./docs/AGENTS.md) | Task-specific guidance |

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
| `fakemui/` | 758 | Standalone | Material UI clone (QML+React) |
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

## Common Commands

```bash
# Development
npm run dev                 # Start Next.js dev server
npm run build               # Build for production
npm run typecheck           # TypeScript check

# Database
npm --prefix dbal/development run codegen:prisma  # YAML → Prisma
npm --prefix dbal/development run db:push         # Apply schema
npm --prefix dbal/development run db:studio       # Prisma Studio

# Testing
npm run test:e2e            # Playwright E2E tests
npm run test:e2e:ui         # Playwright UI mode

# CodeForge (in codegen/)
npm run audit:json          # Check JSON migration status
npm run build               # Build CodeForge
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

## Before Starting Any Task

1. **Read the relevant CLAUDE.md** for your work area
2. **Use the Explore agent** for codebase questions
3. **Check existing patterns** - find 2-3 similar implementations
4. **Verify multi-tenant filtering** on all database queries
5. **Apply rate limiting** on API endpoints

**Full workflow details**: [docs/CLAUDE.md](./docs/CLAUDE.md)

---

**Status**: Production Ready (Phase 2 Complete)
**Next**: Universal Platform - Core Infrastructure (State Machine, Command Bus, Event Stream, VFS, Frontend Bus)
