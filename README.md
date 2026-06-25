# MetaBuilder

A universal platform monorepo. One codebase. Every domain.

**Scale**: 27,826+ files | 16 frontends | 16 libraries | 84 packages  
**Philosophy**: 95% JSON config, 5% TypeScript/C++ infrastructure  
**Status**: Production-ready — Quake 3 fully playable on custom engine ✅

---

## What Is MetaBuilder?

MetaBuilder is a monorepo that covers an unusually wide surface area — not by sprawl, but by design. Every system is driven by the same JSON-first architecture: entities, workflows, UI components, and game logic are all data. C++ and TypeScript are thin infrastructure that execute it.

| Domain | What's Built |
|--------|-------------|
| **Game Engine** | SDL3/bgfx C++ engine — Quake 3 playable (BSP, physics, weapons, bots, HUD) |
| **Platform** | Multi-tenant Next.js + C++ DBAL REST API, 8 database backends |
| **Component Library** | M3 — 241-component Material Design 3 clone (`@metabuilder/m3`) |
| **Workflow Engine** | Multi-language DAG execution (TS/Python/C++/Rust/Go/Mojo) |
| **IDE** | CodeForge — in-browser code generation studio (React + Monaco) |
| **Email Client** | Full IMAP/SMTP client (Next.js, phases 1–5 complete) |
| **Package Registry** | Multi-format: PyPI, Maven, Go modules, Cargo, Ruby, Nuget |
| **3D CAD / PCB** | Parametric 3D CAD (CadQuery) and PCB design automation |
| **Android Apps** | Kotlin/Compose GitHub client + CapRover mobile PaaS client |
| **Pastebin** | Full-stack code snippet manager (Next.js + Flask + DBAL C++) |
| **Admin Tooling** | PostgreSQL admin, Docker Swarm terminal, visual workflow editor |

---

## Headline Achievement: Quake 3 on a Custom Engine

The game engine (`frontends/gameengine/`) is a C++ engine built on SDL3/bgfx where **every game system is a composable JSON workflow step** — the same engine that drives the UI platform also drives the game.

```bash
cd frontends/gameengine
cmake --build _build/Release --target sdl3_app
./_build/Release/sdl3_app --bootstrap bootstrap_linux --game quake3
```

| Subsystem | Implementation |
|-----------|---------------|
| Rendering | bgfx (Vulkan/Metal/DX12), deferred pipeline, shadow maps, TAA, SSAO, Bloom |
| BSP loading | Full Quake 3 BSP: lightmap atlas, portal rendering, collision trees |
| Physics | AABB collision, gravity, jump, friction — pmove implementation |
| Audio | 3D positional audio (OpenAL + Opus codec) |
| Gameplay | Weapons, ammo, damage, bots, pickups, movers, triggers, HUD, menus |
| AI | Bot navigation and pathfinding |
| **Total workflow steps** | **212 registered** |

**Game packages** (12): `quake3`, `quake3_screenshot`, `seed`, `standalone_cubes`, `bootstrap_linux`, `bootstrap_mac`, `bootstrap_windows`, `engine_tester`, `asset_loader`, `materialx`, `soundboard`, `assets`

**Performance**: 52+ FPS | ~3–5 ns per workflow step | 545 C++ files (289 .hpp + 256 .cpp)

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
│   ├── gameengine/         # SDL3/bgfx C++ game engine (Quake 3 ✅)
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

## M3 Component Library

`libraries/components/m3/` — `@metabuilder/m3`

241 TypeScript components across 19 categories. Zero MUI dependencies. Full SCSS modules.

| Category | Components |
|----------|-----------|
| atoms | Avatar, Badge, Button, Chip, Divider, Icon, Typography |
| inputs | Checkbox, DatePicker, RadioGroup, Select, Slider, Switch, TextField |
| buttons | ButtonGroup, FAB, IconButton, ToggleButton |
| data-display | Accordion, DataGrid, List, Table, Tabs, Timeline, Tooltip, Tree |
| surfaces | Card, Dialog, Drawer, Paper, Popover |
| navigation | AppBar, Breadcrumb, BottomNav, NavRail, Pagination, Stepper |
| feedback | Alert, LinearProgress, Skeleton, Snackbar, Spinner |
| layout | Box, Container, Grid, Stack |
| database | DataTable, QueryBuilder, EntityForm, SchemaViewer |
| email | 25+ email-specific (ThreadList, ComposeEditor, AttachmentViewer…) |
| canvas | CanvasControls, CanvasGrid, InfiniteCanvas, MiniMap |
| code | CodeEditor, CodeHighlight, DiffViewer, Terminal |
| workflows | WorkflowCard, WorkflowEditor, WorkflowNode |
| settings | SettingsPanel, ThemeEditor, KeybindingEditor |
| theming | ThemeProvider, ColorSwatch, TokenEditor |

---

## DBAL Backends (8)

| Adapter | Backend |
|---------|---------|
| `sqlite` | SQLite3 (dev/embedded) |
| `sql` | PostgreSQL, MySQL, MariaDB, CockroachDB |
| `mongodb` | MongoDB |
| `redis` | Redis (cache layer) |
| `elasticsearch` | Elasticsearch (search layer) |
| `cassandra` | Cassandra |
| `surrealdb` | SurrealDB |
| `supabase` | Supabase REST |

Switch adapter at runtime: `DATABASE_URL=sqlite://:memory: DBAL_ADAPTER=sqlite`

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
