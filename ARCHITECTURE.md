# MetaBuilder Architecture Blueprint

This document establishes the proper MetaBuilder architecture, guided by the `/schemas` folder which defines the complete system blueprint.

## The Foundation: /schemas Folder

The `/schemas/package-schemas/` directory contains 18 interconnected JSON schemas that define the entire MetaBuilder architecture. This is the **source of truth** for what MetaBuilder is and how it should work.

### Core Schema Files

| Schema | Purpose | Key Components |
|--------|---------|-----------------|
| `metadata_schema.json` | Package identity & exports | name, version, authors, exports (pages, components, etc.) |
| `entities_schema.json` | Database models | Entity definitions with relationships, properties, and ACL |
| `types_schema.json` | Type system | Custom types with generics, validation, serialization |
| `script_schema.json` | JSON scripting language | v2.2.0 - declarative data transformation (functions, control flow) |
| `validation_schema.json` | Data validation rules | Validators with sanitization, injection protection |
| `components_schema.json` | UI components | Component definitions with slots, props, styling |
| `api_schema.json` | REST/GraphQL API | Endpoints, query/mutation definitions, request/response schemas |
| `forms_schema.json` | Dynamic form definitions | Form fields, layout, validation binding |
| `events_schema.json` | Event system | Events with payload definitions and handlers |
| `jobs_schema.json` | Background jobs | Scheduled and async job definitions |
| `migrations_schema.json` | Schema migrations | Database migration definitions |
| `permissions_schema.json` | Security & ACL | Role-based and attribute-based access control |
| `config_schema.json` | Package configuration | Feature flags, environment-specific settings |
| `styles_schema.json` | Design tokens | Colors, spacing, typography, design system |
| `assets_schema.json` | Static assets | Images, icons, fonts, localization strings |
| `storybook_schema.json` | Component documentation | Visual testing and documentation for components |
| `stdlib_schema.json` | Standard library | 50+ built-in functions for scripts |
| `index_schema.json` | Master registry | Registry with 12 cross-validation rules |

### Key Properties of /schemas

1. **Declarative, Not Imperative**: Schemas define *what* exists, not *how* to create it
2. **Security First**: Built-in input sanitization, injection protection, password validation
3. **Validation Rules**: 12 automatic cross-validation rules ensure:
   - All referenced entities exist
   - No circular dependencies
   - Proper type safety
   - ACL consistency
4. **Extensibility**: Packages can define custom types, validators, functions, and migrations
5. **Visual Design Ready**: Full metadata for GUI designer integration

---

## Data Flow Architecture

The proper MetaBuilder data flow follows this hierarchy:

```
┌─────────────────────────────────────────────────────────┐
│ Base Seed Data (System Bootstrap)                       │
│ - Located in: /seed folder                              │
│ - Purpose: Create foundation data all packages depend on│
│ - Examples: admin user, app config, default CSS classes │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Package System (/packages/*)                            │
│ - Each package is self-contained                        │
│ - Defines: metadata, components, entities, etc.         │
│ - Optional: seed/metadata.json for package-specific data│
│ - seed/metadata.json can reference base seed data       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ DBAL (Database Abstraction Layer)                       │
│ - Single source of truth for database logic             │
│ - Location: /dbal/development/                          │
│ - Responsible for:                                      │
│   • Prisma schema ownership                             │
│   • Client factory (getDBALClient)                      │
│   • Entity operations (users, pageConfigs, etc.)        │
│   • Seed orchestration (base + package seeds)           │
│   • Adapter implementation                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend Consumers (Next.js, etc.)                      │
│ - Use DBALClient for all database operations            │
│ - Example: db.users.list(), db.pageConfigs.findOne()   │
│ - Never directly access Prisma or adapters             │
│ - No database schema ownership                          │
└─────────────────────────────────────────────────────────┘
```

### Seed Data Organization

```
Base Seed (System Bootstrap)
├── Default users (admin, god, manager, demo)
├── App configuration
├── CSS categories
└── Other system-wide defaults

Package-Specific Seed Data
├── ui_home/seed/metadata.json
│   └── Defines home page (path "/", component "home_page")
├── my_feature/seed/metadata.json
│   └── Defines feature-specific pages and entities
└── ...

DBAL Orchestration
├── Load base seed data first
├── Then load package seeds in dependency order
└── All through entity operations (not raw adapter)
```

**Key Principles**:
- Base seed data is required for system bootstrap
- Package seed data is optional and package-specific
- All seed operations must be idempotent (check before create)
- Seed orchestration happens in DBAL, not frontend

---

## DBAL: The Single Source of Truth

