# MetaBuilder - AI Assistant Guide

**Last Updated**: 2026-03-04 | **Status**: Phase 2 & 3 Complete, Universal Platform in Progress
**Scale**: 27,826+ files across 34 directories | **Philosophy**: 95% JSON config, 5% TS/C++ infrastructure
**Documentation**: Code = Doc (self-documenting Python scripts with argparse)

---

## Code = Doc Principle

All documentation is executable code. No separate markdown docs.

```bash
# Entry points (each with --help)
./metabuilder.py --help              # Root project manager
./codegen/codegen.py --help          # CodeForge IDE
./pastebin/pastebin.py --help        # Pastebin
./gameengine/gameengine.py --help    # Game engine
./postgres/postgres.py --help        # PostgreSQL dashboard
./mojo/mojo.py --help               # Mojo compiler
./deployment/build-base-images.sh --list # Docker base images

# Documentation (SQLite3 + FTS5 full-text search)
cd txt && python3 reports.py search "query"     # 212 reports
cd docs && python3 docs.py search "query"       # 217 docs, 13 categories
python3 docs.py list --category guides
```

---

## Completed Milestones (All ✅)

- **Mar 4**: DBAL C++ event-driven workflow engine (`pastebin.User.created` → 15-node JSON workflow → seeded namespaces + snippets), full YAML→JSON migration (63 files, yaml-cpp removed), JWT auth + JSON ACL, declarative seed data (`dbal/shared/seeds/database/`), i18n (EN/ES) across all pastebin components, dark/light theme switcher
- **Feb 7**: Game engine CLI args (`--bootstrap`, `--game`), 27/27 tests passing (100%)
- **Feb 6**: 6 new DB backends (total 14), SQLite3 doc migration, Docker dev container, WorkflowUI E2E (92.6%)
- **Feb 5**: WorkflowUI mock DBAL testing, Settings/Help pages, DBAL env var config
- **Feb 4**: SQLiteAdapter generic refactoring, YAML Schema Spec 2.0, Dynamic entity loading (TS+C++), DBAL hooks integration, FakeMUI migration
- **Feb 3**: Visual workflow editor (n8n-style), Dynamic plugin registry (152 nodes)
- **Feb 2**: WorkflowUI migration to root packages (77% file reduction)
- **Feb 1**: CodeQL search, FakeMUI organization, Email components (22)
- **Jan 24**: Dependency fixes, testing library standardization
- **Jan 23**: Email client (Phases 1-5), Mojo compiler, FakeMUI restructuring, dependency remediation

**Details**: Search `cd txt && python3 reports.py search "topic"` for full completion reports.

---

## Directory Index

| Directory | Files | Description |
|-----------|-------|-------------|
| `dbal/` | 495 | Database Abstraction Layer (C++ daemon + shared schemas) |
| `workflow/` | 765 | DAG workflow engine, multi-language plugins |
| `frontends/` | 495 | CLI (C++), Qt6 (QML), Next.js (React) |
| `packages/` | 550 | 62 modular feature packages |
| `fakemui/` | 758 | Material UI clone (145 React + 421 icons) |
| `gameengine/` | 2,737 | SDL3/bgfx 2D/3D game engine |
| `codegen/` | 1,926 | CodeForge IDE (React+Monaco) |
| `pastebin/` | 1,114 | Code snippet sharing (Next.js) |
| `exploded-diagrams/` | 17,565 | Interactive 3D exploded diagrams |
| `schemas/` | 105 | JSON Schema validation |
| `services/` | 29 | Media daemon (FFmpeg/ImageMagick) |
| `postgres/` | 212 | PostgreSQL admin dashboard |
| `mojo/` | 82 | Mojo compiler + language examples |
| `docs/` | 1 DB | SQLite3 (217 docs, 13 categories, FTS5) |
| `txt/` | 1 DB | SQLite3 (212 reports, FTS5, archives) |
| `old/` | 149 | Legacy Spark implementation |
| `.github/` | 52 | GitHub Actions, templates |

*Other standalone: pcbgenerator, packagerepo, cadquerywrapper, sparkos, storybook, dockerterminal, smtprelay, caproverforge, repoforge, emailclient, prisma, deployment, spec, scripts, config, e2e*

---

## Core Principles

### 1. 95% Data, 5% Code
- UI, workflows, pages, business logic = **JSON**
- Entities NEVER hardcoded - loaded from JSON schemas
- Adapters NEVER hardcoded - discovered dynamically

