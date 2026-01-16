# TD-1 DBAL Refactoring - Step-by-Step Execution Guide

> This guide provides the exact refactoring pattern for migrating 100+ frontend files from old `getAdapter()` to new `getDBALClient()` pattern.

**Created**: January 15, 2026
**Status**: Ready for automation/batch processing
**Scope**: 14 Prisma imports + 110+ getAdapter() calls across ~100 files

---

## Quick Summary

### Old Pattern (❌ Remove)
```typescript
// OLD 1: Direct Prisma import
import { prisma } from '@/lib/config/prisma'
const users = await prisma.user.findMany()

// OLD 2: getAdapter() pattern
import { getAdapter } from '@/lib/dbal-client/adapter/get-adapter'
const adapter = getAdapter()
const result = await adapter.list('User', { ... })

// OLD 3: database-dbal wrappers
import { dbalGetUsers } from '@/lib/database-dbal/users/dbal-get-users.server'
```

### New Pattern (✅ Use)
```typescript
// NEW: Unified db-client
import { db } from '@/lib/db-client'

// Type-safe entity operations
const users = await db.users.list()
const user = await db.users.findOne({ id: '123' })
const newUser = await db.users.create({ name: 'John' })
```

---

## Refactoring Steps

### Step 1: Files Using Prisma Import (`@/lib/config/prisma`)

**14 files need updating**:

1. `/frontends/nextjs/src/lib/ui-pages/load-page-from-db.ts`
2. `/frontends/nextjs/src/lib/db/functions/app-config/get-app-config.ts`
3. `/frontends/nextjs/src/lib/db/functions/app-config/set-app-config.ts`
4. `/frontends/nextjs/src/lib/db/functions/components/crud/add-component-node.ts`
5. `/frontends/nextjs/src/lib/db/functions/components/crud/delete-component-node.ts`
6. `/frontends/nextjs/src/lib/db/functions/components/crud/update-component-node.ts`
7. `/frontends/nextjs/src/lib/db/functions/components/hierarchy/get-component-configs.ts`
8. `/frontends/nextjs/src/lib/db/functions/components/hierarchy/get-component-hierarchy.ts`
9. `/frontends/nextjs/src/lib/db/functions/components/hierarchy/set-component-hierarchy.ts`
10. `/frontends/nextjs/src/lib/db/functions/comments/crud/add-comment.ts`
11. `/frontends/nextjs/src/lib/db/functions/comments/crud/delete-comment.ts`
12. `/frontends/nextjs/src/lib/db/functions/comments/crud/get-comments.ts`
13. `/frontends/nextjs/src/lib/db/functions/comments/crud/set-comments.ts`
14. `/frontends/nextjs/src/lib/db/functions/comments/crud/update-comment.ts`

**Refactoring Pattern**:

```typescript
// BEFORE
import { prisma } from '@/lib/config/prisma'

export async function getAppConfig() {
  return prisma.appConfig.findFirst()
}

// AFTER
import { db } from '@/lib/db-client'

export async function getAppConfig() {
  // Use type-safe entity operations from DBAL
  return db.appConfig.findOne()
}
```

**Refactoring Rule**: Replace `prisma.entity.findMany()` → `db.entity.list()`, `prisma.entity.findFirst()` → `db.entity.findOne()`, etc.

---

### Step 2: Files Using getAdapter() Pattern

**110+ calls across ~90 files in `/lib/db/` directory**

**Refactoring Pattern**:

```typescript
// BEFORE
import { getAdapter } from '@/lib/dbal-client/adapter/get-adapter'

export async function listUsers() {
  const adapter = getAdapter()
  return adapter.list('User', { limit: 10 })
}

// AFTER
import { db } from '@/lib/db-client'

export async function listUsers() {
  return db.users.list({ limit: 10 })
}
```

**Key Mappings**:
- `adapter.list('User')` → `db.users.list()`
- `adapter.findOne('User', { id })` → `db.users.findOne({ id })`
- `adapter.create('User', data)` → `db.users.create(data)`
- `adapter.update('User', id, data)` → `db.users.update(id, data)`
- `adapter.delete('User', id)` → `db.users.delete(id)`

---

### Step 3: Delete Old Modules

After all files are refactored, delete:

```bash
# Remove old duplicate code
rm -rf /frontends/nextjs/src/lib/dbal-client/
rm -rf /frontends/nextjs/src/lib/database-dbal/
rm /frontends/nextjs/src/lib/config/prisma.ts
```

**Verify no imports remain**:
```bash
grep -r "from '@/lib/dbal-client" frontends/nextjs/src/
grep -r "from '@/lib/database-dbal" frontends/nextjs/src/
grep -r "from '@/lib/config/prisma" frontends/nextjs/src/
```

Should return **0 results**.

---

### Step 4: Update TypeScript Configuration

**File**: `/frontends/nextjs/tsconfig.json`

No changes needed - path alias `@/lib/*` already points to correct location.

---

### Step 5: Verification Checklist

