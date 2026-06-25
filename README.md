# MetaBuilder

**Philosophy**: 95% JSON config, 5% TypeScript/C++ infrastructure
**Scale**: 27,826+ files | 16 frontends | 16 libraries | 84 packages
**Status**: Production-ready — Quake 3 playable on custom engine ✅

---

## What Is MetaBuilder?

MetaBuilder is a universal platform monorepo — a single repository that covers an unusually broad surface area:

| Domain | What's Built |
|--------|-------------|
| **Game Engine** | SDL3/bgfx C++ engine running Quake 3 (BSP, physics, weapons, bots, HUD) |
| **Platform** | Multi-tenant Next.js + C++ DBAL REST API with 8 database backends |
| **Component Library** | M3 — 241-component Material Design 3 clone (`@metabuilder/m3`) |
| **IDE** | CodeForge — in-browser code generation studio (React + Monaco) |
| **Workflow Engine** | Multi-language DAG engine (TS/Python/C++) with 212 registered steps |
| **Email Client** | Full IMAP/SMTP email client (Next.js) |
| **Package Repo** | Multi-format package registry (PyPI, Maven, Go, Cargo, Ruby, Nuget) |
| **3D CAD / PCB** | Parametric 3D CAD (CadQuery) and PCB design automation |
| **Android Apps** | Kotlin/Compose GitHub client, CapRover mobile PaaS client |
| **Pastebin** | Full-stack code snippet manager (Next.js + Flask + DBAL C++) |
| **Admin Dashboard** | PostgreSQL admin UI, Docker Swarm terminal, WorkflowUI editor |

Everything is driven by JSON — entities, workflows, UI components, game logic — with C++/TypeScript as thin infrastructure only.

---

## What's Running (Pastebin Stack)

```
http://localhost/pastebin          # UI
http://localhost/pastebin-api      # Flask auth (register, login, Python runner)
http://localhost:8080              # DBAL C++ REST API (entities)
```

**Test accounts** (seeded on first startup):

| User | Password | Namespaces | Snippets |
|------|----------|------------|---------|
| `demo` | `demo1234` | Default, Python Recipes, SQL Patterns, Utilities | 11 |
| `alice` | `alice1234` | Default, React Components, CSS Tricks, JS Utilities | 9 |
| `bob` | `bob12345` | Default, Go Patterns, Bash Scripts, API Design | 8 |

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

---

## Game Engine — Quake 3 on a Custom Engine

The game engine (`frontends/gameengine/`) is a production C++ engine built on SDL3/bgfx. Every system — rendering, physics, input, audio, gameplay — is implemented as composable JSON workflow steps.

**Running Quake 3**:
```bash
cd frontends/gameengine
cmake --build _build/Release --target sdl3_app
./_build/Release/sdl3_app --bootstrap bootstrap_linux --game quake3
```

**Engine capabilities**:
| Subsystem | Implementation |
|-----------|---------------|
| Rendering | bgfx (Vulkan/Metal/DX12), deferred pipeline, shadow maps, TAA, SSAO, Bloom |
| BSP loading | Full Quake 3 BSP: lightmap atlas, portal rendering, collision trees |
| Physics | AABB collision, gravity, jump, friction (pmove) |
| Audio | 3D positional audio, Opus codec |
| Gameplay | Weapons, ammo, damage, bots, pickups, movers, triggers, HUD, menus |
| AI | Bot navigation and movement |
| **Total workflow steps** | **212 registered** |

**Game packages** (12): `seed`, `standalone_cubes`, `quake3`, `quake3_screenshot`, `bootstrap_mac`, `bootstrap_linux`, `bootstrap_windows`, `engine_tester`, `asset_loader`, `materialx`, `soundboard`, `assets`

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
├── docs/                   # SQLite3 docs + reports (FTS5 search)
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

## M3 Component Library

`libraries/components/m3/` — `@metabuilder/m3`

241 TypeScript component files across 19 categories:

| Category | Examples |
|----------|---------|
| atoms | Avatar, Badge, Button, Chip, Typography |
| inputs | TextField, Select, Checkbox, DatePicker |
| data-display | Table, DataGrid, List, Accordion, Tabs |
| feedback | Snackbar, Alert, ProgressBar, Skeleton |
| navigation | AppBar, Breadcrumb, BottomNav, Stepper |
| layout | Box, Stack, Container, Grid |
| database | QueryBuilder, DataTable, specialized dialogs |
| email | 25+ email-specific components |
| canvas | InfiniteCanvas, CanvasGrid, CanvasControls |
| code | CodeEditor, CodeHighlight, Terminal |
| workflows | WorkflowCard, WorkflowNode, WorkflowEditor |

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

`libraries/workflow/` — multi-language DAG execution with **212 step types** (game engine) and **41 example workflows**.

**Plugin runtimes**: TypeScript, Python, C++, Rust, Go, Mojo

**Step categories** (game engine): Graphics, Input, Audio, Scene, Camera, Physics, Rendering, Q3 Gameplay (42 steps), Control Flow, Math, String, Logic, Collections, Value, Composition

---

## Development

```bash
# Frontend dev
cd frontends/pastebin && npm run dev
cd frontends/workflowui && npm run dev

# DBAL logs
docker logs -f metabuilder-dbal

# Search docs / reports
cd docs && python3 docs.py search "topic"
cd docs/txt && python3 reports.py search "topic"

# Type regeneration (after schema changes)
python3 libraries/dbal/shared/tools/codegen/gen_types.py
```

---

## Schema-First Development

Entity schemas live in `libraries/dbal/shared/api/schema/entities/` as JSON (40 entities across 10 categories: Core, CodeForge, Pastebin, Packages, Access, Gaming, E-commerce, Workspace, Video, Music).

They are the **single source of truth** — consumed by the C++ DBAL daemon, TypeScript type generator, seed loader, and workflow engine.

---

## By the Numbers

| Metric | Value |
|--------|-------|
| Frontends | 16 |
| Libraries | 16 |
| Feature packages | 84 |
| M3 components | 241 |
| Entity schemas | 40 |
| Workflow steps (game engine) | 212 |
| React hooks | 100+ |
| Workflow examples | 41 |
| Icons | 421 |
| DBAL backends | 8 |
| Languages | TypeScript, C++, Python, Kotlin, Mojo, Go, Rust |

---

**Last Updated**: 2026-06-25