### 2. Schema-First Development
```
dbal/shared/api/schema/entities/    # JSON entities (SOURCE OF TRUTH)
schemas/package-schemas/            # JSON validation schemas (27 total)
dbal/shared/seeds/database/         # Declarative JSON seed data
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

### Workflow Engine (`workflow/`)

Multi-language: executors (TS, Python, C++), plugins (C++/16 categories, Python, TS, Go, Rust, Mojo), 19 example workflows. Dynamic plugin registry at `/api/plugins` (152 nodes).

### Game Engine (`gameengine/`)

SDL 3.2.20, bgfx 1.129, MaterialX 1.39.1, Assimp, Bullet3, Box2D, EnTT 3.16.0, FFmpeg 8.0.1. 36 service interfaces. CLI: `--bootstrap bootstrap_mac --game seed`.

### CodeForge IDE (`codegen/`)

~420 TSX files (legacy) → 338 JSON definitions (target). See `codegen/CLAUDE.md`.

### FakeMUI (`fakemui/`)

167 components (145 core + 22 email) across 11 categories. Import from `@metabuilder/fakemui`. React/TS, QML (104+), Python (15), 421 icons, 78 SCSS modules.

### React Hooks (`hooks/`)

`@metabuilder/hooks` (30 hooks), `@metabuilder/hooks-utils` (useTableState, useAsyncOperation, useDebounced, useThrottled), `@metabuilder/hooks-forms` (useFormBuilder). Multi-version peer deps (React 18/19, Redux 8/9).

### Redux

12 packages: hooks, hooks-utils, hooks-forms, core-hooks, api-clients, hooks-*, redux-slices, service-adapters, timing-utils. Active in: workflowui, frontends/nextjs, codegen, pastebin.

### Email Client

Phases 1-5 complete (frontend). 4 DBAL schemas, 22 FakeMUI components, 4 Redux slices, 6 hooks, API endpoints. Phases 6-8 TODO: workflow plugins, Flask backend, Docker.

---

## Package System (`packages/`)

62 packages: Admin (7), UI Core (8), Dev Tools (7), Features (6), Testing (4).

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
cd deployment && ./build-base-images.sh  # Build Docker base images

# Deploy full stack
cd deployment && docker compose -f docker-compose.stack.yml up -d

# Build & deploy specific apps
./build-apps.sh --force dbal pastebin        # Next.js frontend only
docker compose -f docker-compose.stack.yml build pastebin-backend  # Flask backend

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
- **workflowui + new projects**: FakeMUI only (`@metabuilder/fakemui`)
- **Legacy projects**: Radix UI + Tailwind acceptable
- **Never**: Direct @mui/material imports in workflowui

### WorkflowUI Components
- Atomic components <100 LOC, SCSS modules, no sx prop
- Categories: layout/, cards/, forms/, navigation/, feedback/
- Import pattern: `@/components/{domain}/{Component}`

### Security Checklist
- Input validation, no XSS (no innerHTML with user data), no SQL injection
- Passwords hashed SHA-512, no secrets committed, multi-tenant tenantId filtering

### Declarative-First
Ask: Could this be JSON config? Could a generic renderer handle this? Is it filtering by tenantId?

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
- postgres dashboard uses @mui/material directly (should migrate to FakeMUI)
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
11. Log long commands: `| tee txt/command-$(date +%Y%m%d-%H%M%S).log`
12. Search SQLite before browsing files

### Gotchas & Lessons Learned

| Gotcha | Prevention |
|--------|-----------|
| Conan profile in Docker mount | Run `conan profile detect` INSIDE cache-mounted RUN |
| Missing types after refactor | Verify all referenced types exist before committing |
| Headers in src/ not include/ | Use relative paths or fix build include dirs |
| No logs for long commands | ALWAYS pipe to txt/*.log |
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
| `build-apps.sh pastebin` ≠ Flask backend | Use `docker compose build pastebin-backend` for Flask |
| `ensureClient()` before startup DB ops | `dbal_client_` is null in `registerRoutes()` — must call `ensureClient()` first |
| Seed data in Flask Python | NEVER — declarative seed data belongs in `dbal/shared/seeds/database/*.json` |
| Werkzeug scrypt on macOS Python | Generate hashes inside running container: `docker exec metabuilder-pastebin-backend python3 -c "..."` |

### Critical Folders to Check Before Any Task

`/redux/`, `/components/`, `/scss/`, `/hooks/`, `/types/`, `/interfaces/`, `/icons/`, `/workflow/`, `/schemas/`, `/packages/`, `/deployment/`, `/docs/docs.db`, `/txt/reports.db`

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
- **Reports**: `txt/reports.db` - create via `python3 reports.py create "Title" "Content..."`
- **Docs**: `docs/docs.db` - create via `python3 docs.py create "Title" "Content..." --category guides`
- **Rule**: Create directly in SQLite, do NOT create markdown files first
- **File org**: Implementation type first (react/, python/, qml/), component categorization, preserve legacy in archived folders

---

**Status**: Production Ready (Phase 2 Complete)
**Next**: Universal Platform - Core Infrastructure (State Machine, Command Bus, Event Stream, VFS, Frontend Bus)
