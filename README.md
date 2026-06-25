# MetaBuilder

A meta-application platform. Define your application in JSON. MetaBuilder runs it.

**Scale**: 27,826+ files | ~540K LOC | 16 frontends | 16 libraries | 84 packages  
**Philosophy**: 95% JSON config, 5% TypeScript/C++ infrastructure  
**Status**: Production-ready platform — multi-tenant, schema-driven, workflow-executed

---

## What Is MetaBuilder?

MetaBuilder is a **platform for building applications from JSON**. Entities, workflows, UI components, permissions, pages, and game logic are all data — TypeScript and C++ are thin infrastructure that execute it. You define what your application does; MetaBuilder runs it.

The same JSON workflow engine that powers a Quake 3-compatible game loop also powers the web frontends, the DBAL event system, and the visual workflow editor. It is one architecture applied consistently across every domain.

| Domain | What's Built |
|--------|-------------|
| **Platform** | `frontends/nextjs` — the vision itself. 6-level permissions (Public→SuperGod), God Panel, 84 packages, `/{tenant}/{package}/{entity}` routing, JSON workflows. Same architecture as the game engine. |
| **Workflow Engine** | Multi-language DAG execution (TS/Python/C++/Rust/Go/Mojo) — runs everything |
| **Component Library** | M3 — 241-component Material Design 3 implementation (`@metabuilder/m3`) |
| **Game Engine** | JSON workflow game engine (SDL3 GPU C++) — Quake 3 proof of concept, any game possible |
| **IDE** | CodeForge — in-browser code generation studio (React + Monaco) |
| **Email Client** | Full IMAP/SMTP client (Next.js, phases 1–5 complete) |
| **Package Registry** | Multi-format: PyPI, Maven, Go modules, Cargo, Ruby, Nuget |
| **3D CAD / PCB** | Parametric 3D CAD (CadQuery) and PCB design automation |
| **Android Apps** | Kotlin/Compose GitHub client + CapRover mobile PaaS client |
| **Pastebin** | Full-stack code snippet manager (Next.js + Flask + DBAL C++) |
| **Admin Tooling** | PostgreSQL admin, Docker Swarm terminal, visual workflow editor |

---

## The JSON Workflow Game Engine

The game engine (`frontends/gameengine/`) demonstrates the full power of the workflow architecture: a **game-agnostic C++ engine** built on SDL3 GPU where every game system — rendering, physics, audio, input, AI, gameplay logic — is a composable JSON workflow step. There is no hardcoded game logic. A game is just a JSON file that wires steps together.

Quake 3 is the current proof of concept (fully playable), but the architecture is open: loading a GTA5 map, a Doom level, or a completely original game is a matter of authoring the right workflow steps, not changing the engine.

```bash
cd frontends/gameengine
cmake --build _build/Release --target sdl3_app
./_build/Release/sdl3_app --bootstrap bootstrap_linux --game quake3
```

| Subsystem | Implementation |
|-----------|---------------|
| Rendering | SDL3 GPU (Vulkan/Metal/DX12), deferred pipeline, shadow maps, TAA, SSAO, Bloom |
| Level loading | BSP (Quake 3 maps today — extensible to any format via workflow steps) |
| Physics | AABB collision, gravity, jump, friction — pmove implementation |
| Audio | 3D positional audio (OpenAL + Opus codec) |
| Gameplay | Weapons, ammo, damage, bots, pickups, movers, triggers, HUD, menus |
| AI | Bot navigation and pathfinding |
| **Total workflow steps** | **212 registered** |

**Game packages** (12): `quake3`, `quake3_screenshot`, `seed`, `standalone_cubes`, `bootstrap_linux`, `bootstrap_mac`, `bootstrap_windows`, `engine_tester`, `asset_loader`, `materialx`, `soundboard`, `assets`

**Performance**: 52+ FPS | ~3–5 ns per workflow step | 545 C++ files (289 .hpp + 256 .cpp)