- [ ] All 14 Prisma imports replaced with db-client
- [ ] All 110+ getAdapter() calls replaced with db.entity operations
- [ ] Grep confirms 0 remaining old imports
- [ ] `/frontends/nextjs/src/lib/dbal-client/` deleted
- [ ] `/frontends/nextjs/src/lib/database-dbal/` deleted
- [ ] `/frontends/nextjs/src/lib/config/prisma.ts` deleted
- [ ] `/frontends/nextjs/src/lib/db-client.ts` exists and exports `db`
- [ ] Tests pass: `npm run test:e2e`
- [ ] Build succeeds: `npm run build`

---

## Implementation Approach

### Option A: Automated (Recommended for Large Refactoring)

Use sed/regex to bulk replace patterns:

```bash
# Replace getAdapter pattern
find frontends/nextjs/src -name "*.ts" -type f -exec sed -i \
  's/import { getAdapter } from.*getAdapter.ts/import { db } from "@\/lib\/db-client"/g' {} \;

# Replace adapter.list calls
find frontends/nextjs/src -name "*.ts" -type f -exec sed -i \
  's/adapter\.list('\''User'\''/db.users.list(/g' {} \;

# Replace prisma imports
find frontends/nextjs/src -name "*.ts" -type f -exec sed -i \
  's/import { prisma } from.*config\/prisma/import { db } from "@\/lib\/db-client"/g' {} \;
```

### Option B: Manual (Better for verification)

Use IDE find-replace with regex:
1. Find: `import { getAdapter } from '@/lib/dbal-client/adapter/get-adapter'`
   Replace: `import { db } from '@/lib/db-client'`
2. Find: `adapter\.list\('(\w+)',`
   Replace: `db.${1.toLowerCase()}.list(`
3. And so on...

### Option C: Git-Based (Safest)

1. Create new branch: `git checkout -b td-1-dbal-refactor`
2. Perform refactoring in small chunks
3. Test after each chunk
4. Commit with message: `chore: Refactor [area] from getAdapter to db-client`
5. Create PR when complete

---

## Files Requiring Changes by Category

### Category 1: Prisma Direct Import (14 files)
All in `/lib/db/functions/` - Replace `prisma.X.findMany()` with `db.X.list()`

### Category 2: getAdapter() Calls (90+ files)
In `/lib/db/` - Replace `adapter.list('Entity')` with `db.entity.list()`

### Category 3: Page Routes (10 files)
In `/app/**` - Replace `getAdapter()` calls with `db` operations

### Category 4: Auth Functions (3 files)
In `/lib/auth/` - Replace adapter patterns with db operations

---

## Expected Outcomes After Refactoring

✅ **DBAL is self-contained**:
- Can be versioned independently
- Can be deployed separately from Next.js
- Reusable by other frontends

✅ **No code duplication**:
- Single adapter implementation (in DBAL)
- No duplicate prisma.ts files
- One true source of truth

✅ **Proper abstraction**:
- Frontend uses high-level entity operations
- No raw adapter access
- Type-safe database calls

✅ **Clean architecture**:
- Clear separation: Frontend uses `/lib/db-client.ts`
- DBAL exports: `getDBALClient()`, `seedDatabase()`, `getPrismaClient()`
- All database logic in `/dbal/development/src/`

---

## Testing Strategy

After refactoring:

```bash
# 1. Generate Prisma schema from YAML
npm --prefix dbal/development run codegen:prisma

# 2. Create database (SQLite for dev)
npm --prefix dbal/development run db:push

# 3. Run unit tests
npm run test:unit

# 4. Run E2E tests
npm run test:e2e

# 5. Build for production
npm run build
```

All tests should pass without modification.

---

## Rollback Plan

If something breaks:

```bash
# Restore backup
git checkout HEAD~1 frontends/nextjs/src/lib/

# Or use git to revert changes
git revert <commit-sha>
```

---

## Success Criteria

**TD-1 is COMPLETE when**:

✅ All 14 Prisma imports replaced
✅ All 110+ getAdapter() calls replaced
✅ `/lib/dbal-client/` deleted
✅ `/lib/database-dbal/` deleted
✅ `/lib/config/prisma.ts` deleted
✅ `/lib/db-client.ts` is sole integration point
✅ All tests pass
✅ Build succeeds
✅ Git grep shows 0 old imports

---

## Commands for Batch Processing

**Find all files with getAdapter**:
```bash
grep -r "getAdapter" frontends/nextjs/src --include="*.ts" | wc -l
```

**Find all files with prisma import**:
```bash
grep -r "from '@/lib/config/prisma" frontends/nextjs/src --include="*.ts"
```

**Find all files with old database-dbal import**:
```bash
grep -r "from '@/lib/database-dbal" frontends/nextjs/src --include="*.ts"
```

**Count total refactoring scope**:
```bash
echo "Total getAdapter calls:"; \
grep -r "getAdapter()" frontends/nextjs/src --include="*.ts" | wc -l; \
echo "Total Prisma imports:"; \
grep -r "@/lib/config/prisma" frontends/nextjs/src --include="*.ts" | wc -l; \
echo "Total database-dbal imports:"; \
grep -r "@/lib/database-dbal" frontends/nextjs/src --include="*.ts" | wc -l
```

---

## Next: Start Refactoring

**Ready to proceed?** Pick one approach:
- **For quick completion**: Use Option A (automated sed)
- **For safety**: Use Option C (git-based, chunk by chunk)
- **For precision**: Use Option B (IDE find-replace)

All approaches should result in the same outcome.
