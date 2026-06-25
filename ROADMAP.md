# MetaBuilder Roadmap

> **The Single Source of Truth for MetaBuilder Development**

**Version:** 0.9.0
**Last Updated:** June 25, 2026
**Status:** Universal Platform — Quake 3 on custom engine ✅, C++ DBAL production ✅
**Scale:** 27,826+ files | 16 frontends | 16 libraries | 84 packages

---

## Executive Summary

**What's Done:**
- ✅ Full-stack multi-tenant platform (Next.js + Flask + C++ DBAL, 8 DB backends)
- ✅ C++ game engine running Quake 3 (BSP, physics, weapons, bots, HUD — 212 workflow steps)
- ✅ M3 component library — 241 components, 19 categories (`@metabuilder/m3`)
- ✅ Multi-language workflow engine (TS/Python/C++/Go/Rust/Mojo, 41 examples)
- ✅ 100+ React hooks, 84 feature packages, 40 JSON entity schemas
- ✅ Full email client, CodeForge IDE, visual workflow editor, PostgreSQL dashboard
- ✅ Package repository (PyPI/Maven/Go/Cargo/Ruby/Nuget), Android apps (Kotlin/Compose)
- ✅ Monorepo reorganised into `libraries/` + `frontends/` (June 2026)

**What's Next:**
- 🔄 Phase 3: Close out Backend Integration (rate limiting, OpenAPI)
- 🔮 Phase 4: Enhanced CRUD UI (rich forms, bulk ops, relationships)
- 🔮 Phase 5: God Panel (admin UI for routes, packages, schemas)
- 🔮 Phase 6: Advanced Features (full-text search, webhooks, audit logs)
- 🔮 Phase 7: Advanced Auth (OAuth, MFA, SSO)
- 🔮 Phase 8: Multi-Source Packages (remote registries, marketplace)
- 🔮 Phase 9: Universal Platform (State Machine, Command Bus, Event Stream, VFS)

---

## 📁 Monorepo Structure

```
metabuilder/
├── libraries/              # 16 shared libraries
│   ├── dbal/               # C++ DBAL daemon + 40 JSON entity schemas
│   ├── workflow/           # Multi-language DAG engine (41 examples, 7 runtimes)
│   ├── components/m3/      # M3 component library (241 components, @metabuilder/m3)
│   ├── hooks/              # 100+ React hooks
│   ├── redux/              # Redux slices, API clients, middleware
│   ├── schemas/            # JSON validation schemas
│   ├── icons/              # 421 icons
│   ├── types/              # Shared TypeScript types
│   ├── interfaces/         # TypeScript interfaces
│   ├── scss/               # Design tokens, shared SCSS
│   ├── translations/       # i18n (EN/ES)
│   ├── mojo/               # Mojo compiler + examples
│   ├── cadquerywrapper/    # Parametric 3D CAD (Python/CadQuery)
│   ├── pcbgenerator/       # PCB design automation (Python)
│   ├── qml/                # Qt6 QML components
│   └── sparkos/            # Minimal Linux distro (C++/Qt6)
├── frontends/              # 16 application frontends
│   ├── gameengine/         # SDL3/bgfx C++ game engine — Quake 3 ✅ (212 workflow steps)
│   ├── pastebin/           # Code snippet sharing (Next.js + Flask + DBAL)
│   ├── codegen/            # CodeForge IDE (React + Monaco)
│   ├── workflowui/         # Visual workflow editor (n8n-style)
│   ├── postgres/           # PostgreSQL admin dashboard (Next.js + M3)
│   ├── emailclient/        # Full email client (IMAP/SMTP, Next.js)
│   ├── packagerepo/        # Multi-format package registry
│   ├── nextjs/             # Primary web UI (Next.js + App Router)
│   ├── cli/                # C++ command-line interface
│   ├── qt6/                # Desktop app (Qt6/QML)
│   ├── dockerterminal/     # Docker Swarm management UI
│   ├── storybook/          # Component documentation
│   ├── exploded-diagrams/  # Interactive 3D exploded views
│   ├── caproverforge/      # CapRover PaaS client (Android/Kotlin/Compose)
│   ├── repoforge/          # GitHub client (Android/Kotlin)
│   └── dbal/               # DBAL admin tools
├── packages/               # 84 feature packages
├── services/               # Background daemons (media, email, plugin-registry, SMTP)
├── deployment/             # Docker Compose stack + build scripts
├── docs/                   # SQLite3 docs (217 docs) + reports (212 reports), FTS5
├── e2e/                    # Playwright end-to-end tests
└── config/                 # Lint, test, misc configs
```

