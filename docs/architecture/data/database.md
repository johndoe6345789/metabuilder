# Database Architecture

MetaBuilder uses **Prisma ORM** as the data access layer with support for **multi-tenant** architecture and **DBAL** (Database Abstraction Layer) for server-side operations.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│       React Components (Client)             │
├─────────────────────────────────────────────┤
│  useDatabase() hooks / API Routes           │
├─────────────────────────────────────────────┤
│  Database Layer                             │
│  ├─ Prisma ORM (Client-side/API)           │
│  └─ DBAL (Server-side only)                │
├─────────────────────────────────────────────┤
│  Database Driver                            │
│  ├─ SQLite (Development)                   │
│  └─ PostgreSQL (Production)                │
├─────────────────────────────────────────────┤
│  Persistent Storage                         │
└─────────────────────────────────────────────┘
```

## Prisma ORM

**File**: `prisma/schema.prisma`

Prisma provides:
- Type-safe database access
- Automatic migrations
- Query builder
- Relationship management

### Schema Structure

```prisma
// Define tables as models
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  level     Int
  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  tenantId  String
  workflows Workflow[]
  
  @@unique([email, tenantId])
}

model Workflow {
  id        String   @id @default(cuid())
  name      String
  config    String   @db.Text
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  tenantId  String
}

model Tenant {
  id        String   @id @default(cuid())
  name      String   @unique
  users     User[]
  workflows Workflow[]
  createdAt DateTime @default(now())
}
```

## Multi-Tenant Design

All tables include `tenantId` for data isolation:

```typescript
// Always filter by tenant
const userWorkflows = await prisma.workflow.findMany({
  where: {
    tenantId: user.tenantId,
    userId: user.id,
  },
})
```

### Tenant Benefits
- Complete data isolation between customers
- Independent scaling per tenant
- Separate backups and recovery
- Regulatory compliance (data residency)

## DBAL (Database Abstraction Layer)

**File**: `src/lib/database-dbal.server.ts`

Advanced server-side database operations:

```typescript
// Server-side only - compile-time enforcement
import { dbalQuery } from '@/lib/database-dbal.server'

// Atomic operations with validation
const result = await dbalQuery({
  operation: 'transfer_workflow',
  from: user1Id,
  to: user2Id,
})
```

### DBAL vs Prisma

| Feature | Prisma | DBAL |
|---------|--------|------|
| **Location** | Client + Server | Server only |
| **Use Case** | Standard CRUD | Complex operations |
| **Transactions** | Basic | Advanced with rollback |
| **Validation** | Schema | Custom rules |
| **Performance** | Good | Optimized |

### Primary Key Mapping

DBAL adapters normalize primary key lookups for Prisma models that use non-`id` keys. The adapter maps the entity name to its primary key field so standard `read`/`update`/`delete` calls work correctly.

Non-`id` primary keys in this repo:
- `Credential.username`
- `InstalledPackage.packageId`
- `PackageData.packageId`
- `PasswordResetToken.username`
- `SystemConfig.key`

## Database Operations

### Create (Insert)

```typescript
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashPassword('password'),
    level: 2,
    tenant: {
      connect: { id: tenantId }
    },
  },
})
```

### Read (Query)

```typescript
// Single record
const user = await prisma.user.findUnique({
  where: { id: userId },
})

// Multiple records with filters
const workflows = await prisma.workflow.findMany({
  where: {
    tenantId: user.tenantId,
    status: 'active',
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
})
```

### Update

```typescript
const updated = await prisma.user.update({
  where: { id: userId },
  data: {
    email: 'newemail@example.com',
    level: 3,
  },
})
```

### Delete

```typescript
await prisma.user.delete({
  where: { id: userId },
})
```

### Relationships

```typescript
// Include related data
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    workflows: true,
    tenant: true,
  },
})

// Access related data
user.workflows.forEach(workflow => {
  console.log(workflow.name)
})
```

## Transactions

Atomic operations across multiple records:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // All operations succeed or all fail
  const user = await tx.user.create({ data: userData })
  const workflow = await tx.workflow.create({
    data: { ...workflowData, userId: user.id }
  })
  return { user, workflow }
})
```

## Migrations

Schema changes require migrations:

```bash
# Create migration after schema change
npm run db:migrate

# Apply migrations
npm run db:push

# View database with UI
npm run db:studio
```

## Connection Management

### Development (SQLite)

```env
DATABASE_URL="file:./dev.db"
```

### Production (PostgreSQL)

```env
DATABASE_URL="postgresql://user:password@host:5432/metabuilder"
```

## Performance Optimization

### Indexing

```prisma
model User {
  id      String @id
  email   String @unique  // Automatically indexed
  tenantId String
  
  @@index([tenantId])  // Composite index for queries
}
```

### Pagination

```typescript
const page = 1
const pageSize = 20

const workflows = await prisma.workflow.findMany({
  where: { tenantId },
  skip: (page - 1) * pageSize,
  take: pageSize,
})
```

### Select Specific Fields

```typescript
// Only retrieve needed columns
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    level: true,
  },
})
```

## Error Handling

```typescript
import { Prisma } from '@prisma/client'

try {
  await prisma.user.create({ data: userData })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      throw new Error('Email already exists')
    }
  }
  throw error
}
```

## Best Practices

✅ **Do:**
- Always filter by `tenantId` for tenant data
- Use TypeScript for type safety
- Create migrations for schema changes
- Use transactions for related operations
- Validate input before database operations
- Cache frequently accessed data
- Use indexes for common queries

❌ **Don't:**
- Store secrets in database
- Trust user input in queries
- Assume data is available (check null)
- Use `findMany()` without filters on large tables
- Forget `tenantId` in queries
- Execute raw SQL without escaping

## Related Files

- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
- Database wrapper: `src/lib/database.ts`
- DBAL (server-side): `src/lib/database-dbal.server.ts`
- Type definitions: `src/lib/level-types.ts`

See `/docs/` for more database patterns and guides.
