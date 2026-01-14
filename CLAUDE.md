# MetaBuilder Project Instructions for AI Assistants

## ⚠️ Critical: Read Before Any Database Work

**These documents establish the proper architecture - READ THEM FIRST:**

1. **ARCHITECTURE.md** - Defines the proper MetaBuilder foundation and data flow
2. **DBAL_REFACTOR_PLAN.md** - Implementation roadmap (Phase 1 partially complete)
3. **TESTING.md** - E2E testing and database initialization guide
4. **schemas/package-schemas/** - The /schemas folder is the SOURCE OF TRUTH for MetaBuilder architecture

**Current Status**: Phase 1 refactoring in progress - DBAL now owns Prisma schema and client factories

---

## 🎯 Architecture Overview

MetaBuilder follows a **data-driven, declarative architecture**:

```
┌─────────────────────┐
│ /seed/ folder       │  ← Seed data (YAML format)
│ Packages seed data  │  ← Package-specific definitions
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ DBAL (Database      │  ← Single source of truth for database
│ Abstraction Layer)  │    /dbal/development/
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Next.js Frontend    │  ← Uses DBALClient for all database access
│ /frontends/nextjs   │
└─────────────────────┘
```

### Proper Data Flow

1. **Seed Data** (`/seed/` folder)
   - Contains YAML files defining base bootstrap data
   - `seed/database/installed_packages.yaml` - Package installation records
   - `seed/database/package_permissions.yaml` - Permission rules
   - NOT TypeScript code, NOT hardcoded in Next.js

2. **Packages** (`/packages/*/`)
   - Optional `seed/metadata.json` for package-specific seed data
   - Self-contained UI and logic
   - Reference seed data through metadata

3. **DBAL** (`/dbal/development/`)
   - **OWNS:** Prisma schema, database adapter, client factories
   - **OWNS:** Seed orchestration (loading from /seed/)
   - **EXPORTS:** `getDBALClient()`, `getPrismaClient()`, `seedDatabase()`
   - **PROVIDES:** Entity operations (users, pageConfigs, components, etc.)

4. **Frontend** (`/frontends/nextjs/`)
   - Uses DBALClient from DBAL
   - Example: `db.users.list()`, `db.pageConfigs.findOne()`
   - NEVER touches Prisma, adapters, or schema
   - NEVER defines seed data (that's in /seed/)

---

## 📋 DBAL Usage (Phase 1 Complete)

### Getting a DBAL Client

```typescript
// CORRECT: Use factory from DBAL
import { getDBALClient } from '@/dbal'

const db = getDBALClient()
const users = await db.users.list()
```

### Factory Functions Available in DBAL

```typescript
// From @/dbal (DBAL subproject)
export { getDBALClient, useDBAL }              // ← Use these
export { getPrismaClient, createPrismaClient } // Available if needed
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

// Pages
db.pageConfigs.list({ filter: { path: '/' } })
db.pageConfigs.findOne({ path: '/' })
db.pageConfigs.create({ path, title, component })

// Other entities
db.sessions.list()
db.components.list()
db.workflows.list()
// ... and more
```

---

## ❌ Common Mistakes to Avoid

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
// ❌ WRONG (being removed in refactoring)
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
// DBAL loads from /seed/database/installed_packages.yaml, etc.
```

### Mistake 4: Trying to Edit Prisma Schema Directly
```typescript
// ❌ WRONG - Prisma schema is auto-generated
// Don't edit /prisma/schema.prisma directly
// Don't edit /dbal/development/prisma/schema.prisma

// ✅ CORRECT - Edit YAML schemas instead
// 1. Edit: /dbal/shared/api/schema/entities/core/[entity].yaml
// 2. Generate Prisma: npm --prefix dbal/development run codegen:prisma
// 3. Push to DB: npm --prefix dbal/development run db:push
```

### Mistake 5: Forgetting Database Schema Exists
```typescript
// ❌ PROBLEM: Tables don't exist, tests fail
// Cause: db:push was never run

// ✅ SOLUTION
// 1. Run: npm --prefix dbal/development run db:push
// 2. Or let playwright global.setup.ts handle it
```

---

## 📁 Key Files & Locations

| File | Purpose |
|------|---------|
| `/dbal/shared/api/schema/entities/` | **YAML schemas** (source of truth for database structure) |
| `/prisma/schema.prisma` | Generated Prisma schema (auto-generated from YAML) |
| `/dbal/development/src/core/client/factory.ts` | `getDBALClient()`, `useDBAL()` factories |
| `/dbal/development/src/runtime/prisma-client.ts` | `getPrismaClient()` factory |
| `/dbal/development/src/seeds/index.ts` | `seedDatabase()` orchestration |
| `/seed/database/installed_packages.yaml` | Base seed data (YAML) |
| `/packages/*/seed/metadata.json` | Package-specific seed data |
| `/ARCHITECTURE.md` | Complete architecture blueprint |
| `/schemas/package-schemas/` | Complete MetaBuilder system definition |

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
# Database must exist with schema first
npm --prefix dbal/development run db:push

