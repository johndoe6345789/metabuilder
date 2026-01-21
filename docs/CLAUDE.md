# MetaBuilder Development Guide for AI Assistants

**Last Updated**: 2026-01-21
**Status**: Phase 2 Complete, Monorepo Consolidated
**Overall Health**: 82/100
**Vision**: Universal Platform - One cohesive system for code, 3D, graphics, media, and system administration
**Structure**: Monorepo containing MetaBuilder core + 11 standalone projects

---

## Table of Contents

1. [Universal Platform Vision](#universal-platform-vision)
2. [Before Starting Any Task](#before-starting-any-task)
3. [Core Principles](#core-principles)
4. [Architecture Overview](#architecture-overview)
5. [JSON-First Philosophy](#json-first-philosophy)
6. [Multi-Tenant & Security](#multi-tenant--security)
7. [Code Organization](#code-organization)
8. [What NOT to Do](#what-not-to-do)
9. [Quick Reference](#quick-reference)

---

## Universal Platform Vision

MetaBuilder is evolving into a **Universal Platform** - a userland operating environment that provides everything through a unified data model and consistent interface.

### The Premise

Modern computing is fragmented. Users need dozens of apps, each with its own paradigms, file formats, and learning curves. MetaBuilder provides **one cohesive system** for code editing, 3D modeling, game development, graphics work, system administration, and media production.

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTENDS                                       │
├─────────────────┬─────────────────────┬─────────────────────────────────────┤
│   CLI Frontend  │   Qt6 Frontend      │   Web Frontend (Next.js)            │
│   (Commander)   │   (Native Desktop)  │   (Browser/Electron/Tauri)          │
└────────┬────────┴──────────┬──────────┴──────────────────┬──────────────────┘
         │                   │                              │
         └───────────────────┼──────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  FRONTEND BUS   │
                    │  (WebSocket/IPC)│
                    └────────┬────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────────┐
│                           METABUILDER CORE                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ State Machine│ │ Command Bus  │ │ Event Stream │ │ Entity Graph │        │
│  │ (XState-like)│ │ (CQRS)       │ │ (Pub/Sub)    │ │ (DBAL)       │        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Undo/Redo    │ │ Job Scheduler│ │ Plugin Host  │ │ VFS Layer    │        │
│  │ (Event Src)  │ │ (DAG Engine) │ │ (Registry)   │ │ (Abstraction)│        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                        CAPABILITY MODULES                                    │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────┤
│   CODE      │   GRAPHICS  │    3D       │   MEDIA     │   SYSTEM            │
│   ────      │   ────────  │    ──       │   ─────     │   ──────            │
│ • Editor    │ • Raster    │ • Modeling  │ • Audio     │ • Files             │
│ • LSP Host  │ • Vector    │ • Sculpting │ • Video     │ • Processes         │
│ • Debugger  │ • Compositor│ • Animation │ • Streaming │ • Network           │
│ • Builder   │ • Filters   │ • Physics   │ • Recording │ • Hardware          │
│ • VCS       │ • AI Gen    │ • Rendering │ • Encoding  │ • Containers        │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────────────┤
│   GAME      │   DATA      │   DOCS      │   COMMS     │   AI                │
│   ────      │   ────      │   ────      │   ─────     │   ──                │
│ • Engine    │ • Database  │ • Writer    │ • Chat      │ • Local LLM         │
│ • Physics   │ • Sheets    │ • Slides    │ • Email     │ • Image Gen         │
│ • Audio     │ • Graphs    │ • Diagrams  │ • Calendar  │ • Code Assist       │
│ • Assets    │ • ETL       │ • PDF       │ • Tasks     │ • Agents            │
│ • Scripting │ • Analytics │ • Publishing│ • Contacts  │ • Embeddings        │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                         RUNTIME LAYER                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │ Native     │ │ WASM       │ │ Workflow   │ │ GPU        │                │
│  │ (C++/TS)   │ │ (Portable) │ │ (JSON DAG) │ │ (Compute)  │                │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mapping to Current Implementation

| Architecture Layer | Current Component | Location |
|-------------------|-------------------|----------|
| Entity Graph | DBAL | `dbal/` |
| Job Scheduler | DAG Executor | `workflow/executor/ts/executor/` |
| Plugin Host | Node Executor Registry | `workflow/executor/ts/registry/` |
| Workflow Runtime | Python/TS Plugins | `workflow/plugins/` |
| Web Frontend | Next.js App | `frontends/nextjs/` |

### Core Subsystems (To Build)

| Subsystem | Purpose | Status |
|-----------|---------|--------|
| State Machine | Central state management (XState-like) | Planned |
| Command Bus | CQRS command/query separation | Planned |
| Event Stream | Pub/sub for cross-module communication | Planned |
| VFS Layer | Virtual filesystem abstraction | Planned |
| Frontend Bus | WebSocket/IPC for frontend sync | Planned |

### Capability Categories

- **Code**: Editor, LSP, debugger, builder, VCS
- **Graphics**: Raster, vector, compositor, filters, AI generation
- **3D**: Modeling, sculpting, animation, physics, rendering
- **Media**: Audio, video, streaming, recording, encoding
- **System**: Files, processes, network, hardware, containers
- **Game**: Engine, physics, audio, assets, scripting
- **Data**: Database, sheets, graphs, ETL, analytics
- **Docs**: Writer, slides, diagrams, PDF, publishing
- **Comms**: Chat, email, calendar, tasks, contacts
- **AI**: Local LLM, image generation, code assist, agents, embeddings

**Full architecture details**: See [docs/UNIVERSAL_PLATFORM_ARCHITECTURE.md](./docs/UNIVERSAL_PLATFORM_ARCHITECTURE.md)

---

## Before Starting Any Task

**MANDATORY: Perform exploration BEFORE any implementation work.** Do NOT skip this step or go shallow.

### Exploration is NOT Optional
- Many task failures occur because exploration was skipped or done superficially
- Shallow exploration (reading only 1-2 files) misses critical context and conventions
- Proper exploration prevents rework, security issues, and architectural mistakes
- Use the **Explore agent** for codebase questions - it goes deep systematically

### For EVERY Task - Follow This Sequence

#### 1. Understand the Task Domain
- Read `/CLAUDE.md` (this file) - core principles and patterns
- Read `/AGENTS.md` - domain-specific rules for your task type
- Read `/README.md` - project overview
- Check recent git commits: What was done recently in this area?

#### 2. Map the Relevant Codebase (Use Explore Agent)
The exploration depth depends on task type:

**For Feature/Package Work:**
- [ ] Examine `/packages/{packageId}/` structure - all directories and files
- [ ] Review similar existing packages for patterns
- [ ] Check `/schemas/package-schemas/` for validation rules
- [ ] Look at `/dbal/shared/api/schema/entities/` if new entities needed

**For API/Backend Work:**
- [ ] Review `/frontends/nextjs/src/app/api/v1/[...slug]/route.ts` - main router
- [ ] Check `/frontends/nextjs/src/lib/middleware/` - rate limiting, auth, multi-tenant
- [ ] Examine `/dbal/development/src/adapters/` - database patterns
- [ ] Check `/dbal/shared/api/schema/operations/` - operation specifications
- [ ] Review rate limiting setup in `/docs/RATE_LIMITING_GUIDE.md`

**For Frontend/UI Work:**
- [ ] Review target `/packages/{packageId}/component/` structure
- [ ] Check `/frontends/nextjs/src/lib/` for rendering and utilities
- [ ] Examine similar UI packages for component patterns
- [ ] Understand the JSON→React rendering flow

**For Database/Schema Work:**
- [ ] Review all 27 YAML entity definitions in `/dbal/shared/api/schema/entities/`
- [ ] Check `/schemas/package-schemas/` for JSON validation schemas
- [ ] Understand the two-layer schema system (YAML source → Prisma → JSON validation)
- [ ] Review `/docs/MULTI_TENANT_AUDIT.md` for tenant filtering patterns

**For Testing Work:**
- [ ] Check `/playwright.config.ts` and `/e2e/` structure
- [ ] Review test patterns in `/packages/{packageId}/playwright/` and `tests/`
- [ ] Understand schema validation in `/schemas/package-schemas/tests/`
- [ ] Check how tests handle multi-tenancy

#### 3. Identify Patterns & Conventions
- Look at 2-3 similar completed implementations
- Identify: naming conventions, directory structure, file organization, code patterns
- Check what's in `/schemas/` and `/dbal/` for your task area
- Note any TODOs or FIXMEs related to your task

#### 4. Check for Existing Work/Documentation
- Search for related documentation files
- Check git log for similar work: `git log --grep="keyword"`
- Look for ADRs (Architecture Decision Records) or implementation guides
- Note if there are Phase reports or migration docs relevant to your task

#### 5. Identify Blockers & Dependencies
- Check `/TECH_DEBT.md` and `/SYSTEM_HEALTH_ASSESSMENT.md` for known issues
- Verify dependencies are installed and buildable
- Check if related packages/modules already exist
- Understand what's needed before you can start

### What "Going 1 Level Deep" Really Means

**Insufficient Exploration (❌ Don't Do This):**
```
- Only reading CLAUDE.md
- Checking 1 file and starting to code
- Skipping package structure inspection
- Missing schema validation files
- Not checking existing patterns
```

**Proper Exploration (✅ Do This):**
```
# For package work:
✓ Read package.json file structure
✓ Examine component/ directory and sample files
✓ Check page-config/ for routing patterns
✓ Review workflow/ for existing JSON Script patterns
✓ Look at tests/ and playwright/ for test patterns
✓ Compare with 2-3 similar packages
✓ Check /schemas/package-schemas/ for validation rules

# For API work:
✓ Review main router ([...slug]/route.ts)
✓ Check middleware implementations
✓ Examine 2-3 similar API endpoints
✓ Review rate limiting patterns
✓ Understand multi-tenant filtering
✓ Check DBAL client usage patterns

# For schema work:
✓ Review all 27 YAML entities (/dbal/shared/api/schema/entities/)
✓ Check JSON validation schemas (/schemas/package-schemas/)
✓ Understand entity operations specifications
✓ Review existing entity implementations
✓ Check how tenantId is used everywhere
```

### When to Use the Explore Agent

Use the **Explore agent** for:
- Understanding codebase structure and patterns
- Finding where code lives (searching across files)
- Mapping dependencies and integrations
- Answering "How does X work?" questions
- Identifying similar existing implementations
- Understanding architecture layers

**Do NOT** use Explore for:
- Simple file reads (use Read tool directly)
- Known file paths (use Read/Glob/Grep)
- Trivial searches (use Glob for patterns)

### Common Exploration Mistakes (And How to Fix Them)

| Mistake | Impact | Fix |
|---------|--------|-----|
| Not reading `/CLAUDE.md` principles first | Violates 95/5 rule, multi-tenant issues | Always start with Core Principles section |
| Skipping schema review | Missing validation requirements, data structure issues | Review `/schemas/package-schemas/` before coding |
| Not checking existing patterns | Inconsistent code, duplicate work | Examine 2-3 similar implementations |
| Ignoring multi-tenant requirements | Data leaks, security issues | Read Multi-Tenant section, check all DB queries have tenantId filter |
| Missing rate limiting | API abuse risk | Review `/docs/RATE_LIMITING_GUIDE.md` for new endpoints |
| Not understanding JSON-first philosophy | TypeScript bloat, wrong patterns | Review JSON-First Philosophy section |
| Assuming you know the structure | Wrong file locations, wasted effort | Use Explore agent to map the actual structure |

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

**Two-layer schema system - YAML entities + JSON validation schemas**.

**Layer 1: Core Database Schemas (YAML)**
- Source of truth for database structure
- Location: `/dbal/shared/api/schema/entities/` (27 files)
- 5 core system entities (User, Session, Workflow, Package, UIPage)
- 3 access control entities (Credential, ComponentNode, PageConfig)
- 6 package-specific entities (Forum, Notification, AuditLog, Media, IRC, Streaming)
- 4 domain-specific entities (Product, Game, Artist, Video)

**Layer 2: JSON Validation Schemas (JSON Schema)**
- Location: `/schemas/package-schemas/` (27 files)
- Validates package files: metadata, entities, types, scripts, components, API, events, etc.
- Reference: [SCHEMAS_COMPREHENSIVE.md](./SCHEMAS_COMPREHENSIVE.md)

**Development Workflow**:
```bash
# 1. Define entity schema in YAML
# /dbal/shared/api/schema/entities/core/my-entity.yaml

# 2. Generate Prisma from YAML
npm --prefix dbal/development run codegen:prisma

# 3. Push to database
npm --prefix dbal/development run db:push

# 4. Create package files with proper schemas
# Use schemas/package-schemas/*.json for validation

# 5. Code follows the schema
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

## Repository Structure (Quick Reference)

**Monorepo Directory Tree:**
```
metabuilder/
├── cadquerywrapper/      # CadQuery 3D CAD wrapper (Python)
├── caproverforge/        # CapRover mobile client (Android/Kotlin)
├── codegen/              # Code generation tools
├── config/               # Lint, test, misc configs
├── dbal/                 # Database Abstraction Layer
│   ├── development/      # DBAL TypeScript implementation
│   ├── production/       # Production build
│   └── shared/api/schema/# YAML entities (SOURCE OF TRUTH)
├── deployment/           # Docker & infrastructure
├── dockerterminal/       # Docker Swarm management (Next.js)
├── docs/                 # Documentation (organized)
│   ├── analysis/         # Status reports, assessments
│   ├── architecture/     # System design docs
│   ├── guides/           # Quick references, how-tos
│   ├── implementation/   # Implementation details
│   ├── packages/         # Package-specific docs
│   ├── phases/           # Phase completion reports
│   ├── testing/          # E2E and test docs
│   └── workflow/         # Workflow engine docs
├── e2e/                  # End-to-end Playwright tests
├── fakemui/              # Material UI clone (React/QML)
├── frontends/            # Multiple frontends
│   ├── cli/              # Command-line interface
│   ├── nextjs/           # Primary web UI
│   └── qt6/              # Desktop application
├── gameengine/           # SDL3 C++ game engine
├── mojo/                 # Mojo examples (systems programming)
│   └── examples/         # Official Modular examples
├── packagerepo/          # Package repository service
├── packages/             # 62+ feature packages
├── pastebin/             # Snippet pastebin (Next.js)
├── pcbgenerator/         # PCB design library (Python)
├── postgres/             # PostgreSQL utilities
├── repoforge/            # GitHub Android client (Kotlin)
├── schemas/              # JSON validation schemas
├── scripts/              # Build and migration scripts
├── services/             # Background services
├── smtprelay/            # SMTP relay (Python/Twisted)
├── sparkos/              # Minimal Linux distro + Qt6 app
├── storybook/            # Component stories
├── workflow/             # Workflow engine
│   ├── executor/         # Multi-language executors
│   │   ├── ts/           # TypeScript core engine
│   │   ├── python/       # Python executor
│   │   └── cpp/          # C++ executor (planned)
│   ├── examples/         # Workflow examples
│   └── plugins/          # Workflow plugins
└── [root files]          # CLAUDE.md, README.md, etc.
```

**Standalone Projects in Monorepo:**
| Project | Purpose | Tech Stack |
|---------|---------|------------|
| `cadquerywrapper/` | Parametric 3D CAD modeling | Python, CadQuery |
| `caproverforge/` | CapRover PaaS mobile client | Android, Kotlin |
| `dockerterminal/` | Docker Swarm management | Next.js, TypeScript |
| `fakemui/` | Material UI clone (React + QML) | React, QML, TypeScript |
| `gameengine/` | 2D/3D game engine | C++, SDL3 |
| `mojo/` | Systems programming examples | Mojo (Python superset) |
| `pastebin/` | Code snippet sharing | Next.js, TypeScript |
| `pcbgenerator/` | PCB design automation | Python |
| `repoforge/` | GitHub client for Android | Kotlin, Compose |
| `smtprelay/` | Email relay server | Python, Twisted |
| `sparkos/` | Minimal Linux + Qt6 app | C++, Qt6, Linux |

**Critical Root Files:**
- `CLAUDE.md` - THIS FILE (in docs/)
- `AGENTS.md` - Domain-specific rules (in docs/)
- `README.md` - Project overview (in docs/)
- `package.json` - Workspace configuration
- `playwright.config.ts` - E2E test config

**Understanding the Structure:**
- **Schemas drive development**: YAML entities → Prisma schema → JSON validation → Code
- **Packages are modular**: Each package is self-contained with its own structure
- **Multi-layer architecture**: Database layer (DBAL) → API (Next.js) → Frontend (React/CLI/Qt6)
- **Everything multi-tenant**: Every entity has `tenantId` - mandatory filtering
- **Standalone projects**: Integrated into monorepo but maintain independence

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
    /entities/         # 27 entity definitions
    /operations/       # 7 operation specs

/frontends/nextjs/
  /src/lib/
    /middleware/       # Express-style middleware
    /routing/          # API routing helpers
    /db-client.ts      # DBAL singleton
  /app/api/
    /v1/[...slug]/     # RESTful API

/packages/             # 62 packages total
  /{packageId}/
    /page-config/      # Routes
    /workflow/         # Workflows (JSON Script v2.2.0)
    /component/        # Components
    /permissions/      # Roles & permissions
    /styles/           # Design tokens
    /tests/            # Unit tests
    /playwright/       # E2E tests
    package.json       # Package metadata + file inventory

/schemas/
  /package-schemas/    # 27 JSON schemas for validation
    /{schema}.json     # Metadata, entities, types, scripts, components, etc.
    /examples/         # Reference templates (minimal, complete, advanced)
  README.md            # Schema overview
  SEED_SCHEMAS.md      # Seed data validation guide
  yaml-schema.yaml     # YAML meta-schema
```

### What Goes Where

| Item | Location | Format |
|------|----------|--------|
| Entity definitions | `/dbal/shared/api/schema/entities/` | YAML (27 files) |
| Entity operations | `/dbal/shared/api/schema/operations/` | YAML (7 files) |
| API routes | `/frontends/nextjs/src/app/api/` | TypeScript |
| UI definitions | `/packages/{pkg}/component/` | JSON |
| Workflows | `/packages/{pkg}/workflow/` | JSON Script v2.2.0 |
| Pages/routes | `/packages/{pkg}/page-config/` | JSON |
| Package metadata | `/packages/{pkg}/package.json` | JSON (with file inventory) |
| Schema validation | `/schemas/package-schemas/` | JSON Schema (27 files) |

### Package File Inventory

Each package.json now includes a `files` section documenting all contained files:

```json
{
  "packageId": "my_package",
  "files": {
    "directories": ["components", "page-config", "tests", ...],
    "byType": {
      "components": ["components/ui.json"],
      "pages": ["page-config/page-config.json"],
      "workflows": ["workflow/init.jsonscript"],
      "tests": ["tests/test.json", "playwright/tests.json"],
      "config": ["package.json"],
      "permissions": ["permissions/roles.json"],
      "styles": ["styles/tokens.json"],
      "schemas": ["entities/schema.json"]
    }
  }
}
```

See [PACKAGE_INVENTORY_GUIDE.md](./PACKAGE_INVENTORY_GUIDE.md) for usage examples.

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
- **YAML Schemas**: `dbal/shared/api/schema/entities/` (source of truth)
- **JSON Schemas**: `schemas/package-schemas/` (validation & documentation)

### Documentation

**Core Principles & Development**:
- **This file**: CLAUDE.md (core principles)
- **Rate Limiting**: `/docs/RATE_LIMITING_GUIDE.md`
- **Multi-Tenant**: `/docs/MULTI_TENANT_AUDIT.md`
- **API Reference**: `/docs/API_DOCUMENTATION_GUIDE.md`
- **Strategic Guide**: `/STRATEGIC_POLISH_GUIDE.md`

**Schemas & Package Documentation**:
- **All Schemas**: [SCHEMAS_COMPREHENSIVE.md](./SCHEMAS_COMPREHENSIVE.md) - 27 JSON schemas + 27 YAML entities
- **Quick Start**: `schemas/package-schemas/QUICKSTART.md` - 30-second patterns
- **Schema Reference**: `schemas/package-schemas/SCHEMAS_README.md` - Complete 16 schema overview
- **Package Inventory**: [PACKAGES_INVENTORY.md](./PACKAGES_INVENTORY.md) - All 62 packages with files
- **Package Guide**: [PACKAGE_INVENTORY_GUIDE.md](./PACKAGE_INVENTORY_GUIDE.md) - How to use package.json files section
- **Seed Schemas**: `schemas/SEED_SCHEMAS.md` - Seed data validation & entity types
- **Root Schemas**: `schemas/README.md` - Schema overview & core database structure

---

## Development Workflow

### Phase 1: Explore (MANDATORY - Never Skip)

1. **Read Foundation Docs** (15 min)
   - [ ] `/CLAUDE.md` core principles
   - [ ] `/AGENTS.md` for your domain
   - [ ] `/README.md` project overview

2. **Map the Codebase** (30-45 min)
   - [ ] Use Explore agent to understand structure
   - [ ] Identify where similar work exists
   - [ ] Check relevant schemas and types
   - [ ] Review 2-3 similar implementations

3. **Verify Dependencies** (10 min)
   - [ ] Build passes: `npm run build`
   - [ ] Tests pass: `npm run test`
   - [ ] No blocking issues in `/TECH_DEBT.md`

**Checklist Before Moving to Phase 2:**
- [ ] You can explain the existing pattern for your task type
- [ ] You've found 2-3 examples of similar work
- [ ] You understand the directory structure
- [ ] You know what schemas/types are involved
- [ ] You've identified any blockers or dependencies

### Phase 2: Design (Before Coding)

1. **Schema Design** (if needed)
   - [ ] Update YAML in `/dbal/shared/api/schema/entities/`
   - [ ] Generate Prisma: `npm --prefix dbal/development run codegen:prisma`
   - [ ] Create validation schemas in `/schemas/package-schemas/`

2. **Architecture Design**
   - [ ] Sketch file structure and naming
   - [ ] Identify multi-tenant filtering points
   - [ ] Plan rate limiting strategy
   - [ ] Document any deviations from existing patterns

3. **Get Alignment**
   - [ ] If patterns unclear, ask for clarification
   - [ ] If task scope seems large, break it down
   - [ ] Verify assumptions about dependencies

### Phase 3: Implementation

1. Start Implementation with Code Review Agent proactively
2. Apply multi-tenant filtering to ALL database queries
3. Add rate limiting to sensitive endpoints
4. Follow one-function-per-file pattern
5. Use JSON Script for business logic, not TypeScript

### Before Committing

- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Tests pass (99%+): `npm run test:e2e`
- [ ] Build succeeds: `npm run build`
- [ ] **One function per file** rule followed
- [ ] **Multi-tenant filtering** applied everywhere (tenantId check)
- [ ] **Rate limiting** on sensitive endpoints
- [ ] **No Prisma direct usage** (use DBAL)
- [ ] **Business logic in JSON Script**, not TypeScript
- [ ] Documentation updated
- [ ] Code review completed

---

**Status**: Production Ready (Phase 2 Complete)
**Next**: Universal Platform - Core Infrastructure (State Machine, Command Bus, Event Stream, VFS, Frontend Bus)

