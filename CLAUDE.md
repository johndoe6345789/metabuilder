# MetaBuilder Project Instructions for AI Assistants

## ⚠️ CRITICAL: Start Here for Development Work

**YOUR WORKFLOW**: Follow `.github/prompts/workflow/0-kickstart.md` - this is your complete development roadmap

**IF YOU GET STUCK**: See `.github/prompts/misc/EEK-STUCK.md` - recovery guide for common problems

**READ THESE FIRST** (in order):

### Step 1: Onboarding (First Time)
1. **.github/prompts/workflow/0-kickstart.md** - Complete workflow guide, common commands, architecture guardrails
   - References nested `AGENTS.md` files (e.g., `AGENTS.md`) for scoped rules
   - References `.github/prompts/LAMBDA_PROMPT.md` - **one lambda/function per file pattern**
   - If stuck: See `.github/prompts/misc/EEK-STUCK.md`

### Step 2: Architecture & Core Concepts
2. **README.md** - System overview, deployment, routing, packages, permissions
3. **ARCHITECTURE.md** - Proper MetaBuilder foundation and data flow
4. **.github/copilot-instructions.md** - AI development instructions, critical patterns, code conventions
5. **.github/TEMPLATES.md** - PR/issue template guidelines, MetaBuilder-specific conventions

### Step 3: Scoped Rules for Your Area
6. **AGENTS.md** (READ FIRST - for all agents) - Quick reference for core principles, DBAL, frontend, packages, testing, deployment, troubleshooting
7. Check for other nested scoped rules in subdirectories you're editing (e.g., `dbal/development/docs/AGENTS.md`, `frontends/nextjs/AGENTS.md`)