> **Planned**: The `qt6` frontend is the natural launcher for the game engine — both are C++, both live in this monorepo. A Qt6 game browser that discovers installed game packages and launches the engine is a straightforward integration.

---

## Quick Start

```bash
# Deploy full stack
cd deployment
docker compose -f compose.yml up -d

# Build & deploy a specific app
python3 deployment.py build apps --force dbal pastebin

# Rebuild base images (rare)
python3 deployment.py build base
```

**Running services** (pastebin stack):
```
http://localhost/pastebin          # Next.js UI
http://localhost/pastebin-api      # Flask auth (register, login, Python runner)
http://localhost:8080              # DBAL C++ REST API (entities)
```

**Test accounts** (seeded automatically on first startup):

| User | Password | Namespaces | Snippets |
|------|----------|------------|---------|
| `demo` | `demo1234` | Default, Python Recipes, SQL Patterns, Utilities | 11 |
| `alice` | `alice1234` | Default, React Components, CSS Tricks, JS Utilities | 9 |
| `bob` | `bob12345` | Default, Go Patterns, Bash Scripts, API Design | 8 |

---

## Monorepo Layout

```
metabuilder/
├── libraries/              # 16 shared libraries
│   ├── dbal/               # C++ DBAL daemon (8 DB backends, JWT auth, event workflows)
│   │   ├── production/     # Drogon HTTP + 40 entity schemas
│   │   └── shared/         # JSON schemas, seed data, workflow definitions
│   ├── workflow/           # Multi-language DAG engine (TS/Python/C++, 41 examples)
│   ├── components/m3/      # M3 component library (241 components, @metabuilder/m3)
│   ├── hooks/              # 100+ React hooks
│   ├── redux/              # Redux slices, API clients, middleware
│   ├── schemas/            # JSON validation schemas
│   ├── icons/              # 421 icons
│   ├── types/              # Shared TypeScript types
│   ├── interfaces/         # TypeScript interfaces
│   ├── scss/               # Design tokens, shared SCSS
│   ├── translations/       # i18n (EN/ES)
│   ├── mojo/               # Mojo compiler + language examples
│   ├── cadquerywrapper/    # Parametric 3D CAD (Python/CadQuery)
│   ├── pcbgenerator/       # PCB design automation (Python)
│   ├── qml/                # Qt6 QML components
│   └── sparkos/            # Minimal Linux distro (C++/Qt6)
├── frontends/              # 16 application frontends
│   ├── gameengine/         # SDL3 GPU C++ game engine (Quake 3 ✅)
│   ├── pastebin/           # Code snippet sharing (Next.js + Flask + DBAL)
│   ├── codegen/            # CodeForge IDE (React + Monaco)
│   ├── workflowui/         # Visual workflow editor (n8n-style)
│   ├── postgres/           # PostgreSQL admin dashboard
│   ├── emailclient/        # Full email client (IMAP/SMTP)
│   ├── packagerepo/        # Multi-format package registry (PyPI/Maven/Go/Cargo)
│   ├── nextjs/             # Primary web UI
│   ├── cli/                # C++ command-line interface
│   ├── qt6/                # Desktop app (Qt6/QML)
│   ├── dockerterminal/     # Docker Swarm management UI
│   ├── storybook/          # Component docs & testing
│   ├── exploded-diagrams/  # Interactive 3D exploded views
│   ├── caproverforge/      # CapRover mobile client (Android/Kotlin)
│   ├── repoforge/          # GitHub Android client (Kotlin/Compose)
│   └── dbal/               # DBAL admin tools
├── packages/               # 84 feature packages
├── services/               # Background daemons (media, email, plugin-registry, SMTP)
├── deployment/             # Docker Compose stack + build scripts
├── docs/                   # SQLite3 docs (217 docs) + reports (212 reports), FTS5 search
├── e2e/                    # Playwright end-to-end tests
└── config/                 # Lint, test, misc configs
```

---

## Frontends (16)

### Web Applications