DBAL is the abstraction layer between packages and database implementation. It provides:

### 1. Prisma Client Factory
```typescript
// dbal/development/src/runtime/prisma-client.ts
export function getPrismaClient(config?: PrismaClientConfig): PrismaClient
export function createPrismaClient(config?: PrismaClientConfig): PrismaClient
```

- Manages PrismaClient lifecycle
- Handles test vs production modes
- Owns database URL and adapter configuration

### 2. DBAL Client Factory
```typescript
// dbal/development/src/core/client/factory.ts
export function getDBALClient(config?: DBALClientConfig): DBALClient
export function createDBALClient(config?: DBALClientConfig): DBALClient
export function useDBAL(config?: DBALClientConfig): DBALClient
```

- Singleton pattern for DBALClient
- Configurable via DBALClientConfig
- Entry point for all database operations

### 3. Entity Operations
```typescript
// From DBALClient instance
db.users.list({ limit: 10 })
db.users.create({ ... })
db.users.findOne({ id })
db.users.update(id, { ... })

db.pageConfigs.list({ filter: { path: '/' } })
db.pageConfigs.create({ ... })

db.components.list()
db.workflows.list()
db.sessions.list()
db.packages.list()
// ... more entity operations
```

- High-level, type-safe operations
- Returns domain objects (User, PageConfig, etc.)
- Handles ACL, validation, and permissions

### 4. Seed Orchestration
```typescript
// dbal/development/src/seeds/index.ts
export async function seedDatabase(dbal: DBALClient): Promise<void>
```

- Idempotent seeding (checks before creating)
- Orchestrates base seed data
- Loads package-specific seed data
- Uses entity operations, not raw adapter

### 5. Prisma Schema Ownership
```
dbal/development/prisma/schema.prisma
```

- DBAL owns and versions the database schema
- Moved from `/prisma/schema.prisma` (frontend location)
- Defines all entities (User, PageConfig, Component, etc.)
- Used by DBAL's PrismaClient

---

## Frontend: How Next.js Uses DBAL

### Integration Point (Single Source)
```typescript
// frontends/nextjs/src/lib/db-client.ts
import { getDBALClient, type DBALClient } from '@/dbal'

export function getDB(): DBALClient {
  return getDBALClient({ environment: process.env.NODE_ENV as any })
}

export const db = getDB()
```

### Usage Pattern
```typescript
// ✅ CORRECT: Use DBALClient through entity operations
import { db } from '@/lib/db-client'

const users = await db.users.list({ limit: 10 })
const user = await db.users.findOne({ id })
const newUser = await db.users.create({ ... })

// ❌ WRONG: Don't use adapter directly
import { getAdapter } from '@/lib/dbal-client/adapter/get-adapter'
const adapter = getAdapter()
await adapter.list('User', { ... })

// ❌ WRONG: Don't use Prisma directly
import { prisma } from '@/lib/config/prisma'
const users = await prisma.user.findMany()
```

### Server-Side Operations
```typescript
// app/api/setup/route.ts
import { seedDatabase } from '@/dbal'
import { db } from '@/lib/db-client'

export async function POST() {
  try {
    await seedDatabase(db)
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }
}
```

### What Next.js Should NOT Own
- ❌ Prisma client creation
- ❌ Database schema
- ❌ Adapter implementations
- ❌ Seed orchestration
- ❌ Seed data modules

---

## Mapping /Schemas to DBAL Implementation

The `/schemas` folder defines the structure; DBAL implements it:

| Schema | DBAL Implementation |
|--------|-------------------|
| `metadata_schema.json` | Package loading & exports in DBALClient.packages |
| `entities_schema.json` | Entity definitions reflected in Prisma schema, DBAL entity operations |
| `types_schema.json` | Type system in TypeScript types, used by entity operations |
| `validation_schema.json` | Validation applied in entity create/update operations |
| `components_schema.json` | Component metadata stored in database, accessible via API |
| `api_schema.json` | API endpoints expose DBAL entity operations |
| `forms_schema.json` | Form definitions stored & retrieved via database |
| `events_schema.json` | Event handlers integrated with DBAL operations |
| `jobs_schema.json` | Background jobs use DBAL for data access |
| `permissions_schema.json` | ACL enforced in DBALClient entity operations |
| `script_schema.json` | Scripts have access to DBAL operations and stdlib |
| `stdlib_schema.json` | Standard library functions available to scripts |

---

## Refactoring Roadmap

The `/schemas` blueprint guides three implementation phases:

### Phase 1: DBAL Improvements (Foundation)
- Move Prisma schema to DBAL ownership
- Implement Prisma client factory
- Implement DBAL client factory
- Implement seed orchestration in DBAL
- Enhance entity operations