### Step 4: Development Workflow (Follow in Order)
8. **.github/prompts/workflow/1-plan-feature.md** - Feature planning
9. **.github/prompts/workflow/2-design-component.md** - Component design
10. **.github/prompts/implement/** - Implementation prompts:
    - `3-impl-database.prompt.md` - Database/DBAL changes
    - `3-impl-dbal-entity.prompt.md` - New DBAL entities
    - `3-impl-component.prompt.md` - React components
    - `3-impl-feature.prompt.md` - Feature implementation
    - `3-impl-package.prompt.md` - Package creation
    - `3-impl-migration.prompt.md` - Database migrations
11. **.github/prompts/test/** - Testing guidance:
    - `4-test-write.prompt.md` - Test writing patterns
    - `4-test-run.prompt.md` - Running tests locally and in CI
12. **.github/prompts/workflow/5-review-code.md** - Code review checklist
13. **.github/prompts/deploy/** - Deployment procedures:
    - `6-deploy-ci-local.prompt.md` - Local CI testing with `act`
    - `6-deploy-production.prompt.md` - Production deployment
14. **.github/prompts/maintain/** - Maintenance tasks:
    - `7-maintain-debug.prompt.md` - Debugging problems
    - `7-maintain-refactor.prompt.md` - Refactoring guidance
    - `7-maintain-security.prompt.md` - Security fixes
    - `7-maintain-performance.prompt.md` - Performance optimization
15. **.github/prompts/workflow/8-docs-feature.prompt.md** - Documentation
16. **.github/prompts/misc/LAMBDA_PROMPT.md** - Code organization pattern

### Reference Documentation
17. **DBAL_REFACTOR_PLAN.md** - Implementation roadmap
18. **ROADMAP.md** - Project vision and evolution (Spark → Next.js)
19. **TESTING.md** - E2E testing guide
20. **schemas/package-schemas/** - System definitions (18 files)

**Current Status**: Phase 2 (TypeScript DBAL + SQLite dev) - Phase 3 (C++ daemon) is future

**Production Stack**: PostgreSQL + C++ DBAL daemon + Media daemon + Redis + Nginx + Monitoring

---

## 🎯 Core MetaBuilder Concepts

### The Mental Model

```
Browser URL → Database Query → JSON Component → Generic Renderer → React → User
```

**Zero hardcoded connections**. Everything is a database lookup:

```typescript
// ❌ Traditional (hardcoded)
import HomePage from './HomePage'
<Route path="/" component={HomePage} />

// ✅ MetaBuilder (data-driven)
const route = await db.query('PageConfig', { path: '/' })
const component = await loadPackage(route.packageId)
return renderJSONComponent(component)
```

### Key Principles

1. **95% Data-Driven Architecture** - MetaBuilder is 95% JSON/JSON Script, not TypeScript:
   - UI components defined as JSON (not hardcoded TSX)
   - Business logic in JSON Script (custom JSON-based language, not TypeScript)
   - Configuration in YAML/JSON (not code)
   - TypeScript is **only** infrastructure, adapters, and frameworks
   - When choosing between TS code and JSON config → choose JSON

2. **One Lambda Per File** - Code organization pattern:
   - Each function is in its own file (lambda = one focused function)
   - Use classes only as containers for related functions
   - See `.github/prompts/misc/LAMBDA_PROMPT.md`

3. **No Hardcoded Routes** - Routes live in `PageConfig` database table
4. **No Component Imports** - Components are JSON definitions in packages
5. **No Direct Database Access** - Everything goes through DBAL
6. **Complete Loose Coupling** - Frontend knows nothing about packages
7. **Multi-Tenant First** - Always filter by `tenantId` in every query

### Available Packages

| Package | Purpose | Permission Level |
|---------|---------|------------------|
| `ui_home` | Landing page | Public (0) |
| `ui_header` | App header/navbar | Public (0) |
| `ui_footer` | App footer | Public (0) |
| `dashboard` | User dashboard | User (1) |
| `user_manager` | User management | Admin (3) |
| `package_manager` | Install packages | God (4) |
| `database_manager` | Database admin | Supergod (5) |
| `schema_editor` | Schema editor | Supergod (5) |

### Permission System (6 Levels)

| Level | Role | Use Cases |
|-------|------|-----------|
| 0 | Public | Landing page, login |
| 1 | User | Personal dashboard, profile |
| 2 | Moderator | Content moderation |
| 3 | Admin | User management, settings |
| 4 | God | Package installation, workflows |
| 5 | Supergod | Full system control, schema editor |

**Each level inherits permissions from levels below.**

---

## 💡 Code Organization: One Lambda Per File

MetaBuilder follows a specific code organization pattern to keep files small and focused:

```typescript
// ✅ CORRECT: One function/lambda per file
// filename: src/lib/users/createUser.ts
export async function createUser(username: string, email: string): Promise<User> {
  // Single responsibility
}

// filename: src/lib/users/listUsers.ts
export async function listUsers(limit: number): Promise<User[]> {
  // Single responsibility
}

// filename: src/lib/users/UserManager.ts
// Use classes only as containers for related functions
export class UserManager {
  static async create = createUser
  static async list = listUsers
}

// ❌ WRONG: Multiple functions in one file
// filename: src/lib/users.ts
export function createUser() { ... }
export function listUsers() { ... }
export function deleteUser() { ... }
export function updateUser() { ... }
```

**Why**: This keeps files small, makes testing easier, and aligns with the lambda pattern where each file is effectively a single callable unit.

**Reference**: See `.github/prompts/misc/LAMBDA_PROMPT.md` for detailed guidance.

---

## 🏗️ Complete Architecture Overview

MetaBuilder is structured in **phases**, with a **three-layer DBAL system**:

### Production Deployment Stack

```
┌────────────────────────────────────────────────────────────┐
│                    Browser                                  │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼─────────────────────────────────────────┐
│                   Nginx (Reverse Proxy)                       │
│              - SSL/TLS termination                            │
│              - Caching (Redis)                                │
│              - Load balancing                                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
   ┌─────────────────┼─────────────────┬────────────────────┐
   │                 │                 │                    │
   ▼                 ▼                 ▼                    ▼
┌────────┐    ┌────────────┐    ┌──────────┐    ┌──────────────┐
│Next.js │    │ Media      │    │ DBAL     │    │ Monitoring   │
│Frontend│    │ Daemon     │    │ Daemon   │    │ Stack        │
│(Node)  │    │ (C++)      │    │ (C++)    │    │              │
└────┬───┘    │ FFmpeg,    │    │ Security │    │ Prometheus   │
     │        │ ImageMgk   │    │ Sandbox  │    │ Grafana      │
     │        └─────┬──────┘    └────┬─────┘    │ Loki         │
     │              │                 │         └──────────────┘
     └──────────────┼─────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    ┌─────────────┐    ┌───────────────┐
    │ PostgreSQL  │    │ Redis Cache   │
    │ (Database)  │    │ (Memory Store)│
    └─────────────┘    └───────────────┘
```

### Architecture Phases

```
┌─────────────────────────────────────────────────────────┐
│ Phase 2: Hybrid Mode (CURRENT)                          │
├─────────────────────────────────────────────────────────┤
│ - TypeScript DBAL in /dbal/development/                 │
│ - Runs in Next.js process (dev) or docker (prod)        │
│ - Prisma adapter for SQLite (dev) or PostgreSQL (prod)  │
│ - ACL layer for security                                │
│ - Media daemon for FFmpeg processing                    │
│ - Redis for caching                                     │
│ - Nginx for reverse proxy & SSL                         │
│ - Monitoring stack optional                             │
└─────────────────────────────────────────────────────────┘
                            ↓
                        (Future)
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 3: Daemon Mode (FUTURE)                           │
├─────────────────────────────────────────────────────────┤
│ - C++ DBAL daemon at /dbal/production/                  │
│ - WebSocket RPC protocol                                │
│ - Credential isolation in separate process              │
│ - Full security hardening & sandboxing                  │
│ - Comprehensive audit logging                           │
│ - Multiple database adapters                            │
└─────────────────────────────────────────────────────────┘
```

### Bootstrap Process (7 Phases)

When system starts, `deployment/scripts/bootstrap-system.sh` runs:

1. **Wait for Database** - Ensure PostgreSQL/SQLite is ready
2. **Run Migrations** - Apply Prisma schema changes
3. **Check Bootstrap Status** - Idempotent (safe to rerun)
4. **Seed Database** - Load from `/seed/database/*.yaml`
5. **Install Core Packages** - 12 packages in priority order:
   - Phase 1: `package_manager` (required first)
   - Phase 2: Headers, footers, auth UI, login
   - Phase 3: Dashboard
   - Phase 4: User & role managers
   - Phase 5: Admin tools
6. **Verify Installation** - Health checks
7. **Run Post-Hooks** - Custom initialization

See `seed/packages/core-packages.yaml` for full order.

### Data Flow: Seed → Packages → DBAL → Frontend

```
┌─────────────────────┐
│ /seed/ folder       │  ← Seed data (YAML format)
│ Packages seed data  │  ← Package-specific definitions
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ DBAL (Current:      │  ← Single source of truth for database
│ TypeScript)         │    /dbal/development/
│ Future: C++         │    /dbal/production/
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Next.js Frontend    │  ← Uses DBALClient for all database access
│ /frontends/nextjs   │
└─────────────────────┘
```

### Proper Data Flow (Detailed)

1. **Root DBAL Seed Data** (`/dbal/shared/seeds/database/` - MINIMAL)
   - `installed_packages.yaml` - List of 12 core packages to install at bootstrap
   - `package_permissions.yaml` - System-wide permissions and roles
   - That's it. Nothing else belongs here.
   - Loaded during `POST /api/bootstrap` via `seedDatabase()`

2. **Package Entity Seed Data** (`/packages/[packageId]/[entity-type]/` - EVERYTHING)
   - One folder per entity type: `page-config/`, `workflow/`, `credential/`, `notification/`, `component/`
   - `metadata.json` - Describes entity folder (entity type, packageId, description)
   - `*.json` - Actual seed data (e.g., `home.json`, `dashboard.json` in page-config/)
   - Simple JSON arrays, validated by `/schemas/seed-data/` JSON schemas
   - Loaded automatically for packages listed in `installed_packages.yaml`
   - Each package self-contained with all its seed data
   - Examples: ui_home/page-config/, dashboard/page-config/, user_manager/workflow/

3. **DBAL** (Phase 2: TypeScript, Phase 3: C++)
   - **OWNS:** Database schema definitions (YAML source of truth in `/dbal/shared/api/schema/entities/`)
   - **OWNS:** Prisma schema (auto-generated from YAML)
   - **OWNS:** Seed orchestration (reads `installed_packages.yaml`, loads package entity folders)
   - **OWNS:** Client factories, adapters, entity operations
   - **OWNS:** Root seed data only (`/dbal/shared/seeds/database/` - package list + permissions)
   - **EXPORTS:** `getDBALClient()`, `seedDatabase()`, etc.
   - **PROVIDES:** Type-safe entity operations
   - **DOES NOT DEFINE:** Entity seed data (belongs in packages)

4. **Frontend** (`/frontends/nextjs/`)
   - Uses DBALClient from DBAL
   - Example: `db.users.list()`, `db.pageConfigs.findOne()`
   - NEVER touches Prisma, adapters, or schema directly
   - NEVER defines seed data (that's in /seed/)

---

## 🗂️ Project Structure Overview

```
/
├── dbal/
│   ├── development/              [Phase 2: TypeScript DBAL]
│   │   ├── src/
│   │   │   ├── core/client/      [DBALClient factory & implementation]
│   │   │   ├── runtime/          [Prisma client factory]
│   │   │   ├── seeds/            [Seed orchestration]
│   │   │   └── adapters/         [Database adapters]
│   │   ├── prisma/               [Prisma schema location]
│   │   └── package.json
│   │
│   ├── production/               [Phase 3: C++ DBAL (Future)]
│   │   ├── include/dbal/         [C++ headers]
│   │   ├── src/                  [C++ implementation]
│   │   ├── tests/                [C++ tests]
│   │   └── docs/
│   │
│   └── shared/                   [Shared across all implementations]
│       ├── api/
│       │   └── schema/            [YAML entity schemas - SOURCE OF TRUTH]
│       │       ├── entities/      [Database entity definitions]
│       │       ├── operations/    [Operation definitions]
│       │       └── capabilities/  [Capability definitions]
│       ├── docs/                 [Implementation guides]
│       ├── tools/                [Schema generation tools]
│       └── backends/             [Database connection utilities]
│
├── schemas/                       [All schemas - validation + definitions]
│   ├── seed-data/                [JSON seed validation schemas]
│   │   ├── page-config.schema.json
│   │   ├── workflow.schema.json
│   │   ├── credential.schema.json
│   │   ├── notification.schema.json
│   │   ├── component.schema.json
│   │   └── README.md
│   ├── package-schemas/          [Package system definitions]
│   │   ├── metadata_schema.json
│   │   ├── entities_schema.json
│   │   ├── components_schema.json
│   │   └── ... (14+ more schemas)
│   └── SEED_SCHEMAS.md           [Two-layer schema explanation]
│
├── packages/                     [Modular packages - ALL ENTITY DATA]
│   ├── [packageId]/
│   │   ├── page-config/          [Routes/pages]
│   │   │   ├── metadata.json
│   │   │   └── *.json
│   │   ├── workflow/             [Workflows]
│   │   │   ├── metadata.json
│   │   │   └── *.json
│   │   ├── credential/           [API credentials]
│   │   │   ├── metadata.json
│   │   │   └── *.json
│   │   ├── notification/         [Notifications]
│   │   │   ├── metadata.json
│   │   │   └── *.json
│   │   ├── component/            [Components]
│   │   │   ├── metadata.json
│   │   │   └── *.json
│   │   └── package.json
│   ├── PACKAGE_STRUCTURE.md      [Package organization guide]
│   └── SEED_FORMAT.md            [Seed format specification]
│
├── dbal/shared/seeds/            [Root DBAL seed - MINIMAL]
│   └── database/
│       ├── installed_packages.yaml    [12 core packages to install]
│       └── package_permissions.yaml   [System permissions]
│
└── frontends/
    └── nextjs/                   [Next.js frontend]
        └── src/
            └── lib/
                └── db-client.ts  [Integration point for DBAL]
```

---

## 📋 DBAL Usage (Phase 2 - Current)

**See `/AGENTS.md` for comprehensive development guidance** including:
- Core principles (95% config rule, schema-first, one lambda per file, multi-tenant safety, ACL-first)
- DBAL development (API contract model, Phase 2 vs Phase 3, file organization, code generation)
- Frontend development (Next.js patterns, DBAL integration)
- Package development (JSON-based UI, metadata structure)
- Testing strategy (Unit, Integration, E2E)
- Deployment guidelines
- Troubleshooting

### Getting a DBAL Client

```typescript
// CORRECT: Use factory from DBAL
import { getDBALClient } from '@/dbal'

const db = getDBALClient()
const users = await db.users.list()
```

### Factory Functions Available (Phase 2)

```typescript
// From @/dbal (TypeScript DBAL in /dbal/development/src/)
export { getDBALClient, useDBAL }              // Main client factories
export { getPrismaClient, createPrismaClient } // Prisma access (if needed)
export { seedDatabase }                        // Seed orchestration
```

### Entity Operations

DBALClient provides type-safe entity operations (types generated from YAML schemas):

```typescript
const db = getDBALClient()

// Users
db.users.list({ limit: 10 })
db.users.findOne({ id })
db.users.create({ username, email, role })
db.users.update(id, { ... })

// Pages (from PageConfig table, defined in YAML schema)
db.pageConfigs.list({ filter: { path: '/' } })
db.pageConfigs.findOne({ path: '/' })
db.pageConfigs.create({ path, title, component })

// Other entities
db.sessions.list()
db.components.list()
db.workflows.list()
db.packages.list()

// All operations are validated against:
// - YAML schema at /dbal/shared/api/schema/entities/
// - ACL rules for current user
// - Prisma adapter safety checks
```

---

## ⚠️ Common Mistakes (All Phases)

### Mistake 1: Using Prisma Directly
```typescript
// ❌ WRONG
import { prisma } from '@/lib/config/prisma'
const users = await prisma.user.findMany()

// ✅ CORRECT
import { getDBALClient } from '@/dbal'
const db = getDBALClient()
const users = await db.users.list()
```

### Mistake 2: Using Old Frontend Adapter
```typescript
// ❌ WRONG (Phase 2 cleanup task)
import { getAdapter } from '@/lib/dbal-client/adapter/get-adapter'
const adapter = getAdapter()
await adapter.list('User', { ... })

// ✅ CORRECT
import { getDBALClient } from '@/dbal'
const db = getDBALClient()
await db.users.list()
```

### Mistake 3: Defining Seed Data in Code
```typescript
// ❌ WRONG - seed data should not be in TypeScript files
const seedData = [
  { username: 'admin', email: 'admin@localhost' },
  { username: 'demo', email: 'demo@localhost' },
]
for (const user of seedData) {
  await db.users.create(user)
}

// ✅ CORRECT - seed data lives in /packages/*/seed/ as JSON files
// File: /packages/my-package/seed/metadata.json
{
  "packageId": "my_package",
  "seed": { "schema": "page-config.json" }
}

