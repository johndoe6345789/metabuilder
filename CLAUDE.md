# MetaBuilder Project Instructions for AI Assistants

## ⚠️ Critical: Read Before Any Database Work

**These documents establish the proper architecture - READ THEM FIRST:**

1. **ARCHITECTURE.md** - Defines the proper MetaBuilder foundation and data flow
2. **DBAL_REFACTOR_PLAN.md** - Implementation roadmap (Phase 2 in progress)
3. **TESTING.md** - E2E testing and database initialization guide
4. **schemas/package-schemas/** - Complete MetaBuilder system definition
5. **dbal/shared/docs/** - DBAL implementation and design documentation

**Current Status**: Phase 2 (TypeScript DBAL) - Phase 3 (C++ daemon) is future work

---

## 🏗️ Complete Architecture Overview

MetaBuilder is structured in **phases**, with a **three-layer DBAL system**:

### Architecture Phases

```
┌─────────────────────────────────────────────────────────┐
│ Phase 2: Hybrid Mode (CURRENT - TypeScript DBAL)        │
├─────────────────────────────────────────────────────────┤
│ - DBAL in TypeScript at /dbal/development/              │
│ - Runs in Next.js process                               │
│ - Prisma adapter for database                           │
│ - ACL layer for security                                │
│ - Production-ready within GitHub Spark constraints      │
└─────────────────────────────────────────────────────────┘
                            ↓
                        (Future)
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 3: Daemon Mode (FUTURE - C++ DBAL)                │
├─────────────────────────────────────────────────────────┤
│ - DBAL as separate C++ process                          │
│ - WebSocket RPC protocol                                │
│ - Credential isolation and security hardening           │
│ - Sandboxed execution                                   │
│ - Audit logging                                         │
│ - Multiple database adapters (PostgreSQL, MySQL, etc.)  │
└─────────────────────────────────────────────────────────┘
```

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

1. **Seed Data** (`/seed/` folder)
   - Contains YAML files defining base bootstrap data
   - `seed/database/installed_packages.yaml` - Package installation records
   - `seed/database/package_permissions.yaml` - Permission rules
   - NOT TypeScript code, NOT hardcoded in Next.js

2. **Packages** (`/packages/*/`)
   - Optional `seed/metadata.json` for package-specific seed data
   - Self-contained UI and logic
   - Reference seed data through metadata

3. **DBAL** (Phase 2: TypeScript, Phase 3: C++)
   - **OWNS:** Database schema (YAML source of truth)
   - **OWNS:** Prisma schema (auto-generated from YAML)
   - **OWNS:** Seed orchestration (loading from /seed/)
   - **OWNS:** Client factories, adapters, entity operations
   - **EXPORTS:** `getDBALClient()`, `seedDatabase()`, etc.
   - **PROVIDES:** Type-safe entity operations

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
├── schemas/                       [Package system schemas]
│   └── package-schemas/          [JSON schema definitions]
│       ├── metadata_schema.json
│       ├── entities_schema.json
│       ├── components_schema.json
│       └── ... (14+ more schemas)
│
├── seed/                         [Base bootstrap data]
│   ├── database/
│   │   ├── installed_packages.yaml
│   │   └── package_permissions.yaml
│   └── config/
│
├── packages/                     [Modular packages]
│   └── */
│       ├── seed/metadata.json    [Package-specific seed data]
│       └── ...
│
└── frontends/
    └── nextjs/                   [Next.js frontend]
        └── src/
            └── lib/
                └── db-client.ts  [Integration point for DBAL]
```

---

## 📋 DBAL Usage (Phase 2 - Current)

### Getting a DBAL Client

```typescript
// CORRECT: Use factory from DBAL
import { getDBALClient } from '@/dbal'

const db = getDBALClient()
const users = await db.users.list()
```

### Factory Functions Available (Phase 2)

```typescript
// From @/dbal (TypeScript DBAL)
export { getDBALClient, useDBAL }              // Main factories
export { getPrismaClient, createPrismaClient } // Prisma access (if needed)
export { seedDatabase }                        // Seed orchestration
```

