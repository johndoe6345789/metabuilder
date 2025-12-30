# Migration Guide: Integrating Secure Database Layer

This guide walks you through migrating your existing codebase to use the secure database abstraction layer.

## Quick Start

### 1. Import the Secure Layer

```typescript
import { SecureDatabase, SecurityContext } from '@/lib/secure-db-layer'
```

### 2. Create Security Context

In your component or function, create a security context with the current user:

```typescript
const ctx: SecurityContext = {
  user: currentUser,
  ipAddress: '192.168.1.1', // Optional
  requestId: 'unique-request-id' // Optional
}
```

### 3. Replace Database Calls

Replace direct Prisma or database calls with SecureDatabase methods.

## Common Migration Patterns

### User Operations

**Before (Direct Prisma):**
```typescript
import { prisma } from '@/lib/prisma'

const users = await prisma.user.findMany()
const user = await prisma.user.findUnique({ where: { id: userId } })
await prisma.user.create({ data: { ... } })
await prisma.user.update({ where: { id: userId }, data: { ... } })
await prisma.user.delete({ where: { id: userId } })
```

**After (Secure Layer):**
```typescript
import { SecureDatabase, SecurityContext } from '@/lib/secure-db-layer'

const ctx: SecurityContext = { user: currentUser }

const users = await SecureDatabase.getUsers(ctx)
const user = await SecureDatabase.getUserById(ctx, userId)
await SecureDatabase.createUser(ctx, userData)
await SecureDatabase.updateUser(ctx, userId, updates)
await SecureDatabase.deleteUser(ctx, userId)
```

### Credential Operations

**Before:**
```typescript
const credential = await prisma.credential.findUnique({
  where: { username }
})
const isValid = credential?.passwordHash === providedHash

await prisma.credential.upsert({
  where: { username },
  update: { passwordHash },
  create: { username, passwordHash }
})
```

**After:**
```typescript
const ctx: SecurityContext = { user: systemUser }

const isValid = await SecureDatabase.verifyCredentials(ctx, username, password)
await SecureDatabase.setCredential(ctx, username, passwordHash)
```

### Comment Operations

**Before:**
```typescript
const comments = await prisma.comment.findMany()
await prisma.comment.create({
  data: {
    id: `comment_${Date.now()}`,
    userId: currentUser.id,
    content: commentText,
    createdAt: BigInt(Date.now())
  }
})
```

**After:**
```typescript
const ctx: SecurityContext = { user: currentUser }

const comments = await SecureDatabase.getComments(ctx)
await SecureDatabase.createComment(ctx, {
  userId: currentUser.id,
  content: commentText
})
```

### Workflow Operations

**Before:**
```typescript
const workflows = await prisma.workflow.findMany()
```

**After:**
```typescript
const ctx: SecurityContext = { user: currentUser }

const workflows = await SecureDatabase.getWorkflows(ctx)
```

## Component Integration Examples

### Level 2 Component (User Area)

```typescript
import { useState, useEffect } from 'react'
import { SecureDatabase, SecurityContext } from '@/lib/secure-db-layer'
import type { User, Comment } from '@/lib/level-types'

interface Level2Props {
  user: User
  onLogout: () => void
}

export function Level2({ user, onLogout }: Level2Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ctx: SecurityContext = { user }

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await SecureDatabase.getComments(ctx)
      setComments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (content: string) => {
    try {
      await SecureDatabase.createComment(ctx, {
        userId: user.id,
        content
      })
      await loadComments() // Reload
      toast.success('Comment added!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add comment')
    }
  }

  return (
    <div>
      {/* Your UI here */}
    </div>
  )
}
```

### Level 3 Component (Admin Panel)

