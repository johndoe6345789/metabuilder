# MetaBuilder - AI Assistant Guide

**Last Updated**: 2026-08-08 | **Status**: Universal Platform — Quake 3 on custom engine ✅, all frontend backends on C++/Drogon
**Scale**: 27,826+ files | 16 frontends | 16 libraries | 84 packages | **Philosophy**: 95% JSON config, 5% TS/C++ infrastructure
**Documentation**: Code = Doc (self-documenting Python scripts with argparse)

---

## Code = Doc Principle

All documentation is executable code. No separate markdown docs.

```bash
# Entry points (each with --help)
./frontends/codegen/codegen.py --help          # CodeForge IDE
./frontends/pastebin/pastebin.py --help        # Pastebin
./frontends/postgres/postgres.py --help        # PostgreSQL dashboard
./libraries/mojo/mojo.py --help               # Mojo compiler
cd ../deployment && python3 deployment.py build base --list  # Docker base images (sibling repo)
```

There is no `docs/` tree. It was deleted on 2026-08-11 — no SQLite doc store,
no reports database, no markdown doc set. The code and this file are the
documentation; anything else is reconstructed on demand rather than stored.

---

## Completed Milestones (All ✅)

- **Aug 8**: Eliminated the last Flask backends — `pastebin`, `emailclient`, and `dockerterminal` rewritten to C++/Drogon/CMake/Ninja/Conan 2. Pastebin is now DBAL-only auth (no local password store); also gained one-shot code execution, interactive Python sessions, DAP debugging, and an AI proxy, all verified against a live Docker daemon. Removed the orphaned top-level Flask duplicate and disconnected Phase-8 planning docs/tests left over from the old architecture.
- **Jun 25**: Root reorganised into category folders (`libraries/`, `frontends/`), component library renamed to `m3` (`@metabuilder/m3`), postgres dashboard migrated to SCSS modules (all sx props removed)
- **Mar 4**: DBAL C++ event-driven workflow engine (`pastebin.User.created` → 15-node JSON workflow → seeded namespaces + snippets), full YAML→JSON migration (63 files, yaml-cpp removed), JWT auth + JSON ACL, declarative seed data (`dbal/shared/seeds/database/`), i18n (EN/ES) across all pastebin components, dark/light theme switcher
- **Feb 7**: Game engine CLI args (`--bootstrap`, `--game`), 27/27 tests passing (100%)
- **Feb 6**: 6 new DB backends (total 14), SQLite3 doc migration, Docker dev container, WorkflowUI E2E (92.6%)
- **Feb 5**: WorkflowUI mock DBAL testing, Settings/Help pages, DBAL env var config
- **Feb 4**: SQLiteAdapter generic refactoring, YAML Schema Spec 2.0, Dynamic entity loading (TS+C++), DBAL hooks integration, M3 migration
- **Feb 3**: Visual workflow editor (n8n-style), Dynamic plugin registry (152 nodes)
- **Feb 2**: WorkflowUI migration to root packages (77% file reduction)
- **Feb 1**: CodeQL search, M3 organization, Email components (22)
- **Jan 24**: Dependency fixes, testing library standardization
- **Jan 23**: Email client (Phases 1-5), Mojo compiler, M3 restructuring, dependency remediation

**Details**: These are summaries only — the completion reports they used to link to were in the deleted `docs/` tree.

---

## Directory Index

| Directory | Description |
|-----------|-------------|
| `libraries/dbal/` | C++ DBAL daemon (8 DB backends, JWT auth, event workflows, 40 entity schemas) |
| `libraries/workflow/` | Multi-language DAG engine (TS/Python/C++, 41 examples, 7 plugin runtimes) |
| `libraries/components/m3/` | M3 component library — 241 components, 19 categories (`@metabuilder/m3`) |
| `libraries/hooks/` | 100+ React hooks (`@metabuilder/hooks`, hooks-utils, hooks-forms) |
| `libraries/redux/` | Redux slices, API clients, middleware (14 categories) |
| `libraries/schemas/` | JSON Schema validation |
| `libraries/icons/` | 421 icons |
| `libraries/mojo/` | Mojo compiler + language examples |
| `libraries/cadquerywrapper/` | Parametric 3D CAD (Python/CadQuery) |
| `libraries/pcbgenerator/` | PCB design automation (Python) |
| `libraries/qml/` | Qt6 QML components |
| `libraries/sparkos/` | Minimal Linux distro (C++/Qt6) |
| `frontends/gameengine/` | SDL3 GPU C++ game engine — Quake 3 playable, **212 workflow steps** |
| `frontends/pastebin/` | Code snippet sharing (Next.js + C++/Drogon + DBAL) |
| `frontends/codegen/` | CodeForge IDE (React + Monaco) |
| `frontends/workflowui/` | Visual workflow editor (n8n-style, 152+ plugin nodes) |
| `frontends/postgres/` | PostgreSQL admin dashboard (Next.js + M3) |
| `frontends/emailclient/` | Full email client (IMAP/SMTP, Next.js) |
| `frontends/packagerepo/` | Multi-format package registry (PyPI/Maven/Go/Cargo/Ruby/Nuget) |
| `frontends/nextjs/` | Primary web UI (Next.js) |
| `frontends/cli/` | C++ command-line interface |
| `frontends/qt6/` | Desktop app (Qt6/QML) |
| `frontends/dockerterminal/` | Docker Swarm management UI |
| `frontends/storybook/` | Component documentation and testing |
| `frontends/exploded-diagrams/` | Interactive 3D exploded diagrams |
| `frontends/caproverforge/` | CapRover PaaS mobile client (Android/Kotlin) |
| `frontends/repoforge/` | GitHub Android client (Kotlin/Compose) |
| `packages/` | 84 modular feature packages |
| `services/` | Background daemons (media, email, plugin-registry, SMTP relay) |
| `.github/` | GitHub Actions, workspace assembly, templates |

---

## Core Principles

### 1. 95% Data, 5% Code
- UI, workflows, pages, business logic = **JSON**
- Entities NEVER hardcoded - loaded from JSON schemas
- Adapters NEVER hardcoded - discovered dynamically

### 2. Schema-First Development
```
dbal/shared/api/schema/entities/       # JSON entities (SOURCE OF TRUTH)
libraries/schemas/package-schemas/     # JSON validation schemas (27 total)
dbal/shared/seeds/database/            # Declarative JSON seed data
```

### 3. Multi-Tenant by Default
Every query MUST filter by `tenantId` - no exceptions.

### 4. Data Access Hierarchy
```
1. Redux + redux-persist     - Client-side state (IndexedDB)
2. DBAL hooks (fetch)        - Server data via C++ DBAL REST API
3. Raw SQL                   - NEVER
```

### 5. One Lambda Per File
`src/lib/users/createUser.ts` - one function per file.

### 6. JSON Script for Business Logic
Workflows defined in JSON with version 2.2.0 format.

---

## Key Subsystems

### DBAL (`dbal/`)

C++ REST API daemon. Client-side persistence handled by `@metabuilder/redux-persist` (IndexedDB).