| Frontend | Stack | Status | Description |
|----------|-------|--------|-------------|
| `pastebin` | Next.js + Flask + DBAL C++ | Production | Multi-tenant code snippet manager. JWT auth, Redux + IndexedDB, 3 seeded accounts, event-driven user seeding via DBAL workflows. |
| `nextjs` | Next.js 16, React 19, App Router | Active | **The platform itself** — modern rewrite of the original MetaBuilder vision. 6-level permission system (Public → User → Moderator → Admin → God → SuperGod), God Panel (tab-driven meta-builder configured via JSON), 84 installable packages, `/{tenant}/{package}/{entity}` dynamic routing, JSON workflow execution, schema-driven CRUD. Same JSON-workflow architecture as the game engine, applied to web. |
| `workflowui` | React, n8n-style DAG editor | Functional | Visual workflow editor with 152+ plugin nodes. 92.6% Playwright E2E pass rate. |
| `codegen` | React + Monaco Editor | Functional | CodeForge IDE — in-browser code generation studio. Schema → component mapping, live preview. |
| `postgres` | Next.js + M3 | Functional | PostgreSQL admin dashboard. Fully migrated to `@metabuilder/m3` SCSS modules (no MUI). |
| `emailclient` | Next.js, Redux, M3 | Phases 1–5 | Full IMAP/SMTP email client. Frontend complete; Flask backend (phases 6–8) TODO. |
| `packagerepo` | Next.js | Framework | Multi-format package registry. Supports PyPI, Maven, Go modules, Cargo, Ruby Gems, Nuget. |
| `dockerterminal` | React | Functional | Docker Swarm management UI with interactive container terminal access. |
| `storybook` | Storybook | Functional | Component docs and testing. Previews MetaBuilder JSON packages without the full app. |
| `exploded-diagrams` | Next.js | Functional | Interactive 3D exploded views for component/assembly visualisation. |
| `dbal` | Next.js | Functional | DBAL Daemon overview UI + standalone `/api/status` endpoint. |

### Desktop & CLI

| Frontend | Stack | Status | Description |
|----------|-------|--------|-------------|
| `gameengine` | C++20, SDL3 GPU | Production | Custom game engine — Quake 3 fully playable. 212 JSON workflow steps. See section below. |
| `cli` | C++, Lua runtime | Functional | Command-line interface targeting MetaBuilder services via HTTP. Lua scripting for package execution. Conan + CMake. |
| `qt6` | Qt6, QML | Functional | Desktop app — Qt Quick replica of the MetaBuilder landing page. Platform-native look via QML. Natural future launcher for the game engine (both C++, same monorepo). |

### Mobile (Android)

| Frontend | Stack | Status | Description |
|----------|-------|--------|-------------|
| `caproverforge` | Kotlin, Jetpack Compose | Functional | CapRover PaaS mobile client. Native Android APK built via GitHub Actions. |
| `repoforge` | Kotlin, Jetpack Compose | Functional | GitHub + GitLab client. Dual login flow, native Android. |

---

## Architecture

```
Browser
  └── Next.js (React + Redux + IndexedDB)
        └── Flask (auth, Python runner, JWT)
              └── DBAL C++ daemon (REST API, 8 DB backends)
                    └── PostgreSQL (prod) / SQLite (dev)
```

**DBAL event flow** (user registration → automatic seeding):
```
POST /User  →  pastebin.User.created  →  WfEngine (detached thread)
                  └── on_user_created.json workflow
                        ├── dbal.uuid × 7
                        ├── dbal.timestamp
                        ├── dbal.entity.create → Namespace "Default"
                        ├── dbal.entity.create → Namespace "Examples"
                        └── dbal.entity.create × 5 → seed snippets
```

---

## Schema-First Development

Entity schemas in `libraries/dbal/shared/api/schema/entities/` are the **single source of truth** — consumed by the C++ DBAL daemon, TypeScript type generator, seed loader, and workflow engine.