// File: /packages/my-package/seed/page-config.json
[
  { "id": "page_1", "path": "/my-route", "title": "My Route", ... }
]

// System loads via: await seedDatabase(db) from DBAL
// Which reads installed_packages.yaml and each package's seed/metadata.json
```

### Mistake 4: Putting Non-Seed Code in Seed Folders (CRITICAL)

**Seed folders contain ONLY data files.** No TypeScript, scripts, or orchestration code.

```
❌ WRONG:
/dbal/shared/seeds/
├── database/
│   └── installed_packages.yaml
└── load-and-apply.ts        ← DON'T PUT THIS HERE!

✅ CORRECT:
/dbal/shared/seeds/
└── database/
    └── installed_packages.yaml

/dbal/development/src/seeds/index.ts    ← Orchestration lives HERE
```

**For package seeds:**
```
❌ WRONG:
/packages/my-package/seed/
├── page-config.json
└── loader.ts               ← DON'T PUT THIS HERE!

✅ CORRECT:
/packages/my-package/seed/
└── page-config.json        ← ONLY data files
```

Orchestration functions (like `seedDatabase()`) belong in DBAL source code, not in seed folders. Seed folders are **mundane data only**.

### Mistake 5: Editing Prisma Schema Directly
```typescript
// ❌ WRONG - Prisma schema is auto-generated
// Don't edit /prisma/schema.prisma directly
// Don't edit /dbal/development/prisma/schema.prisma