```
dbal/
├── production/      # C++ daemon - SQLite, PostgreSQL, MySQL, Drogon HTTP
│   ├── src/config/  # EnvConfig (env vars, NO hardcoded paths)
│   ├── src/workflow/ # Event-driven workflow engine (WfEngine, WfExecutor, 7 step types)
│   ├── src/auth/     # JWT validation + JSON ACL config
│   ├── build-config/# Dockerfile, CMakeLists, conanfile (no yaml-cpp — JSON only)
│   ├── templates/sql/# Jinja2 SQL templates (Inja library)
│   └── .env.example # ~30 config options documented
├── shared/api/schema/
│   ├── entities/    # JSON entity definitions (39 entities, SOURCE OF TRUTH)
│   ├── events/      # event_config.json → workflow mappings
│   ├── workflows/   # on_user_created.json etc.
│   └── auth/        # auth.json (JWT + ACL rules)
└── shared/seeds/database/ # Declarative JSON seed data (auto-loaded at startup)
```

**Workflow Engine**: `pastebin.User.created` → detached thread → `on_user_created.json` → Default + Examples namespaces + 5 snippet templates. Event dispatch wraps `send_success` callback in entity route handler.

**Auto-Seed**: `DBAL_SEED_ON_STARTUP=true` → `SeedLoaderAction::loadSeeds()` in `registerRoutes()`. Seed files are idempotent (skip if records exist). Must call `ensureClient()` before seeding — `dbal_client_` is null during route registration.

**JWT Auth**: `DBAL_AUTH_CONFIG=/app/schemas/auth/auth.json` — defines which endpoints require auth and what roles can access them.

**Entity Categories**: Core (user, session, workflow, package, ui_page), Access (credential, component_node, page_config), Packages (forum, notification, audit_log, media, irc, streaming), Domain (product, game, artist, video)

**14 Database Backends**:
| Adapter | Backend | Notes |
|---------|---------|-------|
| memory | In-memory | Testing/development |
| sqlite | SQLite | Embedded, generic CRUD via templates |
| postgres | PostgreSQL | Direct connection, no ORM |
| mysql | MySQL | Direct connection |
| mariadb | MariaDB | Reuses mysql adapter |
| cockroachdb | CockroachDB | Reuses postgres adapter |
| mongodb | MongoDB | mongo-cxx-driver, JSON↔BSON |
| redis | Redis | Cache layer (L1/L2 with primary DB) |
| elasticsearch | Elasticsearch | Search layer (full-text, analytics) |
| cassandra | Cassandra | Wide-column store |
| surrealdb | SurrealDB | Multi-model (docs/graphs/KV) |
| supabase | Supabase REST/Direct | PostgreSQL + REST + Realtime + RLS |
| prisma | Prisma | ORM, HTTP bridge |

**Config**: `DBAL_SCHEMA_DIR`, `DBAL_TEMPLATE_DIR`, `DATABASE_URL` (adapter options as query strings)
**Endpoints**: `/health`, `/version`, `/status`, `/{tenant}/{package}/{entity}` (RESTful CRUD)

**Multi-Adapter Patterns** (both implemented 2026-08-16; before that the two
variables below were documented here and in `.env.example` but read by no code
at all — setting them got you a healthy, permanently idle container):
- **Redis caching**: `DBAL_CACHE_URL=redis://localhost:6379/0?ttl=300&pattern=read-through`
  — `CachingAdapter` decorates the primary adapter. Caches `read(entity, id)` only;
  writes invalidate, bulk writes SCAN+UNLINK the entity. Deliberately never caches
  `readIncludingSensitive()` (password hashes) or list/query results (no way to know
  which query keys a write invalidates).
- **Elasticsearch search**: `DBAL_SEARCH_URL=http://localhost:9200?index=dbal_search&refresh=true`
  — `SearchingAdapter` mirrors writes and answers
  `GET /{tenant}/{package}/{Entity}/_search?q=`. Mirroring is best-effort: a failed
  mirror logs and the primary write still succeeds, so the index can drift with no TTL
  bounding it. Bulk operations are not mirrored at all.
- Chain order is primary → search → cache. Each layer must forward any capability it
  does not implement, or the outermost one answers for all of them — `CachingAdapter`
  forwards `search()` for exactly this reason.
- **read-through is the only pattern that exists.** write-through, cache-aside,
  dual-write, CDC and search-first were listed here for a long time and were never
  implemented; a URL naming one is now refused rather than silently downgraded.

### Workflow Engine (`libraries/workflow/`)

Multi-language: executors (TS, Python, C++), plugins (7 runtimes: TS, Python, C++, Rust, Go, Mojo, registry), 41 example workflows. Dynamic plugin registry at `/api/plugins`. Game engine registers 212 step types.

### Game Engine (`frontends/gameengine/`)

SDL3 GPU C++ engine — **Quake 3 fully playable** (BSP, lightmaps, pmove, weapons, bots, HUD, menus). 212 registered workflow steps covering rendering (deferred, TAA, SSAO, Bloom), Q3 gameplay (42 steps), physics (AABB, gravity, friction), audio (3D positional, Opus), scene, camera, input, math, logic. 12 game packages including `quake3`, `quake3_screenshot`, `materialx`. CLI: `--bootstrap bootstrap_linux --game quake3`.

### CodeForge IDE (`frontends/codegen/`)

Visual code generation studio — React + Monaco editor. See `frontends/codegen/CLAUDE.md`.

### M3 (`libraries/components/m3/`)

**241 component files** across 19 categories (atoms, inputs, data-display, feedback, navigation, layout, database, email, canvas, code, terminal, workflows, settings, theming, help). Import from `@metabuilder/m3`. 421 icons, full SCSS modules — zero MUI dependencies.

### React Hooks (`libraries/hooks/`)

**100+ React hooks** across all common patterns: data fetching (useAsync, useFetch), state (useToggle, useCounter, useMap, useSet), storage (useLocalStorage, useKvStore, useBlobStorage), UI (useDragDrop, useHotkeys, useDialog, useClickOutside), pagination/sorting/filtering, specialized (useWorkflow, useGitHubBuildStatus, useFaviconDesigner, useCanvasKeyboard). Multi-version peer deps (React 18/19, Redux 8/9).

### Redux

12 packages: hooks, hooks-utils, hooks-forms, core-hooks, api-clients, hooks-*, redux-slices, service-adapters, timing-utils. Active in: workflowui, frontends/nextjs, codegen, pastebin.

### Email Client

Full-stack complete. Phases 1-5 frontend (DBAL schemas, M3 components, Redux slices, hooks, API endpoints) plus a C++/Drogon backend (IMAP/SMTP via libcurl, Postgres) and Docker Compose stack — no workflow-plugin layer or Flask involved.

---

## Package System (`packages/`)

84 packages: Admin, UI Core, Dev Tools, Features, Testing, WorkflowUI suite (17).

```
packages/{packageId}/
├── package.json, components/ui.json, page-config/
├── permissions/roles.json, workflow/*.jsonscript
├── styles/tokens.json, tests/
```

---

## API Routing

