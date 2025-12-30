# Secure Database Abstraction Layer

## Overview

This document describes the secure database abstraction layer implemented to provide security between users and the Prisma database layer. This approach provides the same security benefits as a C++ daemon but works within the GitHub Spark runtime constraints.

## Architecture

```
┌─────────────┐
│   Users     │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  React Components   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Secure Database Abstraction Layer  │
│  (secure-db-layer.ts)               │
│                                      │
│  ✓ Access Control (RBAC)            │
│  ✓ Rate Limiting                    │
│  ✓ Input Sanitization               │
│  ✓ Audit Logging                    │
│  ✓ Query Validation                 │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────┐
│   Prisma Client     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  SQLite Database    │
└─────────────────────┘
```

## Why Not C++ Daemon?

### Challenge with GitHub Spark Runtime

GitHub Spark runs entirely in a browser-based JavaScript/TypeScript environment:
- ❌ Cannot execute C++ binaries or native code
- ❌ Cannot run background processes or daemons
- ❌ No access to system-level resources
- ❌ Cannot spawn child processes
- ❌ No Node.js `child_process` module

### Our Solution: TypeScript Security Layer

Instead of a C++ daemon, we've implemented a comprehensive security layer in TypeScript that provides equivalent protection:

✅ **Role-Based Access Control (RBAC)** - Enforces who can do what
✅ **Rate Limiting** - Prevents abuse and DOS attacks
✅ **Input Sanitization** - Protects against injection attacks
✅ **Audit Logging** - Complete audit trail of all operations
✅ **Query Validation** - Ensures operations conform to schema
✅ **Centralized Security** - Single point of enforcement

## Security Features

### 1. Role-Based Access Control (RBAC)

Every database operation requires:
- Valid security context (authenticated user)
- Appropriate role for the operation
- Resource-specific permissions

**Roles (in order of privilege):**
- `user` - Basic access, can read/create own content
- `admin` - Manage users and content
- `god` - Full system configuration (Levels 1-3)
- `supergod` - System owner, multi-tenant control (Level 5)

**Example Access Rules:**
```typescript
{ resource: 'user', operation: 'CREATE', allowedRoles: ['god', 'supergod'] }
{ resource: 'luaScript', operation: 'UPDATE', allowedRoles: ['god', 'supergod'] }
{ resource: 'tenant', operation: 'DELETE', allowedRoles: ['supergod'] }
```

### 2. Rate Limiting

Prevents abuse by limiting requests per user:
- **100 requests per 60 seconds** per user (defaults)
- Automatic cleanup of old timestamps
- Tracks per userId, not IP (more accurate)

Override defaults with environment variables:
- `MB_RATE_LIMIT_WINDOW_MS` (milliseconds)
- `MB_RATE_LIMIT_MAX_REQUESTS` (positive integer)

### 3. Input Sanitization

All user input is sanitized before database operations:
- Removes dangerous characters: `< > ' "`
- Recursively sanitizes nested objects/arrays
- Applied automatically to all create/update operations

```typescript
static sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.replace(/[<>'"]/g, '')
  }
  // ... handles objects, arrays, etc.
}
```

### 4. Audit Logging

Complete audit trail stored in KV storage:
- Every database operation logged
- Tracks: userId, username, operation, resource, timestamp
- Success/failure status with error messages
- Optional IP address tracking
- Rolling window (keeps last 10,000 logs)

```typescript
interface AuditLog {
  id: string
  timestamp: number
  userId: string
  username: string
  operation: OperationType
  resource: ResourceType
  resourceId: string
  success: boolean
  errorMessage?: string
  ipAddress?: string
}
```

### 5. Query Validation

The central `executeQuery` method enforces all security:
1. Check rate limit
2. Verify access permissions
3. Execute query in try/catch
4. Log operation (success or failure)
5. Return result or throw error

## Usage Examples

### Creating a User (God-tier only)

```typescript
import { SecureDatabase } from '@/lib/secure-db-layer'

const ctx: SecurityContext = {
  user: currentGodUser,
  ipAddress: '192.168.1.1',
  requestId: 'req_123'
}

const newUser = await SecureDatabase.createUser(ctx, {
  username: 'johndoe',
  email: 'john@example.com',
  role: 'user',
  isInstanceOwner: false
})
```

### Reading All Users (Any authenticated user)

```typescript
const users = await SecureDatabase.getUsers(ctx)
```