---

## Status Dashboard

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| **0** | Foundation | ✅ Complete | 100% |
| **1** | MVP | ✅ Complete | 100% |
| **2** | Backend Integration | 🔄 Near-complete | ~80% |
| **2.5** | Monorepo Consolidation | ✅ Complete | 100% |
| **3** | Enhanced CRUD UI | 🔮 Planned | 0% |
| **4** | God Panel | 🔮 Planned | 5% |
| **5** | Advanced Platform Features | 🔮 Planned | 0% |
| **6** | Advanced Auth | 🔮 Planned | 0% |
| **7** | C++ DBAL Production | ✅ Complete | 100% |
| **7.5** | Monorepo Reorganisation + M3 | ✅ Complete | 100% |
| **8** | Multi-Source Packages | 🔮 In Progress | 10% |
| **9** | Universal Platform | 🔮 Planned | 0% |

**Overall: ~45–50% of written roadmap complete.**

Note: The project has grown significantly beyond the original roadmap scope. The game engine (Quake 3), email client, package registry, CAD tools, Android apps, and M3 library were not in the original plan.

---

## What's Working Today

### ✅ Game Engine (`frontends/gameengine/`)

The headline achievement. A C++ game engine built on SDL3/bgfx where **all game systems are JSON workflow steps**.

- **Quake 3 Arena fully playable**: BSP level loading, lightmap atlas, portal rendering, pmove (gravity/jump/friction/acceleration), weapons, ammo, damage, pickups, movers, triggers, bots, HUD, crosshair, hitmarkers, menus
- **212 registered workflow steps** across: graphics (10), rendering (40+), Q3 gameplay (42), physics (5), scene (8), camera (5), input (5), audio (7), control flow (5), math (9), string (10), logic (6), collections (8), value/utility (10), composition (2)
- **12 game packages**: `quake3`, `quake3_screenshot`, `seed`, `standalone_cubes`, `bootstrap_linux/mac/windows`, `engine_tester`, `asset_loader`, `materialx`, `soundboard`, `assets`
- **Rendering**: Deferred pipeline, shadow maps, TAA, SSAO, Bloom, tonemapping
- **Audio**: 3D positional audio, Opus codec

### ✅ DBAL C++ Daemon (`libraries/dbal/`)

Production REST API written in C++ (Drogon HTTP) with event-driven workflows.

- **8 database adapters**: sqlite, sql (postgres/mysql/mariadb/cockroachdb), mongodb, redis, elasticsearch, cassandra, surrealdb, supabase
- **40 entity schemas** across 10 domains: Core, CodeForge, Pastebin, Packages, Access, Gaming, E-commerce, Workspace, Video, Music
- **JWT authentication** + JSON ACL config (`auth.json`)
- **Event-driven workflows**: `POST /User → pastebin.User.created → on_user_created.json → 2 namespaces + 5 snippets` (detached thread)
- **Declarative seed data**: 24 JSON files in `libraries/dbal/shared/seeds/database/`, idempotent
- **Rate limiting**: C++ implementation in `production/src/security/rate_limiting/`

### ✅ M3 Component Library (`libraries/components/m3/`)

Material Design 3 clone. Zero MUI dependencies. `@metabuilder/m3`.

- **241 component files** across 19 categories
- Categories: atoms, inputs, buttons, data-display, surfaces, navigation, feedback, layout, database, email (25+ components), canvas, code, terminal, workflows, settings, theming, help
- Full SCSS modules, no `sx` prop
- PostgreSQL dashboard fully migrated to M3 (June 2026)

### ✅ Workflow Engine (`libraries/workflow/`)

Multi-language DAG execution.

- **7 plugin runtimes**: TypeScript, Python, C++, Rust, Go, Mojo, registry
- **41 example workflows**: game loops, e2e tests, web server bootstrap, cross-project workflows, Python math/dict/logic/string
- Dynamic plugin registry at `/api/plugins`

