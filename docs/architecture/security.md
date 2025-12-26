# Security Architecture

MetaBuilder implements a comprehensive security model based on 5-level permission hierarchy and strict isolation boundaries.

## 🔐 Security Principles

1. **Defense in Depth** - Multiple layers of protection
2. **Least Privilege** - Users get minimum necessary permissions
3. **Zero Trust** - Verify all requests, trust nothing by default
4. **Separation of Concerns** - Isolate sensitive operations
5. **Audit Trail** - Log all sensitive operations

## 🎯 Permission Levels

```
Level 5 (SuperGod)  → System administrator, full access, database control
    ↓
Level 4 (God)       → Power user, system configuration, user management
    ↓
Level 3 (Admin)     → Tenant administrator, data and user management
    ↓
Level 2 (User)      → Regular user, standard data access per schema
    ↓
Level 1 (Guest)     → Read-only access (not implemented)
```

### Permission Inheritance

Each level inherits permissions from lower levels:

```typescript
// Example: Can User (Level 2) do something?
const canDo = userLevel >= requiredLevel;

// Admin (3) can do anything User (2) can do, plus more
```

## 🔑 Authentication

### Password Hashing

All passwords stored as **SHA-512 hashes**:

```typescript
// Never store plaintext!
const hash = sha512(password);
```

### Credential Verification

```typescript
import { scram } from '@/lib/auth';

const verified = scram(password, storedHash);
```

### Session Management

- Session tokens generated on login
- Tokens validated on each request
- Tokens expire after inactivity
- Tokens can be revoked immediately

### Login Lockout & Backoff

- Failed login attempts are tracked per username and rate-limited.
- After `MB_AUTH_LOCKOUT_MAX_ATTEMPTS` within `MB_AUTH_LOCKOUT_WINDOW_MS`, logins lock for `MB_AUTH_LOCKOUT_MS`.
- When locked, the API returns `429` with `Retry-After` to guide clients.

## 🏢 Multi-Tenant Isolation

### Tenant Boundaries

```
Tenant A         Tenant B         Tenant C
├─ Users    ├─ Users    ├─ Users
├─ Data     ├─ Data     ├─ Data
├─ Schemas  ├─ Schemas  ├─ Schemas
└─ Scripts  └─ Scripts  └─ Scripts
```

Each tenant's data is:
- ✅ Logically isolated (database level)
- ✅ Physically isolated (separate fields)
- ✅ Cryptographically signed (optional)
- ✅ Audited (all access logged)

### Tenant Checking

Every data access checks `tenantId`:

```typescript
const data = await db.data.findFirst({
  where: {
    id: dataId,
    tenantId: currentTenantId  // Ensures isolation
  }
});
```

## 🔒 Data Protection

### At Rest

- Data encrypted at database level (optional)
- Sensitive fields hashed
- Backups encrypted
- Access logs maintained

### In Transit

- HTTPS only (deployment configured)
- API endpoint authentication required
- CSRF token validation
- Rate limiting on sensitive endpoints

### In Use

- Sandboxed Lua execution (no file system access)
- TypeScript type safety
- Input validation on all endpoints
- Output sanitization for HTML

## 🚨 Lua Script Sandboxing

Lua scripts run in sandboxed environment:

```lua
-- Allowed operations
local data = GetData("table_name")
local result = DatabaseQuery(...)

-- Blocked operations
os.execute("rm -rf /")  -- ❌ NOT allowed
io.open("/etc/passwd")  -- ❌ NOT allowed
require("unsafe_module") -- ❌ NOT allowed
```

### Sandbox Restrictions

| Operation | Allowed | Reason |
|-----------|---------|--------|
| File system | ❌ No | Isolation |
| Network | ❌ No | Security |
| System calls | ❌ No | Containment |
| Database queries | ✅ Yes | Business logic |
| Memory usage | ✅ Limited | Max heap enforced |
| JSON parsing | ✅ Yes | Data transformation |
| Math operations | ✅ Yes | Calculations |

## 🔍 Audit & Logging

### Audit Trail

All sensitive operations logged:

```typescript
interface AuditLog {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  resource: string;
  timestamp: DateTime;
  tenantId: string;
  ipAddress: string;
}
```

### Monitored Actions

- ✅ User login/logout
- ✅ Permission changes
- ✅ Data modifications
- ✅ Script execution
- ✅ Configuration changes
- ✅ Failed authentication attempts

## 🛡️ API Security

### Authentication Required

```typescript
// All endpoints require valid token
export async function GET(request: Request) {
  const token = request.headers.get('Authorization');
  const user = await verifyToken(token);
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  return new Response(JSON.stringify(data));
}
```

### Permission Checking

```typescript
async function checkPermission(userId: string, action: string, resource: string) {
  const user = await getUser(userId);
  
  if (user.level < requiredLevel) {
    throw new Error('Insufficient permissions');
  }
  
  return true;
}
```

### Rate Limiting

Prevent brute force attacks:

```bash
# Login attempts: 5 per minute
# API requests: 100 per minute
# Lua execution: 10 per second
```

## 🔐 Sensitive Data

### Classification

| Level | Storage | Access | Audit |
|-------|---------|--------|-------|
| **Critical** | Encrypted | Admin+ only | All | 
| **Sensitive** | Hashed | User+ | All |
| **Normal** | Plaintext | As configured | Some |
| **Public** | Plaintext | Public | None |

### Handling Secrets

```typescript
// ❌ Never do this
const API_KEY = "secret123";  // Hardcoded!

// ✅ Do this instead
const API_KEY = process.env.API_KEY;  // Environment variable
const hashedKey = sha512(API_KEY);  // Hash for storage
```

## 🚀 Security Best Practices

### For Developers

1. **Always hash passwords** - Use SHA-512
2. **Validate input** - Check type, length, format
3. **Check permissions** - Verify user level before action
4. **Log sensitive ops** - Audit trail required
5. **Encrypt secrets** - Never commit API keys
6. **Sanitize output** - Prevent XSS attacks
7. **Use types** - TypeScript prevents many bugs
8. **Test security** - Include security tests

### For Administrators

1. **Regular backups** - Daily encrypted backups
2. **Monitor logs** - Watch for suspicious activity
3. **Update immediately** - Apply security patches
4. **Strong passwords** - Enforce password policy
5. **Rotate secrets** - Regular credential rotation
6. **Limit access** - Principle of least privilege
7. **Verify integrations** - Vet third-party services
8. **Test recovery** - Verify backup restoration works

## 🔗 Related Documentation

- [Security Guidelines](../security/SECURITY.md) - Security policy
- [5-Level System](./5-level-system.md) - Permission model
- [Database Architecture](./database.md) - Data storage
- [API Development](../guides/api-development.md) - API security

## 📚 External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Security vulnerabilities
- [SHA-512 Hashing](https://en.wikipedia.org/wiki/SHA-2) - Password hashing
- [Lua Sandboxing](https://www.lua.org/manual/5.4/manual.html#4.6) - Script isolation
- [Multi-Tenancy](https://www.singletenancy.com/) - Isolation patterns