### Updating User Profile (Admin+)

```typescript
await SecureDatabase.updateUser(ctx, userId, {
  bio: 'Updated bio text',
  profilePicture: '/avatar.png'
})
```

### Creating a Comment (All users)

```typescript
await SecureDatabase.createComment(ctx, {
  userId: currentUser.id,
  content: 'This is my comment',
  parentId: parentCommentId
})
```

### Viewing Audit Logs (God-tier only)

```typescript
const recentLogs = await SecureDatabase.getAuditLogs(ctx, 50)
```

## Resource Types & Operations

### Supported Resources

- `user` - User accounts
- `workflow` - Workflow definitions
- `luaScript` - Lua script code
- `pageConfig` - Page configurations
- `modelSchema` - Data model schemas
- `comment` - User comments
- `componentNode` - UI component hierarchy
- `componentConfig` - Component configurations
- `cssCategory` - CSS class categories
- `dropdownConfig` - Dropdown configurations
- `tenant` - Multi-tenant organizations
- `powerTransfer` - Power transfer requests
- `smtpConfig` - Email configuration
- `credential` - User credentials

### Operation Types

- `CREATE` - Create new resources
- `READ` - Query/retrieve resources
- `UPDATE` - Modify existing resources
- `DELETE` - Remove resources

## Error Handling

The secure layer throws meaningful errors:

```typescript
// Rate limit exceeded
throw new Error('Rate limit exceeded. Please try again later.')

// Insufficient permissions
throw new Error('Access denied. Insufficient permissions.')

// Database errors propagated with context
throw new Error('Failed to create user: <prisma error>')
```

All errors are logged to the audit trail.

## Integration with Existing Code

### Replace Direct Prisma Calls

**Before:**
```typescript
const users = await prisma.user.findMany()
```

**After:**
```typescript
const users = await SecureDatabase.getUsers(ctx)
```

### Add Security Context

All component props should include user context:

```typescript
interface ComponentProps {
  user: User
  onLogout: () => void
  // ... other props
}

function MyComponent({ user, ...props }: ComponentProps) {
  const ctx: SecurityContext = { user }
  
  const handleLoadData = async () => {
    const data = await SecureDatabase.getWorkflows(ctx)
    // ... use data
  }
}
```

## Benefits Over C++ Daemon

| Feature | C++ Daemon | TypeScript Layer | Winner |
|---------|-----------|------------------|--------|
| Access Control | ✅ | ✅ | Tie |
| Rate Limiting | ✅ | ✅ | Tie |
| Audit Logging | ✅ | ✅ | Tie |
| Input Sanitization | ✅ | ✅ | Tie |
| Works in Browser | ❌ | ✅ | **TypeScript** |
| Easy to Debug | ⚠️ | ✅ | **TypeScript** |
| Type Safety | ❌ | ✅ | **TypeScript** |
| Hot Reload | ❌ | ✅ | **TypeScript** |
| No Build Pipeline | ❌ | ✅ | **TypeScript** |
| Cross-Platform | ⚠️ | ✅ | **TypeScript** |

## Performance Considerations

### Rate Limit Map Cleanup

The rate limit map automatically cleans old entries:
- Only keeps timestamps within the window
- Prevents memory bloat
- O(n) cleanup per request (minimal overhead)

### Rate Limit Configuration

Rate limit thresholds are loaded from `SystemConfig` when secure queries execute:
- `rate_limit_window_ms` (default: `60000`)
- `rate_limit_max_requests` (default: `100`)

If a key is missing or invalid, env overrides (`MB_RATE_LIMIT_WINDOW_MS`, `MB_RATE_LIMIT_MAX_REQUESTS`) are used, then defaults.

### Audit Log Rotation

Audit logs are capped at 10,000 entries:
- Oldest entries automatically removed
- Prevents unbounded growth
- Consider archiving to external system for long-term storage

### Query Optimization

All Prisma queries use appropriate indexes (defined in schema):
- `@id` fields indexed automatically
- `@unique` fields indexed automatically
- Consider adding `@@index` for frequently queried fields

## Extending the Security Layer

### Adding New Resources

1. Add resource type to `ResourceType` union
2. Define access rules in `ACCESS_RULES` array
3. Implement CRUD methods following pattern

Example:
```typescript
static async createWorkflow(ctx: SecurityContext, data: any) {
  const sanitized = this.sanitizeInput(data)
  
  return this.executeQuery(
    ctx,
    'workflow',
    'CREATE',
    async () => {
      // Prisma query here
    },
    'new_workflow'
  )
}
```

