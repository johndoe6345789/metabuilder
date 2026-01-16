# MetaBuilder Codebase Recovery Plan

**Status**: 🚨 CRITICAL - Multiple fundamental blockers
**Date**: January 15, 2026
**Estimated Effort**: 3-4 hours to restore basic operations

---

## Executive Summary

The codebase is **broken at the foundation**. Basic operations (build, test, dev) do not work. Root causes are:

1. **DBAL TypeScript compilation fails** (16+ errors)
2. **Missing codegen script** (types.generated.ts never created)
3. **TypeScript strict mode violations** (exactOptionalPropertyTypes)
4. **Database not initialized** (no .db file, schema inconsistent)
5. **Frontend path conflicts** (multiple DBAL implementations)

**All feature work, refactoring, and TD-1 is BLOCKED until these are fixed.**

---

## Critical Issues & Fixes

### CRITICAL #1: DBAL Codegen Missing

**Problem**: `/dbal/shared/tools/codegen/gen_types.ts` does not exist
- npm script calls: `tsx ../shared/tools/codegen/gen_types.ts`
- What exists: Only `gen_types.py` and `generate-types.js`
- Result: Codegen fails, `types.generated.ts` never created
- Impact: 5 files can't import types → DBAL won't compile

**Fix**:
```bash
# Step 1: Check what codegen files exist
ls -la /dbal/shared/tools/codegen/gen*

# Step 2: Review what gen_types.py does
cat /dbal/shared/tools/codegen/gen_types.py

# Step 3: Port to TypeScript or update npm script
# Option A: Create gen_types.ts (port from Python)
# Option B: Update package.json script to use existing gen_types.py or generate-types.js
```

**Expected Result**: `npm run codegen` succeeds and creates `/dbal/development/src/core/foundation/types/types.generated.ts`

---

### CRITICAL #2: DBAL TypeScript Strict Mode Errors

**Problem**: `exactOptionalPropertyTypes: true` enabled in tsconfig, but code violates it

**Errors** (8 locations):
```
1. src/core/client/adapter-factory.ts:27,38,46 - Passing undefined to optional
2. src/core/client/factory.ts:37,47 - Same issue
3. src/bridges/websocket-bridge/state.ts:13 - exactOptionalPropertyTypes
4. src/core/kv/operations/batch.ts:59 - Type mismatch
5. src/core/kv/operations/write.ts:33 - Date|undefined vs Date
6. src/blob/index.ts:26 - Browser 'window' object
```

**Fix Options**:

**Option A (Recommended): Fix code to honor types**
```typescript
// BEFORE (WRONG)
return this.operations.pageConfigs  // might be undefined

// AFTER (CORRECT)
return this.operations.pageConfigs ?? createPageConfigOps()  // always defined
```

**Option B (Temporary): Relax type strictness**
```json
// In tsconfig.json, temporarily disable
"exactOptionalPropertyTypes": false
```

**Do NOT use Option B long-term** - it hides real type errors.

**Expected Result**: `npm run build` succeeds in `/dbal/development/`

---

### CRITICAL #3: Database Not Initialized

**Problem**: No database file exists anywhere
- Expected: `/prisma/dev.db` (SQLite)
- Found: Nothing
- Tests/dev server fail immediately

**Missing Files**:
- `/prisma/schema.prisma` exists but might be out of sync
- `/dbal/development/prisma/schema.prisma` does NOT exist (empty dir)
- `.db` file never created

**Fix**:
```bash
# Step 1: Verify schema exists
ls -la /prisma/schema.prisma

# Step 2: Generate Prisma client
npm run db:generate

# Step 3: Create database and apply schema
npm run db:push

# Step 4: Verify database created
ls -la /prisma/dev.db  # Should exist now
```

**Expected Result**: SQLite database created with schema

---

### CRITICAL #4: Frontend Path Conflicts

**Problem**: Multiple DBAL implementations causing import conflicts

```
/dbal/development/src/          ← Source (doesn't compile)
/dbal/development/dist/         ← Output (incomplete)
/frontends/nextjs/src/lib/dbal-client/        ← Old wrapper (20+ refs)
/frontends/nextjs/src/lib/database-dbal/      ← Newer wrapper (7 files)
/frontends/nextjs/src/lib/dbal/                ← Stubs (39 files, broken)
/frontends/nextjs/src/lib/db/core/dbal-client/ ← Integration stubs
```

**Current State**:
- Frontend `tsconfig.json` includes raw DBAL source files
- This bypasses the proper npm package resolution
- DBAL compiler errors become frontend errors
- Path alias `@/dbal` points to non-existent node_modules