// ✅ CORRECT - Edit YAML schemas instead
// 1. Edit: /dbal/shared/api/schema/entities/core/[entity-name].yaml
// 2. Generate Prisma: npm --prefix dbal/development run codegen:prisma
// 3. Push to DB: npm --prefix dbal/development run db:push
```

### Mistake 6: Ignoring C++ Production Code
```typescript
// ❌ WRONG - Don't assume only TypeScript matters
// C++ DBAL in /dbal/production/ is for Phase 3
// Don't modify it without understanding DBAL architecture

// ✅ CORRECT - Understand the phases
// Phase 2 (NOW): Use TypeScript DBAL in /dbal/development/
// Phase 3 (FUTURE): Separate C++ daemon in /dbal/production/
// Both conform to YAML schemas in /dbal/shared/api/schema/
```

### Mistake 6: Forgetting Database Schema Must Be Generated
```typescript
// ❌ PROBLEM: Tables don't exist, tests fail
// Cause: Prisma schema was never generated from YAML

// ✅ SOLUTION
// 1. Generate Prisma from YAML: npm --prefix dbal/development run codegen:prisma
// 2. Push schema: npm --prefix dbal/development run db:push
// 3. Verify tables exist in database
```

### Mistake 7: Putting Kitchen Sink in Seed Folders

**Seed folders are ONLY for mundane data files.** One folder per entity type. Nothing else.

**Pattern:**
```
✅ CORRECT - Simple and clean:
/packages/my-package/seed/
├── metadata.json          ← Package manifest (required)
├── page-config.json       ← Page routes (if needed)
├── workflow.json          ← Workflows (if needed)
└── credential.json        ← Credentials (if needed)

❌ WRONG - Don't add anything else:
/packages/my-package/seed/
├── metadata.json
├── schema.json           ← NO: Use DBAL schemas instead
├── examples.json         ← NO: Kitchen sink
├── README.md             ← NO: Docs go in /packages/SEED_FORMAT.md
├── loader.ts             ← NO: Code goes in /dbal/development/src/seeds/
└── utils/                ← NO: Utilities go in DBAL source code
```

Each package's seed folder follows this simple structure:
- `metadata.json` - Always required. Points to data files and describes the package
- Entity data files (e.g., `page-config.json`) - Only if the package needs to seed that entity
- Nothing else. No documentation, no code, no schemas

See `/packages/SEED_FORMAT.md` for complete seed data specification.

### Mistake 8: Using TypeScript Instead of JSON/JSON Script (95% Rule Violation)
```typescript
// ❌ WRONG - Hardcoding UI in TypeScript
function MyPage() {
  return (
    <div>
      <h1>Welcome</h1>
      <button onClick={() => alert('Hello')}>Click Me</button>
      {/* All hardcoded, can't customize from admin panel */}
    </div>
  )
}