40 entities across 10 categories: Core, CodeForge, Pastebin, Packages, Access, Gaming, E-commerce, Workspace, Video, Music.

```json
{
  "name": "Snippet",
  "tenantId": "pastebin",
  "package": "pastebin",
  "fields": [
    { "name": "id",          "type": "uuid",      "primary": true },
    { "name": "title",       "type": "string",    "required": true },
    { "name": "content",     "type": "string",    "required": true },
    { "name": "namespaceId", "type": "uuid",      "required": true },
    { "name": "tenantId",    "type": "string",    "required": true },
    { "name": "createdAt",   "type": "timestamp", "required": true }
  ]
}
```

After schema changes: `python3 libraries/dbal/shared/tools/codegen/gen_types.py`

---

## M3 — Material Design 3, Built From Scratch

`libraries/components/m3/` — `@metabuilder/m3`

M3 is **not** a wrapper around MUI or any other third-party component library. It is a full Material Design 3 implementation written from scratch in React + SCSS modules.

### Why not MUI?

MUI couples components to its own theming runtime (Emotion, `sx` prop, `ThemeProvider`, CSS-in-JS). That means:
- Every component carries the Emotion runtime (~10 KB gzip)
- Styling goes through a JS runtime at render time, not statically at build time
- Overriding anything deeply requires fighting the `sx` cascade or `styled()` wrappers
- You can't easily swap the component library without rewriting all style overrides

M3 takes the opposite approach — **SCSS modules are the preferred and enforced styling method**. Every component is styled with a `.module.scss` file co-located next to it. No `sx` prop, no `styled()` wrapper, no Emotion, no CSS-in-JS at runtime.

```tsx
// MUI: Emotion CSS-in-JS — styles computed at render time in JS
<Button sx={{ borderRadius: 2, px: 3 }}>Save</Button>

// M3: SCSS module — compiled to static CSS at build time, zero runtime cost
import styles from './Button.module.scss'
<button className={styles.root}>Save</button>
```

The `sx` prop does exist on some M3 components for gradual migration compatibility, but it is a thin shim (`sxToStyle`) that converts to inline styles — it is not the idiomatic path. New code uses SCSS modules directly. Any existing non-modular SCSS (global stylesheets, plain `.scss` imports) should be converted to `.module.scss` as encountered.

**M3 dependencies**: `classnames`, `clsx` — that's it. No MUI, no Emotion, no Radix, no Tailwind runtime.

### What's Included

241 components across 19 tree-shakeable categories:

| Category | Components |
|----------|-----------|
| `inputs` | TextField, Select, Checkbox, Radio, Switch, Slider, DatePicker, TimePicker, FileUpload, ColorPicker, Autocomplete, Rating |
| `atoms` | AutoGrid, Heading, Label, Panel, Section, StatBadge, Text, Title |
| `data-display` | Avatar, Badge, Chip, Divider, List, Markdown, Table, Tooltip, TreeView, Typography |
| `surfaces` | Card, Dialog, Drawer, Paper (via layout) |
| `navigation` | AppBar, Breadcrumbs, BottomNavigation, Menu, Pagination, ProjectSidebar, SpeedDial, Stepper, Tabs |
| `feedback` | Alert, Backdrop, Dialog, ErrorDisplay, LoadingContent, Progress, Skeleton, Snackbar, Spinner, Toast |
| `layout` | Box, Container, Grid, Stack |
| `database` | DataTable, QueryBuilder, EntityForm, SchemaViewer |
| `email` | 25+ (ThreadList, ComposeEditor, AttachmentViewer, MailSidebar…) |
| `canvas` | InfiniteCanvas, CanvasGrid, CanvasControls, MiniMap |
| `code` | CodeEditor, CodeHighlight, DiffViewer |
| `terminal` | Terminal emulator components |
| `workflows` | WorkflowCard, WorkflowEditor, WorkflowNode |
| `settings` | SettingsPanel, ThemeEditor, KeybindingEditor |
| `theming` | ThemeProvider, ColorSwatch, TokenEditor |
| `help` | HelpPanel, Shortcut, KeyCombo |

