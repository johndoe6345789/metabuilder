# DBAL Refactoring Plan

## Objective
Move Prisma initialization, adapter implementation, schema, and seeding from Next.js frontend to DBAL subproject. Make DBAL the single source of truth for database abstraction.

## Current Problems

1. **Duplicate Adapter**: `/frontends/nextjs/src/lib/dbal-client/adapter/get-adapter.ts` has a simplified `PrismaAdapter` that duplicates DBAL's implementation
2. **Prisma Context in Frontend**: `/frontends/nextjs/src/lib/config/prisma.ts` creates PrismaClient - should be in DBAL
3. **Schema Outside DBAL**: Database schema at `/prisma/schema.prisma` - DBAL should own it
4. **Scattered Seeding**: Seed code split between `/seed/`, `/frontends/nextjs/src/lib/seed/`, and database-admin
5. **Unused Entity Operations**: DBAL defines high-level operations but frontend uses raw adapter
6. **No Factory Pattern in DBAL**: Adapter/client factory is in Next.js, not DBAL

## Refactoring Phases

### Phase 1: DBAL Improvements (Required Foundation)

#### 1.1 Move & Own Prisma Schema
**Location**: Move `/prisma/schema.prisma` → `/dbal/development/prisma/schema.prisma`

```bash
# Steps
mkdir -p dbal/development/prisma
cp prisma/schema.prisma dbal/development/prisma/
# Update references in dbal/development/package.json
```

**Why**: DBAL is the database abstraction layer - it should own the schema. Allows DBAL to be versioned independently.

#### 1.2 Implement DBAL Prisma Factory
**Location**: `/dbal/development/src/runtime/prisma-client.ts` (NEW)

```typescript
// dbal/development/src/runtime/prisma-client.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

export interface PrismaClientConfig {
  databaseUrl?: string
  environment?: 'test' | 'integration' | 'production'
}

export function createPrismaClient(config?: PrismaClientConfig): PrismaClient {
  const env = config?.environment || process.env.NODE_ENV
  const dbUrl = config?.databaseUrl || process.env.DATABASE_URL

  // Test mode: mock
  if (env === 'test' && !process.env.VITEST_INTEGRATION) {
    return createMockPrisma()
  }

  // Integration mode: in-memory
  if (env === 'test' && process.env.VITEST_INTEGRATION) {
    return createIntegrationPrisma()
  }

  // Production mode: file-based SQLite
  const adapter = new PrismaBetterSqlite3({
    url: dbUrl || 'file:./prisma/dev.db'
  })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as { prisma?: PrismaClient }

export function getPrismaClient(config?: PrismaClientConfig): PrismaClient {
  // Singleton with config override
  if (globalForPrisma.prisma && !config) {
    return globalForPrisma.prisma
  }
  globalForPrisma.prisma = createPrismaClient(config)
  return globalForPrisma.prisma
}
```

#### 1.3 Implement DBAL Client Factory
**Location**: `/dbal/development/src/core/client/factory.ts` (NEW)

```typescript
// dbal/development/src/core/client/factory.ts
import { DBALClient, DBALConfig } from './client'
import { PrismaAdapter } from '../adapters/prisma'
import { getPrismaClient } from '../../runtime/prisma-client'

export interface DBALClientConfig extends DBALConfig {
  // Extended with runtime options
  databaseUrl?: string
  environment?: 'test' | 'integration' | 'production'
}

const globalDBAL = globalThis as { dbalClient?: DBALClient }

export function createDBALClient(config?: DBALClientConfig): DBALClient {
  const prisma = getPrismaClient({
    databaseUrl: config?.databaseUrl,
    environment: config?.environment
  })

  const adapter = new PrismaAdapter(prisma)

  return new DBALClient({
    adapter,
    mode: config?.mode || 'production',
    ...config
  })
}

export function getDBALClient(config?: DBALClientConfig): DBALClient {
  // Singleton pattern
  if (globalDBAL.dbalClient && !config) {
    return globalDBAL.dbalClient
  }
  globalDBAL.dbalClient = createDBALClient(config)
  return globalDBAL.dbalClient
}

// Export for convenience
export function useDBAL(config?: DBALClientConfig): DBALClient {
  return getDBALClient(config)
}
```

#### 1.4 Implement Database Seeding in DBAL
**Location**: `/dbal/development/src/seeds/` (NEW)

