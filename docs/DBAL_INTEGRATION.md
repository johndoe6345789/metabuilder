# DBAL Integration Guide

## Overview

The MetaBuilder application now has DBAL (Database Abstraction Layer) wired up and ready for use. DBAL provides a unified interface for database operations with support for multiple adapters, ACL, audit logging, and more.

## Architecture

### Current Setup

- **DBAL Layer**: Located in `dbal/ts/src/` - provides the core abstraction with Prisma adapter support
- **Server-Side Integration**: `src/lib/database-dbal.server.ts` - server-only module that initializes and exports DBAL operations
- **Database Class**: `src/lib/database.ts` - maintains backward compatibility with existing code using Prisma directly
- **API Routes**: Demonstrate DBAL usage (e.g., `app/api/users/route.ts`)

### Why Two Approaches?

1. **Database Class (Prisma Direct)**: Used by client components and existing code for backward compatibility
2. **DBAL (Server-Only)**: Used in API routes and server components for:
   - Multi-adapter support
   - ACL/permission checking
   - Audit logging
   - WebSocket bridge capability

## Using DBAL in Your Code

### ✅ Server-Side Usage (API Routes, Server Components, Server Actions)

```typescript
import { dbalGetUsers, dbalAddUser, initializeDBAL } from '@/lib/database-dbal.server'

// In an API route
export async function GET() {
  await initializeDBAL()
  const users = await dbalGetUsers()
  return NextResponse.json({ users })
}

// In a Server Action
'use server'
export async function createUser(formData: FormData) {
  await initializeDBAL()
  const user = await dbalAddUser({
    username: formData.get('username'),
    email: formData.get('email'),
    role: 'user'
  })
  return user
}
```

### ❌ Client-Side (Will Not Work)

```typescript
// DON'T DO THIS - will cause build errors
import { dbalGetUsers } from '@/lib/database-dbal.server' // ❌ server-only module

function MyComponent() {
  const users = await dbalGetUsers() // ❌ can't use DBAL on client
}
```

For client-side code, use:
- The existing `Database` class (which uses Prisma directly)
- API routes that use DBAL internally
- Server Components with DBAL

## DBAL Features

### 1. Multi-Adapter Support
```typescript
const config = {
  adapter: 'prisma', // or 'sqlite', 'mongodb' (when implemented)
  database: { url: process.env.DATABASE_URL }
}
```

### 2. ACL Integration
DBAL includes built-in access control:
```typescript
const config = {
  auth: {
    user: currentUser,
    session: currentSession
  },
  security: {
    sandbox: 'strict', // or 'permissive', 'disabled'
    enableAuditLog: true
  }
}
```

### 3. Validation
All DBAL operations include automatic validation:
```typescript
// Automatic validation of user data
await dbal.users.create({
  username: 'john', // validated
  email: 'invalid',  // throws validation error
})
```

### 4. Error Handling
DBAL provides consistent error types:
```typescript
try {
  await dbal.users.create(userData)
} catch (error) {
  if (error instanceof DBALError) {
    if (error.code === 409) {
      // Handle conflict (duplicate username/email)
    }
  }
}
```

## Migration Path

### Current State
- ✅ DBAL is initialized and working
- ✅ Prisma adapter is configured  
- ✅ Server-side API routes can use DBAL
- ⏳ Database class still uses Prisma directly (backward compatibility)

### Future Enhancements
1. Gradually migrate Database class methods to use DBAL internally
2. Add support for SQLite and MongoDB adapters
3. Implement full audit logging
4. Add WebSocket bridge for C++ daemon communication

## Testing DBAL

Test the DBAL integration using the API route:

```bash
# Start the dev server
npm run dev

# Test the DBAL-powered users endpoint
curl http://localhost:3000/api/users
```

Expected response:
```json
{
  "users": [...],
  "source": "DBAL"
}
```

## Benefits of DBAL

1. **Abstraction**: Switch database backends without changing application code
2. **Type Safety**: Full TypeScript support with validation
3. **Security**: Built-in ACL, sandboxing, and audit logging
4. **Performance**: Connection pooling, query timeouts, caching support
5. **Testing**: Easy to mock and test with different adapters
6. **Multi-tenancy**: Built-in tenant isolation and quota management

## Next Steps

To fully adopt DBAL throughout the codebase:

1. Create API routes for all database operations
2. Update client components to call API routes instead of using Database class directly
3. Migrate server components to use DBAL
4. Eventually refactor Database class to use DBAL internally

This gradual approach ensures backward compatibility while enabling new code to leverage DBAL's advanced features.