### Entity Operations

DBALClient provides typed entity operations:

```typescript
const db = getDBALClient()

// Users
db.users.list({ limit: 10 })
db.users.findOne({ id })
db.users.create({ username, email, role })
db.users.update(id, { ... })

// Pages (from PageConfig table)
db.pageConfigs.list({ filter: { path: '/' } })
db.pageConfigs.findOne({ path: '/' })
db.pageConfigs.create({ path, title, component })

// Other entities
db.sessions.list()
db.components.list()
db.workflows.list()
db.packages.list()
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
// ❌ WRONG - seed data should not be in code
const seedData = [
  { username: 'admin', email: 'admin@localhost' },
  { username: 'demo', email: 'demo@localhost' },
]
for (const user of seedData) {
  await db.users.create(user)
}

// ✅ CORRECT - seed data is in /seed/ folder (YAML)
// Frontend calls: await seedDatabase(db)
// DBAL loads from /seed/database/installed_packages.yaml
```

### Mistake 4: Editing Prisma Schema Directly
```typescript
// ❌ WRONG - Prisma schema is auto-generated
// Don't edit /prisma/schema.prisma directly
// Don't edit /dbal/development/prisma/schema.prisma

// ✅ CORRECT - Edit YAML schemas instead
// 1. Edit: /dbal/shared/api/schema/entities/core/[entity-name].yaml
// 2. Generate Prisma: npm --prefix dbal/development run codegen:prisma
// 3. Push to DB: npm --prefix dbal/development run db:push
```

### Mistake 5: Ignoring C++ Production Code
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

---

## 📁 Key Files & Locations

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

### Application Layers

| File | Purpose |
|------|---------|
| `/ARCHITECTURE.md` | Complete architecture blueprint |
| `/DBAL_REFACTOR_PLAN.md` | Refactoring phases and steps |
| `/TESTING.md` | E2E testing guide |
| `/schemas/package-schemas/` | Package system definitions |
| `/dbal/shared/docs/` | DBAL implementation guides |

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

### Task 2: Create New Seed Data
```typescript
// ❌ DON'T create TypeScript seed files
// ✅ DO add to /seed/ folder (YAML format)
// Or add to /packages/my-package/seed/metadata.json (JSON)

// Examples:
// - /seed/database/installed_packages.yaml
// - /packages/ui_home/seed/metadata.json
```

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

- ✅ Read ARCHITECTURE.md before starting database work
- ✅ Use `getDBALClient()` from `@/dbal` for all database access (Phase 2)
- ✅ Put seed data in `/seed/` folder or `/packages/*/seed/metadata.json`
- ✅ Edit YAML schemas at `/dbal/shared/api/schema/entities/` for database changes
- ✅ Generate Prisma from YAML: `npm --prefix dbal/development run codegen:prisma`
- ✅ Run `npm --prefix dbal/development run db:push` to apply schema changes
- ✅ Follow entity operations pattern (db.users.list(), etc.)
- ✅ Check `/schemas/` folder for architectural/package design questions
- ✅ Check `/dbal/shared/api/schema/` folder for database schema questions
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

## 📖 Further Reading

### Architecture & Refactoring
1. **ARCHITECTURE.md** - Complete blueprint and data flow
2. **DBAL_REFACTOR_PLAN.md** - Implementation phases and cleanup steps
3. **TESTING.md** - E2E testing guide

### DBAL Documentation
4. **dbal/shared/docs/IMPLEMENTATION_SUMMARY.md** - Phase 2 overview
5. **dbal/shared/docs/PHASE2_IMPLEMENTATION.md** - Phase 2 detailed guide
6. **dbal/production/docs/PHASE3_DAEMON.md** - Phase 3 future design

### Schema & Package System
7. **schemas/SCHEMAS_README.md** - Package system definitions
8. **schemas/QUICKSTART.md** - Package system quick start
9. **dbal/shared/api/schema/** - YAML schema sources