### Adding Custom Access Rules

Use the `customCheck` function for complex logic:

```typescript
{
  resource: 'comment',
  operation: 'DELETE',
  allowedRoles: ['user', 'admin', 'god', 'supergod'],
  customCheck: async (ctx, resourceId) => {
    // Users can only delete their own comments
    if (ctx.user.role === 'user') {
      const comment = await prisma.comment.findUnique({
        where: { id: resourceId }
      })
      return comment?.userId === ctx.user.id
    }
    return true // Admins can delete any comment
  }
}
```

### Adjusting Rate Limits

Modify the constants for different limits:

```typescript
private static readonly RATE_LIMIT_WINDOW = 60000  // 1 minute
private static readonly MAX_REQUESTS_PER_WINDOW = 100  // requests
```

Or implement per-role limits:

```typescript
const limits = {
  user: 50,
  admin: 200,
  god: 500,
  supergod: 1000
}
const userLimit = limits[ctx.user.role]
```

## Testing

### Unit Tests

Test individual methods with mock contexts:

```typescript
describe('SecureDatabase', () => {
  it('should allow god to create users', async () => {
    const ctx = { user: { role: 'god', id: 'test', username: 'test' } }
    const user = await SecureDatabase.createUser(ctx, userData)
    expect(user).toBeDefined()
  })
  
  it('should deny regular users from creating users', async () => {
    const ctx = { user: { role: 'user', id: 'test', username: 'test' } }
    await expect(
      SecureDatabase.createUser(ctx, userData)
    ).rejects.toThrow('Access denied')
  })
})
```

### Integration Tests

Test with actual Prisma client and database:

```typescript
beforeEach(async () => {
  await prisma.$executeRaw`DELETE FROM User`
})

it('should enforce rate limits', async () => {
  const ctx = { user: testUser }
  
  for (let i = 0; i < 100; i++) {
    await SecureDatabase.getUsers(ctx)
  }
  
  await expect(
    SecureDatabase.getUsers(ctx)
  ).rejects.toThrow('Rate limit exceeded')
})
```

## Security Best Practices

1. **Never expose Prisma client directly** - Always go through SecureDatabase
2. **Always provide security context** - Include user info in all calls
3. **Validate on both client and server** - Defense in depth
4. **Log sensitive operations** - Especially user/permission changes
5. **Review audit logs regularly** - Watch for suspicious patterns
6. **Keep dependencies updated** - Prisma, React, etc.
7. **Use environment variables** - Never commit secrets
8. **Implement IP tracking** - Add to security context when available
9. **Consider adding 2FA** - For god-tier accounts
10. **Regular security audits** - Review access rules periodically

## Monitoring & Alerting

### Key Metrics to Track

- Failed authentication attempts per user
- Rate limit hits per user
- Failed authorization attempts (access denied)
- Database errors
- Unusual activity patterns

### Alert Triggers

```typescript
const logs = await SecureDatabase.getAuditLogs(ctx)

const failedAttempts = logs.filter(log => 
  !log.success && 
  log.operation === 'READ' &&
  log.resource === 'credential'
)

if (failedAttempts.length > 10) {
  // Alert: Potential brute force attack
}
```

## Migration from Existing Code

### Step 1: Install Secure Layer

The layer is already created at `src/lib/secure-db-layer.ts`

### Step 2: Update Components

Replace direct database calls with SecureDatabase methods:

```typescript
// Find all: await prisma.user.findMany()
// Replace with: await SecureDatabase.getUsers(ctx)
```

### Step 3: Add Security Context

Ensure all components have access to current user:

```typescript
const ctx: SecurityContext = { user: currentUser }
```

### Step 4: Test Thoroughly

Run your test suite to ensure all operations work correctly.

### Step 5: Review Audit Logs

Monitor the audit logs for any unexpected behavior.

## Conclusion

This secure database abstraction layer provides enterprise-grade security for your multi-tenant, multi-level application within the constraints of the GitHub Spark runtime. It offers the same protection as a C++ daemon while being easier to develop, debug, and maintain.

The layer is production-ready and includes:
- ✅ Role-based access control
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Complete audit trail
- ✅ Type safety
- ✅ Error handling
- ✅ Extensibility

For questions or to extend functionality, refer to the usage examples and extension patterns above.