### ✅ React Hooks (`libraries/hooks/`)

100+ hooks across: data fetching, state, storage, UI controls, pagination/sorting/filtering, canvas, workflow, GitHub integration, favicon designer, project sidebar.

### ✅ Redux (`libraries/redux/`)

14 categories: adapters, api-clients, core, core-hooks, email, hooks, hooks-async, hooks-auth, hooks-canvas, hooks-data, hooks-forms, hooks-utils, middleware, persist, services, slices, timing-utils.

### ✅ Frontends

| Frontend | Status | Notes |
|----------|--------|-------|
| `pastebin` | ✅ Production | Next.js + Flask + DBAL; 3 seeded accounts |
| `workflowui` | ✅ Functional | n8n-style DAG editor; 92.6% E2E pass rate |
| `codegen` | ✅ Functional | CodeForge IDE; React + Monaco |
| `postgres` | ✅ Functional | PostgreSQL admin; full M3 migration |
| `emailclient` | ✅ Phases 1-5 | Frontend done; backend phases 6-8 TODO |
| `packagerepo` | ✅ Framework | PyPI/Maven/Go/Cargo/Ruby/Nuget support |
| `gameengine` | ✅ Production | Quake 3 playable |
| `nextjs` | ✅ Functional | Primary web UI |
| `qt6` | ✅ Functional | Desktop (Qt6/QML) |
| `cli` | ✅ Functional | C++ CLI |
| `storybook` | ✅ Functional | Component docs |
| `dockerterminal` | ✅ Functional | Docker Swarm UI |
| `exploded-diagrams` | ✅ Functional | 3D interactive views |
| `caproverforge` | ✅ Functional | Android/Kotlin |
| `repoforge` | ✅ Functional | Android/Kotlin |
| `dbal` | ✅ Functional | DBAL admin tools |

---

## Roadmap Phases

### ✅ Phase 0: Foundation (Complete — Pre-2026)

- [x] Next.js 16 + App Router + React 19
- [x] Prisma ORM + PostgreSQL + SQLite
- [x] DBAL architecture (TypeScript dev + C++ production)
- [x] Package system foundation (84 packages)
- [x] Generic JSON → React component renderer
- [x] Multi-tenant database schema (tenantId on every query)
- [x] 6-level permission system (Public → Supergod)

---

### ✅ Phase 1: MVP (Complete — January 2026)

- [x] Session-based user authentication
- [x] Permission checks with redirects + access denied UI
- [x] Dynamic package loading from filesystem
- [x] Schema-driven CRUD (list, detail, create, edit views)
- [x] Static page generation + ISR (`generateStaticParams`)
- [x] Code compilation (esbuild — TS/JS, minification, source maps)
- [x] 192 tests — 97.9% pass rate

---

### 🔄 Phase 2: Backend Integration (~80% — Q1 2026)

**Core complete:**
- [x] REST API endpoints — list, get, create, update, delete (`/api/v1/{tenant}/{package}/{entity}`)
- [x] TypeScript API client with retry (exponential backoff)
- [x] Zod validation middleware (all field types, nested objects, arrays)
- [x] Offset + cursor-based pagination with UI components
- [x] Filtering (eq, ne, gt, gte, lt, lte, in, notIn, contains, startsWith, endsWith, isNull)
- [x] Multi-field sorting
- [x] Auth middleware (session tokens, 401/403, allowPublic option)
- [x] Multi-tenant isolation in all queries
- [x] 194 new tests (retry, pagination, filtering, validation, auth middleware)

**Remaining (~20%):**
- [ ] Frontend rate limiting (C++ DBAL has it; Next.js frontend does not)
- [ ] OpenAPI/Swagger specification
- [ ] Standardised error response format (code, message, details)

---

### ✅ Phase 2.5: Monorepo Consolidation (Complete — January 2026)

- [x] 62 packages with auto-loading seed data
- [x] WorkflowUI migrated to root packages (77% file reduction)
- [x] FakeMUI restructured into M3 hierarchy

---

### ✅ Phase 7: C++ DBAL Production (Complete — March 2026)