Import from any sub-path:
```ts
import { Button, TextField, Snackbar } from '@metabuilder/m3'
import { DataTable, QueryBuilder }     from '@metabuilder/m3/database'
import { InfiniteCanvas }              from '@metabuilder/m3/canvas'
import { ThreadList, ComposeEditor }   from '@metabuilder/m3/email'
```

Peer dependencies: React 18 or 19. Nothing else.

---

## DBAL — C++ Data Layer

`libraries/dbal/` — a production C++ REST API daemon built on the Drogon HTTP framework. It is the single data access point for the entire platform.

### What It Is

The DBAL (Database Abstraction Layer) daemon is a C++ binary that:
- Exposes a RESTful HTTP API for all entity operations
- Enforces multi-tenant isolation (`tenantId` on every query, no exceptions)
- Validates every write against JSON entity schemas
- Authenticates requests via JWT (issued by Flask, validated in C++)
- Enforces rate limits per IP via configurable sliding-window buckets
- Fires event-driven workflows asynchronously after CRUD operations
- Auto-seeds the database from declarative JSON files on startup

### Endpoints

```
GET    /{tenant}/{package}/{entity}          # list (filter, sort, paginate)
POST   /{tenant}/{package}/{entity}          # create
GET    /{tenant}/{package}/{entity}/{id}     # get by ID
PUT    /{tenant}/{package}/{entity}/{id}     # update
DELETE /{tenant}/{package}/{entity}/{id}     # delete
POST   /{tenant}/{package}/{entity}/batch    # bulk operations
GET    /health                               # health check
GET    /version                              # build info
GET    /schema/{tenant}/{package}            # introspect entity schemas
```

### Database Adapters (8)

| Adapter | Backend | Notes |
|---------|---------|-------|
| `sqlite` | SQLite3 | Dev/embedded — prepared statements, connection pool |
| `sql` | PostgreSQL, MySQL, MariaDB, CockroachDB | Jinja2 SQL templates (Inja), connection pooling, transactions |
| `mongodb` | MongoDB | mongo-cxx-driver, JSON↔BSON conversion |
| `redis` | Redis | Cache layer — read-through, write-through, cache-aside patterns |
| `elasticsearch` | Elasticsearch | Search layer — full-text indexing, analytics |
| `cassandra` | Cassandra | Wide-column store |
| `surrealdb` | SurrealDB | Multi-model (docs, graphs, KV) |
| `supabase` | Supabase REST | PostgreSQL + REST + Realtime |

Switch adapter at runtime — no rebuild required:
```bash
DATABASE_URL=sqlite://:memory: DBAL_ADAPTER=sqlite          # SQLite in-memory
DATABASE_URL=postgres://user:pass@host/db DBAL_ADAPTER=sql  # PostgreSQL
DATABASE_URL=redis://localhost:6379/0?ttl=300 DBAL_ADAPTER=redis  # Redis cache
```

### Event-Driven Workflows

After any CRUD operation, the DBAL can fire a workflow asynchronously in a detached thread. The workflow engine (`WfEngine`) maps event names to JSON workflow files and executes them against a fresh `dbal::Client` instance — isolated from the HTTP request that triggered them.

```
POST /pastebin/pastebin/User
  └── handleCreate() → entity stored → dispatchAsync("pastebin.User.created")
        └── detached std::thread
              └── WfExecutor: on_user_created.json (15 nodes)
                    ├── dbal.uuid × 7       → generate IDs
                    ├── dbal.timestamp      → current time
                    ├── dbal.entity.create  → Namespace "Default"
                    ├── dbal.entity.create  → Namespace "Examples"
                    └── dbal.entity.create × 5 → seed snippets
```

The 7 built-in workflow step types:

