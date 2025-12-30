# Libraries (`src/lib/`)

Core utilities, database access, authentication, and business logic for MetaBuilder.

## Key Modules

### Database Access

- **database.ts** - Prisma ORM wrapper and database operations
  - User management
  - Tenant data isolation
  - Schema queries
  - CRUD operations

### Authentication & Authorization

- **auth.ts** - Permission and access control
  - `canAccessLevel(user, level)` - Check if user can access level
  - `hashPassword()` - SHA-512 password hashing
  - Permission matrices for 5-level system

### Data Initialization

- **seed-data/** - Initial database population
  - User templates
  - Default configurations
  - Example workflows
  - Component templates

### Utilities

- **package-loader.ts** - Package system management
- **lua-sandbox.ts** - Secure Lua script execution with Fengari
- **validators.ts** - Input validation schemas
- **helpers.ts** - Common utility functions

## 5-Level Architecture

The permission system provides granular access control:

```typescript
// Level definitions
const LEVELS = {
  LEVEL_1: 1,  // Public/Unauthenticated
  LEVEL_2: 2,  // Authenticated User
  LEVEL_3: 3,  // Admin
  LEVEL_4: 4,  // God Mode
  LEVEL_5: 5,  // Supergod (Full Control)
}

// Usage
if (canAccessLevel(user.level, 3)) {
  // Show admin features
}
```

## Database Schema

Prisma ORM manages the database schema defined in `prisma/schema.prisma`:

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String    // SHA-512 hashed
  level     Int       // 1-5
  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  tenantId  String
}
```

## Package System

Dynamic feature loading through packages:

```typescript
import { initializePackageSystem } from '@/lib/package-loader'

// Loads packages from /packages/ directory
await initializePackageSystem()
```

Each package can include:
- React components
- Lua scripts
- Seed data
- Configuration
- Static assets

## Lua Scripting

Safe, sandboxed Lua execution for business logic:

```typescript
import { executeLua } from '@/lib/lua-sandbox'

const result = await executeLua(`
  function add(a, b)
    return a + b
  end
  return add(2, 3)
`)
// result = 5
```

## Security

### Password Hashing

```typescript
import { hashPassword } from '@/lib/database'

const hashed = hashPassword('userPassword')
// Uses SHA-512 for security
```

### Lua Sandbox

All Lua scripts execute in a restricted environment:
- Limited standard library access
- No file system access
- No network access
- Memory limits enforced
- Timeout protection

## Usage Examples

### Check User Permissions

```typescript
import { canAccessLevel } from '@/lib/auth'

const canAdmin = canAccessLevel(user.level, 3)
if (canAdmin) {
  // Show admin UI
}
```

### Database Query

```typescript
import { Database } from '@/lib/database'

const db = new Database()
const user = await db.getUser(userId)
const updated = await db.updateUser(userId, { level: 3 })
```

### Initialize App

```typescript
import { seedDatabase } from '@/lib/seed-data'
import { initializePackageSystem } from '@/lib/package-loader'

// Seed initial data
await seedDatabase()

// Load packages
await initializePackageSystem()
```

## File Organization

```
lib/
├── auth.ts                 # Authorization logic
├── database.ts             # Prisma wrapper
├── lua-sandbox.ts          # Lua execution
├── package-loader.ts       # Package system
├── validators.ts           # Input validation
├── helpers.ts              # Utilities
├── seed-data/
│   ├── index.ts            # Main seed entry
│   ├── users.ts            # User templates
│   ├── workflows.ts        # Workflow templates
│   └── components.ts       # Component templates
└── level-types.ts          # TypeScript type definitions
```

## Best Practices

1. ✅ Keep business logic in libraries, not components
2. ✅ Use database for configuration (declarative)
3. ✅ Sandbox all Lua execution
4. ✅ Hash all passwords with SHA-512
5. ✅ Validate all user input
6. ❌ Don't expose secrets in code
7. ❌ Don't trust client-side permissions alone
8. ❌ Don't execute unsanitized code

See `/docs/` for detailed architecture documentation.