```
/api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]
```
Rate limits: Login 5/min, Register 3/min, List 100/min, Mutations 50/min.

---

## Architecture

```
Frontends (CLI C++ | Qt6 QML | Next.js React)
    → Redux + redux-persist (IndexedDB, client-side state)
    → DBAL C++ daemon (REST API, 14 backends)
        → Database (SQLite dev | PostgreSQL prod)
```

---

## Common Commands

```bash
npm run dev / build / typecheck / lint / test:e2e
npm run build --workspaces

# Local stack: nginx + frontend + DBAL, entirely from GHCR. Builds nothing —
# there is no `build:` key in deploy/compose.yml, by design. Runs anywhere
# Docker does, with no toolchain and no assembled workspace.
docker compose -f deploy/compose.yml up -d      # -> http://localhost:8080/app
docker compose -f deploy/compose.yml pull       # take whatever CI last published
docker compose -f deploy/compose.yml down       # -v also wipes the seeded DBAL data
TAG=<sha>-arm64 docker compose -f deploy/compose.yml up -d   # before :latest exists

# Base images and the stack live in the sibling deployment repo.
# In CI you pull the published base rather than building it:
docker pull ghcr.io/johndoe6345789/deployment/base-node-deps:latest
docker tag  ghcr.io/johndoe6345789/deployment/base-node-deps:latest \
            metabuilder/base-node-deps:latest

cd ../deployment && python3 deployment.py build base  # Build Docker base images

# Deploy full stack
cd ../deployment && python3 deployment.py stack up

# Build & deploy specific apps
python3 deployment.py build apps --force dbal pastebin  # Next.js frontend only
docker compose -f metabuilder/compose.yml build pastebin-backend  # C++/Drogon backend

# DBAL logs / seed verification
docker logs -f metabuilder-dbal
docker logs metabuilder-dbal 2>&1 | grep -i "workflow\|seed"

# Force re-seed
curl -X POST http://localhost:8080/admin/seed \
  -H "Authorization: Bearer $DBAL_ADMIN_TOKEN" -d '{"force": true}'
```

Pre-commit: `npm run build && npm run typecheck && npm run lint && npm run test:e2e`

---

## Coding Standards

### Code Quality Rules
- One lambda per file, no @ts-ignore, no implicit any, no dead code
- JSDoc on public APIs, self-documenting names
- FULL implementations only - no WIP code on main
- No disabled tests (DISABLED_, @skip)

### No Work-In-Progress Code
- No `-wip`, `-todo`, `-temp` directories
- All code is 100% complete OR not included
- Incomplete work on feature branches only

### UI/Styling
- **workflowui + new projects**: M3 only (`@metabuilder/m3`)
- **Legacy projects**: Radix UI + Tailwind acceptable
- **Never**: Direct MUI imports in workflowui or new M3-based apps
- **Preferred styling**: SCSS modules (`.module.scss`) — co-located next to component
- **Migration rule**: Non-modular SCSS (global stylesheets, plain `.scss` imports) should be converted to `.module.scss` as encountered
- **No `sx` prop on new code**: the `sxToStyle` shim exists for compatibility only; new components use SCSS modules directly

### WorkflowUI Components
- Atomic components ≤80 LOC, SCSS modules, no sx prop
- 80-character line length margin — keep lines within 80 chars
- **Heavy splitting**: when a component approaches 80 LOC, split aggressively — extract sub-components, hooks, or helpers rather than letting any single file grow. Prefer many small files over one large one.
- Categories: layout/, cards/, forms/, navigation/, feedback/
- Import pattern: `@/components/{domain}/{Component}`

### Security Checklist
- Input validation, no XSS (no innerHTML with user data), no SQL injection
- Passwords hashed SHA-512, no secrets committed, multi-tenant tenantId filtering

### Declarative-First
Ask: Could this be JSON config? Could a generic renderer handle this? Is it filtering by tenantId?

---

## CI/CD Infrastructure (sibling repo)

Both the build pipeline and credential manager are in `../jenkins/`
(`github.com/johndoe6345789/jenkins`) — a **separate repo in the same GitHub
folder**, not inside metabuilder.

### GitHub Actions (`.github/`)

Rebuilt from scratch after the repo split — the old monolithic
`gated-pipeline.yml` is gone and is **not** a reference (it built libraries,
packages and DBAL that no longer live here).

| Workflow | Covers | Notes |
|----------|--------|-------|
| `nextjs.yml` | lint, typecheck, unit, build, E2E | Needs 11 repos / 13 mounts |
| `cli.yml` | Conan + CMake, Release & Debug | Self-contained; no mounts |
| `qt6.yml` | CMake + prebuilt Qt (aqtinstall) | **No Conan** — see below |
| `docker.yml` | Publishes `metabuilder/{nextjs-app,cli}` to GHCR | Every push to main; multi-arch |
| `bump-workspace-pins.yml` | Weekly pin refresh → PR | Manual dispatch too |

