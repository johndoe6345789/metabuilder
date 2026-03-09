# MetaBuilder — Agent Guide

**Last Updated**: 2026-03-04
Quick-start for AI agents (Claude Code, Copilot, etc.) working on this codebase.
Read CLAUDE.md for the full guide. This file covers agent-specific patterns and shortcuts.

---

## What's Running

```
http://localhost/pastebin           # Next.js UI
http://localhost/pastebin-api       # Flask auth (register, login, JWT)
http://localhost:8080               # DBAL C++ REST API (entities)
```

**Test accounts**: `demo/demo1234`, `alice/alice1234`, `bob/bob12345`

---

## Architecture in 30 Seconds

```
Browser (Next.js + Redux + IndexedDB)
  └── Flask (JWT auth, Python runner)       frontends/pastebin/backend/
        └── DBAL C++ daemon (REST API)      dbal/production/
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
| `dbal/shared/api/schema/entities/` | JSON entity schemas — SOURCE OF TRUTH (39 entities) |
| `dbal/shared/api/schema/events/event_config.json` | Event → workflow mappings |
| `dbal/shared/api/schema/workflows/` | JSON workflow definitions |
| `dbal/shared/api/schema/auth/auth.json` | JWT + ACL rules |
| `dbal/shared/seeds/database/` | Declarative seed data (JSON, loaded at startup) |
| `dbal/production/src/workflow/` | C++ workflow engine (WfEngine, WfExecutor, steps/) |
| `dbal/production/src/daemon/server_routes.cpp` | Route registration + auto-seed startup |
| `frontends/pastebin/backend/app.py` | Flask JWT auth + Python runner |
| `frontends/pastebin/src/` | Next.js React app |
| `deployment/docker-compose.stack.yml` | Full stack compose |
| `deployment/build-apps.sh` | Build + deploy helper |

---

## Before You Touch Anything

```bash
# Search docs first (SQLite FTS5)
cd docs && python3 docs.py search "topic"
cd txt && python3 reports.py search "topic"

# Check what's already there
ls dbal/shared/api/schema/entities/
ls dbal/shared/seeds/database/

# Logs
docker logs -f metabuilder-dbal
docker logs -f metabuilder-pastebin-backend
```

---

## Deploy Commands

```bash
cd deployment

# Full rebuild + restart
./build-apps.sh --force dbal pastebin
docker compose -f docker-compose.stack.yml up -d

# Flask backend (separate from Next.js)
docker compose -f docker-compose.stack.yml build pastebin-backend
docker compose -f docker-compose.stack.yml up -d pastebin-backend

# dbal-init volume (schema volume container — rebuild when entity JSON changes)
docker compose -f docker-compose.stack.yml build dbal-init
docker compose -f docker-compose.stack.yml up dbal-init
```

---

## Entity Schema Format (JSON)

All schemas live in `dbal/shared/api/schema/entities/*.json`.

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

After schema changes: `python3 dbal/shared/tools/codegen/gen_types.py`

---

## Seed Data Format (JSON)

All seed files in `dbal/shared/seeds/database/*.json`. Idempotent — skipped if records exist.

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

**User passwords**: Generate werkzeug hashes inside the container:
```bash
docker exec metabuilder-pastebin-backend python3 -c \
  "from werkzeug.security import generate_password_hash; print(generate_password_hash('mypassword'))"
```

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
3. **Seed data in `dbal/shared/seeds/`** — never hardcode in Flask Python or C++.
4. **No hardcoded entity names** — loaded from schema JSON.
5. **Call `ensureClient()` before any DB op in `registerRoutes()`** — `dbal_client_` starts null.
6. **`build-apps.sh pastebin` ≠ Flask** — that only rebuilds Next.js. Flask needs `docker compose build pastebin-backend`.

---

## Common Traps

| Trap | Fix |
|------|-----|
| nlohmann/json iterator `it->second` | Use `it.value()` |
| dbal-init volume stale after schema rename | `docker compose build dbal-init && docker compose up dbal-init` |
| `.dockerignore` blocks `dbal/shared/seeds/` | Add `!dbal/shared/seeds/database` |
| Seed segfaults on startup | Missing `ensureClient()` guard |
| Seed runs every restart | `skipIfExists` check broken — verify entity name matches schema |
| Werkzeug scrypt not on host Python | Generate inside running container with `docker exec` |

---

## Pastebin Stack URLs (dev)

| Service | URL | Auth |
|---------|-----|------|
| UI | `http://localhost/pastebin` | JWT cookie |
| Flask auth API | `http://localhost/pastebin-api/api/auth/*` | — |
| DBAL entities | `http://localhost:8080/{tenant}/{package}/{entity}` | Bearer JWT |
| DBAL health | `http://localhost:8080/health` | — |