```typescript
import { useState, useEffect } from 'react'
import { SecureDatabase, SecurityContext } from '@/lib/secure-db-layer'
import type { User } from '@/lib/level-types'

interface Level3Props {
  user: User
  onLogout: () => void
}

export function Level3({ user, onLogout }: Level3Props) {
  const [users, setUsers] = useState<User[]>([])
  const ctx: SecurityContext = { user }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await SecureDatabase.getUsers(ctx)
      setUsers(data)
    } catch (err) {
      toast.error('Failed to load users')
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await SecureDatabase.updateUser(ctx, userId, updates)
      await loadUsers() // Reload
      toast.success('User updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  return (
    <div>
      {/* Admin UI here */}
    </div>
  )
}
```

### Level 4 Component (God Tier)

```typescript
import { useState, useEffect } from 'react'
import { SecureDatabase, SecurityContext, AuditLog } from '@/lib/secure-db-layer'
import type { User, Workflow, LuaScript, PageConfig } from '@/lib/level-types'

interface Level4Props {
  user: User
  onLogout: () => void
}

export function Level4({ user, onLogout }: Level4Props) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [luaScripts, setLuaScripts] = useState<LuaScript[]>([])
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const ctx: SecurityContext = { user }

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      const [wf, lua, pages, logs] = await Promise.all([
        SecureDatabase.getWorkflows(ctx),
        SecureDatabase.getLuaScripts(ctx),
        SecureDatabase.getPageConfigs(ctx),
        SecureDatabase.getAuditLogs(ctx, 100)
      ])
      
      setWorkflows(wf)
      setLuaScripts(lua)
      setPageConfigs(pages)
      setAuditLogs(logs)
    } catch (err) {
      toast.error('Failed to load data')
    }
  }

  const handleCreateUser = async (userData: any) => {
    try {
      await SecureDatabase.createUser(ctx, userData)
      toast.success('User created!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  return (
    <div>
      {/* God tier UI here */}
    </div>
  )
}
```

## Error Handling Best Practices

### Always Use Try-Catch

```typescript
try {
  const result = await SecureDatabase.getUsers(ctx)
  // Handle success
} catch (err) {
  if (err instanceof Error) {
    if (err.message.includes('Rate limit')) {
      toast.error('Too many requests. Please wait a moment.')
    } else if (err.message.includes('Access denied')) {
      toast.error('You do not have permission to perform this action.')
    } else {
      toast.error(err.message)
    }
  }
}
```

### Handle Loading States

```typescript
const [loading, setLoading] = useState(false)

const loadData = async () => {
  setLoading(true)
  try {
    const data = await SecureDatabase.getUsers(ctx)
    setUsers(data)
  } catch (err) {
    // Handle error
  } finally {
    setLoading(false)
  }
}
```

## Testing with Secure Layer

### Mock the Secure Layer

```typescript
import { vi } from 'vitest'
import * as SecureDB from '@/lib/secure-db-layer'

vi.mock('@/lib/secure-db-layer', () => ({
  SecureDatabase: {
    getUsers: vi.fn().mockResolvedValue([
      { id: '1', username: 'test', email: 'test@example.com', role: 'user' }
    ]),
    createUser: vi.fn().mockResolvedValue({ id: '2', username: 'new' }),
    // ... other methods
  }
}))

describe('MyComponent', () => {
  it('should load users', async () => {
    render(<MyComponent user={testUser} />)
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument()
    })
  })
})
```

### Test Access Control

```typescript
it('should deny access for insufficient permissions', async () => {
  const userCtx: SecurityContext = { 
    user: { role: 'user', id: '1', username: 'test' } 
  }
  
  await expect(
    SecureDatabase.createUser(userCtx, userData)
  ).rejects.toThrow('Access denied')
})

it('should allow access for god role', async () => {
  const godCtx: SecurityContext = { 
    user: { role: 'god', id: '1', username: 'god' } 
  }
  
  const user = await SecureDatabase.createUser(godCtx, userData)
  expect(user).toBeDefined()
})
```

## Performance Tips

### Batch Operations

When loading multiple resources, use `Promise.all`:

```typescript
const [users, workflows, scripts] = await Promise.all([
  SecureDatabase.getUsers(ctx),
  SecureDatabase.getWorkflows(ctx),
  SecureDatabase.getLuaScripts(ctx)
])
```