| Step | What It Does |
|------|-------------|
| `dbal.uuid` | Generate UUID v4, store to context via `outputs` |
| `dbal.timestamp` | Current timestamp (ms) |
| `dbal.entity.create` | `client.createEntity(entity, data)` |
| `dbal.entity.get` | `client.getEntity(entity, id)` |
| `dbal.entity.list` | `client.listEntities(entity, options)` |
| `dbal.var.set` | Set context variable |
| `dbal.log` | `spdlog::info(message)` |

Context variable resolution: `"${var_name}"`, `"${event.userId}"`, `"prefix-${var}-suffix"`

### Rate Limiting

Three configurable buckets — all enforced in C++, no middleware layer:

| Bucket | Default | Env Var |
|--------|---------|---------|
| Read operations | 1000 req/min | `DBAL_READ_RATE_LIMIT` |
| Mutations (create/update/delete) | 50 req/min | `DBAL_MUTATION_RATE_LIMIT` |
| Admin operations | 10 req/min | `DBAL_ADMIN_RATE_LIMIT` |

Keys off `X-Forwarded-For` (original client IP when behind nginx) or peer address.

### JWT Authentication

Configured via `DBAL_AUTH_CONFIG=/app/schemas/auth/auth.json`. Defines which endpoints require auth and what roles can access them. JWT tokens are issued by the Flask backend and validated in C++ — no round-trip to Flask on each request.

### Auto-Seeding

With `DBAL_SEED_ON_STARTUP=true`, the daemon loads all JSON files from `libraries/dbal/shared/seeds/database/` at startup. Seed operations are idempotent — existing records are skipped.

---

## Workflow Engine

`libraries/workflow/` — multi-language DAG execution.

**7 plugin runtimes**: TypeScript, Python, C++, Rust, Go, Mojo, registry  
**41 example workflows**: game loops, web server bootstrap, e2e tests, cross-project workflows  
**212 step types** (game engine): Graphics, Rendering, Q3 Gameplay (42 steps), Physics, Scene, Camera, Input, Audio, Control Flow, Math, String, Logic, Collections, Value, Composition

---

## React Hooks

`libraries/hooks/` — `@metabuilder/hooks` (100+ hooks)

Covers: data fetching, state management, storage (IndexedDB/localStorage), UI controls, pagination/sorting/filtering, canvas operations, workflow execution, GitHub API integration.

Packages: `@metabuilder/hooks`, `@metabuilder/hooks-utils`, `@metabuilder/hooks-forms`

---

## Development

```bash
# Frontend dev servers
cd frontends/pastebin && npm run dev
cd frontends/workflowui && npm run dev
cd frontends/codegen && npm run dev

# DBAL logs
docker logs -f metabuilder-dbal

# Search docs (SQLite FTS5)
cd docs && python3 docs.py search "topic"        # 217 docs, 13 categories
cd docs/txt && python3 reports.py search "topic" # 212 reports

# Type regeneration (after schema changes)
python3 libraries/dbal/shared/tools/codegen/gen_types.py

# Deploy Flask backend (separate from Next.js build)
docker compose -f deployment/compose.yml build pastebin-backend
docker compose -f deployment/compose.yml up -d pastebin-backend
```

---

## By the Numbers

| Metric | Value |
|--------|-------|
| Total files | 27,826+ |
| Frontends | 16 |
| Libraries | 16 |
| Feature packages | 84 |
| M3 components | 241 |
| M3 categories | 19 |
| Icons | 421 |
| Entity schemas | 40 |
| DBAL backends | 8 |
| Workflow steps (game engine) | 212 |
| Q3 gameplay steps | 42 |
| Game packages | 12 |
| Workflow examples | 41 |
| Plugin runtimes | 7 |
| React hooks | 100+ |
| Languages | TypeScript, C++, Python, Kotlin, Mojo, Go, Rust |
| Game engine FPS (Quake 3) | 52+ |
| C++ files (game engine) | 545 |

---

**Last Updated**: 2026-06-25  
**Roadmap**: See [ROADMAP.md](ROADMAP.md) for phase status and what's next.