**Container images** — `docker.yml` builds both app images natively on
`ubuntu-latest` + `ubuntu-24.04-arm`, pushes `:<sha>-<arch>`, then joins them
with `docker buildx imagetools create` into `:latest` and `:<sha>`. It runs on
*every* push because it no longer builds a base image: the sibling
[deployment](https://github.com/johndoe6345789/deployment) repo publishes
`deployment/base-{apt,conan-cli,node-deps}` to GHCR and these jobs pull one,
retagging it to the `metabuilder/base-*:latest` name the app Dockerfiles
expect (their `ARG BASE_REGISTRY=metabuilder` default makes this work with no
Dockerfile change). A stale base costs build minutes, never correctness — the
app Dockerfiles re-run `npm install` / `conan install --build=missing`
themselves — which is why the app pipeline never blocks on the base pipeline.

**Qt6 does not use Conan in CI.** `conanfile.txt` requests `qt/6.7.3`, for which
Conan has no prebuilt binary, so `--build=missing` would compile Qt from source
— hours of runner time and enough disk to exhaust the runner. `qt6.yml` instead
installs the same version prebuilt via `aqtinstall` (the approach
`CPlusPlusQT6Skel/python/download_qt6/` already uses) and points CMake at it
with `CMAKE_PREFIX_PATH`. `conanfile.txt` is left untouched and is still the
source of truth for the **version** — the workflow parses `qt/<version>` out of
it rather than hardcoding, so the two cannot drift. This works because
`CMakeLists.txt` includes `conan_toolchain.cmake` with `OPTIONAL`.

**Workspace assembly** — metabuilder follows a micro-repo model, so the npm
workspaces under `libraries/*` and the QML paths in
`frontends/qt6/CMakeLists.txt` point at directories that no longer exist here.
`.github/workspace.json` records the repo → mount-path map (this is the
mapping the reposplit README left as a TODO), and
`.github/scripts/assemble_workspace.py` clones them into place.

```bash
python3 .github/scripts/assemble_workspace.py --frontend nextjs   # 9 repos
python3 .github/scripts/assemble_workspace.py --frontend qt6      # QML only
python3 .github/scripts/assemble_workspace.py --all --dry-run
python3 .github/scripts/bump_pins.py --check                      # pins behind?
```

Sibling repos are assembled at their **branch heads**, not at the SHAs in
`workspace.json` (changed 2026-08-16 — development across the micro-repos is
rapid enough that a pinned build was reliably a stale one). Two consequences,
both deliberate: a push in another repo **can** redden CI here, and a build is
not reproducible from `workspace.json` after the fact. Pass `--pinned` to the
script, or `floating: false` to the `assemble-workspace` action, to rebuild
from the recorded SHAs; `nextjs.yml` exposes this as a `pinned` dispatch input.
The pins are still bumped by `bump-workspace-pins.yml` so they stay a usable
record of a known-good set. Set the `WORKSPACE_TOKEN` secret to a PAT if any
sibling repo is private — the default `GITHUB_TOKEN` only sees this repo.

### Sibling micro-repo CI (2026-08-11)

All 56 reposplit micro-repos now carry a standalone `.github/workflows/ci.yml`,
generated from what each repo actually contains rather than a shared template.
Archetypes: npm (with sibling assembly where needed), C++/CMake (+Conan where a
conanfile exists), Python (`compileall` + requirements), and JSON validation for
data-only repos.

Two traps worth knowing when touching those workflows:

- **The m3 family can't `npm install` standalone.** `@metabuilder/*` is never
  published to npm (404), and the family resolves each other through *flat*
  relative paths (`../../icons/react/m3`). Their CI clones the family into a
  sibling layout and generates a root `package.json` with workspaces — and it
  needs `overrides` pinning `react`/`react-dom`/`react-redux`, or npm resolves
  `react-redux@9.0.4` (peer `react ^18`) against React 19 and dies on ERESOLVE.
- **Several repos have no root `package.json`** (`blog`, `wiki`, `packages`,
  `platform-core`, …) — packages are nested under `admin/`, `services/*/admin/`
  etc. Install per package directory; a root `npm install` fails with ENOENT.
- **Consumer apps use Verdaccio, not sibling assembly.** `codegen_studio`,
  `email_client` and `dbal` merely *consume* `@metabuilder/*`; their CI stands up
  Verdaccio, publishes those packages from their own source repos, and installs
  against it — so the app resolves them exactly as a real consumer would.
  Verdaccio's **default config** suffices (it proxies npmjs and lets an
  authenticated user publish scoped packages); don't hand-write one. 24 of 26
  packages publish; the 2 skipped are `private: true`. Note `@metabuilder/components`
  packs a broken tarball — its `main` is `./index.tsx` and the `./` prefix isn't
  matched by `files`. Sibling assembly is still correct for the m3 family itself,
  which resolves *relative* cross-repo paths that a registry cannot satisfy.

### Jenkins (`../jenkins/`)

Docker Compose: controller + nginx + 8 SSH agents + `registry:2` (no-auth, `:5001`).

**Jobs:**
- `metabuilder-base-images` — builds apt/node/pip/conan base images (serial: build→push→prune)
- `metabuilder-base-heavy` — big conan bases (dbal/qt6/gameengine), disk-gated, run rarely
- `metabuilder-apps` — pulls last-good bases, builds & pushes app images; runs every commit
- `metabuilder` — orchestrator (base-images → apps)
- `metabuilder-deploy` — pulls images, retags to `deployment-<svc>:latest`, runs `deployment.py stack up`

Build and deploy are fully split. Management CLI: `../jenkins/scripts/setup.py`.
Secrets in `../jenkins/secrets/` (gitignored). Bootstrap: `setup.py secrets ...`.

### Vault (`../jenkins/scripts/vault/`)

Drogon C++ credential manager — stores and **rotates** all secrets across the stack.
- `vault-backend` on `:5055`, `vault-frontend` on `:4100`, `vault-db` (PostgreSQL)
- 8 rotation adapters: `env_var`, `db_sha512`, `db_werkzeug`, `db_bcrypt`,
  `db_bcrypt_sqlite`, `pyracms_pbkdf2`, `grafana_api`, `keycloak_realm`, `caprover`
- Secrets it manages live in `../jenkins/secrets/*.env` — **never commit these**
  (`pastebin.env`, `vault.env`, `pkgrepo-registry.env`, `postgres-dashboard.env`, etc.)

```bash
cd ../jenkins/scripts/vault && docker compose up -d   # UI: http://localhost:4100
```

---

## Dependency Management

### Conan (C++)
Updated: cpr, lua, sol2, cmake, qt, ninja, sqlite3, fmt, spdlog, shaderc. Run `conan install . --build=missing`.

### npm
Multi-version peer deps. React 18/19, TypeScript 5.9.3, Next.js 14-16, @reduxjs/toolkit 1.9/2.5. Run `npm install` at root.

### Workflow Plugins
- Python: `requirements.txt` (Python 3.9+)
- Go: `go.mod` + `go.work` (Go 1.21+, stdlib only)
- TypeScript: `@metabuilder/workflow: ^3.0.0`

### Known Issues
- postgres dashboard uses M3 (`@metabuilder/m3`) — do not introduce MUI/Radix imports
- 7 moderate npm vulnerabilities (lodash in @prisma/dev, LOW production risk)
- eslint/vite version conflicts in some workspaces (partially fixed)

---

## AI Assistant Directives

**Must-Follow** (No Exceptions):
1. Read CLAUDE.md first before any work
2. IMPLEMENT, don't delete - fix compilation errors properly
3. Use Explore agent for feasibility checks and planning
4. Plan before coding - list affected files, determine scope
5. CHECK before DELETE - `git show HEAD:path` first
6. Use subagents for complex work
7. Update CLAUDE.md with new gotchas/patterns
8. Do NOT write reports or docs to disk — there is no doc store any more. Report findings in the conversation; record durable gotchas in this file
9. Git: `git add` on project root first, then commit
10. Use `mv` not `cp` (prevents duplicates)
11. Log long commands to the session scratchpad: `| tee /tmp/command-$(date +%Y%m%d-%H%M%S).log`

### Gotchas & Lessons Learned

