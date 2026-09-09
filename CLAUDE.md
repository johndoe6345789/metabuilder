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
Frontends (CLI C++ | Next.js React)
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

```bash
python3 .github/scripts/assemble_workspace.py --frontend nextjs   # 9 repos
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
| Building any frontend from a bare checkout | Won't work for `nextjs` — its dependencies are in sibling micro-repos. Run `.github/scripts/assemble_workspace.py --frontend nextjs` first. `cli` is self-contained. |
| `compile-tokens.mjs` fails silently | It runs on every `nextjs` build and reads `packages/{id}/styles/tokens.json`. When `packages/` isn't mounted it writes a `/* tokens.json not found */` stub and **exits 0** — you get a tokenless app, not a failed build. `assemble_workspace.py` verifies mounts are non-empty precisely because of this class of failure |
| `typecheck.cjs` silently stops checking | It suppresses `TS2307`/`TS2339`/`TS18046`/`TS7006`/`TS2353` on the assumption that CI ran `npm run build --workspaces` first. Skip that build step and typecheck still passes — while no longer checking most of the app. Always build workspaces before typechecking |
| `AutoMetabuilder` default branch is `master` | Every other sibling repo uses `main`. It's also a **subdirectory** mount: only `workflow-lib/` is `@metabuilder/workflow`; the rest is the workflowui app |
| `libraries/components/m3` needs no separate mount | The `components` repo already contains `m3/` (`@metabuilder/m3`). Mounting `components` satisfies both workspace entries. The standalone `m3` repo is now just a meta-repo holding `checkout.py` |
| Two different `playwright.config.ts` exist — use the local one | `frontends/nextjs/playwright.config.ts` is self-contained (`testDir: './e2e'`, chromium, own `next dev` on :3004) and is what CI runs. The **old monorepo root** config now lives in the `metabuilder_e2e` repo and starts `workflowui` + `codesnippet` dev servers — apps that are no longer in this repo — so do **not** mount `metabuilder_e2e` to satisfy the old `--config=../../playwright.config.ts` path. Those stale `--config` flags were removed; Playwright auto-discovers the local config |
| `NEXT_PUBLIC_*` cannot be set at runtime on a built image | Next inlines them into the browser bundle during `next build`, and `frontends/nextjs/Dockerfile` bakes `NEXT_PUBLIC_DBAL_API_URL=/api/dbal`. No compose env var can repoint the browser at DBAL, which is why the local stack puts nginx in front and serves app and DBAL from one origin rather than exposing DBAL on its own port |
| DBAL reports healthy while every entity route 503s | `DATABASE_URL` must carry a scheme — `sqlite:///app/data/x.db`, not a bare path. `ConnectionValidator` rejects the path, the daemon starts anyway, and `/health` answers `{"status":"healthy"}` because it never touches the database. Look for `[seed] skipping auto-seed — could not acquire DB client` in the boot log |
| DBAL entity routes are `/{tenant}/{package}/{Entity}` | Entity is the schema's `"entity"` field, not the filename: `access/PageConfig`, not `core/page_config`. A wrong package or casing answers 422, and callers that guard with `res.ok` swallow it silently |
| The dbal image has curl, not wget | A healthcheck calling a missing binary leaves the container in `starting` forever rather than `unhealthy`, so `depends_on: service_healthy` on it never releases |
| Panel pages are tenant-scoped, so an E2E `goto` needs the tenant segment too | `media-center.spec.ts` asked for `/app/media-center`; the route is `app/[tenantSlug]/panel/media-center`, so Next answered its 404 and every locator failed with "element(s) not found" — which reads like the page rendering wrong rather than never having been requested. This was the **third** cause behind the same red spec, after the two below were both already fixed: when a Playwright locator finds nothing, dump the page (`error-context.md` in `test-results/` carries the rendered a11y tree) before theorising about the component. |
| Playwright `goto()` must include the `/app` basePath | `playwright.config.ts` sets `baseURL` to the origin only, so `goto('/media-center')` requests a path that does not exist and the page renders Next's 404 — every locator then fails with "element(s) not found", which reads like a render problem rather than a bad URL. `goto('/app/media-center')`. This, not the auth mock, was the larger half of the long-standing `media-center.spec.ts` failure |
| Mocking `/api/auth/session` alone does not authenticate an E2E test | `authStore.refresh()` reads `sessionStorage['nextjs-web-sso']` first and returns early when absent, so the endpoint is never requested and `auth.user` stays null behind `LevelGate`. Seed a session with `addInitScript` before navigating; `isTokenValid` only decodes the payload and compares `exp`, so an unsigned token with a future `exp` suffices |
| `next.config.ts` and `tsconfig.json` disagree on the same alias | `@dbal-ui` resolves to root `dbal/shared/ui` in `next.config.ts` but `libraries/dbal/shared/ui` in `tsconfig.json`; webpack uses the former, `tsc` the latter, so **both** paths must exist. Likewise `@metabuilder/service-adapters` is aliased to `path.resolve(monorepoRoot, 'redux/adapters/src')` — a root-level `redux/` that predates the Jun 2026 reorg into `libraries/`. `workspace.json` therefore mounts `redux` and `dbal` at two paths each. Correcting the aliases to the `libraries/` paths would let both second mounts be dropped |
| Cross-library deps hide behind **relative** paths | `libraries/components/m3` imports `'../../icons/react/m3'` — a path, not a package name. Grepping for `@metabuilder/icons` finds nothing, yet omitting `libraries/icons` fails the build with `Module not found: Can't resolve '../../../../icons/react/m3'`. `icons` has no root `package.json` and is not an npm workspace at all. When adding a repo to `workspace.json`, grep for `from '(../){2,}` too, not just package names |
| `npm ci` in CI | Not possible — no `package-lock.json` is committed. Use `npm install`. The retry loop around it is near-useless on its own: see the npm-version row below |
| npm 10 cannot resolve this workspace from scratch | It dies in arborist's `#loadPeerSet` with **`Cannot read properties of null (reading 'edgesOut')`** while walking rolldown's peer set — an error naming neither a package nor an edge. Deterministic: 4 clean runs out of 4 in a `node:22` container. npm **11** resolves the same tree, same clone, no lockfile, first time. `nextjs.yml` therefore pins `npm@11.19.1` explicitly rather than inheriting whatever the runner image bundles. **Why this looks like a CI-only problem and wastes a day:** no lockfile is committed, but a *successful* install writes one, and every install after that replays it instead of resolving. So any machine that has installed once — i.e. every developer machine — silently stops reproducing it. When investigating, `rm -rf node_modules package-lock.json` before concluding anything, and check for a stray `package-lock.json` in the tree you are testing against. Three plausible theories were chased and disproved first (a poisoned `~/.npm` cache — fails identically with a fresh cache key and a clean between retries; the linux platform — reproduces clean in docker; a transient registry flake — it fails 3 identical times per run). The debug log is what actually named it: `tail ~/.npm/_logs/*-debug-0.log`, which `nextjs.yml` now dumps on failure |
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
| `aqt list-qt` ignores your mirror | `install-qt` takes `-b/--base`, `list-qt` does not, so architecture discovery always hits download.qt.io no matter which mirror the download uses — mirror failover that covers only half the operation. `install_qt.py` reads the architectures from the repository listing itself (falling back to the combined repo's `Updates.xml`), which is both mirror-aware and layout-aware |
| `frontends/nextjs`'s `RootState` is silently `any` everywhere | `store.ts` builds the store via `@metabuilder/redux-persist`'s `createPersistedStore({ reducers: {...} })`. That function's `PersistedStoreOptions.reducers` is typed `Record<string, Reducer>` — RTK's `Reducer` with no state generic, which defaults to `any` — so `combineReducers(options.reducers)` throws away every individual slice's real state type, and `RootState = ReturnType<typeof store.getState>` collapses to effectively `any`. Every `useAppSelector(s => s.god.foo)` across the whole app (and everything downstream of it: `state.god.workflow.nodes`, etc.) type-checks with zero safety and shows as `@typescript-eslint/no-unsafe-*` at the call site, not at the real source. Tried making `createPersistedStore` generic over the reducers map to fix this at the root — it works (RootState properly narrows) but then correctly surfaces that `combineReducers` + `persistReducer` mark every top-level slice as possibly-`undefined` during rehydration (`StateFromReducersMapObject` unioned with `Partial<PreloadedStateShapeFromReducersMapObject>`), which is real, previously-invisible behavior every consumer would need auditing for (`s.god` becomes `GodState \| undefined` everywhere), plus RTK's `configureStore` middleware option wants a `Tuple` type, not a plain array, once the generics are threaded through properly. **Also: `libraries/redux/` is `.gitignore`d in this repo** (`.gitignore:168: /libraries/`) — it's a locally-assembled copy of a genuinely separate sibling GitHub repo (see `assemble_workspace.py`), so a fix here cannot be committed from this checkout at all; it needs a PR against the actual `redux` repo, verified against every consumer app (workflowui, codegen, pastebin), not just this one. Left unfixed and reverted rather than force it through. If you pick this up: fix `createPersistedStore`'s generics in the real `redux` repo, decide deliberately how rehydration-time undefined slices should be handled (probably a `readGodState`-style selector helper with a fallback, not `!` everywhere), and re-run every consumer app's test suite, not just `frontends/nextjs`'s |
| God Panel builder showed a previous tenant's page tree under a new tenant's URL | Same root cause as the row above — `god`/`workflows`/`project`/`workspace` all persist under the single origin-scoped IndexedDB key, with nothing tagging *which tenant* a persisted draft belongs to. Reproduced live: sign up tenant A, build content, sign up tenant B in the same browser — B's Components builder showed A's tree, surviving even a hard reload, because nothing ever re-fetches from DBAL after the initial mount. Patched in-repo (`use-workbench.ts`) without touching the gitignored `libraries/redux/`: track the last-loaded tenant in `localStorage` (not a `useRef` — a ref re-initializes to the current tenant on the very next mount, and a tenant switch in this app is *always* a full page reload through the SSO login flow, never a re-render) and re-`load()` from DBAL whenever the signed-in tenant differs from that record. First surprise: `load()` only `dispatch`es when DBAL actually has a saved `PageConfig` row for `(tenant, path)` — for a brand-new tenant with nothing published yet it correctly no-ops, which left the *previous* tenant's rehydrated tree on screen even after the "fix." Had to add an explicit `resetTree()` fallback specifically when `load()` resolves `null`. Second, accepted trade-off: with no tenant tag on the persisted draft, this can't tell "nothing published yet" apart from "this tenant's own unpublished draft, just after a detour through some other tenant" — both blank the tree, so an unpublished draft does not survive a cross-tenant round trip in the same browser (a same-tenant refresh is unaffected — that's the whole point of tracking last-loaded-tenant instead of reloading unconditionally). Verified against three fresh signups in one browser session before and after the fix. The durable fix is still the `redux` repo one above: a tenant-scoped persist key would make this workaround unnecessary |
| A tenant guard that lives in one tab guards only that tab | The fix for the row above was put in `use-workbench.ts` -- the **Components tab's** view model. Every other consumer of the tree skipped it. BQL was one: opening its tab on a different tenant left `useComponentTree` handing out the previous tenant's leftover draft, BQL's `add` sentences append to whatever tree is loaded, and `publish this at /` then put **another tenant's page content on a live public route** -- worse than the original bug, which at least stayed visible in the editor. The guard now lives in `useComponentTree` (see `tree-tenant.ts`), derived **during render** rather than in an effect, so no consumer sees foreign content even for the one render an effect would leave open; the store is cleared via `setTree` rather than `commit` so Ctrl+Z cannot put it back. An *unmarked* tree counts as ours on purpose -- every install predating the marker has one, and blanking it would destroy a real draft to close a window that writing the marker on that same mount already closes. **The general lesson: "whose data is this" belongs to the thing that owns the data, not to whichever view happens to ask for it.** A second consumer is how you find out you put it in the wrong place, and by then it has already shipped |
| The same guard, one slice key over | The fix above moved the tenant guard from a tab to the tree -- and covered exactly the one key it was written for. `css` lives in the same origin-scoped god slice with no guard at all, so a tenant created minutes earlier showed `darkroom-card` and `hero-panel` from an unrelated site, listed as "Staged changes -- not yet published" and one click from being written into their own StyleRule rows; BQL's `apply` would have put them on a page too. Found by signing into a brand-new tenant in a browser that had built something else earlier -- the same three-step reproduction as the row above, which had only ever been re-run against the tree. The decision now lives in `useGodTenant` (tabs/use-god-tenant.ts) and clears **every** tenant-owned key together via a single `resetTenantOwned` reducer, so a hook added later has to opt out rather than remember to opt in. **When you find a bug in one key of a shared persisted slice, check every other key in that slice before calling it fixed** -- `workflow`, `packages`, `dropdowns`, `smtp`, `tests` and `plan` all persist the same way and are all still unguarded; `packages`, `dropdowns`, `tests` and `plan` are not written to DBAL under a tenant at all, which is the only reason they are not in the set -- but `workflow` and `smtp` are, and `smtp` carries an outbound mail **password**, so a founder signing in after someone else in the same browser was shown that person's mail server, username and password as their own unpublished changes. All four tenant-owned keys (`tree`, `css`, `workflow`, `smtp`) are cleared together now. **The assumption that a key is "just local editor state" is the thing to check, not to make** -- `smtp` was assumed to be, and is not |
| Enforcing a declared ACL breaks whoever was relying on it not being enforced | DBAL's schemas declare read ACLs (`read: {self, admin}` on User, etc.) and only the literal key `system` was ever enforced, so 23 entities answered an anonymous GET in full -- `GET /system/core/User` returned every account's email, role and `isInstanceOwner` flag. Closing that is correct and was verified against the 21 entities that grant `public` read (the page-rendering set: PageConfig, PageTree, PageTreeNode, PageTreeProp, StyleRule, TenantTheme, UIPage...), which a signed-out visitor still needs. What it also did was **break login**, because `fetchSession` verifies the token at `/oidc/userinfo` and then reads the `User` entity through the shared `db` client, which attaches nothing -- so sign-in failed *after* a successful OIDC callback and reported "Session token rejected" for a token minted seconds earlier. The blast radius is every server-side caller: `register.ts`'s uniqueness checks and the vault routes failed **silently**, because `listEntity()` turns any error into `{data: []}` -- a guard that stops finding anything reads exactly like a guard that found nothing. Fixed by having `dbalFetch` attach `DBAL_ADMIN_TOKEN` (server-only; every importer is a server route, and the non-NEXT_PUBLIC name keeps it out of the browser bundle) and `fetchSession` use the caller's own token. **When you make a data layer start enforcing a rule, grep every caller of that entity first** -- and treat a client that swallows errors into an empty result as a caller that will not tell you |
| The same ACL change, one caller further out: signing up left the founder 404'd out of their own site | The row above fixed `dbalFetch` and `fetchSession` and stopped there. `lib/tenant/tenant-exists.ts` uses a **bare `fetch`**, not `dbalFetch`, so it was not in that grep -- and it is the gate `[tenantSlug]/layout.tsx` runs in front of *every page of every tenant*. It asks two questions, has this tenant any users and has it any pages; `User` answers 401 to a server component (no browser session to identify it) and a tenant that has not published yet has no pages, so a brand-new tenant read as one that had never existed. The account, the credential, the tenant and the OIDC login were all fine; the redirect straight afterwards 404'd, as did the God Panel they would have published their first page from. It fixed itself the moment a page was published, which nobody could do -- and it is invisible to anyone testing on an established tenant, because an established tenant has pages. Fixed by attaching `DBAL_ADMIN_TOKEN` there too. Deliberately **not** by treating 401 as "cannot tell, assume real": a made-up tenant answers 401 identically, so that would call every wrong URL a tenant and undo what the module is for. **When auditing callers of a newly-enforced entity, grep for `fetch(` as well as for your own client wrapper** |
| A wrapper applied before the attributes it was supposed to sit around | `renderNode` (`components/blocks/block-registry.tsx`) applies the author's id/class/aria centrally with `cloneElement`, because a block's own `render()` only reads props it knows about. `withWorkflowClick` then wrapped the result -- so from the moment a block was given `onClickWorkflow`, cloneElement was decorating the **wrapper**, a `display:contents` span that reads no className, and the class reached no DOM node at all. Reads as a styling bug, not a wiring one: the block looks right until it is given something to do. Attributes go on the block, wrappers go on last. Note `BlockButton` returned its own `display:contents` span for the same reason and swallowed id/class the same way even with no workflow -- see the row below, which is where that half was finally fixed |
| `cloneElement` reaches a component's props, not its DOM -- so 7 of 39 blocks silently dropped every attribute the builder set | The row above fixed the *wrapper ordering* and left the deeper half: `renderNode`'s `withAttrs` clones id/class/aria onto whatever `render()` returned, which works for the 32 blocks returning an intrinsic element (`<p>`, `<div>`, `<label>`) and does **nothing at all** for the ones returning a component. `BlockButton({ p })`, `FormBlock({ formName, successMessage, children })`, `FormTextField({ p })` and the four `next/dynamic` wrappers all destructure the props they name and drop the rest, so the class never reached any DOM node -- setting one on a Button, Form, Text field, Webchat or any of the three `mb.*` self-hosting blocks did literally nothing. `display: contents` was a **red herring**: the span was never the problem (it never saw the attributes either), the predicate is "render() returns a component". Nothing in a `BlockDef` distinguishes the two kinds and the failure is invisible -- the block still renders, just unstyled. Fixed with an explicit contract: `BlockAttrs` + `withOwnClass` in `components/blocks/common-attrs.ts`, which each such component declares and spreads onto **the control itself, never a wrapper as well** -- a workflow's `page.class` selector matches every node carrying the class, so attributes left on both would apply the effect twice. `withOwnClass` exists because a bare spread overwrites a `className={s.x}` the block already set; M3's `Button`/`TextField` merge an incoming className themselves and so do not need it. **The durable guard is `render-node-attrs-sweep.test.tsx`, which renders every entry in `PALETTE` and asserts the id and class land on exactly one node each** -- sample a few blocks and you re-learn this the hard way; sweep the palette and block #40 fails on the day it is added. |
| A block that mutates into a different element has nowhere to keep its identity | Found while fixing the row above. `FormBlock` returned a bare `<p>` instead of its `<form>` once submitted, and `SchemaEditor` returned a placeholder instead of its root while loading -- so the author's id/class either had to be *copied onto the replacement* or was lost, and CSS written for the block stopped applying the moment somebody used it. Both now keep **one stable root and swap only the contents**, which deletes the question rather than answering it. Prefer that to plumbing identity through every state: the alternative is a per-state decision that some future state will forget to make. |
| Authenticating the caller is not authorising the caller | `api/dbal/[...slug]/route.ts` verified the `mb_session` cookie on every write and then never asked *whose* it was. `path` is `{tenant}/{package}/{entity}` and `user.tenantId` was already in hand; the two were never compared, and the forwarded token had the comment *"so the data layer can apply its own rules once it enforces them; today it ignores this"* -- so nothing downstream closed it either. `Dockerfile:91` bakes `NEXT_PUBLIC_DBAL_API_URL=/api/dbal`, making this proxy the browser's **only** write path in the shipped image: any founder who had signed up could POST/PUT/DELETE into any other community's PageConfig, PageTree, StyleRule, Workflow or SmtpConfig from a console. Now enforced with the rule the God Panel already states in `use-current-tenant-scope.ts` -- your own tenant, unless you are the instance owner (`supergod`), because every other 'god' is one community's founder rather than an instance-wide admin. **A session check answers "is this somebody", never "is this somebody who owns what they are about to change".** |
| A `render()`-time permission field that three readers parsed three different ways | `PageConfig.level` is what a founder sets with the Access level pickers (Public/User/Moderator/Admin/God/SuperGod). `workspace-slot-data.ts` and `use-load-page.ts` both did `typeof row.level === 'number' ? row.level : 0` and `fetch-tenant-page.ts` did `(p.level as number) ?? 1`. The field does **not** always arrive as a number -- the SQLite adapter emits a JSON number only for columns typed number/bigint and `level` is declared `"integer"`, so "Admin only" comes back as the string `"3"`, misses the `typeof` check and gates at **0**. `LevelGate` was then asked to keep anonymous visitors out with `minLevel={0}`. All three now go through `parsePageLevel` (`lib/tenant/page-level.ts`): a level that was set is honoured however it is spelled, an undeclared one is public (what the builder writes and the client has always served), and a value that is present but unreadable fails **closed**. The re-publish path had the same bug, so loading and re-publishing an Admin page silently downgraded it. **When a permission field has more than one reader, give it one parser -- and check what the wire actually sends, not what the type says.** |
| Server-rendered published pages ignored the access level they had just fetched | `[tenantSlug]/[package]/page.tsx` and `[...slug]/tenant-page-fallback.tsx` called `fetchTenantPage`, which returns `level`, `requiresAuth` and `requiredRole`, and then rendered `UIPageRenderer` without reading any of them -- while the *client* path (`WorkspacePageSlot`) gated the same tree through `LevelGate`. So the same page was private at `/{tenant}` and world-readable at `/{tenant}/{path}`, server-rendered and therefore crawlable. `generateMetadata` leaked its title and description too. Both now go through `mayViewPage` (`lib/tenant/page-access.ts`), which fails closed and reads levels as a floor, not a match. **Two render paths for one URL shape means two places to enforce; fetching a permission field is not reading it.** |
| Four God Panel tabs published a founder's work into the shared `system` tenant | `use-css-classes.publish` and `use-smtp-config.publish` both defaulted their tenant parameter to `'system'`, and their tabs call them bare -- while `load()` next to them took a *required* tenant, and BQL passed one explicitly, which is why only the tabs were wrong. `useThemeEditor`/`apply-tenant-theme` and `SchemasTab` hardcoded the same constant, the theme one still carrying a "Single-tenant local deployment for now" comment. Consequences, all silent: a founder's CSS was written to a tenant they do not own while `TenantStyleSheet` loaded the visited tenant's, so **published pages rendered unstyled**; their SMTP host, username and **password** landed in `system` under the fixed id `smtp_system`; their brand colours were saved and read back from `system`, so no visitor ever saw them; their schema edits overwrote the shared tenant's. `Providers` now resolves the theme of the site being *visited*. Same class one layer out: `use-profile-form` and `admin-api` wrote to `/system/core/User/{id}` although registration writes users at `/{tenant}/core/User` -- so an admin's "delete user" was aimed at the system tenant's rows. **The CLAUDE.md rows above fixed the tenant guard on the *read* side of this slice and never crossed to the *write* side.** |
| A route that changed meaning but kept its rendering | `/{tenant}` began as "Make /{tenant} the user's home workspace" and was repurposed by "Keep the chrome out of published pages" into the founder's published public page -- keeping the `'use client'` that suited a workspace. A client page cannot export `generateMetadata`, and `WorkspacePageSlot` returns `null` until its own client fetch resolves, so the server sent an **empty document** with the title "MetaBuilder - Data-Driven Application Platform" on the one URL a founder actually hands out. Every other published route (`[package]`, `[package]/[...slug]`) was already a server component with metadata. Now a server component too, gated by `mayViewPage`, with openGraph/twitter cards, falling back to the client slot when nothing is published or the visitor may not see it. **When a route's meaning changes, re-ask what rendering it needs -- nothing fails, it just quietly stops being findable.** |
| A guard reading a list that answers `{data: []}` on failure | Registration's three uniqueness checks -- community name, username, email -- all read `.data.length > 0`, and `listEntity` (`lib/db-client/entity-ops/list.ts`) swallowed **every** error into an empty list. So a DBAL timeout during signup was indistinguishable from "nobody has that name", and what follows a passed check is an account created with `role: 'god'` and the **existing founder's tenantId**: a full God Panel takeover of somebody else's community, from the public signup form. CLAUDE.md already named this function for the same reason and fixed only its *auth* half. The swallow itself stays -- a page list going briefly blank during an outage beats a crash -- but `ListResult` now carries `failed?: boolean`, so a caller using a list as a **guard** can tell "nothing is there" from "I could not look", and `register()` refuses on `failed` with a message that reveals nothing about which check it was. **Any list used to decide whether to permit something must fail closed; `{data: []}` is not an answer.** |
| Validating the input rather than the thing derived from it | `communityNameError` required 2+ characters of the **raw** community name while `slugify` strips everything outside `[a-z0-9-]`. So "日本語", "!!" or "---" passed the form, slugged to `''`, and `buildRegisterPayload` sent `tenantName: ''` -- which `register()` reads as *"no community was named"*, skipping the already-taken check entirely and creating the account with `role: 'god'` inside the shared `system` tenant. A founder who meant to start their own community was handed the God Panel over everyone else's. Validate the slug (minus hyphens, which survive slugging but cannot carry a name), not the string it came from. |
| Destroying the live thing before knowing the replacement is good | `saveTree` opened with `await fetch(PageTree/{id}, {method:'DELETE'}).catch(() => null)` and rebuilt under the **same id**, so every later step -- the PageTree POST, either bulk create -- was operating with the founder's live page already deleted and nothing to roll back to. A 422, a 429 from the mutation limiter or a dropped connection left "Publish failed" on screen and the site down; for `/` the visitor got redirected into the panel. A page is reachable only through `PageConfig.pageTreeId`, so the safe order is: write the new tree **beside** the old under a stamped id, move that single pointer, then remove what it used to name. Failures before the flip now change nothing a visitor can see, and the replacement is cleaned up. Fresh ids also sidestep the duplicate-key 400 that deterministic node ids (`${treeId}__${own}`) caused on republish. Cleanup is explicit and best-effort: `page_tree_node.json` declares `on_delete: cascade` but only the Prisma generator reads it, so nothing cascades on the adapters in use -- see the `on_delete` row above. **When a swap is a single pointer, never delete before you write.** |
| A constant exported from a Next route file | `SESSION_COOKIE` lived in `app/api/auth/session/route.ts` and was imported by five modules. A route file may export only route handlers and Next's own config keys, so `.next/types` generates a check that fails `npx tsc --noEmit` -- invisible until something regenerates those types, which is why it survived a commit. Worse, `lib/constants.ts` carried a **second** `SESSION_COOKIE` of `'session_token'` that nothing imported: the next person to reach for it would have read a cookie no one sets, and failed open or closed at random. Both now resolve to `lib/auth/session-cookie.ts`. **Shared constants do not live in route files, and a duplicated one is a trap waiting for its first importer.** |
| Authenticating a caller is still not authorising them -- the asset routes, one layer over | Same shape as the DBAL proxy row below, found by asking where else a tenant comes from the caller. `api/assets` takes it from a query parameter or a form field: **listing had no session check at all**, so any visitor could enumerate a community's uploads by editing the URL, and upload and delete stopped at "somebody is signed in", so one founder could write into another's bucket and **delete the logos and images off their live pages**. Fetching a single object stays open -- that is how an image on a published page loads, and it needs no enumeration. The rule now lives once in `lib/auth/owns-tenant.ts` and answers both questions in one call (`callerAccessTo` -> ok / anonymous / forbidden), because a route that asks "is this somebody" and then separately "is it theirs" is a route where the second question gets forgotten -- which is how every one of these started. |
| A rate limiter keyed on something the caller chooses | `getClientIp` read the **first** `X-Forwarded-For` entry, which is whatever the caller sent: rotating that header handed out a fresh bucket per request, so the 5-per-minute login limiter counted to one and never further. The proxy in front of this app **sets** `X-Real-IP` to `$remote_addr` and **appends** to `X-Forwarded-For`, so the trustworthy value is the one the proxy wrote -- `X-Real-IP`, or the **last** entry of the chain; everything to its left is caller-supplied. `cf-connecting-ip` is opt-in (`RATE_LIMIT_TRUST_CF_HEADER`) because nothing here strips it. Separately, all six limiters incremented **one** entry keyed on the address alone, so their counts ran together (fifty mixed calls spent `mutation`'s fifty-a-minute through `list`'s traffic) and whichever limiter reached the entry first fixed its reset time -- one `public` or `bootstrap` call pinned the hour-long window open for everything. The endpoint is part of the key now, and `getRateLimitStatus` reads the same key rather than a bucket nothing counted into. |
| Origin-scoped browser storage is not tenant-scoped storage | `snapshot('god.workflow', ...)` wrote version history to IndexedDB under a bare key. Tenant A published a workflow; tenant B signed in on the same browser, opened **History**, and saw A's workflow names and timestamps -- one click from loading A's whole graph into their own editor. `resetTenantOwned` clears the Redux slice on a tenant switch and cannot reach IndexedDB, so the guard has to be in the key (`lib/persist/versions-key.ts`). The writer knew the tenant and the reader spelled `storageKey="god.workflow"` out by hand: the same writer-and-reader disagreement as the two casts below, so the hook hands out the key it used. `god.componentTree` was written on every page publish, **read by nothing**, and unscoped the same way. |
| A return value read off the wire and then dropped | `submitForm` parses the `effects` a tenant's workflow returned; `FormBlock` never looked at them. `applyPageEffects` was reached from exactly one place -- the bare-button path in `use-record-action` -- and `BlockButton` deliberately blanks its own action inside a `<Form>` so the form's submit is the *only* route. So a founder could wire `page.message`, `page.text` or `page.go` to a form workflow, watch it run server-side, and nothing happened in the browser: the visitor saw the static thank-you and was never redirected. **Grep for the consumer of every field a response type declares** -- `effects` had a type, a parser and a test, and no reader. |
| Publishing a stylesheet froze it at version one | Exactly the `on_delete: cascade` row below, one module over and with a different symptom. `saveStyleClasses` deleted the `StyleClass` row on the stated assumption that it "cascades its rules and their declarations away"; nothing cascades, so every `StyleRule`/`StyleRuleProp` survived. Rule ids are deterministic (`${sheetId}__${ruleKey}`) and the rows go in through `_bulk/create`, which refuses the whole batch on the first conflicting id -- so the **second** publish and every one after it failed. The site kept serving the first version of its CSS forever and a class the founder deleted never stopped rendering, while the bar read "Staged changes -- not yet published", which is what it says *before* you press Publish. Children are deleted by name now, and both this and SMTP surface their reason. SMTP had the mirror: a fixed id and POST only, so every publish after the first 409'd -- rotating a password did nothing. |
| A tile handed a ready-made path while its neighbours build their own | The dashboard's God Panel tile was passed `tenantGodPanelPath(...)` by its caller; the other four hard-coded `/profile`, `/comments`, `/admin`, `/super-god-panel`. Under `basePath: '/app'` those resolve to `/app/profile`, which Next matches as `tenantSlug` "profile", finds no such tenant, and 404s -- so **three of the four tiles on a founder's very first screen were dead**, and had been since the sidebar was taught to do it correctly and these were not. The asymmetry is the tell: when one member of a list is special-cased by its caller, the others are the ones nobody re-checks. |
| A cast that made three untrue claims at once, and a test that agreed with it | The starter page a package ships with reached `saveTree` through `as unknown as TreeNodeShape`. Only the root had an `id`, so `collectRows` read `node.id.length` on the first child, threw a `TypeError`, and **every package install failed** -- after `registry.install()` had already recorded it, so the package sat there owning no pages. Had it saved, "Box" and "Typography" are not block types here (the page would have rendered "Unknown block" three times) and the text nodes carried `content` while the text block reads `text`. The only test of the install path **mocked saveTree**, so the real traversal never ran; the tree's own test read the same wrong shape back through another cast, so it agreed with the function while neither agreed with the two sides that had to accept it. **A `?? ''` guard was already there for an *empty* id and could not survive a missing one** -- `collectRows` checks the type now, because "always a string" is exactly the claim a cast breaks. |
| Asking a table that does not exist, and reading the 404 as an answer | `validateTenantAccess` answered "is this person a member" by listing a `Tenant` entity. There is none -- `tenant-exists.ts` says so outright -- so the request 404'd, `listEntity` swallowed it into an empty list, and an empty list reads exactly like "no such tenant": **every caller below god was refused with "Tenant not found" across the whole `/api/v1` surface**, which is what the entity list/detail/edit/create views run on. Its test mocked the entity in. The account already carries the community it belongs to; asking it also made this agree with the DBAL proxy and the asset routes rather than letting any god into any tenant. |
| Precedence decided by which lookup happened to be written first | `/{tenant}/{package}` loaded a filesystem package before it ever asked what the tenant had published, and `packages/` ships `admin`, `dashboard`, `global`, `examples` and two dozen more -- packages that *exist*, not ones this community installed. So every tenant had those paths quietly reserved: publish at `/dashboard` and the built-in home component rendered instead, with nothing in the builder saying why. `notFound()` also sat **inside** the `try` whose `catch` handled a missing package, so its throw was swallowed straight into the fallback. |
| One flag standing in for many things | `dirty.workflow` covered every workflow, so publishing any of them cleared it: edit A, switch to B, publish B, and the bar read "Published -- up to date" while A's edits had never been written. `resetTenantOwned`'s comment had always named `workflow` and its body did not clear it, so a tenant switch left the previous community's unpublished-changes state over a list already swapped out. Same shape in `fireWorkflow`, which took the first workflow across **every tenant in the browser** (its comment said a preview "has no tenant of its own to consult" -- it does: the block renders under `/{tenant}/...`), so Preview could show another community's workflow name, logs and output. |
| Set on the response when it was meant for the request | `middleware.ts` put `x-tenant-id`/`x-package-id` on `NextResponse.next()`'s own headers. A response header goes to the browser, not to the app: nothing downstream could read them, a server component asking would have got `null` and fallen back to "system", and both ids were echoed to every visitor. The comment said "for downstream use" and there were no readers to prove it wrong -- and the test asserted them **on the response**, which is what let it stand. Forwarding needs `NextResponse.next({ request: { headers } })`. |
| A sanitiser on the way in but not on the way back | Creating a style class runs the typed name through `toClassName` ("Big red heading" -> `big-red-heading`, "2col" -> `s-2col`). **Renaming did not**, and `styleSheetText` silently drops any name failing its selector-safety test -- so a class renamed to "hero panel" stayed selectable in the builder, saved, published, and rendered nothing at all. Two doors into the same field; only one was guarded. |
| The E2E gap that let all of this live | 4,900 unit tests and two E2E specs, neither on the core loop. The unit suite mocks `WorkspacePageSlot`, `fetchTenantPage` and the renderer, so it can prove the right props were passed and never that a visitor gets a page. **Server components fetch DBAL from the Node process, which Playwright's `page.route` cannot reach**, so the published-page journey was untestable until something answered those calls: `e2e/dbal-stub.mjs` on 8099, pointed at with `DBAL_ENDPOINT` (server side reads it first; the browser keeps 8080 where `page.route` still works). `e2e/published-page.spec.ts` asserts **the HTML the server actually sent** -- which is what a crawler, a link preview and a slow connection get. Verified by reverting each fix and watching the matching test fail; a spec that passes against the bug it names is worse than none. |
| The same downgrade through a second door | The route-picker fix (above) kept a page's level when it was *picked*. BQL hard-coded `level: 0, requiresAuth: false` for every page it published, so re-running a script over an Admin-only route quietly made it public -- same bug, different entry point. `PublishTarget.level`/`requiresAuth` are optional now and **unsaid means "whatever the path already had"**; only a page nobody has published is public. The builder still passes them explicitly, because its picker is where a founder sets them. **When you fix a downgrade at one caller, grep for every other writer of the same field.** |
| A comment that named the exact failure, above a return value being dropped | `use-bql-tab.ts` said *"otherwise the page goes live styled in the editor and bare to everyone else"* directly above `await publishStyles(...)` -- and discarded its boolean. A refused stylesheet left the list reporting "Published at /about" for a page rendering unstyled to every visitor. Five more unread answers in the same pass: the builder's route list became `[]` on any error (so an outage read as "nothing published" and invited publishing over a live page); the schema editor never read its PUT (a 4xx showed the new model, saved only to localStorage); the BQL parser's error envelope was cast to the success type (`outcome.errors.length` threw in a void promise -- spinner cleared, nothing on screen); asset delete never read the response (a refusal refreshed and showed the file still there); `idbSet`'s `tx.onerror` resolved exactly like `oncomplete` and `lsSet` swallowed quota errors, so `snapshot()` returned a version nothing had stored and History told a founder who had just published to "publish to snapshot". |
| Publish greyed out for "same tree, new route" | The bar gated on `dirty.tree` alone, and `load()` clears that flag. Load `/about`, change the target path to `/pricing`, press Publish: disabled, no explanation, throwaway edit required. `useTargetActions` now records `loadedPath`, and the workbench publishes when the tree changed **or** a loaded tree points somewhere else. |
| A failed assertion that leaked a spy into every test after it | `idb-kv.test.ts` spied `Storage.prototype.setItem` to throw and called `mockRestore()` on the line **after** its assertion. When the contract changed and that assertion failed, the restore never ran and the two "falls back to localStorage" tests in the *next* describe failed with no connection to the change. Restore in `finally`. **Two collateral failures with no plausible cause usually means an earlier test's cleanup did not run.** |
| `access/PageConfig` vs `core/PageConfig` -- neither is wrong | `app/page.tsx` used `access` with a comment implying the other twenty call sites' `core` must 422. `rpc_restful_handler.cpp` validates the package segment only for **shape** (alphanumeric + underscore) and resolves the entity by name, so both route to the same table. The inconsistency sent two separate reviews hunting a bug that was not there; it now matches the rest. |
| The Link block emitted its href verbatim | `html.a`'s own placeholder is "/contact" and its hint says "a page path" -- and a founder typing exactly that got a link to `/contact`, not `/app/{tenant}/contact`, so **every internal link on a published page 404'd**. `nav-href.ts` exists to fix this; only `NavBarLinks` called it. A block's `render()` is a plain function, so like the nav it needs a component (`LinkBlock`) to reach `usePathname` -- and, per the row on cloneElement above, that component must forward `BlockAttrs` onto its `<a>`. The palette sweep test catches it if it does not. |
| Three copies of one table, all wrong the same way | `use-god-panel-state.ts`, `preview-targets.ts` and `UsersToolbar.tsx` each hard-coded `'/'`, `'/profile'`, `'/admin'`. Under basePath `/app` the last two resolve to `/app/profile` and `/app/admin`, which Next matches as tenants named "profile" and "admin", refuses, and 404s; `'/'` is the marketing page. So **"Home" in the builder's own header left the product, every Preview card on the first tab a founder lands on was dead, and "Open Admin Panel" went to `/app/app/admin`** -- the one `router.push` in the app that also prepended `BASE_PATH`, which the router adds itself. Exactly the dashboard-tiles row above, one screen over; the fix there did not look for other copies. One helper now: `previewPathForLevel`. **`router.push` takes a path without the basePath; `window.location.assign` needs it added.** |
| A tenant filter the data layer ignores, then a client-side filter that discards everything | The Credentials tab asked `/system/core/User?filter.tenantId=<scope>`. DBAL scopes by the URL's tenant and ignores `filter.tenantId` (`tenant-exists.ts` says so), so every founder was handed the **system tenant's users** -- god, supergod, admin, with emails and roles -- over the wire, and `visibleAccounts` then threw all of them away for having the wrong tenantId. Their own members live at `/{tenant}/core/User` and were never fetched: the tab was permanently empty. The fourth `/system/` hard-code missed by the tenant sweep; grep for `/system/core/` when you add a tab. |
| The signup screen promised a URL that could not work | The hint showed `metabuilder.app/acme-running-club` while the payload sent `tenantName: acme_running_club` -- DBAL's route parser takes only alphanumerics and underscores, and `tenant-exists` refuses a hyphen before any request -- and it omitted the `/app` basePath too. Two places derived the name; `tenantNameFor` is now the one place, and the test asserts the hint equals the payload. |
| The register limiter was declared, documented, and applied to the wrong route | `RATE_LIMIT_CONFIGS.register` (3/min, "to slow account-enumeration attempts") was applied only inside `/api/v1/…/auth/register`. The signup form posts to `/api/auth/register`, which applied nothing -- and answers "Username already exists", "Email already exists" and "already taken" with distinct messages, so unlimited it was an oracle for all three, each attempt costing an Argon2id hash inside DBAL. Applied before the body is parsed. **A limiter's existence in `configs.ts` says nothing about which route runs it; grep `applyRateLimit(` for the route you care about.** Note the test trap: the older route tests sent no `x-real-ip`, shared the `"unknown"` bucket, and the new three-attempt test drained it before they ran -- give each test request its own address. |
| Five raw `<a href={\`/${tenant}/…\`}>` the lint rule cannot see | `@next/next/no-html-link-for-pages` reads only string-literal hrefs against a `pages/` directory, so template-literal hrefs under `app/` pass it untouched. Five entity views linked past the basePath and 404'd. `next/link` applies it and works in server components. |
| A limiter for a login form that is not this app's, and none for the one that is | `RATE_LIMIT_CONFIGS.login` (5/min) was applied nowhere -- sign-in is DBAL's own form -- while `POST /api/vault/auth`, which compares a guess against the **one instance-wide master password**, had no limiter at all. The vault, holding every credential the instance manages, was brute-forceable from a loop. The dead config now guards it. |
| A write, then a second write that can fail, and a catch that rolls nothing back | Registration writes the User row and *then* provisions the Credential. DBAL's `isValidUsername` refuses under three characters and the signup form allowed two, so "AB" wrote the row, had its Credential refused, and the catch returned the error and left the row behind. The retry hit "That community name is already taken" -- which checks for *any* user in the tenant -- so the name was burned with no account able to log in. The minimum is three now, and a credential failure discards the row it wrote (best-effort, as the operator, without hiding the real error). **When step two can fail, step one needs an undo.** |
| A block that collects nothing, next to one that does | `m3.checkbox` and `m3.switch` rendered a bare control with no `name` and never touched the form scope, while `m3.textfield` beside them did. A founder could add "I agree to be contacted", a visitor could tick it, and the row arrived without it. `FormCheckbox` now carries the answer -- and records "no" on mount, because an unticked box is an answer and `${event.data.agreed}` has to be able to tell "left unticked" from "not on this form". |
| A builder notice shipped to visitors | The image block returned `<em>Image: no src set</em>` when its address was empty -- and published it. A founder who added an image and published before pasting the URL shipped that italic text to every visitor. The published page shows nothing now; the builder warns through the prop schema's `warnIfEmpty`, which is where a founder is looking. **A block's render() runs on the live page too; anything meant for the builder does not belong in it.** Note the sweep test consequence: a block that renders *nothing* has no node to carry attributes, so the sweep gives the image an address rather than weakening its assertion. |
| The shared-bucket test leak, a third time | Adding a limiter to a route whose existing tests build requests with no address puts every one of them in the `"unknown"` bucket, and the Nth request in the file is refused for reasons unrelated to what it tests -- `register`, then `vault/auth`. Both harnesses now hand each request a fresh `x-real-ip`. **When you add `applyRateLimit` to a route, go and give its tests addresses in the same commit.** |
| `.env.example` documented two variables, neither of which anything reads | `DATABASE_URL` and `DBAL_NATIVE_PRISMA_TOKEN` appear in no `process.env` read under `src/`; the twenty-two that *are* read appeared nowhere. `DBAL_ADMIN_TOKEN` unset silently drops the auth header in `tenant-exists.ts` and 404s a new founder's panel; `NEXT_PUBLIC_DBAL_OIDC_BASE_URL` unset makes the login button 404 under plain `next dev`; `METABUILDER_INTERNAL_URL` wrong makes every entity view fail to reach the app's own API. The file now lists every variable with what breaks without it. **Regenerate it from `grep -rhoE 'process\.env\.[A-Z_]+' src` when adding one.** |
| A tab's description in the nav config is a promise the tab has to keep | `god-panel-config.json` said "User management and role assignment" (the tab is a read-only list with a search box), "Database inspection and management" (a static list of adapter blurbs), and the Tests tab's hint said each test "feeds its input through the current workflow" (`run-workflow.ts` never dispatches on `node.type` -- it merges config and moves on, so a green test proves only that a config object carries the expected keys). The Database tab also offered a **Redis** card with a `REDIS_URL` hint while `dbal/CMakeLists` excludes `adapters/redis/` from the build. The Deploy row above is the same shape. **When a tab does less than its description, fix the description in the same change as the tab, or the description is the bug.** |
| An export that carried pointers to content that was not in it | "Export Database" wrote `User`, `Workflow`, `PageConfig`, `StyleClass` -- the parent rows. A page's content is `PageTree`/`PageTreeNode`/`PageTreeProp`, a stylesheet's is `StyleRule`/`StyleRuleProp`, a workflow's is `WorkflowNode`/`WorkflowNodeParam`/`WorkflowEdge`, and none were exported; nor were `FormSubmission` (the founder's leads) or `TenantTheme`. A founder exporting before a migration got a backup with none of their site in it. |
| "Not written to DBAL" is not the same as "not one community's" | The tenant reset cleared only keys published under a tenant id, on the reasoning that `plan`, `tests` and `dropdowns` never reach DBAL. But the slice persists per browser origin: founder A's plan cards, saved tests and dropdown lists were on screen for founder B the moment B signed in on the same machine. What is *shown* is what leaks. The rule is now "authored by one community", and all three are cleared -- at the cost of a browser-local draft not surviving a cross-tenant round trip, the same trade the tree already made. |
| The founder was never told the name the sign-in prompt asks for | `register` sends `username: slug` -- the **hyphenated** community slug (`acme-running-club`) -- while the URL tenant is the **underscored** one (`acme_running_club`), and DBAL's sign-in form asks for "Username". Neither string was shown at signup; the dashboard showed the username unlabelled, as if it were a display name. A founder was bounced to a Username prompt seconds after signing up with nothing that would work: not their name, not their email (the assembled DBAL checkout has no `verifyCredentialIdentifier`, whatever `register.ts`'s comment claimed), and not the URL they had just been shown. The signup screen now says "You will sign in as **acme-running-club** -- write it down", and the dashboard labels it. **Two near-identical derived names is a trap; if you cannot make them one, show both and say which is which.** The DBAL half -- email as a second identifier -- is a sibling-repo change and is not in this branch. |
| The route list carried its own level table, off by one from the field it showed | `page-list-levels.ts` said 1: Public, 2: User, 3: Admin while the form writing `PageConfig.level`, `ROLE_LEVELS` and the server gate all count from 0. So a public page listed as "L0", a users-only page as "Public" and a moderators-only page as "User" -- the list told a founder the opposite of who could see each page -- and its "Auth" chip read `requiresAuth` alone, so an Admin page sat beside a green "Public". One table now (`lib/tenant/page-levels.ts`), and the chip says what `requiredPageLevel` -- the same function `mayViewPage` enforces -- says. Found a **fourth** reader of the string-typed level too: `usePageRoutes` handed rows straight through, so the list matched `"3"` against nothing and printed "L3". **A label table next to a UI is a second definition of the field; put it beside the parser.** |
| A heading that promised management over a list nobody could change | The Users tab was headed "User Management" and printed the role hierarchy, and neither it nor the Admin Panel offered any way to change a role -- a founder could not make a moderator. Its Level column read `user.level ?? 1` off a row that carries no level, so every god showed as L1. Roles are assigned in the tab now (`users-roles.ts`): a caller may hand out any role **strictly below their own** and may not touch their own account or a peer's, the write goes to `/{tenant}/core/User/{id}` as the caller (DBAL's `update: {self, admin}` ACL applies), the list shows the change at once and puts the old role back with the reason on a refusal. Level is derived from role. |
| `credentials: 'include'` against a stub answering `Access-Control-Allow-Origin: *` | The preflight 204s and the PUT itself dies as `Failed to fetch` -- a browser refuses a credentialed response whose allowed origin is the wildcard. The E2E stub echoes the request's `Origin` and sets `Allow-Credentials` now. Only bites when the browser talks to DBAL directly (`NEXT_PUBLIC_DBAL_API_URL` set); through the same-origin `/api/dbal` proxy there is no CORS at all, which is why nothing in production ever saw it. |
| "fetch failed" as the whole error | Node's undici reports a connection it never made as a bare `TypeError('fetch failed')`, and the Files tab showed exactly that when no object store was running -- nothing about *what* failed to be fetched. `api/assets/store-error.ts` names the store URL and the variable that points at it. **When a route relays an error to a person, ask whether the message names the thing that broke.** |
| "Best-effort" on the one write a visitor depends on | The Theme tab's Save wrote localStorage, fired the TenantTheme POST, and swallowed every failure as "non-fatal -- the localStorage copy still applies". It applies to **this browser**; visitors read the TenantTheme row and never see that copy. So a refused write left the founder looking at their colours while every visitor got the defaults, and Save gave no feedback either way -- pressing it did nothing visible, which is indistinguishable from it having worked. `saveColors` now resolves with a status and the editor says "Saved -- visitors will see these colours" or "Kept in this browser only (HTTP 403)". **A local fallback is not a reason to hide the failure of the thing it falls back from.** |
| A seed that the tab's own check flagged | `SEED_CSS`'s `card` was `#161b22` on a `#30363d` border with no text colour -- a dark-mode mockup's palette -- and every new community starts on the light theme, so the first class a founder ever opened previewed as near-black on near-black and the Styles tab's contrast check said "Hard to read" about the product's own starter. Theme tokens now (`var(--mat-sys-surface-container)` etc.), the same values the tab's colour picker stores, so the seed follows the tenant's palette and the viewer's mode. **Open your own defaults in your own editor once; if it warns about them, the defaults are the bug.** |
| Fixing "Publish is greyed out" at the one entry point you tested | The first fix recorded the loaded path in the setup panel's `pick`/`load` handlers and passed its own test. The workbench loads a founder's page **on mount** through `useComponentTree.load` directly -- the way a page normally arrives -- and a returning founder's tree is not loaded at all but rehydrated from IndexedDB, so both left the record null and Publish stayed grey for "same tree, new route". Found only by driving the tab in a browser after a reload. The record now lives with the tree (`loadedPath`, set by load **and** publish) and persists in localStorage beside the tenant marker (`tree-path.ts`, believed only for the same tenant), and the gate is inverted: grey only when the tree is unedited **and known** to be live at exactly the target path; unknown means publishable, since re-publishing is an idempotent swap. **A state that answers "is this already live there" has to survive the paths that never call your handler -- mount and rehydration -- or it answers wrong exactly when a founder returns.** |
| A stub that models the communities and forgets the instance | `e2e/dbal-stub.mjs` knew the two fixture tenants and answered `[]` for anything else, so `tenantExists('system')` said no and the tenant layout 404'd `/app/system/panel/media-center` -- nine media-centre tests red, from the day the stub became the E2E data layer, with the failure list hidden under a `tail -6` that only showed the "passed" line. `system` always exists on a real install (the seeded god user lives in it) and the stub says so now. **When you read an E2E summary, read the line above "N passed" too; and when a stub says who exists, include the tenant every install is born with.** The signup-hint spec was also still asserting the old hyphenated, basePath-less address that the form was fixed to stop showing. |
| An entity three subsystems wrote and nothing ever read | Every Form block on every published page writes a `FormSubmission`; the backup exports them; `useFormNames` reads them for workflow suggestions; DBAL fires `FormSubmission.created` off them, which is the whole "Someone submits a form" trigger. **No screen in the product ever showed one.** A founder could put a contact form on their site, watch visitors fill it in, and never read a single message -- the one thing a community site collects that cannot be reconstructed from anywhere else. Now the Messages tab (`tabs/submissions/`): newest first, filtered by form, mark handled (`status` is the privileged field forms deliberately never set, so this is its only writer), and CSV export. **Grep for the reader of every entity you write, not just the writer of every entity you read** -- an entity with three writers and no reader is a feature that was never finished. |
| A CSV of what strangers typed | The export is the founder's leads leaving the product for a spreadsheet, and Excel and Sheets run a cell that opens with `=`, `+`, `-` or `@` -- so "=HYPERLINK(...)" typed into a public contact form becomes a live link in the founder's download. `csvCell` prefixes those with an apostrophe (the standard defence: the cell shows the text and runs nothing) and quotes everything. **Any export of user-supplied text is an injection surface for whatever opens the file, not just for the app.** |
| A nav config and a component map joined by string id | `god-panel-config.json` advertises the tabs; `TAB_COMPONENTS` supplies them; `GodPanelPanels` joins them by id and renders *"Tab X is not yet implemented"* for a config entry with no component -- quietly, forever, and only for whoever clicks that tab. A typo'd id does the same. `god-panel-tabs.test.ts` now asserts both directions: every advertised tab has a component, and every registered component is advertised (one nothing routes to is dead code). |
| Do not conclude what a local `dbal/` grep tells you | Both `dbal/` and `libraries/dbal/` are the **same** gitignored mount of the sibling dbal repo (`workspace.json` mounts it twice), and the copy assembled here declares 68 entities -- among them **no** `FormSubmission`, `PageTree`, `PageTreeNode`, `PageTreeProp`, `StyleRule`, `StyleRuleProp`, `WorkflowNode`, `WorkflowNodeParam` or `WorkflowEdge`, i.e. every entity the publish path and the form path write. Read literally that says publishing and forms are refused end-to-end, which is almost certainly wrong: the rows above record several of these being written and read back against a live daemon. The mount is stale, or they are registered some other way (`entity_schema` is itself an entity, and the Schemas tab edits models at runtime). Either way the local tree is **not** the authority on what the deployed data layer knows -- confirm against the dbal repo before acting on its absence. Worth confirming that FormSubmission in particular does exist there, since nothing in this repo can prove it and every form on every published page depends on it. |
| A test runner that dispatched on nothing | `run-workflow.ts` walked the graph in dependency order and gave **every** node the same treatment -- merge its config into the data and move on. So "Only carry on if" carried on, "Make an id" made nothing, "Say something" said nothing, `${event.data.name}` was never resolved by anything in this repo, and a green test in the Tests tab proved only that a config object carried the keys the test asked for. The earlier pass here fixed the tab's **description** to admit that, which is honest but leaves a "point-and-click unit testing" tab that tests nothing. The steps run now (`lib/workflow/dry-run/`): ids are handed out as `dry-run-id-N` so a run repeats exactly (a real uuid makes any test touching that step pass once and fail next time), the clock is a parameter for the same reason, rows go to an in-memory store so a workflow that reads back what it wrote can be tested without writing anything, page steps are recorded in the wire shape `page-effects.ts` applies rather than applied, and a failed condition stops the run and says which step and why. A node type it does not know keeps the old merge, which is all the editor's stock palette (Webhook, Code, Slack) could ever do. **Verified by negative control: 16 of the 17 new tests fail with the dispatch switched off.** |
| A condition nobody can evaluate is not a condition that passed | `evaluateCondition` returns `holds: false` for an `is` it does not implement, because the steps *after* "Only carry on if" are the ones that write rows. Failing open there would run the writes on a typo. |
| A mock that returns half the type its only caller consumes | `fire-workflow.test.tsx` mocked `runWorkflow` as `{ logs, output }` -- true of the old shape -- and adding `rows`/`effects` to `RunResult` broke it with `Cannot convert undefined or null to object` inside the code under test rather than at the mock. The fix is the mock, not a defensive read: a partial mock is the test disagreeing with the only caller. Same family as the casts below. |
| A whole page that crashed, found by clicking it | `/{tenant}/panel/chat` rendered *"Something went wrong -- messages is not iterable"*. `irc-api.ts` read `json.data` as the list, but the real envelope is `{data:{data:[…]}}`, so it handed back an **object**, and `IrcChatShell` spreads what it returns -- `[...messages]` on an object throws, and the error boundary ate the page. Third instance of this exact envelope misread (`usePageRoutes` and `users-data` were the first two, both of which merely rendered empty); it crashes here because the value is spread rather than mapped. Its tests asserted the one-level shape, so they agreed with the bug. `readList` now, like every other reader. **A bespoke unwrapper for the DBAL envelope is always wrong; there is one reader and it is `lib/db/read-list.ts`.** |
| Four things wrong in one URL, and a fallback that hid all of them | The same file asked `${DBAL}/v1/default/irc/irc_channel`: a `/v1` prefix DBAL does not serve, a hardcoded `default` tenant, the package `irc` where the schema says `irc_webchat`, and snake_case where the entities are `IRCChannel`/`IRCMessage`. It could only ever 404 -- and the hook catches any failure as *"DBAL offline -- using local data"*, so chat silently ran on localStorage from the day it was written and looked like it worked. The tenant is a required parameter now (`useChatTenant`, from the route), the fallback keys carry it, and the author is written to `username`, the field the entity actually declares -- `createdBy` was not a field at all, so every message would have arrived with no author. **A fallback that catches every error is a fallback that hides every bug: when one exists, check that the primary path has ever once succeeded.** |
| The envelope misread, swept | After the chat crash, `grep -rn "json\.data\|body\.data" src` found the same hand-unwrap in six more places. `use-god-users` and `use-power-transfer-users` called `.filter` straight on it -- an object -- so the super-god panel's tabs **threw** the moment DBAL answered, and both also asked for `core/user` where the entity is `User`, which 422s. `apply-tenant-theme` read a fetch-by-id as `json.data`: right for `{data: row}`, wrong for `{success, data: {data: row}}`, where it hands back the wrapper, every field reads undefined and the function quietly returns the built-in defaults -- a founder's brand colours in the editor and never on their site. `readRow` (in `lib/db/read-list.ts`) takes either depth, so that guess is gone. **One reader for lists (`readList`), one for a single row (`readRow`); a hand-rolled unwrap is a bug that has not surfaced yet.** |
| Asking for the Tenant table, a third time | The super-god panel's Tenants tab fetched `/system/core/tenant`, took the 404 as "no tenants" and showed an empty list for its whole life -- the same non-existent entity that made `validateTenantAccess` refuse every caller. There is no Tenant entity and there does not need to be: a community exists if it has anyone in it (`tenant-exists.ts` says so), so the list is derived from the accounts, with the god as founder and the earliest account as its start date. It also now distinguishes "nothing here" from "could not read", which for the instance owner's only view of what exists is the whole point. **Its `create`/`remove` are still local-state only -- a community is made by signing up, and nothing in that tab writes anything. Flagged, not silently redesigned.** |
| `cause.message` for the failure that happens most | `use-media-channels` wrote `setError(cause instanceof Error ? cause.message : loadError)` -- and a service that is not running throws a **TypeError** whose message is the bare `"Failed to fetch"`. So the friendly `loadError` beside it was unreachable by construction, and a founder's Stream page said "Failed to fetch" with no hint of what had not been fetched. Same shape as the Files tab's "fetch failed". `lib/net/never-connected.ts` names that case once (TypeError with a fetch-ish message, or an aborted DOMException) and both callers use it; the message now names the service and the address. **A fallback that only fires for non-Errors never fires: every fetch failure is an Error.** |
| The `/system/` hardcode, one more screen over | `useStreamApps` fetched the constant `/app/api/v1/system/platform/StreamApp`, so every community read and wrote the **instance's** stream apps -- a founder's additions landed in a tenant they do not own, and the row they were shown, and could delete, was somebody else's. Exactly the row above about the theme, CSS, SMTP and schema editors, found by clicking the one screen that sweep had not covered. The tenant now comes from the route via `lib/tenant/use-route-tenant.ts`, which the chat fix needed too -- so it lives in `lib/tenant`, not beside either caller. **When two screens need "whose page is this", that is a shared answer, not a local one.** |
| One shared community board | `comment-types.ts` addressed `/system/pastebin/ProfileComment` and stamped every new row `tenantId: 'system'`, so every community on the instance posted into and read **one** board: a founder's members saw strangers' comments as their own community's, and the founder could delete them. Found by clicking the Comments page after the chat fix, on the suspicion that anything with a hardcoded tenant would have the same shape -- it did. |
| The sidebar showed the instance's packages to everyone | `fetchNavigablePackages` asked `/system/core/InstalledPackage`, and packages are installed **per tenant** (the Packages tab writes the row under the tenant it was pointed at). So a founder who installed Community or Content never saw it in their own navigation, while whatever the instance had installed appeared in everybody's. **Four screens in one sweep had the same constant: chat, stream apps, comments, sidebar. When you find a hardcoded tenant, grep `/system/` across the app rather than fixing the one you found.** |
| One side forwards a cookie, the other reads only a header | `entityApiFetch` forwards the incoming session cookie so a Server Component can call this app's own `/api/v1` as the visitor -- its comment says exactly that -- and `getSessionUser` read the `Authorization: Bearer` header **only**. So every entity list, detail, create and edit page under `/{tenant}/{package}/{entity}` rendered *"Error loading data: Authentication required"* to a signed-in founder: a whole CRUD surface, with views, metadata and tests, that could never once have worked. Found by opening `/{tenant}/core/User` in a browser. `getSessionUser` takes the bearer when there is one and falls back to `mb_session` -- the cookie the DBAL proxy, the asset routes and `mayViewPage` all already use. **When two halves of a call authenticate differently, one of them is dead; check that any surface you have never opened actually renders.** |
| A list view whose columns came from a schema it never has | `loadEntitySchema` reads `packages/{packageId}`, so anything outside a package directory -- `core/User`, say -- has none, and `EntityTable` rendered a header of nothing but "Actions" over one empty row per record. The rows know what they carry: `columnsFor` uses the schema when there is one and the union of the rows' own keys otherwise, id first. |
| Describing a row from what the write echoed back | `register()` built its whole `user` response out of `createDbalUser`'s response body -- and a DBAL create answers `{data: {id}}`. Confirmed live: a successful signup returned `{"user":{"id":"stub","tenantId":null,...}}` with no username, no email, no role and `createdAt: NaN`, about an account the function had just written and knew everything about. Worse, the credential-failure rollback deleted `newUser.id` from that echo rather than the id it generated, so the undo aimed at the wrong row -- or at `/undefined` -- and left the orphan that burns the community name for good (the very thing that rollback exists to prevent). The tests passed because their stub echoed a full row, i.e. was kinder than the real daemon. **Describe what you wrote from what you wrote.** |
| A fallback the likeliest failure cannot reach | `usePackageMetadata`'s comment says its placeholder covers "offline, **or DBAL has no record for it yet**", and only the `catch` reached it -- a 404 took the `res.ok ? … : null` branch, left metadata null, and the page rendered "Package Not Found" for a package the founder had installed and could see in their own sidebar. Its two tests asserted that null, so they agreed with the code instead of with the comment above it. |
| A form that looks finished and writes nothing | The entity create and edit views rendered labelled inputs above a `<button type="button">` with **no handler** -- nothing read the inputs, nothing submitted -- so filling one in and pressing "Create User" or "Save Changes" did exactly the same nothing as leaving it blank, and looked identical to success. Their tests asserted the inputs existed, which was true, and never that pressing the button did anything. They write now (`EntityForm` -> `submitEntity`, through the app's own `/api/v1` with the session cookie), report the server's own refusal, and navigate on success; a create form with no schema and nothing to derive fields from says so and disables the button rather than posting an empty row. **`grep -n 'type="button"' | grep -v onClick` is worth running on any surface you have not clicked.** |
| Unwrapping the list but not the row beside it | `fetchEntityList` went through `readList`; `fetchEntity` handed the envelope back whole. So the detail page and the edit form showed a single field called `data` containing `{"data":[{"id":"u1"}]}` -- visible the moment the forms started rendering anything at all. Both readers now share `readRow`. **When one of a pair of functions is fixed, the other is where the bug goes to hide.** |
| The critical button that did nothing, under a warning that it could not be undone | "Initiate Power Transfer" -- headed *"This action cannot be undone"*, promising to make somebody else the instance owner and step you down -- was a `<Button>` with **no onClick**. The one thing it did was nothing, which is exactly what success looks like. It asks first now and then writes, and the ordering is the whole design: the new owner is promoted **first**, so a refusal changes nothing, and only then is the old one stepped down -- a failure there leaves two supergods, which either can put right, where the other order risks leaving none, which nobody can. Same family as the entity forms above; both were found by `grep '<Button\|<button'` for tags carrying no handler. |
| A fourth copy of the levels table | `PreviewLevelsTab` hard-coded `'/'`, `'/dashboard'` and `'/admin'` -- the marketing page and two addresses Next reads as tenants called "dashboard" and "admin" -- so three of its four Preview cards 404'd. The same table had already been fixed in the dashboard tiles, the God Panel header, `overview/preview-targets` and `UsersToolbar`, each time by pointing it at `previewPathForLevel`. **A helper only stops the bug in the copies you go and find.** |
| The fourth call in the file you did not open | Fixing `irc-api.ts` corrected three IRC calls and left a fourth: `ChannelList` had its own `joinChannel`, with its own copy of the DBAL constant, asking `/v1/default/irc/irc_membership` -- the same four mistakes -- inside a `catch {}` that reported nothing, so joining a channel had never once worked and never once said so. Its own test asserted the broken URL. It lives in `irc-api.ts` with the rest now, and the shell passes the real tenant and username. **When a module owns the calls to a service, grep the whole feature for `fetch(` before believing you have fixed them all.** |
| A tab about the product, on a screen a founder opened to see their own data | The Database tab listed the fourteen backends DBAL *can* run on -- a choice made by whoever runs the instance, never by a founder, and unchangeable from here -- and nothing anywhere in the product showed a founder how much of anything they actually had. It counts their own collections now, reusing `EXPORTED_COLLECTIONS` so what the tab reports and what a backup contains cannot drift; a collection that could not be read says so rather than counting as zero, because a data layer that is down otherwise looks exactly like a community with nothing in it. **"Honest but useless" is still a tab doing less than its screen-space costs.** |
| A cast that turned a total failure into a green test | `saveEdges` was typed `GraphEdges` (a nested source -> handle -> outputIndex -> targets adjacency). Its only caller has the editor's flat `Connection[]` and reached it via `as unknown as GraphEdges`. `Object.entries` therefore walked the array, then each connection's own fields, then **the characters of their string values**: one link drawn in the editor became twelve `WorkflowEdge` rows with `sourceKey "0"`, handles named `id`/`sourceOutput`, and no `targetKey`. It returned `true`. The C++ loader drops any edge naming a node it does not have, so execution never complained -- workflows ran in whatever order `listEntities` returned their nodes in (insertion order, which is why it looked correct) and the graph a founder drew had never once been honoured. The declared type had a comment acknowledging the mismatch and adding `?? []` fallbacks at each level, which made the code look careful while it wrote garbage. **A double-unknown cast is not a type assertion, it is a claim that no test is checking -- write the test that asserts what actually reaches the wire** |
| The same cast, one file over: no workflow had ever had a parameter | `saveNodes` was typed `GraphNode[]` -- the DBAL row shape coming back *out* -- and handed the editor's `WorkflowNode[]` through the same `as unknown as`. `GraphNode.parameters` does not exist on it (the editor calls it `config`) and `position` is `{x, y}`, not `[number, number]`. So `Object.entries(node.parameters ?? {})` iterated nothing and **not one `WorkflowNodeParam` row was ever written**, while every node was saved at 0,0. A published workflow had its steps and their order and nothing telling any of them what to do: `page.message` with no `text` throws inside the daemon, `dbal.log` logs an empty line. Every write returned 2xx, so the panel said published. Its unit test built a `GraphNode` too, so the test agreed with the declared type and neither agreed with the only caller -- **when a test constructs its input from the same wrong type the code declares, it cannot fail; build the fixture from the caller's type**. Found by publishing a workflow and reading the rows back, not by any test |
| `on_delete: cascade` in a schema does nothing outside Prisma | `workflow_node_param.json` declares a `belongs-to` relation with `on_delete: cascade`, and `delete-existing-graph.ts` said in a comment that params cascade with their node. Only `core/prisma_relation_generator.cpp` reads `onDelete`; `templates/sql/{sqlite,postgres,mysql}_create_table.sql.j2` emit **no FOREIGN KEY at all**, so on the adapters actually in use nothing cascades. Harmless while no `WorkflowNodeParam` row existed (see the row above), and immediately harmful once they did: `(nodeId, name, sortOrder)` is unique, and the visual editor keeps a node's id between saves, so the *second* publish of any workflow 409s on every parameter and reports "the workflow was saved but its steps were not". Delete children explicitly. **Treat a relation's `on_delete` as documentation until you have found the code that enforces it for your adapter** |
| A field that is `required` *and* has a `default` | DBAL validates presence before applying defaults, so `"required": true, "default": 0` on `WorkflowNodeParam.sortOrder` is a 422 ("Field is required") for a field that has one -- the same shape as `Workflow.version`, which made publishing a workflow fail for months. Writers must send it explicitly. Worth grepping the schemas for the combination before writing a new client |

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
