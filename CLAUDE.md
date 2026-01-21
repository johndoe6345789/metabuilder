# MetaBuilder Development Guide for AI Assistants

**Last Updated**: 2026-01-21
**Status**: Phase 2 Complete, Ready for Phase 3
**Overall Health**: 82/100

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Architecture Overview](#architecture-overview)
3. [JSON-First Philosophy](#json-first-philosophy)
4. [Multi-Tenant & Security](#multi-tenant--security)
5. [Code Organization](#code-organization)
6. [What NOT to Do](#what-not-to-do)
7. [Quick Reference](#quick-reference)

---

## Core Principles

### 1. 95% Data, 5% Code

MetaBuilder is **95% configuration/data in JSON, 5% infrastructure code in TypeScript**.

- UI components defined as JSON
- Workflows defined as JSON Script
- Pages/routes defined as JSON
- Business logic in JSON, not TypeScript
- Code only handles rendering and persistence

### 2. Schema-First Development

**YAML schemas are the single source of truth**.

```bash
# 1. Define schema in YAML
# /dbal/shared/api/schema/entities/core/my-entity.yaml

# 2. Generate Prisma from YAML
npm --prefix dbal/development run codegen:prisma

# 3. Push to database
npm --prefix dbal/development run db:push

# 4. Code follows the schema
```

### 3. Multi-Tenant by Default

**Every entity has tenantId - no exceptions.**

```typescript
// ✅ CORRECT: Filter by tenant
const db = getDBALClient()
const records = await db.users.list({
  filter: { tenantId: user.tenantId }
})

// ❌ WRONG: Missing tenant filter (data leak!)
const records = await db.users.list()
```

### 4. Use JSON Script, Not TypeScript for Logic

**Business logic lives in JSON Script v2.2.0, not TypeScript.**

```json
{
  "version": "2.2.0",
  "nodes": [
    {
      "id": "filter",
      "type": "operation",
      "op": "filter",
      "condition": "{{ $json.status === 'active' }}"
    }
  ]
}
```

Why: Non-technical users understand JSON, GUIs can generate it, no compilation needed.

### 5. One Lambda Per File

**Each file = one focused function, period.**

```typescript
// ✅ CORRECT
// src/lib/users/createUser.ts
export async function createUser(data: UserData): Promise<User> { ... }

// src/lib/users/listUsers.ts
export async function listUsers(): Promise<User[]> { ... }

// ❌ WRONG: Multiple functions in one file
// src/lib/users.ts
export function createUser() { ... }
export function listUsers() { ... }
export function deleteUser() { ... }
```

### 6. DBAL > Prisma > Raw SQL

**Use highest abstraction level available.**

```typescript
// ✅ HIGHEST (handles multi-tenant, ACL, caching)
const db = getDBALClient()
const users = await db.users.list()

// ⚠️ MIDDLE (only if DBAL doesn't support)
const prisma = getPrismaClient()
const users = await prisma.user.findMany()

// ❌ LOWEST (never do this)
const query = "SELECT * FROM user"
```

---

## Architecture Overview

### Three-Tier System

```
Frontend (Next.js/CLI/Qt6)
  ↓
DBAL (TypeScript Phase 2, C++ Phase 3)
  ↓
Database (SQLite dev, PostgreSQL prod)
```

### Routing Pattern

```
/api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]

GET  /api/v1/acme/forum_forge/posts          → List
POST /api/v1/acme/forum_forge/posts          → Create
GET  /api/v1/acme/forum_forge/posts/123      → Get
PUT  /api/v1/acme/forum_forge/posts/123      → Update
DELETE /api/v1/acme/forum_forge/posts/123    → Delete
POST /api/v1/acme/forum_forge/posts/123/like → Custom action
```

---

## JSON-First Philosophy

### UI Components as JSON

```json
{
  "id": "comp_hero",
  "name": "Hero Section",
  "render": {
    "type": "Container",
    "props": { "variant": "primary" },
    "children": [
      {
        "type": "Heading",
        "props": { "text": "Welcome" }
      }
    ]
  }
}
```

### Pages as JSON

```json
{
  "id": "page_home",
  "path": "/",
  "title": "Home",
  "tenantId": "acme",
  "component": "home_page",
  "isPublished": true
}
```

### Workflows as JSON Script

```json
{
  "version": "2.2.0",
  "nodes": [
    {
      "id": "step1",
      "type": "operation",
      "op": "transform_data",
      "input": "{{ $json }}",
      "output": "{{ $utils.flatten($json) }}"
    }
  ]
}
```

**No hardcoded TypeScript UI logic!** Everything is JSON that GUIs can generate.

---

## Multi-Tenant & Security

### Rate Limiting (Always Apply)

```typescript
import { applyRateLimit } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  // Apply rate limit
  const limitResponse = applyRateLimit(request, 'mutation')
  if (limitResponse) return limitResponse
  
  // Rest of handler
}
```

**Rate limits:**
- Login: 5 attempts/minute
- Register: 3 attempts/minute
- List: 100 requests/minute
- Mutations: 50 requests/minute
- Bootstrap: 1 attempt/hour

### Multi-Tenant Filtering (Always Apply)

```typescript
// ✅ CORRECT
const filter = tenantId !== undefined ? { tenantId } : {}
const records = await adapter.list(entity, { filter })

// ❌ WRONG: Data leak!
const records = await adapter.list(entity)
```

**Rule**: Every database query filters by tenantId. No exceptions.

---

## Code Organization

### Directory Structure

```
/dbal/
  /development/src/
    /core/client/      # DBAL implementation
    /adapters/         # Prisma adapter
    /seeds/            # Seed logic
  /shared/api/schema/  # YAML schemas (source of truth)

/frontends/nextjs/
  /src/lib/
    /middleware/       # Express-style middleware
    /routing/          # API routing helpers
    /db-client.ts      # DBAL singleton
  /app/api/
    /v1/[...slug]/     # RESTful API

/packages/
  /{packageId}/
    /page-config/      # Routes
    /workflow/         # Workflows
    /component/        # Components
    /seed/             # Seed metadata
```

### What Goes Where

| Item | Location | Format |
|------|----------|--------|
| Entity definitions | `/dbal/shared/api/schema/entities/` | YAML |
| API routes | `/frontends/nextjs/src/app/api/` | TypeScript |
| UI definitions | `/packages/{pkg}/component/` | JSON |
| Workflows | `/packages/{pkg}/workflow/` | JSON Script |
| Pages/routes | `/packages/{pkg}/page-config/` | JSON |

---

## What NOT to Do

### ❌ Don't Use Prisma Directly

```typescript
// ❌ WRONG
import { prisma } from '@/lib/config/prisma'
const users = await prisma.user.findMany()

// ✅ CORRECT
const db = getDBALClient()
const users = await db.users.list()
```

### ❌ Don't Hardcode Configuration

```typescript
// ❌ WRONG: Hardcoded routes
const routes = [
  { path: '/', component: 'home' },
  { path: '/about', component: 'about' }
]

// ✅ CORRECT: In database/JSON
// /packages/my_package/page-config/routes.json
```

### ❌ Don't Skip tenantId Filtering

```typescript
// ❌ WRONG: Data leak!
const users = await db.users.list()

// ✅ CORRECT
const users = await db.users.list({
  filter: { tenantId }
})
```

### ❌ Don't Put Multiple Functions in One File

```typescript
// ❌ WRONG
// src/lib/users.ts
export function create() { ... }
export function list() { ... }
export function delete() { ... }

// ✅ CORRECT
// src/lib/users/create.ts
export function createUser() { ... }

// src/lib/users/list.ts
export function listUsers() { ... }

// src/lib/users/delete.ts
export function deleteUser() { ... }
```

### ❌ Don't Use TypeScript for Business Logic

```typescript
// ❌ WRONG: TypeScript workflow logic
export function processOrder(order) {
  if (order.status === 'pending') {
    // Complex TypeScript logic
  }
}

// ✅ CORRECT: JSON Script
{
  "nodes": [
    {
      "op": "filter",
      "condition": "{{ $json.status === 'pending' }}"
    }
  ]
}
```

### ❌ Don't Forget Rate Limiting on APIs

```typescript
// ❌ WRONG: Missing rate limit
export async function POST(request: NextRequest) {
  // No protection!
}

// ✅ CORRECT
export async function POST(request: NextRequest) {
  const limitResponse = applyRateLimit(request, 'mutation')
  if (limitResponse) return limitResponse
}
```

### ❌ Don't Ignore YAML Schemas

```typescript
// ❌ WRONG: Schema in code
interface User {
  id: string
  name: string
}

// ✅ CORRECT: YAML source of truth
// /dbal/shared/api/schema/entities/core/user.yaml
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run typecheck          # Check TypeScript
npm run build              # Build production
npm run test:e2e           # Run tests

# Database
npm --prefix dbal/development run codegen:prisma    # YAML → Prisma
npm --prefix dbal/development run db:push           # Apply schema

# Documentation
http://localhost:3000/api/docs     # API docs
```

### Key Files

- **Rate Limiting**: `frontends/nextjs/src/lib/middleware/rate-limit.ts`
- **DBAL Client**: `frontends/nextjs/src/lib/db-client.ts`
- **API Routes**: `frontends/nextjs/src/app/api/v1/[...slug]/route.ts`
- **YAML Schemas**: `dbal/shared/api/schema/entities/`

### Documentation

- **This file**: CLAUDE.md (principles)
- **Rate Limiting**: `/docs/RATE_LIMITING_GUIDE.md`
- **Multi-Tenant**: `/docs/MULTI_TENANT_AUDIT.md`
- **API Reference**: `/docs/API_DOCUMENTATION_GUIDE.md`
- **Strategic Guide**: `/STRATEGIC_POLISH_GUIDE.md`

---

## Development Workflow

### Starting New Feature

1. Read `/AGENTS.md` for domain rules
2. Update YAML schema if needed
3. Generate Prisma from schema
4. Write TypeScript code
5. Test with multiple tenants
6. Apply rate limiting if API endpoint

### Before Committing

- [ ] TypeScript compiles (npm run typecheck)
- [ ] Tests pass (99%+)
- [ ] Build succeeds (npm run build)
- [ ] One function per file
- [ ] Multi-tenant filtering applied
- [ ] Rate limiting on sensitive endpoints
- [ ] Documentation updated

---

**Status**: Production Ready (Phase 2 Complete)
**Next**: Phase 3 - JSON-based Admin Tools

