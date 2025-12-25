# Fix Security Issue

Address security vulnerabilities in MetaBuilder:

## Common Security Fixes

### 1. Missing Tenant Isolation
```typescript
// ❌ Vulnerable
const data = await Database.getData()

// ✅ Fixed
const data = await Database.getData({ tenantId: user.tenantId })
```

### 2. Permission Bypass
```typescript
// ❌ Missing check
async function adminAction() { /* ... */ }

// ✅ With check
async function adminAction(user: User) {
  if (user.level < 3) throw new Error('Admin required')
  /* ... */
}
```

### 3. Lua Sandbox Escape
```lua
-- ❌ Never allow these in Lua scripts
os.execute()
io.open()
require()
loadfile()

-- ✅ Sandbox enforces restrictions automatically
```

### 4. Raw SQL/Prisma
```typescript
// ❌ Bypass Database wrapper
prisma.$queryRaw`SELECT * FROM users`

// ✅ Use Database class
Database.getUsers({ tenantId })
```

## Security Scan
```bash
npm run security-scan  # If available
npm audit              # Check dependencies
```