| Gotcha | Prevention |
|--------|-----------|
| Conan profile in Docker mount | Run `conan profile detect` INSIDE cache-mounted RUN |
| Missing types after refactor | Verify all referenced types exist before committing |
| Headers in src/ not include/ | Use relative paths or fix build include dirs |
| No logs for long commands | ALWAYS pipe to a scratchpad log: `\| tee /tmp/<name>-$(date +%Y%m%d-%H%M%S).log` |
| Dockerfile `build/` conflict | Use `_build/` |
| Drogon wildcard routes | Check docs for path param syntax |
| `cp` instead of `mv` | ALWAYS use `mv` to relocate |
| Deleting without checking | ALWAYS `git show HEAD:path` first |
| Skipping Explore agent | Always Explore before implementation |
| Version conflicts (eslint, vite) | Check ALL workspaces upfront |
| nlohmann/json includes | Link to ALL targets, not just transitive |
| Docker Compose YAML special chars | Quote env vars: `"DATABASE_URL=:memory:"` |
| nlohmann/json iterators | Use `it.value()` not `it->second` (std::map syntax fails) |
| dbal-init volume stale | Rebuild with `docker compose build dbal-init` when schema file extensions change |
| `.dockerignore` excludes `dbal/` | Whitelist specific subdirs: `!dbal/shared/seeds/database` |
| `deployment.py build apps pastebin` ≠ backend | That only rebuilds Next.js — the C++ backend needs `docker compose build pastebin-backend` |
| `ensureClient()` before startup DB ops | `dbal_client_` is null in `registerRoutes()` — must call `ensureClient()` first |
| Seed data in backend service code | NEVER — declarative seed data belongs in `dbal/shared/seeds/database/*.json` |
| Seed `"bootstrap": true` vs `skipIfExists` | `bootstrap: true` (fixed system fixtures like `credentials.json`, `users.json` — not organic content) now reconciles to the seed file on *every* startup, even without `--force`: `skipIfExists` only short-circuits whole-document loading for non-bootstrap docs. Existing bootstrap rows are upserted via `updateEntity` on conflict instead of skipped, so e.g. a password-hashing-algorithm migration doesn't leave old dev DB volumes with permanently-broken demo logins. Non-bootstrap seeds (sample content a user might edit) keep the old skip-if-exists-and-never-touch-again behavior — don't flip `bootstrap: true` on those. See `seed_loader_action.cpp` |
| `loadFromDirectory` vs `loadFromFile` | Both must stay in sync — `loadFromDirectory` is used in production; check both when adding schema parsing features |
| There are **two** schema loaders and they drifted — the strict one gates security | `adapters/schema_loader.hpp` (tolerant) registers entities for CRUD routes; `core/entity_loader.cpp` + `core/loaders/*` (strict) feeds `SchemaAclRegistry`, which answers `schema.acl.<op>.system`. The strict one threw or rejected where the tolerant one shrugged, so it loaded **26 of 51** files while CRUD registered **57 entities** — and since `SchemaAclRegistry::isSystemOnly` **fails open** on entities it never loaded, `EmailAttachment.create`, `MediaJob.create/update` and `Notification.create` were exposed through the generic routes despite declaring `system: true`. Six concrete drifts, all now fixed: `parseACLOperation` did `get<bool>()` on every ACL value (schemas legitimately carry `"role": ["admin"]`, `"role": "user"`, `"uploaderId": "{{ currentUserId }}"`, and array-of-alternatives operations) and one unmodelled value threw away the whole file; no `tenantId: true` auto-add, so every schema indexing tenantId died on "Index references non-existent field"; no type case-folding, so Prisma-style `String`/`DateTime` were invalid; no `primaryKey` alias; `displayName` missing from the name precedence; `int`/`decimal` absent from `getValidFieldTypes`. **When you touch schema parsing, change both loaders and re-check the loaded count against the registered count — they should be equal.** |
| New DBAL entity missing from frontend | Add JSON schema in `dbal/shared/api/schema/entities/{package}/`, seed in `dbal/shared/seeds/database/`, rebuild `dbal-init` + DBAL image |
| ComponentNode schema vs C++ struct | JSON schema must match C++ struct in `types.generated.hpp` (pageId, parentId, childIds, order), NOT the Redux slice shape |
| GitHub Actions version assumptions | NEVER assume an action version is invalid — use `WebFetch` on `https://github.com/actions/{name}/releases` to verify before changing |
| Entity primary key must be named `id` | The generic SQL adapter's single-record methods (`read`/`update`/`remove`/`readIncludingSensitive`) always query `WHERE id = ?` — hardcoded, not schema-driven. Every entity except historically `Credential` (fixed) and `Package` (`packageId`, not used via these methods) follows this. A `"primary": true` field named anything other than `id` silently breaks lookups (wrong-column SQL error swallowed into a generic not-found/unauthorized result) rather than failing loudly |
| `docker run`/`docker exec -e VAR=/app/...` on Windows Git Bash | MSYS path conversion mangles `/app/...` in `-e`/`-v` values into `C:/Program Files/Git/app/...`, not just volume-mount paths — hits `docker exec` too, not just `docker run`. Prefix the whole command with `MSYS_NO_PATHCONV=1` |
| xmlsec1 signing/verifying an element by `ID="..."` | `xmlAddID()` alone is NOT enough — xmlsec's `#id` reference resolution goes through libxml2's XPointer `id()` scheme, which needs `xmlSecAddIDs(doc, root, {"ID", NULL})` (from `<xmlsec/xmltree.h>`) called on BOTH the signing side and the verifying side, before `xmlSecDSigCtxSign`/`xmlSecDSigCtxVerify` — otherwise it fails deep inside `xmlSecXPathDataExecute` with a useless `xpointer(id('...'))` error. See `saml/xmldsig/{signer,verifier}.cpp` |
| Monolithic `base-conan-deps` removed | Split into per-target `base-conan-{cli,media,dbal,qt6,gameengine}`. App images FROM `base-conan-cli` (cli/dbal) or `base-conan-media`. Only cli+media are on the app pipeline; dbal/qt6/gameengine are heavy/dev-only. `Dockerfile.conan-deps` is deleted |
| Merging Conan caches across images | A raw `COPY /root/.conan2` from multiple images clobbers the Conan 2 sqlite index. Use `conan cache save`/`conan cache restore` (Conan >= 2.1) — see `Dockerfile.devcontainer` |
| `.github/workflows/gated-pipeline.yml` still references conan-deps | The GitHub Actions pipeline (separate from the Jenkins stack) still builds `base-conan-deps`/`Dockerfile.conan-deps`; update its Tier-2 matrix + verify loop to the split images before relying on GH CI |
| New app Dockerfile uses selective `COPY` but misses transitive workspace deps | Frontend Dockerfiles `COPY` only the workspaces the app imports. `@metabuilder/types` is imported by `redux/slices` et al., and `types/project.ts` imports `../interfaces/requests`. So any Dockerfile that builds `redux/*` MUST `COPY types/ interfaces/ translations/` (the full set), not just `types/` — a partial set yields `TS2307: Cannot find module '@metabuilder/types'` / `'../interfaces/requests'`. Mirror the COPY set of `frontends/codegen` or `frontends/workflowui`. Also: app `name` in `deployment/cli/commands.json` MUST equal the compose service name (== `local` minus `deployment-`/`:latest`) or the per-app Jenkins loop fails with `Unknown or non-buildable service`. |
| Building any frontend from a bare checkout | Won't work for `nextjs` or `qt6` — their dependencies are in sibling micro-repos. Run `.github/scripts/assemble_workspace.py --frontend <name>` first. Only `cli` is self-contained. |
| `compile-tokens.mjs` fails silently | It runs on every `nextjs` build and reads `packages/{id}/styles/tokens.json`. When `packages/` isn't mounted it writes a `/* tokens.json not found */` stub and **exits 0** — you get a tokenless app, not a failed build. `assemble_workspace.py` verifies mounts are non-empty precisely because of this class of failure |
| `typecheck.cjs` silently stops checking | It suppresses `TS2307`/`TS2339`/`TS18046`/`TS7006`/`TS2353` on the assumption that CI ran `npm run build --workspaces` first. Skip that build step and typecheck still passes — while no longer checking most of the app. Always build workspaces before typechecking |
| `AutoMetabuilder` default branch is `master` | Every other sibling repo uses `main`. It's also a **subdirectory** mount: only `workflow-lib/` is `@metabuilder/workflow`; the rest is the workflowui app |
| `libraries/components/m3` needs no separate mount | The `components` repo already contains `m3/` (`@metabuilder/m3`). Mounting `components` satisfies both workspace entries. The standalone `m3` repo is now just a meta-repo holding `checkout.py` |
| Two different `playwright.config.ts` exist — use the local one | `frontends/nextjs/playwright.config.ts` is self-contained (`testDir: './e2e'`, chromium, own `next dev` on :3004) and is what CI runs. The **old monorepo root** config now lives in the `metabuilder_e2e` repo and starts `workflowui` + `codesnippet` dev servers — apps that are no longer in this repo — so do **not** mount `metabuilder_e2e` to satisfy the old `--config=../../playwright.config.ts` path. Those stale `--config` flags were removed; Playwright auto-discovers the local config |
| `NEXT_PUBLIC_*` cannot be set at runtime on a built image | Next inlines them into the browser bundle during `next build`, and `frontends/nextjs/Dockerfile` bakes `NEXT_PUBLIC_DBAL_API_URL=/api/dbal`. No compose env var can repoint the browser at DBAL, which is why the local stack puts nginx in front and serves app and DBAL from one origin rather than exposing DBAL on its own port |
| DBAL reports healthy while every entity route 503s | `DATABASE_URL` must carry a scheme — `sqlite:///app/data/x.db`, not a bare path. `ConnectionValidator` rejects the path, the daemon starts anyway, and `/health` answers `{"status":"healthy"}` because it never touches the database. Look for `[seed] skipping auto-seed — could not acquire DB client` in the boot log |
| DBAL entity routes are `/{tenant}/{package}/{Entity}` | Entity is the schema's `"entity"` field, not the filename: `access/PageConfig`, not `core/page_config`. A wrong package or casing answers 422, and callers that guard with `res.ok` swallow it silently |
| The dbal image has curl, not wget | A healthcheck calling a missing binary leaves the container in `starting` forever rather than `unhealthy`, so `depends_on: service_healthy` on it never releases |
| Playwright `goto()` must include the `/app` basePath | `playwright.config.ts` sets `baseURL` to the origin only, so `goto('/media-center')` requests a path that does not exist and the page renders Next's 404 — every locator then fails with "element(s) not found", which reads like a render problem rather than a bad URL. `goto('/app/media-center')`. This, not the auth mock, was the larger half of the long-standing `media-center.spec.ts` failure |
| Mocking `/api/auth/session` alone does not authenticate an E2E test | `authStore.refresh()` reads `sessionStorage['nextjs-web-sso']` first and returns early when absent, so the endpoint is never requested and `auth.user` stays null behind `LevelGate`. Seed a session with `addInitScript` before navigating; `isTokenValid` only decodes the payload and compares `exp`, so an unsigned token with a future `exp` suffices |
| `next.config.ts` and `tsconfig.json` disagree on the same alias | `@dbal-ui` resolves to root `dbal/shared/ui` in `next.config.ts` but `libraries/dbal/shared/ui` in `tsconfig.json`; webpack uses the former, `tsc` the latter, so **both** paths must exist. Likewise `@metabuilder/service-adapters` is aliased to `path.resolve(monorepoRoot, 'redux/adapters/src')` — a root-level `redux/` that predates the Jun 2026 reorg into `libraries/`. `workspace.json` therefore mounts `redux` and `dbal` at two paths each. Correcting the aliases to the `libraries/` paths would let both second mounts be dropped |
| Cross-library deps hide behind **relative** paths | `libraries/components/m3` imports `'../../icons/react/m3'` — a path, not a package name. Grepping for `@metabuilder/icons` finds nothing, yet omitting `libraries/icons` fails the build with `Module not found: Can't resolve '../../../../icons/react/m3'`. `icons` has no root `package.json` and is not an npm workspace at all. When adding a repo to `workspace.json`, grep for `from '(../){2,}` too, not just package names |
| `npm ci` in CI | Not possible — no `package-lock.json` is committed. Use `npm install` (with retries; workspace installs this large hit transient registry failures) |
| Re-running `assemble_workspace.py --force` after `npm install` | `node_modules/@metabuilder/*` are symlinks into `libraries/`. Re-assembling replaces those directories and leaves the links dangling, so the next build fails with `Module not found: '@metabuilder/…'` for packages that were previously fine. Always `npm install` again after re-assembling. CI is unaffected — it assembles before installing |
| Assuming a GitHub Action version | Confirmed current majors as of 2026-08-11: `checkout@v7`, `setup-node@v7`, `setup-python@v7`, `cache@v6`, `upload-artifact@v7`, `docker/login-action@v4`. Verify with `gh api repos/<owner>/<name>/releases/latest --jq .tag_name` — never guess. The dbal repo's `docker.yml` is still on `login-action@v3` |
| `deployment/` is gone from this repo | It moved to the sibling [deployment](https://github.com/johndoe6345789/deployment) repo (2026-08-11) because it describes the whole platform: its `compose.yml` builds ~20 services and only `frontends/nextjs` + `frontends/cli` still live here. Base-image Dockerfiles, `deployment.py`, the compose stacks, `config/` and `portal/` are all there now. `/deployment/` is gitignored here because the Jenkinsfile clones it into the workspace |
| A base image Dockerfile that `COPY`s from another repo | `Dockerfile.conan-cli` needs `frontends/cli/conanfile.txt` and `Dockerfile.node-deps` needs every workspace `package.json` — both from metabuilder. The deployment repo's `base-images.yml` checks metabuilder out at `_metabuilder/` and passes *that* as the build context while keeping `-f` pointed at its own Dockerfile. For node-deps it must also run `assemble_workspace.py` first, or the workspace `package.json` COPYs fail |
| A stale `COPY` line in a base image Dockerfile is fatal; a missing one is not | `COPY` of an absent path fails the build outright, which is why the eight removed frontends had to come out of `Dockerfile.node-deps`. Workspaces *omitted* from that list only cost cache efficiency: the app Dockerfiles re-run `npm install` over the real source afterwards |
| Publishing a base image built from this repo's `.npmrc` | The committed `.npmrc` carries a Verdaccio `_authToken` and points `@esbuild-kit`/`@metabuilder` at `localhost:4873`. The `COPY package.json .npmrc ./` layer preserves whatever was on disk, so the sanitising `sed` has to run on the *host* before the context is sent — an in-`RUN` sed cannot remove it from the earlier layer. `base-images.yml` asserts the published image is clean before pushing |
| Runtime stage on a different distro to the builder | `frontends/cli/Dockerfile` built on ubuntu:24.04 (via `base-apt`) and ran on `debian:bookworm-slim`. It built clean, then could not run its own entrypoint — `GLIBC_2.38 not found`, `GLIBCXX_3.4.32 not found` — because bookworm's glibc 2.36 / GCC 12 libstdc++ are older than what the binary was compiled against. Keep the runtime stage on the same distro release as the builder. On noble the OpenSSL runtime is `libssl3t64`, not `libssl3` (64-bit time_t rename) |
| `docker build` succeeding proves nothing about the image running | The glibc mismatch above survived because nothing ever executed the binary. Every image this repo publishes is now exercised after build: the CLI runs its entrypoint bare (prints usage, exits 0) and nextjs is booted and polled on `/app/api/health` |
| Browsing the local stack on `http://0.0.0.0:8080` | Supported now, but by a **fallback**, not because the origin became secure. `0.0.0.0` is not a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) — Chrome trusts `localhost` and `127.0.0.1`, not `0.0.0.0` — so `crypto.subtle` is permanently `undefined` there; no browser flag or server setting changes that. `sha256Base64Url` (`redux/dbal-sso/src/core/pkce.ts`) therefore computes the S256 challenge with an in-file JavaScript SHA-256 when `crypto.subtle` is absent, and warns once to the console. That is a narrow concession — `code_challenge` is a public value with no secret input, and `crypto.getRandomValues` (never secure-context gated) still supplies the verifier's entropy — but the **transport** is the real cost: codes and tokens cross this origin in plaintext HTTP. Keep it to a laptop; front anything shared with real HTTPS (`tailscale serve --bg 8080`). `http://0.0.0.0:8080/app/auth/callback` is registered in `deploy/oidc/clients.json`; without that the flow would 400 at `/authorize` on an unregistered `redirect_uri`. **Three history traps:** an image built from a `workspace.json` redux pin older than the fallback commit still *throws* the secure-context error (redux `c1c8d9a`..fallback), and one older than `c1c8d9a` throws a bare `Cannot read properties of undefined (reading 'digest')` that reads like an SSO-library bug rather than a bad address bar — check the pin, not just the browser. `DBAL_OIDC_ISSUER` also still defaults to the **localhost** origin; the browser flow stays on `0.0.0.0` because `dbalOidcBase` is the relative `/api/dbal`, but the minted `iss` claim reads localhost, so override it if anything starts validating `iss` |
| Editing `deploy/oidc/clients.json` appears to do nothing | It is a **single-file** bind mount, and Docker binds files by inode. Every editor that writes atomically (write temp → rename) — `Edit`/`Write`, `vim`, most IDEs — allocates a new inode, leaving the mount pointing at the unlinked old one. The symptom is bizarre and easy to misread: inside the container `ls -la /app/schemas/oidc/` still lists `clients.json` at its **old** size and mtime, while `cat` on the same path answers `No such file or directory`. DBAL keeps serving whatever it parsed at boot, so `/oidc/authorize` rejects a `redirect_uri` you can see in the file on the host. `docker compose restart dbal` does **not** fix it — bind mounts are resolved at container *creation*: `docker compose -f deploy/compose.yml up -d --force-recreate --no-deps dbal`. Verify with `docker exec metabuilder-dbal cat /app/schemas/oidc/clients.json`, never by trusting `ls`. Appending with `>>` instead of rewriting preserves the inode and avoids this, but the durable fix is mounting the **directory** (`./oidc:/app/schemas/oidc:ro`), whose inode is stable across file rewrites |
| `deploy/compose.yml` login button 404s | The local stack has to *opt in* to OIDC: `DBAL_OIDC_ISSUER` unset makes `server_routes.cpp` log `OIDC provider is DISABLED` and every `/oidc/*` route 404s. Three things are needed together — the issuer (browser-facing URL, e.g. `http://localhost:8080/api/dbal`, since `oidc_service.cpp` concatenates all endpoint URLs and the `iss` claim from it; `dbal:8080` mints unusable tokens), `DBAL_PUBLIC_PATH_PREFIX=/api/dbal` (nginx strips the prefix, so DBAL must re-add it to Location headers and the login `<form action>` or the redirect lands on the Next.js app), and a mounted `clients.json` (the dbal image ships none, and the missing file throws inside the try/catch that silently disables the provider). Mount `/app/keys` on a volume too — `RsaKeypair` generates a key when absent, so a baked-in path re-mints it every restart and invalidates all live tokens |
| OIDC `redirect_uris` are matched exactly, port included | `clients.json` in the dbal repo registers `nextjs-web` for ports 3000/8900 and the prod domain only, but `deploy/compose.yml` defaults to `HTTP_PORT=8080` — so `/authorize` rejects with `redirect_uri not registered for this client` (HTTP 400) before it ever renders the login form. `deploy/oidc/clients.json` covers the local stack; changing `HTTP_PORT` means adding that origin there too |
| `Workflow.status` is authoritative, `Workflow.enabled` is vestigial | Three overlapping state fields existed. `status` (`'draft' \| 'active' \| 'paused' \| 'archived'`) is what the UI renders (`WorkflowStatusBadge`), what `useWorkflowsPage` filters on, what two indexes and the `workflows:{tenantId}:{status}` cache key target, and what the seeds set. `isPublished` is a real secondary flag (indexed, raises `workflow.published`). `enabled` is read by **nothing** — the `enabled` flags in `workflow/executor/ts/types.ts` belong to triggers/retry/rate-limit policies, not the entity — and it was `required: true` while no seed ever set it, i.e. unsatisfiable. It's now nullable and marked deprecated rather than dropped, because `operations/entities/workflow.ops.json` still lists it as required on create; remove from both together. Note `ops.json` mirrors the `fields` block field-for-field, so it is **not** independent evidence when deciding what a field means |
| A GLOB_RECURSE build plus a hand-written dependency list | Adding a *file* is free; adding an *include* is not, and nothing connects the two until the linker complains. `src/adapters/redis/` is excluded from dbal's build (`list(FILTER ... EXCLUDE REGEX ".*/adapters/redis/.*")`), so redis-plus-plus had never been needed and was absent from `conanfile.py` — then `src/cache/caching_adapter.cpp` included `<sw/redis++/redis++.h>` and was picked up by the same glob that skips `adapters/redis/`. main did not build. Excluded-from-build code is worse than deleted code: it reads as a working reference for APIs and idioms while being compiled by nothing |
| Wrapping an adapter in a decorator | The move happens when the *parameter* is constructed, before the constructor body runs. `make_unique<CachingAdapter>(std::move(adapter_), cfg)` therefore consumes `adapter_` and then, if the body throws, destroys the wrapped adapter during unwinding — turning "cache unavailable, carry on" into a null-pointer crash on the first query. Use a static `tryCreate(std::unique_ptr<Adapter>& inner, ...)` that takes the adapter by reference and moves from it only after everything fallible has succeeded. `CachingAdapter` and `SearchingAdapter` both do |
| A gate named after the property it does not check | metabuilder-small's "Gate 7: Multi-Arch Manifests" inspected only the base images (already correct), used `docker manifest inspect` — which proves a manifest exists, not which architectures are in it — and ended every check with `\|\| echo "WARNING: ..."`, so it exited 0 unconditionally. App images shipped amd64-only for months behind a green tick. Verify the *artifact* (`imagetools inspect --raw`, then grep for each arch) and let the step fail |
| Extracting a repo from the monorepo | Flat `node_modules` means a package resolves anything *any* sibling installed, so manifests can be wrong for years with no symptom. Extraction is what audits them. The postgres dashboard needed three undeclared deps found one at a time (`@monaco-editor/react` in m3, `sass` and `@tailwindcss/postcss` in the app) plus a workspace-layout rebuild, and had never once had a green CI run |
| npm workspace globs vs a hand-listed COPY | A glob like `libraries/redux/*` only matches directories that exist *at that layer*, so a selective `COPY libraries/x/package.json` silently shrinks the workspace set. Because `@metabuilder` is unpublished, the symptom is a registry 404 naming a package — pointing nowhere near the copy list. This bit four times in one change (types ×3, then redux-slices) before the fix became "copy `libraries/` wholesale" |
| Peer ranges that predate a major | Reach for nested `overrides` (`{"eslint-plugin-x": {"eslint": "^10"}}`), not `--legacy-peer-deps`: the flag switches peer resolution off for the whole tree and would equally absorb a real incompatibility later. Derive the set by rule from `package.json` (every `eslint-plugin-*`/`eslint-config-*`) rather than listing them — pinning one surfaces the next. npm honours `overrides` only in the *root* package.json; those in a workspace are ignored |
| GHCR package naming | This account nests packages under the publishing repo — `metabuilder/nextjs-app`, `deployment/base-apt`, `businessplanner/businessplanner-base-apt`. Follow that; a flat `metabuilder-base-apt` works but is the odd one out. This repo publishes exactly two: `metabuilder/nextjs-app` and `metabuilder/cli`. Packages published by Actions here come out **public**, so no cross-repo grant is needed — the pull from the deployment repo's packages just works |
| A Qt frontend that only runs from its build tree | `SRCDIR` is a compile-time absolute path to the machine that compiled the binary, so anything read through it works forever in development and never works for a user. `frontends/qt6` read `packages/` and its QML through it, and `imports/QmlComponents` is a **symlink pointing outside the source tree**, which cannot be installed at all — so the first real package launched, showed nothing, and died with `module "QmlComponents" is not installed`. `src/ResourceRoot.hpp` resolves data relative to the executable now, and the layout lives in the `packaging` block of `cmake_config.json` (the declarative source of truth for this frontend), not in `generate_cmake.py`. Regenerate `CMakeLists.txt` after touching either |
| "Did the app start?" is not a smoke test for a Qt app | A failed QML import leaves the process alive with the event loop running and no window, so a liveness check passes on a package that shows the user nothing. `qt6-release.yml` requires both: the process survives, **and** the log contains no `is not installed` / `QQmlApplicationEngine failed` |
| Qt's base install has no webp plugin | Qt's own macOS Controls style draws its busy indicator from `busyindicator-dark.webp`, so without the `qtimageformats` module it fails at runtime while everything else looks completely fine. Install it alongside `qtshadertools` (needed by `QtQuick.Effects`) in every workflow that installs Qt — a PR job with a smaller module set than the release job is a PR that passes against a Qt the release cannot build with |
| aqtinstall 3.3.0 cannot install Windows x86_64 Qt ≥ 6.11 | Qt changed the Windows desktop layout in 6.11.0 to per-compiler repositories (`qt6_6111/qt6_6111_msvc2022_64/`) and dropped the combined `qt6_6111/qt6_6111/` folder. aqt 3.3.0 — still the newest PyPI release — only knows the old shape, and fails with `Failed to download checksum for the file 'Updates.xml'`, which reads exactly like a flaky mirror. It is not: no mirror has a folder Qt never published, and retrying or switching mirrors cannot fix it. Windows ARM64, Linux and macOS kept the combined layout, so only one of five jobs fails, which makes it look even more like bad luck. Upstream fixed it in miurahr/aqtinstall#1000 without releasing it, so `.github/scripts/install_qt.py` pins that commit — drop the pin once a release above 3.3.0 exists |
| `aqt list-qt` ignores your mirror | `install-qt` takes `-b/--base`, `list-qt` does not, so architecture discovery always hits download.qt.io no matter which mirror the download uses — mirror failover that covers only half the operation. `install_qt.py` reads the architectures from the repository listing itself (falling back to the combined repo's `Updates.xml`), which is both mirror-aware and layout-aware |
| A Linux package that builds, uploads and publishes with no Qt in it | CMake strips the build-tree RPATH on install, so `ldd` on the freshly installed binary answers `libQt6Gui.so.6 => not found` — no path, nothing for a dependency-closure regex to match, so the closure copied **nothing** and the tarball shipped without Qt. The only symptom is `cannot open shared object file` on a user's machine. Run `ldd` with Qt on `LD_LIBRARY_PATH`, give the installed binary an `$ORIGIN/../lib` RPATH, and assert the Qt libraries are present before writing an archive |

### Critical Folders to Check Before Any Task

`/libraries/redux/`, `/libraries/components/`, `/libraries/scss/`, `/libraries/hooks/`, `/libraries/types/`, `/libraries/interfaces/`, `/libraries/icons/`, `/libraries/workflow/`, `/libraries/schemas/`, `/packages/`

### Task Workflow
1. Read relevant CLAUDE.md
2. Check if functionality already exists in critical folders
3. Use Explore agent for codebase questions
4. Plan affected files before coding
5. Verify multi-tenant filtering + rate limiting

---

## Definition of Done

A task is complete when:
- **Builds**: Compiles, core functionality works, type safety reasonable
- **Tests**: All pass, new tests added, edge cases covered, multi-tenant verified
- **Deploy**: Docker builds, services healthy, env vars documented, deps install
- **Docs**: CLAUDE.md updated with any new gotcha or pattern (this is the only doc that persists)
- **Security**: Input validation, no XSS/SQLi, passwords hashed, no secrets, rate limited
- **Git**: Clear commit message, co-authored tag, no merge conflicts

**Standards**: IMPLEMENT don't disable. Real solutions over workarounds. TODOs acceptable for future work. Pragmatic over perfect.

**Unacceptable**: Deleting code instead of fixing. Fake implementations. Claiming done when broken.

**Task-Specific**:
- Refactoring: ~100 LOC classes, original functionality preserved, tests pass
- New Adapters: CRUD + bulk + query + metadata ops, connection management, Result<T> errors
- Docker: Multi-stage, BuildKit cache, <500MB runtime, non-root user, health check

---

## Project Organization

- **Root**: Minimal - config, CI/CD, build, package files only
- **Reports and docs**: none are kept. Don't create a `docs/` tree, a SQLite doc store, or standalone markdown reports — summarise in the conversation instead, and put anything worth keeping in this file
- **File org**: Implementation type first (react/, python/, qml/), component categorization, preserve legacy in archived folders

---

**Status**: Production Ready (Phase 2 Complete)
**Next**: Universal Platform - Core Infrastructure (State Machine, Command Bus, Event Stream, VFS, Frontend Bus)