- [x] C++ DBAL daemon (Drogon HTTP, 8 DB backends)
- [x] Full YAML → JSON migration (63 files, yaml-cpp removed)
- [x] JWT auth + JSON ACL (`auth.json`)
- [x] Event-driven workflow engine (detached threads, 7 step types)
- [x] Declarative seed data (24 JSON files, idempotent)
- [x] Flask auth backend (register, login, JWT, Python runner)
- [x] Pastebin full-stack (Next.js + Redux + IndexedDB + Flask + DBAL)
- [x] Dark/light theme switcher, i18n (EN/ES)

---

### ✅ Phase 7.5: Monorepo Reorganisation + M3 (Complete — June 2026)

- [x] Root reorganised into `libraries/` + `frontends/` category folders
- [x] `fakemui` → `m3`, package renamed `@metabuilder/fakemui` → `@metabuilder/m3`
- [x] Postgres dashboard fully migrated to SCSS modules (all sx props removed)
- [x] All 534 import/reference sites updated

---

### 🔮 Phase 3: Enhanced CRUD UI (Planned — Q3 2026)

**Goal:** Rich editing experience beyond auto-generated forms.

- [ ] RenderComponent integration for forms (field types: text, number, date, select, file upload)
- [ ] Real-time client-side validation (required, type, min/max, pattern, custom)
- [ ] Nested object + array field editing
- [ ] Relationship handling: foreign key dropdowns, many-to-many UI
- [ ] Advanced list: bulk select/delete/export, customisable views (table/grid/list)
- [ ] Frontend rate limiting (close out Phase 2)
- [ ] OpenAPI/Swagger specification

---

### 🔮 Phase 4: God Panel (Planned — Q3 2026, ~5% started)

**Goal:** Admin UI for zero-code system configuration.

- [ ] Route management (add/edit/delete PageConfig routes, visual priority editor)
- [ ] Package management (install/uninstall, config editor, dependency viewer)
- [ ] User management (create/edit users, role assignment, permission testing)
- [ ] Visual schema editor (entity builder, field type selector, validation rules)
- [ ] Component builder (JSON component editor, live preview, templates)

*Note: God panel page skeleton exists at `frontends/nextjs/src/app/app/god-panel/page.tsx`.*

---

### 🔮 Phase 5: Advanced Platform Features (Planned — Q4 2026)

**Goal:** Production-hardening the platform.

- [ ] Full-text search across entities (Elasticsearch adapter already exists)
- [ ] Global search UI
- [ ] Redis query result caching + component render caching
- [ ] Change history tracking + audit trail UI
- [ ] Entity change webhooks + event replay
- [ ] CSV/JSON bulk import/export
- [ ] Data backup/restore

---

### 🔮 Phase 6: Advanced Auth (Planned — Q4 2026)

**Goal:** Enterprise-grade authentication.

- [ ] OAuth 2.0 (Google, GitHub, Microsoft Azure AD)
- [ ] TOTP multi-factor authentication (Google Authenticator / Authy)
- [ ] Session refresh tokens + "Remember Me"
- [ ] Device management + concurrent session control
- [ ] Brute force protection + IP allowlisting
- [ ] Security audit logs

---

### 🔮 Phase 8: Multi-Source Packages (In Progress — 10%)

**Goal:** Open package ecosystem beyond local filesystem.

- [x] Package repository service (`frontends/packagerepo/`) — PyPI/Maven/Go/Cargo/Ruby/Nuget
- [ ] Remote package loading into MetaBuilder platform
- [ ] Package index API + version management
- [ ] Package marketplace UI (discovery, ratings, docs)
- [ ] Conflict resolution strategies (priority, latest-version, local-first)

---

### 🔮 Phase 9: Universal Platform (Planned — 2027)

**Goal:** True universal application framework.

- [ ] State Machine subsystem (declarative JSON FSM, visual editor)
- [ ] Command Bus (typed command dispatch, CQRS pattern)
- [ ] Event Stream (persistent ordered log, replay, projections)
- [ ] Virtual File System (VFS — abstraction over local, S3, git, memory)
- [ ] Frontend Bus (cross-component event mesh, replaces ad-hoc prop drilling)
- [ ] Platform SDK (unified API surface for all subsystems)

---