```typescript
// dbal/development/src/seeds/index.ts
import type { DBALClient } from '../core/client'
import { seedDefaultUsers } from './default-users'
import { seedAppConfiguration } from './app-configuration'
import { seedHomePage } from './home-page'
import { seedCssCategories } from './css-categories'

export async function seedDatabase(dbal: DBALClient): Promise<void> {
  // Execute in order - seeds are idempotent
  await seedDefaultUsers(dbal)
  await seedAppConfiguration(dbal)
  await seedHomePage(dbal)
  await seedCssCategories(dbal)
}

// dbal/development/src/seeds/default-users.ts
export async function seedDefaultUsers(dbal: DBALClient): Promise<void> {
  // Check if already exists
  const existing = await dbal.users.list({ limit: 1 })
  if (existing.total > 0) return // Already seeded

  // Create default users using entity operations (not raw adapter!)
  const users = [
    { username: 'admin', email: 'admin@localhost', role: 'supergod', passwordHash: hashPassword('admin123') },
    { username: 'god', email: 'god@localhost', role: 'god', passwordHash: hashPassword('god123') },
    { username: 'manager', email: 'manager@localhost', role: 'admin', passwordHash: hashPassword('manager123') },
    { username: 'demo', email: 'demo@localhost', role: 'user', passwordHash: hashPassword('demo123') }
  ]

  for (const user of users) {
    await dbal.users.create(user)
  }
}

// dbal/development/src/seeds/home-page.ts
export async function seedHomePage(dbal: DBALClient): Promise<void> {
  // Check if exists
  const existing = await dbal.pageConfigs.findOne({ path: '/' })
  if (existing) return

  // Create using entity operations
  await dbal.pageConfigs.create({
    path: '/',
    title: 'MetaBuilder',
    description: 'Data-driven application platform',
    packageId: 'ui_home',
    component: 'home_page',
    level: 0,
    requiresAuth: false,
    isPublished: true
  })
}
```

Update DBAL exports:
```typescript
// dbal/development/src/index.ts
export { getDBALClient, createDBALClient, useDBAL } from './core/client/factory'
export { seedDatabase } from './seeds'
export { getPrismaClient, createPrismaClient } from './runtime/prisma-client'
```

#### 1.5 Enhance DBALClient to Use Entity Operations
**Location**: Ensure all entity operations exist and are accessible

Verify DBAL exports:
```typescript
// dbal/development/src/core/client/client.ts should have:
// - users: UserOperations
// - pageConfigs: PageConfigOperations
// - components: ComponentOperations
// - workflows: WorkflowOperations
// - sessions: SessionOperations
// - packages: PackageOperations
```

---

### Phase 2: Next.js Frontend Cleanup (Remove Workarounds)

#### 2.1 Delete Duplicate Code

**Delete these directories**:
- `frontends/nextjs/src/lib/dbal-client/` - NO LONGER NEEDED
- `frontends/nextjs/src/lib/database-dbal/` - NO LONGER NEEDED
- `frontends/nextjs/src/lib/config/prisma.ts` - MOVED TO DBAL

**Delete file**:
- `frontends/nextjs/src/lib/seed/` - MOVED TO DBAL

#### 2.2 Create Single DBAL Integration Point

**Location**: `frontends/nextjs/src/lib/db-client.ts` (NEW - SIMPLE)

```typescript
// frontends/nextjs/src/lib/db-client.ts
// Single source of truth for DBAL client in Next.js
import { getDBALClient, type DBALClient } from '@/dbal'

export function getDB(): DBALClient {
  return getDBALClient({
    mode: process.env.DBAL_MODE as any || 'production',
    environment: (process.env.NODE_ENV as any) || 'production'
  })
}

// For server-side operations
export const db = getDB()
```

#### 2.3 Refactor Existing DB Operations

Replace all:
```typescript
// OLD
import { getAdapter } from '@/lib/dbal-client/adapter/get-adapter'
import { prisma } from '@/lib/config/prisma'
const adapter = getAdapter()
await adapter.list('User', { ... })

// NEW
import { db } from '@/lib/db-client'
await db.users.list({ ... })
```

#### 2.4 Update API Endpoints