**Fix**:
```json
// In frontends/nextjs/tsconfig.json, REMOVE this line:
"../../dbal/development/src/**/*",

// Keep only:
"@/dbal": "../../node_modules/@metabuilder/dbal"
```

Then, after DBAL builds successfully, old wrapper code becomes unused.

**Expected Result**: Frontend typecheck works without including DBAL source

---

### CRITICAL #5: Next.js Route Handler Signatures (4 routes)

**Problem**: Next.js 16 changed route handler signatures

**Affected Routes**:
- `/api/github/actions/runs/[runId]/logs`
- `/api/packages/data/[packageId]`
- (possibly 2 more)

**Old Signature** (doesn't work):
```typescript
export async function GET(req: Request, { params }: { params: Params }) {
  // params is immediate object
}
```

**New Signature** (required for Next.js 16):
```typescript
export async function GET(req: Request, context: { params: Promise<Params> }) {
  const params = await context.params  // params is now Promise
  // rest of code
}
```

**Fix**: Update all 4 route handlers to use `context: { params: Promise<> }` pattern.

---

## Implementation Sequence

### Phase 1: Fix DBAL Compilation (CRITICAL)

**1a. Create/fix codegen script**
```bash
cd /dbal/development
npm run codegen  # Should create types.generated.ts
```

**1b. Fix TypeScript errors**
- Edit 8 files with `exactOptionalPropertyTypes` violations
- Add proper null checks or type guards
- Or temporarily disable strict mode if absolutely stuck

**1c. Build DBAL**
```bash
npm run build  # Should output to dist/
# Verify: ls -la dist/index.js (should exist and have exports)
```

### Phase 2: Initialize Database

**2a. Generate Prisma**
```bash
npm run db:generate
```

**2b. Push schema**
```bash
npm run db:push
# Verify: ls -la /prisma/dev.db (should exist)
```

### Phase 3: Fix Frontend Imports

**3a. Update tsconfig.json**
- Remove raw DBAL source includes
- Keep only npm package alias

**3b. Fix Next.js routes**
- Update 4 route handlers to new signature

**3c. Test typecheck**
```bash
npm run typecheck  # Should pass
```

### Phase 4: Test Basic Operations

```bash
npm run build      # Should succeed
npm run dev        # Should start dev server
npm run test       # Should not crash on DB connect
```

---

## Verification Checklist

After each phase, verify:

- [ ] DBAL codegen runs without errors
- [ ] `types.generated.ts` exists
- [ ] `npm --prefix dbal/development run build` succeeds
- [ ] `/dbal/development/dist/index.js` exists and exports `getDBALClient`
- [ ] `/prisma/dev.db` exists
- [ ] `npm run typecheck` has 0 errors
- [ ] `npm run build` succeeds in Next.js
- [ ] `npm run dev` starts server
- [ ] At least one E2E test runs (doesn't need to pass yet)

---

## Known Issues After Recovery

After fixing these critical issues, these tech debt items remain:

- TD-1: DBAL Refactoring (100+ frontend files need updating)
- TD-2: Rate limiting (not implemented)
- TD-3: OpenAPI/Swagger (not implemented)
- TD-4: Error handling docs (not implemented)
- Multiple old adapter wrappers still in code (can be cleaned up)
- 39 incomplete DBAL stub files (can be deleted)

But at least the codebase will be **functional again**.

---

## Why This Happened

The codebase evolved through multiple phases without full completion:

1. **Phase 2 (TypeScript DBAL)** was started but not finished
   - Codegen script not ported from Python to TypeScript
   - TypeScript strict mode enabled without fixing violations
   - Types not generated, so no export types available

2. **Multiple DBAL implementations**  created as workarounds
   - `/lib/dbal-client/` - Old adapter wrapper
   - `/lib/database-dbal/` - New wrapper attempt
   - `/lib/dbal/` - Integration stubs (39 files)
   - None of these are "official" DBAL client

3. **Database never fully initialized**
   - Schema in root `/prisma/` (should be in `/dbal/`)
   - No `.db` file created
   - Seed process never ran

4. **Workspace setup incomplete**
   - DBAL intended as npm package (correct direction)
   - But never finished implementing (no dist, no exports)

---

## Token Budget Note

Estimated effort to execute this recovery plan:
- Reading/understanding: 30 min (done)
- Codegen fix: 30 min - 1 hour
- TypeScript fixes: 1-2 hours (8 locations to fix)
- Database init: 15 min
- Frontend fixes: 30 min
- Testing/verification: 30 min

**Total: 3-4 hours of concentrated work**

Recommend focusing on CRITICAL #1-4 first to get basic operations working. Then TD-1 refactoring can proceed with a solid foundation.

