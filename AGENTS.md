# MetaBuilder — Agent Guide

**Last Updated**: 2026-08-08
Quick-start for AI agents (Claude Code, Copilot, etc.) working on this codebase.
Read CLAUDE.md for the full guide. This file covers agent-specific patterns and shortcuts.

---

## What's Running

```
http://localhost/pastebin           # Next.js UI
http://localhost/pastebin-api       # C++/Drogon backend (snippets, code run/debug, AI proxy)
http://localhost:8080               # DBAL C++ REST API (entities, sole JWT issuer)
```

**Test accounts**: `demo/demo1234`, `alice/alice1234`, `bob/bob12345` — these are DBAL Users; pastebin has no local password store, all auth goes through DBAL.

---

## Architecture in 30 Seconds

```
Browser (Next.js + Redux + IndexedDB)
  └── C++/Drogon backend (DBAL-only JWT verification, code run/debug, AI proxy)
        frontends/pastebin/backend/
        └── DBAL C++ daemon (REST API, JWT issuer)      dbal/production/
              └── PostgreSQL (prod)
```

**DBAL event flow on user registration**:
```
POST /pastebin/pastebin/User
  └── handleCreate() → dispatchAsync("pastebin.User.created")
        └── detached thread → on_user_created.json (15 nodes)
              └── 2 namespaces + 5 seed snippets created
```

---

## Key Files to Know

| Path | What it is |
|------|-----------|
| `libraries/dbal/shared/api/schema/entities/` | JSON entity schemas — SOURCE OF TRUTH (39 entities) |
| `libraries/dbal/shared/api/schema/events/event_config.json` | Event → workflow mappings |
| `libraries/dbal/shared/api/schema/workflows/` | JSON workflow definitions |
| `libraries/dbal/shared/api/schema/auth/auth.json` | JWT + ACL rules |
| `libraries/dbal/shared/seeds/database/` | Declarative seed data (JSON, loaded at startup) |
| `libraries/dbal/production/src/workflow/` | C++ workflow engine (WfEngine, WfExecutor, steps/) |
| `libraries/dbal/production/src/daemon/server_routes.cpp` | Route registration + auto-seed startup |
| `frontends/pastebin/backend/src/` | C++/Drogon backend — DBAL-only JWT auth, snippets, code run/debug, AI proxy |
| `frontends/pastebin/src/` | Next.js React app |
| `../deployment/metabuilder/compose.yml` | Full stack compose — moved to the [deployment](https://github.com/johndoe6345789/deployment) repo |
| `../deployment/deployment.py` | Python CLI for all build/deploy/stack commands — same repo |

---

## Before You Touch Anything

```bash
# Search docs first (SQLite FTS5)
cd docs && python3 docs.py search "topic"
cd docs/txt && python3 reports.py search "topic"

# Check what's already there
ls libraries/dbal/shared/api/schema/entities/
ls libraries/dbal/shared/seeds/database/

# Logs
docker logs -f metabuilder-dbal
docker logs -f metabuilder-pastebin-backend
```

---

## Deploy Commands

```bash
cd deployment

# Full rebuild + restart
python3 deployment.py build apps --force dbal pastebin
python3 deployment.py stack up

# C++/Drogon backend (separate from Next.js)
docker compose -f metabuilder/compose.yml build pastebin-backend
docker compose -f metabuilder/compose.yml up -d pastebin-backend

# dbal-init volume (schema volume container — rebuild when entity JSON changes)
docker compose -f metabuilder/compose.yml build dbal-init
docker compose -f metabuilder/compose.yml up dbal-init
```

---

## Entity Schema Format (JSON)

All schemas live in `libraries/dbal/shared/api/schema/entities/*.json`.

```json
{
  "name": "MyEntity",
  "tenantId": "pastebin",
  "package": "pastebin",
  "fields": [
    { "name": "id",        "type": "uuid",      "primary": true },
    { "name": "name",      "type": "string",    "required": true },
    { "name": "userId",    "type": "uuid",      "required": true },
    { "name": "tenantId",  "type": "string",    "required": true },
    { "name": "createdAt", "type": "timestamp", "required": true }
  ]
}
```

After schema changes: `python3 libraries/dbal/shared/tools/codegen/gen_types.py`

---

## Seed Data Format (JSON)

All seed files in `libraries/dbal/shared/seeds/database/*.json`. Idempotent — skipped if records exist.

```json
{
  "entity": "MyEntity",
  "records": [
    { "id": "uuid-here", "name": "Example", "tenantId": "pastebin", "createdAt": 0 }
  ],
  "metadata": { "bootstrap": true }
}
```

For multi-document seeds (array of seed objects): wrap in `[...]` at top level.

**User passwords**: Pastebin has no local password store — real login credentials live in DBAL's `Credential` entity (Argon2id, `dbal::security::hash_password`), seeded via `pastebin_credentials.json`. The `User` entity's own `passwordHash` field is vestigial and ignored.

---

## Workflow Step Types

| Type | What it does |
|------|-------------|
| `dbal.uuid` | Generates UUID v4, stores via `outputs` |
| `dbal.timestamp` | Current timestamp (ms), stores via `outputs` |
| `dbal.entity.create` | `client.createEntity(entity, data)` |
| `dbal.entity.get` | `client.getEntity(entity, id)` |
| `dbal.entity.list` | `client.listEntities(entity, options)` |
| `dbal.var.set` | `ctx.set(key, value)` |
| `dbal.log` | `spdlog::info(message)` |

Context variable resolution: `"${var_name}"`, `"${event.userId}"`, `"prefix-${name}-suffix"`

---

## Rules (Non-Negotiable)

1. **Multi-tenant always**: Every DBAL query filters by `tenantId`. No exceptions.
2. **JSON not YAML**: All schemas, events, workflows, seeds — pure JSON. yaml-cpp removed.
3. **Seed data in `dbal/shared/seeds/`** — never hardcode in backend service code.
4. **No hardcoded entity names** — loaded from schema JSON.
5. **Call `ensureClient()` before any DB op in `registerRoutes()`** — `dbal_client_` starts null.
6. **`deployment.py build apps pastebin` ≠ the backend** — that only rebuilds Next.js. The C++/Drogon backend needs `docker compose build pastebin-backend`.

---

## Common Traps

| Trap | Fix |
|------|-----|
| nlohmann/json iterator `it->second` | Use `it.value()` |
| dbal-init volume stale after schema rename | `docker compose build dbal-init && docker compose up dbal-init` |
| `.dockerignore` blocks `dbal/shared/seeds/` | Add `!dbal/shared/seeds/database` |
| Seed segfaults on startup | Missing `ensureClient()` guard |
| Seed runs every restart | `skipIfExists` check broken — verify entity name matches schema |

---

## Pastebin Stack URLs (dev)

| Service | URL | Auth |
|---------|-----|------|
| UI | `http://localhost/pastebin` | JWT cookie |
| Pastebin backend (C++/Drogon) | `http://localhost/pastebin-api/api/*` | Bearer JWT (DBAL-issued; no register/login here — login happens via DBAL) |
| DBAL entities | `http://localhost:8080/{tenant}/{package}/{entity}` | Bearer JWT |
| DBAL health | `http://localhost:8080/health` | — |