**Update `/api/setup` to use DBAL**:
```typescript
// frontends/nextjs/src/app/api/setup/route.ts
import { NextResponse } from 'next/server'
import { seedDatabase } from '@/dbal'
import { db } from '@/lib/db-client'

export async function POST() {
  try {
    await seedDatabase(db)
    return NextResponse.json({
      status: 'ok',
      message: 'Database seeded successfully'
    })
  } catch (error) {
    console.error('Seeding failed:', error)
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Seed failed' },
      { status: 500 }
    )
  }
}
```

#### 2.5 Update Tests

Update Playwright config for database initialization:
```typescript
// playwright.config.ts
import { execSync } from 'child_process'

export default defineConfig({
  globalSetup: require.resolve('./e2e/global.setup.ts'),

  webServer: {
    command: 'npm --prefix frontends/nextjs run dev',
    url: 'http://localhost:3000/api/health',
    env: {
      DATABASE_URL: 'file:../../prisma/prisma/dev.db',
    }
  }
})
```

**Note**: Database schema setup moves out of Next.js entirely. DBAL owns the schema.

---

### Phase 3: Build System Updates

#### 3.1 Update DBAL package.json

```json
{
  "name": "@metabuilder/dbal",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "db:generate": "prisma generate --schema=prisma/schema.prisma",
    "db:push": "prisma db push --schema=prisma/schema.prisma",
    "db:studio": "prisma studio --schema=prisma/schema.prisma"
  },
  "peerDependencies": {
    "@prisma/client": "^7.2.0",
    "@prisma/adapter-better-sqlite3": "^7.2.0"
  }
}
```

#### 3.2 Update Next.js tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@/dbal": "../../dbal/development/src",
      "@/lib/*": "./src/lib/*",
      "@/*": "./src/*"
    }
  }
}
```

#### 3.3 Root package.json

Add workspace management:
```json
{
  "workspaces": [
    "dbal/development",
    "frontends/nextjs"
  ],
  "scripts": {
    "db:setup": "cd dbal/development && npm run db:push",
    "dev": "npm --prefix frontends/nextjs run dev"
  }
}
```

---

## Implementation Order

1. **DBAL Phase (Foundation)**
   - 1.1 Move schema to DBAL
   - 1.2 Implement Prisma factory in DBAL
   - 1.3 Implement DBAL client factory in DBAL
   - 1.4 Implement seeding in DBAL
   - 1.5 Verify entity operations

2. **Cleanup Phase (Frontend)**
   - 2.1 Delete duplicate code
   - 2.2 Create single db-client integration
   - 2.3 Refactor operations to use DBAL
   - 2.4 Update API endpoints
   - 2.5 Update tests

3. **Build Phase (Configuration)**
   - 3.1 Update DBAL package.json
   - 3.2 Update TypeScript paths
   - 3.3 Update root package.json

---

## Verification Checklist

- [ ] DBAL schema.prisma exists at `/dbal/development/prisma/schema.prisma`
- [ ] `getDBALClient()` factory exported from DBAL
- [ ] `seedDatabase()` function exported from DBAL
- [ ] `getPrismaClient()` exported from DBAL
- [ ] `/frontends/nextjs/src/lib/dbal-client/` deleted
- [ ] `/frontends/nextjs/src/lib/database-dbal/` deleted
- [ ] `/frontends/nextjs/src/lib/config/prisma.ts` deleted
- [ ] `/frontends/nextjs/src/lib/db-client.ts` created
- [ ] All `await adapter.list()` replaced with `await db.users.list()` pattern
- [ ] `/api/setup` endpoint works with `seedDatabase(db)`
- [ ] E2E tests run successfully
- [ ] Database schema creation works via DBAL

---

## Benefits After Refactoring

1. **DBAL is Self-Contained**: Can be versioned, deployed independently
2. **No Duplication**: Single adapter implementation
3. **Proper Abstraction**: Frontend uses high-level operations, not raw adapter
4. **Type Safety**: Entity operations have proper types, validation
5. **Consistency**: All database initialization through DBAL
6. **Testability**: DBAL can be tested independently
7. **Reusability**: Other frontends can use same DBAL code
8. **Maintainability**: Clear separation of concerns

---

## Questions for User Review

1. Should DBAL also own the prisma npm scripts (db:generate, db:push)?
2. Should Next.js workspace depend on DBAL workspace?
3. Should we create DBAL CLI tool for database management?
4. How should environment-specific configurations (dev/staging/prod) be handled in DBAL?