# Then run tests (global.setup.ts calls seedDatabase)
npm run test:e2e
```

**Key files:**
- `playwright.config.ts` - Configures webServer and global setup
- `e2e/global.setup.ts` - Runs before tests, calls /api/setup to seed
- `e2e/*.spec.ts` - Test files

---

## 📚 Multiple Layers of Schema

### 1. Package System Schemas (`/schemas/package-schemas/`)
Defines the complete MetaBuilder **package architecture**:
- `metadata_schema.json` - Package structure
- `entities_schema.json` - Database models from packages perspective
- `types_schema.json` - Type system
- `validation_schema.json` - Validation rules
- Plus 14 more schemas defining components, API, events, jobs, etc.

**For architectural and package design questions**, check `/schemas` first.

### 2. DBAL YAML Schemas (`/dbal/shared/api/schema/entities/`)
Defines the actual **database structure** (source of truth):
- `/dbal/shared/api/schema/entities/core/*.yaml` - Core entities (User, Session, Workflow, etc.)
- `/dbal/shared/api/schema/entities/access/*.yaml` - Access control entities (Credential, PageConfig, etc.)
- `/dbal/shared/api/schema/entities/packages/*.yaml` - Package-specific entities

**For database schema changes**, edit YAML files here, then regenerate Prisma schema.

---

## ⚠️ DO NOTs for All Assistants

### Database Code
- ❌ Don't use `prisma` client directly
- ❌ Don't use old `getAdapter()` from frontend
- ❌ Don't edit `/prisma/schema.prisma` directly (it's auto-generated)
- ❌ Don't manually edit Prisma schema - edit YAML schemas instead
- ❌ Don't hardcode seed data in TypeScript
- ❌ Don't assume database tables exist (they might not until db:push is run)

### Architecture
- ❌ Don't bypass DBAL for database access
- ❌ Don't move logic from DBAL back to frontend
- ❌ Don't define seed data anywhere except `/seed/` or `/packages/*/seed/`
- ❌ Don't ignore errors about missing tables (run db:push)

### Refactoring
- ❌ Don't stop midway through a refactoring phase
- ❌ Don't commit code that mixes old and new patterns
- ❌ Don't assume Phase 2 or Phase 3 are complete (check status)

---

## ✅ DO This Instead

- ✅ Read ARCHITECTURE.md before starting database work
- ✅ Use `getDBALClient()` from `@/dbal` for all database access
- ✅ Put seed data in `/seed/` folder or `/packages/*/seed/metadata.json`
- ✅ Edit YAML schemas at `/dbal/shared/api/schema/entities/` for database changes
- ✅ Generate Prisma from YAML: `npm --prefix dbal/development run codegen:prisma`
- ✅ Run `npm --prefix dbal/development run db:push` to apply schema changes
- ✅ Follow entity operations pattern (db.users.list(), etc.)
- ✅ Check `/schemas/` folder for architectural/package design questions
- ✅ Check `/dbal/shared/api/schema/` folder for database schema questions

---

## 🔍 Refactoring Status

**Phase 1 - DBAL Improvements** ✅ (COMPLETE)
- [x] Created Prisma client factory (`getPrismaClient`)
- [x] Created DBAL client factory (`getDBALClient`, `useDBAL`)
- [x] Set up seed orchestration structure (`seedDatabase`)
- [x] Updated DBAL exports
- [x] Clarified YAML schemas as source of truth (Prisma is auto-generated)

**Phase 2 - Next.js Cleanup** ⏳ (PENDING)
- [ ] Delete duplicate adapter code from frontend
- [ ] Create single db-client integration point
- [ ] Refactor all operations to use new DBALClient
- [ ] Update API endpoints

**Phase 3 - Build System** ⏳ (PENDING)
- [ ] Update TypeScript path mappings
- [ ] Update workspace configuration

See `DBAL_REFACTOR_PLAN.md` for detailed steps.

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

### Tests fail with database errors
```bash
# Solution: Generate schema from YAML, push to DB, then run tests
npm --prefix dbal/development run codegen:prisma
npm --prefix dbal/development run db:push
npm run test:e2e
```

---

## 📖 Further Reading

1. **ARCHITECTURE.md** - Complete blueprint and data flow
2. **DBAL_REFACTOR_PLAN.md** - Implementation phases and steps
3. **TESTING.md** - E2E testing guide
4. **schemas/SCHEMAS_README.md** - Schema system documentation
5. **schemas/QUICKSTART.md** - Getting started with schemas