### Cache Results

For data that doesn't change often:

```typescript
const [users, setUsers] = useState<User[]>([])
const usersLoadedRef = useRef(false)

useEffect(() => {
  if (!usersLoadedRef.current) {
    loadUsers()
    usersLoadedRef.current = true
  }
}, [])
```

### Debounce Frequent Operations

For search or filter operations:

```typescript
import { debounce } from 'lodash'

const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    const results = await SecureDatabase.getUsers(ctx)
    // Filter locally or add search method to SecureDatabase
  }, 300),
  []
)
```

## Monitoring Integration

### Track Operations

```typescript
const trackOperation = async <T,>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now()
  try {
    const result = await operation()
    const duration = Date.now() - startTime
    console.log(`${operationName} completed in ${duration}ms`)
    return result
  } catch (err) {
    const duration = Date.now() - startTime
    console.error(`${operationName} failed after ${duration}ms`, err)
    throw err
  }
}

// Usage
const users = await trackOperation('getUsers', () => 
  SecureDatabase.getUsers(ctx)
)
```

### Review Audit Logs

Add a monitoring dashboard in Level 5:

```typescript
const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

const loadAuditLogs = async () => {
  const logs = await SecureDatabase.getAuditLogs(ctx, 100)
  setAuditLogs(logs)
  
  // Check for suspicious activity
  const failedAttempts = logs.filter(log => 
    !log.success && log.operation === 'READ' && log.resource === 'credential'
  )
  
  if (failedAttempts.length > 10) {
    toast.warning('High number of failed login attempts detected')
  }
}
```

## Common Pitfalls

### ❌ Don't: Bypass the Secure Layer

```typescript
// DON'T DO THIS
import { prisma } from '@/lib/prisma'
const users = await prisma.user.findMany()
```

### ✅ Do: Always Use SecureDatabase

```typescript
// DO THIS
import { SecureDatabase } from '@/lib/secure-db-layer'
const users = await SecureDatabase.getUsers(ctx)
```

### ❌ Don't: Forget Security Context

```typescript
// DON'T DO THIS - Missing context
await SecureDatabase.getUsers()
```

### ✅ Do: Always Provide Context

```typescript
// DO THIS
const ctx: SecurityContext = { user: currentUser }
await SecureDatabase.getUsers(ctx)
```

### ❌ Don't: Ignore Errors

```typescript
// DON'T DO THIS
const users = await SecureDatabase.getUsers(ctx)
```

### ✅ Do: Handle Errors Properly

```typescript
// DO THIS
try {
  const users = await SecureDatabase.getUsers(ctx)
  // Use users
} catch (err) {
  console.error('Failed to load users:', err)
  toast.error('Failed to load users')
}
```

## Checklist for Migration

- [ ] Import SecureDatabase in all components that access database
- [ ] Create SecurityContext with current user
- [ ] Replace all direct Prisma calls with SecureDatabase methods
- [ ] Add try-catch error handling around all database operations
- [ ] Test each role's permissions (user, admin, god, supergod)
- [ ] Verify rate limiting works (100 requests/minute)
- [ ] Check audit logs are being created
- [ ] Update tests to use mocked SecureDatabase
- [ ] Add loading states for async operations
- [ ] Document any custom access rules needed
- [ ] Review and test all edge cases
- [ ] Monitor performance impact
- [ ] Set up audit log review process

## Next Steps

1. **Complete the migration** - Work through each component systematically
2. **Add tests** - Ensure security rules are enforced
3. **Monitor audit logs** - Watch for unusual patterns
4. **Extend as needed** - Add new resources and methods
5. **Review regularly** - Security is an ongoing process

For questions or issues, refer to:
- `docs/SECURE_DATABASE_LAYER.md` - Full documentation
- `src/lib/secure-db-layer.ts` - Implementation
- `src/lib/level-types.ts` - Type definitions