## Feature Status Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| **Platform** | | |
| Next.js frontend | ✅ Complete | App Router, RSC, 16 |
| Multi-tenancy | ✅ Complete | tenantId on every query |
| Package system | ✅ Complete | 84 packages, dynamic loading |
| JSON → React renderer | ✅ Complete | Generic component rendering |
| 6-level permissions | ✅ Complete | Public → Supergod |
| C++ DBAL daemon | ✅ Complete | Drogon, 8 backends |
| Event-driven workflows | ✅ Complete | Detached thread execution |
| Declarative seed data | ✅ Complete | 24 JSON files, idempotent |
| **Authentication** | | |
| Session-based auth | ✅ Complete | Secure cookies |
| JWT (DBAL) | ✅ Complete | Flask issues, C++ validates |
| Auth middleware | ✅ Complete | 401/403, 6-level check |
| OAuth / SSO | 🔮 Planned | Phase 6 |
| MFA (TOTP/SMS) | 🔮 Planned | Phase 6 |
| **CRUD & API** | | |
| REST API endpoints | ✅ Complete | list/get/create/update/delete |
| API client + retry | ✅ Complete | Exponential backoff |
| Zod validation | ✅ Complete | All field types |
| Pagination (offset + cursor) | ✅ Complete | UI components included |
| Filtering + sorting | ✅ Complete | All operators, multi-field |
| Rate limiting (DBAL) | ✅ Complete | C++ implementation |
| Rate limiting (frontend) | 🔮 Planned | Phase 3 |
| OpenAPI/Swagger | 🔮 Planned | Phase 3 |
| Rich form editor | 🔮 Planned | Phase 3 |
| Bulk operations | 🔮 Planned | Phase 3 |
| **Game Engine** | | |
| SDL3 + bgfx rendering | ✅ Complete | Deferred, TAA, SSAO, Bloom |
| BSP level loading | ✅ Complete | Quake 3 maps |
| Physics (pmove) | ✅ Complete | AABB, gravity, jump, friction |
| Q3 gameplay (42 steps) | ✅ Complete | Weapons, bots, HUD, menus |
| 3D positional audio | ✅ Complete | Opus codec |
| MaterialX PBR | ✅ Complete | materialx game package |
| Networking/multiplayer | 🔮 Planned | Not started |
| **Component Library (M3)** | | |
| 241 components, 19 categories | ✅ Complete | @metabuilder/m3 |
| 421 icons | ✅ Complete | Custom icon set |
| Zero MUI dependencies | ✅ Complete | All SCSS modules |
| QML components | ✅ Complete | Qt6 counterparts |
| **Workflow Engine** | | |
| TS/Python/C++ executors | ✅ Complete | Multi-language |
| 7 plugin runtimes | ✅ Complete | +Rust, Go, Mojo |
| 41 example workflows | ✅ Complete | Cross-project |
| 212 game engine steps | ✅ Complete | Full game loop |
| **Frontends** | | |
| Pastebin (full-stack) | ✅ Production | JWT, seeded users |
| WorkflowUI (visual editor) | ✅ Functional | 92.6% E2E |
| CodeForge IDE | ✅ Functional | Monaco editor |
| PostgreSQL dashboard | ✅ Functional | Full M3 migration |
| Email client | ✅ Phases 1-5 | Backend TODO |
| Package repository | ✅ Framework | Multi-format |
| Qt6 desktop | ✅ Functional | QML |
| Android apps (×2) | ✅ Functional | Kotlin/Compose |
| **Infrastructure** | | |
| Docker Compose stack | ✅ Complete | Full production stack |
| Multi-stage Dockerfiles | ✅ Complete | <500MB runtime images |
| GitHub Actions CI | ✅ Complete | CodeQL, build, test |
| SQLite3 docs (FTS5) | ✅ Complete | 217 docs, 212 reports |
| **Planned** | | |
| God Panel | 🔮 Phase 4 | Skeleton exists |
| Full-text search UI | 🔮 Phase 5 | ES adapter done |
| Webhooks + event replay | 🔮 Phase 5 | — |
| OAuth + MFA | 🔮 Phase 6 | — |
| Remote package marketplace | 🔮 Phase 8 | Repo framework done |
| State Machine / Command Bus | 🔮 Phase 9 | — |
| VFS / Event Stream | 🔮 Phase 9 | — |

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework, App Router + RSC |
| React | 19 | UI library |
| TypeScript | 5.9.3 | Type-safe JavaScript |
| SASS | Latest | SCSS modules |
| Redux Toolkit | 2.5 | State management |
| Zod | 4 | Schema validation |
| Vitest | Latest | Unit testing |
| Playwright | Latest | E2E testing |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| Drogon | Latest | C++ HTTP framework (DBAL daemon) |
| Flask | Latest | Python auth backend (pastebin) |
| PostgreSQL | Latest | Production database |
| SQLite3 | Latest | Development + embedded |
| Redis | Latest | Cache layer |
| nlohmann/json | Latest | C++ JSON (replaces yaml-cpp) |
| Inja | Latest | C++ Jinja2 templates (SQL) |