### Phase 2: Next.js Cleanup (Remove Workarounds)
- Delete duplicate adapter code
- Delete Prisma client from frontend
- Delete scattered seed modules
- Create single db-client integration
- Refactor all operations to use DBAL

### Phase 3: Build System Updates
- Update DBAL package.json with db scripts
- Update TypeScript path mappings
- Update workspace configuration

**See**: `/Users/rmac/Documents/metabuilder/DBAL_REFACTOR_PLAN.md` for detailed implementation steps.

---

## Key Principles for Implementation

### 1. Separation of Concerns
- DBAL: Database abstraction and schema ownership
- Packages: Business logic and UI
- Frontend: User interaction and presentation
- Seeds: Data initialization (never hardcoded in code)

### 2. Single Source of Truth
- Database schema: Owned by DBAL (not frontend)
- Entity operations: Defined in DBAL (not scattered)
- Seed data: Defined in `/seed` and `packages/*/seed/` (not hardcoded)
- Configuration: Centralized in DBAL factory functions

### 3. Abstraction Layers
```
Next.js                    db.users.list()           ← Entity operations
   │                              │
   └──────────────────────────────┘

DBAL                   getDBALClient()              ← Factory functions
   │
   ├─── getPrismaClient()                          ← Prisma management
   │
   └─── seedDatabase(dbal)                         ← Seed orchestration

Database                  dev.db / PostgreSQL       ← Persistence
```

### 4. No Direct Access
- ❌ Frontend should never import Prisma
- ❌ Frontend should never access adapters
- ❌ Frontend should never own database schema
- ❌ Seed data should never be hardcoded

### 5. Factory Pattern
All DBAL access goes through factories:
```typescript
// Correct
const dbal = getDBALClient()
const prisma = getPrismaClient()
const seeded = await seedDatabase(dbal)

// Not through constructors or singletons without factory
```

---

## Testing Strategy (Per TESTING.md)

Aligned with /schemas architecture:

### E2E Tests
```
Playwright Test Execution
    ↓
1. Start WebServer (via Playwright webServer config)
    ↓
2. Global Setup (calls /api/setup)
    ↓
3. DBAL seedDatabase() via /api/setup endpoint
    ↓
4. Tests execute against seeded database
```

### Seed Data for Tests
- Base seed: Default users (admin, god, manager, demo)
- Package seeds: ui_home page, css categories, etc.
- Idempotent: Only created if not already present
- Cleared: Fresh database for each test run (optional)

---

## AI Assistant Guidance

For all AI assistants working on MetaBuilder:

1. **Read /schemas First**: Understand the blueprint before any implementation
2. **DBAL is The Answer**: Any database logic question → implement in DBAL, not frontend
3. **No Workarounds**: If something doesn't work, fix the architecture, don't patch the symptoms
4. **Idempotent Seeds**: All seed operations must check before creating
5. **Entity Operations**: Use high-level DBAL operations, not adapter/Prisma
6. **Package Isolation**: Packages are self-contained; don't couple them to Next.js
7. **Type Safety**: Use TypeScript types from entity operations, not raw data
8. **Validation Rules**: Check `/schemas/index_schema.json` for cross-validation requirements

### Common Mistakes to Avoid
- ❌ Using Prisma directly in frontend
- ❌ Creating database schema outside DBAL
- ❌ Hardcoding seed data
- ❌ Scattering business logic across files
- ❌ Bypassing entity operations
- ❌ Ignoring /schemas as source of truth

---

## Next Steps

1. **Read**: `/Users/rmac/Documents/metabuilder/DBAL_REFACTOR_PLAN.md` for implementation details
2. **Implement**: Phase 1 (DBAL improvements) following the roadmap
3. **Test**: Verify database seeding works with proper DBAL integration
4. **Refactor**: Phase 2 (Next.js cleanup) to remove workarounds
5. **Configure**: Phase 3 (Build system) to finalize workspace setup

---

## References

- `/schemas/package-schemas/` - Complete blueprint (18 schemas)
- `/schemas/SCHEMAS_README.md` - Detailed schema documentation
- `/schemas/QUICKSTART.md` - Getting started with schemas
- `/schemas/INDEX.md` - Schema registry and cross-validation rules
- `/dbal/development/` - DBAL implementation location
- `/packages/*/` - Package implementations
- `/seed/` - Base seed data
- `DBAL_REFACTOR_PLAN.md` - Detailed implementation roadmap
- `TESTING.md` - E2E testing guide
- `CLAUDE.md` - AI assistant instructions
