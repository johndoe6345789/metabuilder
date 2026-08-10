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
cd deployment && python3 deployment.py build base --list  # Docker base images

# Documentation (SQLite3 + FTS5 full-text search)
cd docs/txt && python3 reports.py search "query"     # 212 reports
cd docs && python3 docs.py search "query"            # 217 docs, 13 categories
cd docs && python3 docs.py list --category guides
```

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

**Details**: Search `cd docs/txt && python3 reports.py search "topic"` for full completion reports.

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
| `docs/` | SQLite3 (217 docs, 13 categories, FTS5 search) |
| `docs/txt/` | SQLite3 (212 reports, FTS5, archives) |
| `docs/old/` | Legacy Spark implementation |
| `.github/` | GitHub Actions, templates |

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

**Multi-Adapter Patterns**:
- **Redis caching**: `DBAL_CACHE_URL=redis://localhost:6379/0?ttl=300&pattern=read-through`
- **Elasticsearch search**: `DBAL_SEARCH_URL=http://localhost:9200?index=dbal_search&refresh=true`
- Patterns: read-through, write-through, cache-aside, dual-write, CDC, search-first

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
cd deployment && python3 deployment.py build base  # Build Docker base images

# Deploy full stack
cd deployment && python3 deployment.py stack up

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
8. Reports → `reports.db`, Docs → `docs.db` (SQLite, not markdown files)
9. Git: `git add` on project root first, then commit
10. Use `mv` not `cp` (prevents duplicates)
11. Log long commands: `| tee docs/txt/command-$(date +%Y%m%d-%H%M%S).log`
12. Search SQLite before browsing files

### Gotchas & Lessons Learned

| Gotcha | Prevention |
|--------|-----------|
| Conan profile in Docker mount | Run `conan profile detect` INSIDE cache-mounted RUN |
| Missing types after refactor | Verify all referenced types exist before committing |
| Headers in src/ not include/ | Use relative paths or fix build include dirs |
| No logs for long commands | ALWAYS pipe to docs/txt/*.log |
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

### Critical Folders to Check Before Any Task

`/libraries/redux/`, `/libraries/components/`, `/libraries/scss/`, `/libraries/hooks/`, `/libraries/types/`, `/libraries/interfaces/`, `/libraries/icons/`, `/libraries/workflow/`, `/libraries/schemas/`, `/packages/`, `/deployment/`, `/docs/docs.db`, `/docs/txt/reports.db`

### Task Workflow
1. Read relevant CLAUDE.md
2. Search SQLite docs: `docs.py search` / `reports.py search`
3. Check if functionality already exists in critical folders
4. Use Explore agent for codebase questions
5. Plan affected files before coding
6. Verify multi-tenant filtering + rate limiting

---

## Definition of Done

A task is complete when:
- **Builds**: Compiles, core functionality works, type safety reasonable
- **Tests**: All pass, new tests added, edge cases covered, multi-tenant verified
- **Deploy**: Docker builds, services healthy, env vars documented, deps install
- **Docs**: CLAUDE.md updated, reports in SQLite, architecture docs updated
- **Security**: Input validation, no XSS/SQLi, passwords hashed, no secrets, rate limited
- **Git**: Clear commit message, co-authored tag, no merge conflicts

**Standards**: IMPLEMENT don't disable. Real solutions over workarounds. TODOs acceptable for future work. Pragmatic over perfect.

**Unacceptable**: Deleting code instead of fixing. Fake implementations. Claiming done when broken.

**Task-Specific**:
- Refactoring: ~100 LOC classes, original functionality preserved, tests pass
- New Adapters: CRUD + bulk + query + metadata ops, connection management, Result<T> errors
- Docker: Multi-stage, BuildKit cache, <500MB runtime, non-root user, health check
- Documentation: Imported to SQLite, categorized, searchable via FTS5

---

## Project Organization

- **Root**: Minimal - config, CI/CD, build, package files only
- **Reports**: `docs/txt/reports.db` - create via `cd docs/txt && python3 reports.py create "Title" "Content..."`
- **Docs**: `docs/docs.db` - create via `cd docs && python3 docs.py create "Title" "Content..." --category guides`
- **Rule**: Create directly in SQLite, do NOT create markdown files first
- **File org**: Implementation type first (react/, python/, qml/), component categorization, preserve legacy in archived folders

---

**Status**: Production Ready (Phase 2 Complete)
**Next**: Universal Platform - Core Infrastructure (State Machine, Command Bus, Event Stream, VFS, Frontend Bus)