### Game Engine
| Technology | Version | Purpose |
|------------|---------|---------|
| SDL3 | 3.2.20 | Window, input, platform |
| bgfx | 1.129 | Cross-platform GPU abstraction |
| MaterialX | 1.39.1 | PBR material system |
| Bullet3 | Latest | 3D physics |
| Box2D | Latest | 2D physics |
| EnTT | 3.16.0 | Entity-Component-System |
| FFmpeg | 8.0.1 | Video/audio decoding |
| Assimp | Latest | 3D model loading |
| OpenAL | Latest | 3D audio |
| Opus | Latest | Audio codec |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy, SSL termination |
| GitHub Actions | CI/CD (CodeQL, build, test) |
| Jenkins | Internal build pipeline |
| Conan 2 | C++ dependency management |
| lefthook | Git hooks (pre-commit) |

---

## Release History

| Version | Date | Highlights |
|---------|------|-----------|
| **0.9.0** | June 25, 2026 | Monorepo reorganisation (libraries/+frontends/), fakemui→m3, postgres SCSS migration |
| **0.8.8** | March 4, 2026 | C++ DBAL production, event-driven workflows, JWT auth, pastebin full-stack, i18n EN/ES |
| **0.7.x** | February 2026 | Game engine Quake 3 support (BSP, pmove, 212 steps), 14 DB backends, WorkflowUI E2E |
| **0.5.x** | February 2026 | Visual workflow editor, dynamic plugin registry (152 nodes), email client phases 1-5 |
| **0.3.x** | January 2026 | Monorepo consolidation, 62 packages, WorkflowUI migration (77% file reduction) |
| **0.1.0** | January 2026 | MVP: auth, packages, CRUD, static generation, esbuild (97.9% test pass rate) |
| **0.0.0** | Pre-2026 | Foundation: Next.js, Prisma, DBAL architecture, multi-tenancy |

---

## By the Numbers

| Metric | Value |
|--------|-------|
| Total files | 27,826+ |
| Frontends | 16 |
| Libraries | 16 |
| Feature packages | 84 |
| M3 component files | 241 |
| M3 categories | 19 |
| Entity schemas | 40 |
| DBAL adapters | 8 |
| Game engine workflow steps | 212 |
| Q3 gameplay steps | 42 |
| Game packages | 12 |
| Workflow examples | 41 |
| Plugin runtimes | 7 |
| React hooks | 100+ |
| Icons | 421 |
| Languages | TypeScript, C++, Python, Kotlin, Mojo, Go, Rust |
| DBAL seed files | 24 |
| Docs indexed | 217 (docs.db) |
| Reports indexed | 212 (txt/reports.db) |

---

## What To Work On Next

### Close out Phase 2 (quick wins)
1. **Frontend rate limiting** — add `@upstash/ratelimit` or similar to Next.js API routes
2. **OpenAPI spec** — generate from entity schemas + route handlers
3. **Error response format** — standardise `{ code, message, details }` across all endpoints

### Phase 3 kickoff
1. **Rich form fields** — wire RenderComponent into create/edit forms
2. **Bulk operations** — multi-select + batch delete in list views

### Game engine (ongoing)
1. Shader validation steps
2. Render coordination steps
3. Multiplayer networking (not started)

---

*For AI assistant directives, gotchas, and coding standards, see `CLAUDE.md`.*
*For game engine step reference, see `QUICK_REFERENCE.md`.*
*For deployment commands, see `deployment/README.md`.*