// ✅ CORRECT - Define in JSON, render generically
// File: packages/my_package/seed/metadata.json
{
  "packageId": "my_package",
  "pages": [{
    "id": "welcome_page",
    "path": "/welcome",
    "component": "DeclaredComponent",
    "config": {
      "title": "Welcome",
      "button": { "label": "Click Me", "action": "run_script", "scriptId": "hello_script" }
    }
  }]
}

// Script defined in JSON Script format (see /schemas/package-schemas/script_schema.json)
// Then use RenderComponent or generic renderer to display
// Now admins can customize without code changes
```

**The 95% Rule**:
- 5% TypeScript = Infrastructure, adapters, frameworks only
- 95% JSON/JSON Script = UI definitions, business logic, configuration
- Ask yourself: "Can this be JSON or JSON Script?" → If yes, do it as JSON/JSON Script, not TS
- **Planned Migration**: Eventually moving to n8n-style JSON, but custom JSON Script for now

See `.github/TEMPLATES.md` under "Data-Driven Architecture" for full guidance.
See `/schemas/package-schemas/script_schema.json` for JSON Script specification (v2.2.0).

---

## 📁 Key Files & Locations

### ⚠️ Scoped Rules (AGENTS.md Files)

**CRITICAL**: Before editing any major subsystem, check for scoped `AGENTS.md` files with specific rules:

| Location | Purpose | Mandatory? |
|----------|---------|-----------|
| `AGENTS.md` (root) | **START HERE** - All agents. Core principles, DBAL, frontend, packages, testing, deployment | **YES** for all work |
| `dbal/development/docs/AGENTS.md` | TypeScript DBAL-specific rules (if exists) | If editing TypeScript DBAL |
| `dbal/shared/docs/AGENTS.md` | YAML schema rules (if exists) | If editing YAML schemas |
| `dbal/production/docs/AGENTS.md` | C++ DBAL rules (if exists) | If editing C++ daemon |
| `packages/[package-name]/AGENTS.md` | Package-specific rules (if exists) | If editing package |
| `frontends/nextjs/AGENTS.md` | Frontend-specific rules (if exists) | If editing Next.js |

**Pattern**:
1. Find the directory you're editing
2. Search for `AGENTS.md` in that directory or its parents
3. These scoped rules **override** general guidance in CLAUDE.md
4. If you find an `AGENTS.md`, read it completely before starting work

### TypeScript DBAL (Phase 2 - Current)

| File | Purpose |
|------|---------|
| `/dbal/development/src/core/client/factory.ts` | `getDBALClient()`, `useDBAL()` factories |
| `/dbal/development/src/runtime/prisma-client.ts` | `getPrismaClient()` factory |
| `/dbal/development/src/seeds/index.ts` | `seedDatabase()` orchestration |
| `/dbal/development/src/adapters/` | Database adapter implementations |
| `/dbal/development/package.json` | TypeScript DBAL configuration |

### DBAL YAML Schemas (Source of Truth)

| Directory | Purpose |
|-----------|---------|
| `/dbal/shared/api/schema/entities/core/` | Core entities (User, Session, Workflow, etc.) |
| `/dbal/shared/api/schema/entities/access/` | Access control (Credential, PageConfig, etc.) |
| `/dbal/shared/api/schema/entities/packages/` | Package-specific entities |
| `/dbal/shared/api/schema/operations/` | Operation definitions |
| `/dbal/shared/api/schema/capabilities.yaml` | Capability declarations |

### C++ DBAL (Phase 3 - Future Reference)

| File | Purpose |
|------|---------|
| `/dbal/production/include/dbal/` | C++ header files |
| `/dbal/production/src/` | C++ implementation |
| `/dbal/production/tests/` | C++ tests |
| `/dbal/production/docs/PHASE3_DAEMON.md` | Phase 3 design |

### Generated Artifacts (Auto-Generated - Do Not Edit)

| File | Purpose |
|------|---------|
| `/prisma/schema.prisma` | Generated Prisma schema (from YAML) |
| `/dbal/development/dist/` | Compiled TypeScript DBAL |

### Seed Data

| File | Purpose |
|------|---------|
| `/seed/database/installed_packages.yaml` | Base seed data (YAML) |
| `/seed/database/package_permissions.yaml` | Permission seed data (YAML) |
| `/packages/*/seed/metadata.json` | Package-specific seed data (JSON) |

### Component System (Fakemui Integration - Complete & Production-Ready)

| File | Purpose |
|------|---------|
| `/frontends/nextjs/src/lib/fakemui-registry.ts` | 151+ component registry (type-safe lookup) |
| `/frontends/nextjs/src/lib/packages/json/render-json-component.tsx` | JSON component renderer (uses fakemui) |
| `/packages/*/component/` | Package component seed data (entity folder) |
| `/packages/*/component/metadata.json` | Component entity metadata |
| `/packages/*/component/*.json` | Component definitions (JSON declarative) |
| `/schemas/package-schemas/component.schema.json` | Component definition validation schema |
| `/fakemui/` | Material-UI inspired component library |
| `/fakemui/COMPONENT_MAPPING.md` | Inventory of 151+ components |

### Application Layers

| File | Purpose |
|------|---------|
| `/ARCHITECTURE.md` | Complete architecture blueprint |
| `/DBAL_REFACTOR_PLAN.md` | Refactoring phases and steps |
| `/TESTING.md` | E2E testing guide |
| `/schemas/package-schemas/` | Package system definitions |
| `/AGENTS.md` | **DBAL-specific guidance for AI agents** (contract-based dev, Phase 2/3, conformance testing) |
| `/dbal/shared/docs/` | DBAL implementation guides (PHASE2_IMPLEMENTATION.md, PHASE3_DAEMON.md, etc.) |

---

## 🚀 Development Tasks

### Task 1: Add a New API Endpoint
```typescript
// Use DBAL, not Prisma
import { getDBALClient } from '@/dbal'

export async function GET(request: Request) {
  const db = getDBALClient()
  const users = await db.users.list()
  return Response.json(users)
}
```

### Task 2: Add Seed Data to a Package

Each package organizes seed data by entity type in subfolders:

```
/packages/my-package/
├── page-config/           [If package defines routes]
│   ├── metadata.json
│   └── home.json
├── workflow/              [If package defines workflows]
│   ├── metadata.json
│   └── sync.json
└── package.json
```

**Step 1: Create entity folder**
```bash
mkdir -p /packages/my-package/page-config
```

**Step 2: Create metadata.json**
```json
{
  "entity": "page-config",
  "packageId": "my_package",
  "description": "Page routes for my_package",
  "version": "1.0.0"
}
```

**Step 3: Create data files**
```json
// /packages/my-package/page-config/home.json
[
  {
    "id": "page_my_pkg_home",
    "path": "/my-package",
    "title": "My Package",
    "component": "my_component",
    "level": 0,
    "requiresAuth": false,
    "isPublished": true
  }
]
```

**Step 4: Package must be listed in bootstrap**
Add to `/dbal/shared/seeds/database/installed_packages.yaml` if it's a core system package.

See `/packages/PACKAGE_STRUCTURE.md` for complete package organization guide.

### Task 3: Initialize Database for Tests
```typescript
// In Playwright global setup:
import { seedDatabase } from '@/dbal'
import { getDBALClient } from '@/dbal'

const db = getDBALClient()
await seedDatabase(db)
```

### Task 4: Modify Database Schema
1. Edit YAML schema: `/dbal/shared/api/schema/entities/core/[entity-name].yaml`
2. Generate Prisma schema: `npm --prefix dbal/development run codegen:prisma`
3. Push to database: `npm --prefix dbal/development run db:push`
4. Verify: Check `/prisma/prisma/dev.db` and `/prisma/schema.prisma` updated

### Task 5: Create Declarative JSON Components

Add components to packages using fakemui (151+ Material Design components):

```bash
# 1. Create component folder
mkdir -p packages/my_package/component

# 2. Create metadata.json
cat > packages/my_package/component/metadata.json << 'EOF'
{
  "entityType": "component",
  "description": "My components",
  "components": [{ "id": "comp_my_button", "name": "My Button" }]
}
EOF

# 3. Create components.json with JSON definitions
cat > packages/my_package/component/components.json << 'EOF'
[
  {
    "id": "comp_my_button",
    "name": "My Button",
    "category": "form",
    "template": {
      "type": "Button",
      "props": { "variant": "{{variant}}" },
      "children": "{{label}}"
    },
    "props": { "label": "Click Me", "variant": "primary" }
  }
]
EOF

# 4. Use in page definitions or bootstrap
```

**Components available**: 151+ fakemui Material Design components (Button, TextField, Card, Grid, etc.)

**Learn more**:
- `docs/README_COMPONENTS.md` - Start here for component system
- `docs/FAKEMUI_QUICK_REFERENCE.md` - Quick lookup
- `docs/FAKEMUI_INTEGRATION.md` - Complete guide
- `docs/COMPONENT_MIGRATION_GUIDE.md` - Real-world examples

### Task 6: Bootstrap the System

After setting up seed data, call the bootstrap endpoint to load it:

```bash
# Bootstrap API endpoint
POST /api/bootstrap

# Response (success):
{
  "success": true,
  "message": "Database seeded successfully",
  "packagesInstalled": 12,
  "recordsCreated": 45
}

# Response (error):
{
  "success": false,
  "error": "Failed to create PageConfig: Duplicate path '/'"
}
```

**When to bootstrap:**
- First deployment (initial system setup)
- After adding new packages to `installed_packages.yaml`
- After modifying seed data
- Safe to call multiple times (idempotent - skips existing records)

**See also:**
- `/frontends/nextjs/src/app/api/bootstrap/route.ts` - Bootstrap endpoint implementation
- `/packages/SEED_FORMAT.md` - Seed data format specification
- `/packages/PACKAGE_AUDIT.md` - Analysis of all 51 packages

---

## 🧪 Testing

E2E tests use Playwright with automatic database initialization:

```bash
# 1. Generate Prisma schema from YAML
npm --prefix dbal/development run codegen:prisma

# 2. Create database schema
npm --prefix dbal/development run db:push

# 3. Run tests (global.setup.ts calls seedDatabase)
npm run test:e2e
```

**Key files:**
- `playwright.config.ts` - Configures webServer and global setup
- `e2e/global.setup.ts` - Runs before tests, calls /api/setup to seed
- `e2e/*.spec.ts` - Test files

---

## 📚 Schema Layers

### 1. Package System Schemas (`/schemas/package-schemas/`)
Defines the complete MetaBuilder **package architecture**:
- `metadata_schema.json` - Package structure
- `entities_schema.json` - Database models from packages perspective
- `types_schema.json` - Type system
- `validation_schema.json` - Validation rules
- Plus 14 more schemas defining components, API, events, jobs, etc.

**For architectural and package design questions**, check `/schemas` first.

### 2. DBAL YAML Schemas (`/dbal/shared/api/schema/entities/`)
Defines the actual **database structure** (source of truth for both Phase 2 & 3):
- `/dbal/shared/api/schema/entities/core/*.yaml` - Core entities (User, Session, Workflow, etc.)
- `/dbal/shared/api/schema/entities/access/*.yaml` - Access control entities (Credential, PageConfig, etc.)
- `/dbal/shared/api/schema/entities/packages/*.yaml` - Package-specific entities
- Both **TypeScript (Phase 2)** and **C++ (Phase 3)** implementations conform to these schemas

**For database schema changes**, edit YAML files here, then regenerate Prisma schema.

---

## ⚠️ DO NOTs for All Assistants

### Database Code
- ❌ Don't use `prisma` client directly (use DBALClient instead)
- ❌ Don't use old `getAdapter()` from frontend (Phase 2 cleanup task)
- ❌ Don't edit `/prisma/schema.prisma` directly (it's auto-generated)
- ❌ Don't manually edit Prisma schema - edit YAML schemas instead
- ❌ Don't hardcode seed data in TypeScript (use /seed/ folder)
- ❌ Don't assume database tables exist (run db:push first)

### Architecture
- ❌ Don't bypass DBAL for database access
- ❌ Don't move logic from DBAL back to frontend
- ❌ Don't define seed data anywhere except `/seed/` or `/packages/*/seed/`
- ❌ Don't ignore errors about missing tables (run schema generation + db:push)

### Code Organization
- ❌ Don't create multiple DBAL implementations (TypeScript is Phase 2, C++ is Phase 3)
- ❌ Don't modify C++ code unless specifically asked (Phase 3 is future work)
- ❌ Don't ignore YAML schemas - they are the source of truth

### Refactoring
- ❌ Don't stop midway through a refactoring phase
- ❌ Don't commit code that mixes old and new patterns
- ❌ Don't assume Phase 2 or Phase 3 are complete (check status)

---

## ✅ DO This Instead

- ✅ **Read `/AGENTS.md` FIRST** - comprehensive agent guide for all MetaBuilder work
- ✅ Follow core principles: 95% config, schema-first, one lambda per file, multi-tenant safe, ACL-first
- ✅ Use DBAL for all database access: `getDBALClient()` from `@/dbal`
- ✅ Edit YAML schemas at `/dbal/shared/api/schema/entities/` for database changes
- ✅ Generate Prisma from YAML: `npm --prefix dbal/development run codegen:prisma`
- ✅ Run `npm --prefix dbal/development run db:push` to apply schema changes
- ✅ Put seed data in `/seed/` folder or `/packages/*/seed/metadata.json`
- ✅ Put UI config in package `seed/metadata.json` (JSON-based, not hardcoded TSX)
- ✅ Check `/AGENTS.md` for quick guidance on any subsystem
- ✅ Check `/ARCHITECTURE.md` for system architecture
- ✅ Check `/CLAUDE.md` for detailed project instructions
- ✅ Check `/dbal/shared/docs/` for DBAL implementation details

---

## 🔍 Implementation Phases

### Phase 2: Hybrid Mode (CURRENT) ✅
**Status**: Active - TypeScript DBAL in Next.js process

What exists:
- [x] TypeScript DBAL client with Prisma adapter
- [x] ACL security layer
- [x] Seed orchestration
- [x] YAML schema definitions
- [x] DBALClient factory functions
- [x] Integration with Next.js frontend

Current refactoring work:
- [ ] Phase 2 Cleanup: Move database logic from Next.js to DBAL
  - [ ] Delete `/frontends/nextjs/src/lib/dbal-client/` (duplicate code)
  - [ ] Delete `/frontends/nextjs/src/lib/database-dbal/`
  - [ ] Create single `/frontends/nextjs/src/lib/db-client.ts` integration
  - [ ] Refactor all operations to use new DBALClient

See `DBAL_REFACTOR_PLAN.md` for detailed Phase 2 cleanup steps.

### Phase 3: Daemon Mode (FUTURE) ⏳
**Status**: Design complete, implementation deferred

What is planned:
- [ ] C++ daemon at `/dbal/production/`
- [ ] WebSocket RPC protocol between frontend and daemon
- [ ] Credential isolation and sandboxing
- [ ] Security hardening
- [ ] Audit logging
- [ ] Multiple database adapters

See `/dbal/production/docs/PHASE3_DAEMON.md` for Phase 3 design.

---

## 🆘 If Something Breaks

### Error: "The table `X` does not exist"
```bash
# Solution: Generate Prisma schema from YAML, then push
npm --prefix dbal/development run codegen:prisma
npm --prefix dbal/development run db:push
```

### Error: "Cannot find module '@/dbal'"
```bash
# Solution: Verify DBAL exports exist
cat dbal/development/src/index.ts | grep getDBALClient
```

### Error: "Seed data not created"
```bash
# Solution: Verify /seed/ folder exists and has YAML files
ls -la seed/database/
```

### Error: "Prisma schema doesn't match database"
```bash
# Solution: Regenerate from YAML and push
npm --prefix dbal/development run codegen:prisma
npm --prefix dbal/development run db:push
```

### Tests fail with database errors
```bash
# Solution: Generate schema from YAML, push to DB, then run tests
npm --prefix dbal/development run codegen:prisma
npm --prefix dbal/development run db:push
npm run test:e2e
```

---

## 🚀 Deployment & Quick Start

### One-Command Deployment

```bash
# Full production stack (PostgreSQL, DBAL, Next.js, Media daemon, Redis, Nginx, Monitoring)
./deployment/deploy.sh all --bootstrap

# Individual stacks
./deployment/deploy.sh production      # Main services only
./deployment/deploy.sh development     # Dev environment
./deployment/deploy.sh monitoring      # Prometheus, Grafana, Loki
```

**What gets deployed**:
- PostgreSQL 16 (database)
- C++ DBAL daemon (from Phase 3, auto-starts WebSocket server)
- Next.js app (Node 18)
- C++ Media daemon (FFmpeg, ImageMagick)
- Redis 7 (caching)
- Nginx (reverse proxy, SSL/TLS, caching)
- Prometheus, Grafana, Loki (optional monitoring)

### Development Setup

```bash
# Clone and install
git clone <repo>
cd metabuilder

# Option 1: From root (recommended)
npm install
npm run db:generate
npm run db:push

# Option 2: From Next.js directory
cd frontends/nextjs
npm install
npm run db:generate
npm run db:push

# Bootstrap seed data
cd ../../deployment/scripts
./bootstrap-system.sh

# Start development
cd ../../
npm run dev  # or cd frontends/nextjs && npm run dev
```

### Docker Deployment

```bash
# Pull images from GHCR
docker login ghcr.io -u USERNAME --password-stdin

# Using docker-compose with GHCR images
docker compose -f docker-compose.ghcr.yml up -d

# With monitoring stack
docker compose -f docker-compose.ghcr.yml --profile monitoring up -d

# View logs
docker compose -f docker-compose.ghcr.yml logs -f
```

**GHCR Images Available:**
- `ghcr.io/johndoe6345789/metabuilder/nextjs-app` - Next.js frontend
- `ghcr.io/johndoe6345789/metabuilder/dbal-daemon` - C++ DBAL daemon

### Development Workflow (Multiple Terminals)

**Terminal 1: Frontend**
```bash
cd frontends/nextjs
npm run dev  # Starts at http://localhost:3000
```

**Terminal 2: DBAL (optional - TypeScript version)**
```bash
cd dbal/development
npm install
npm run dev
```

**Terminal 3: C++ Daemons (if building locally)**
```bash
cd dbal/production
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
./build/bin/dbal-daemon
```

---

## 📖 Further Reading

### System Overview & Deployment
1. **README.md** - Complete system architecture, routing, packages, deployment
2. **ROADMAP.md** - Project vision, history (Spark → Next.js evolution), and current status
3. **docs/CONTAINER_IMAGES.md** - Docker images and GHCR deployment
4. **deployment/deploy.sh** - Deployment automation script
5. **deployment/scripts/bootstrap-system.sh** - System bootstrap process

### Architecture & Refactoring
6. **ARCHITECTURE.md** - MetaBuilder foundation and data flow
7. **DBAL_REFACTOR_PLAN.md** - Phase 2 cleanup implementation steps
8. **TESTING.md** - E2E testing guide

### Testing & Quality
9. **docs/TESTING_GUIDE.md** - TDD methodology, testing pyramid, best practices
10. **docs/TODO_MVP_IMPLEMENTATION.md** - MVP feature checklist
11. **docs/PIPELINE_CONSOLIDATION.md** - CI/CD pipeline configuration

### Project Guidance
12. **AGENTS.md** - ⭐ **READ FIRST** - All agents. Core principles, DBAL development, frontend, packages, testing, deployment, troubleshooting, best practices
13. **TECH_DEBT.md** - ⭐ **For AI Assistants** - Bot-actionable tech debt tasks (TD-1 through TD-13) with explicit step-by-step instructions

### DBAL Documentation & Refactoring
14. **DBAL_REFACTOR_PLAN.md** - Detailed implementation plan (reference for TD-1)
15. **dbal/shared/docs/IMPLEMENTATION_SUMMARY.md** - Phase 2 overview
16. **dbal/shared/docs/PHASE2_IMPLEMENTATION.md** - Phase 2 detailed guide
17. **dbal/production/docs/PHASE3_DAEMON.md** - Phase 3 design (future)

### Seed System Architecture (Complete & Production-Ready)
18. **schemas/SEED_SCHEMAS.md** - ⭐ Two-layer schema system (YAML + JSON validation)
19. **dbal/shared/seeds/README.md** - Root DBAL seed architecture (minimal bootstrap only)
20. **packages/PACKAGE_STRUCTURE.md** - ⭐ Package organization (entity-type folders)
21. **packages/SEED_FORMAT.md** - Seed data file format and best practices
22. **packages/PACKAGE_AUDIT.md** - Audit of all 51 packages (12 core, 39 optional)
23. **schemas/seed-data/README.md** - JSON schema usage and integration
24. **schemas/seed-data/** - JSON validation schemas:
    - `page-config.schema.json` - Route/page definitions
    - `workflow.schema.json` - Automation workflows
    - `credential.schema.json` - API credentials
    - `notification.schema.json` - Notification templates
    - `component.schema.json` - Reusable components

### Core Entity Definitions
25. **dbal/shared/api/schema/entities/** - YAML entity schemas (source of truth for both phases)
26. **dbal/shared/seeds/database/installed_packages.yaml** - List of 12 core packages
27. **dbal/shared/seeds/database/package_permissions.yaml** - System permissions

### Component System & Fakemui Integration (Complete & Production-Ready)
28. **docs/README_COMPONENTS.md** - ⭐ **START HERE** - Central hub for component system with learning paths
29. **docs/FAKEMUI_QUICK_REFERENCE.md** - Quick lookup for components, expressions, patterns
30. **docs/FAKEMUI_INTEGRATION.md** - Complete integration guide (2,000+ lines)
    - 151+ available components
    - Creating JSON components
    - Template syntax and examples
    - Best practices
31. **docs/COMPONENT_SYSTEM_ARCHITECTURE.md** - System architecture (7 layers)
    - Data flow from seed to browser
    - Component categories explained
    - Integration and extension points
32. **docs/COMPONENT_MIGRATION_GUIDE.md** - Migration examples (5 detailed migrations)
    - Quick start for new components
    - Common patterns
    - Troubleshooting
33. **docs/FAKEMUI_INTEGRATION_SUMMARY.md** - Project completion summary
    - What was accomplished
    - Metrics and statistics
    - Implementation status
34. **fakemui/COMPONENT_MAPPING.md** - Inventory of 151+ components
35. **frontends/nextjs/src/lib/fakemui-registry.ts** - Component registry (type-safe, 151+ components)
36. **packages/ui_home/component/** - Example components (5 examples showing all patterns)

### Package System & Schemas
37. **schemas/SCHEMAS_README.md** - Package system overview
38. **schemas/QUICKSTART.md** - Package system quick start
39. **schemas/package-schemas/** - Package definition schemas:
    - `script_schema.json` - JSON Script language (v2.2.0, planned n8n migration)
    - `metadata_schema.json` - Package structure
    - `entities_schema.json` - Database models
    - Plus 15 more schemas for components, APIs, validation, permissions, etc.
