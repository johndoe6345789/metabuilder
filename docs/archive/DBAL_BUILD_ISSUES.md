# DBAL Build Issues - Pre-existing Code Problems

**Discovered**: January 15, 2026
**Blocking**: TD-1 Phase 2 Frontend Refactoring
**Severity**: 🔴 CRITICAL - DBAL cannot be built/compiled

---

## Issue Summary

When attempting to build DBAL for workspace integration, `npm run build` (TypeScript compilation) fails with multiple errors:

### Error 1: Missing Generated Types File

```
src/core/foundation/types/auth/index.ts(1,85): error TS2307:
Cannot find module '../types.generated' or its corresponding type declarations.
```

**Location**: Multiple files import from `../types.generated`:
- `src/core/foundation/types/auth/index.ts`
- `src/core/foundation/types/automation/index.ts`
- `src/core/foundation/types/content/index.ts`
- `src/core/foundation/types/packages/index.ts`
- `src/core/foundation/types/users/index.ts`

**Expected File**: `/dbal/development/src/core/foundation/types/types.generated.ts` (does not exist)

### Error 2: CodeGen Failure

Running the codegen command to generate `types.generated`:

```bash
npm run codegen
# Runs: tsx ../shared/tools/codegen/gen_types.ts
# Result: Command fails with exit code 1
```

**Root Cause**: The codegen script itself has errors or dependencies missing.

### Error 3: TypeScript Strict Mode Errors

Even if types.generated were created, additional TypeScript errors exist:

```
src/core/kv/operations/batch.ts(59,3): error TS2375:
Type '...' is not assignable to type 'KVListResult' with 'exactOptionalPropertyTypes: true'
```

**Root Cause**: DBAL has `exactOptionalPropertyTypes: true` in tsconfig, but code doesn't properly handle optional types.

---

## Impact

| Component | Status | Impact |
|-----------|--------|--------|
| DBAL TypeScript Build | 🔴 FAILING | Cannot compile to dist/ |
| Workspace @/dbal Resolution | ✅ READY | Set up correctly, waiting for build |
| Frontend db-client Import | ⏳ BLOCKED | Can't import until DBAL dist exists |
| TD-1 Refactoring | ⏳ BLOCKED | Needs DBAL to build first |

---

## Solution Options

### Option A: Fix DBAL Build (Recommended)

**Tasks**:
1. Fix CodeGen script in `/dbal/shared/tools/codegen/gen_types.ts`
2. Run `npm run codegen` to generate `types.generated.ts`
3. Fix `exactOptionalPropertyTypes` errors in KV operations:
   - `src/core/kv/operations/batch.ts:59`
   - `src/core/kv/operations/write.ts:33`
4. Run `npm run build` successfully
5. Resume TD-1 refactoring

**Effort**: Medium (debugging codegen + type fixes)

### Option B: Temporarily Disable Type Checking

**Tasks**:
1. In `dbal/development/tsconfig.json`, set `"skipLibCheck": true`
2. Try build again
3. If still fails, identify remaining errors
4. Fix critical errors, ignore type strictness for now

**Risk**: Lower type safety, but allows progress

### Option C: Create Stub Generated Types

**Tasks**:
1. Create empty `types.generated.ts` file with type stubs
2. Compile DBAL
3. Return later to implement proper codegen

**Risk**: Types will be wrong/incomplete

---

## Files Involved

**Codegen Script** (needs fixing):
- `/dbal/shared/tools/codegen/gen_types.ts`

**Missing Generated File**:
- `/dbal/development/src/core/foundation/types/types.generated.ts` (should be here)

**Type Errors** (need fixing):
- `/dbal/development/src/core/kv/operations/batch.ts` - line 59
- `/dbal/development/src/core/kv/operations/write.ts` - line 33

**Configuration**:
- `/dbal/development/tsconfig.json` - has `exactOptionalPropertyTypes: true`

---

## Next Steps

**Immediate**: Choose Option A, B, or C above

**Then**: After DBAL builds successfully:
1. Run `npm --prefix dbal/development run build`
2. Verify `dbal/development/dist/` exists
3. Resume TD-1 Phase 2 frontend refactoring

---

## Workspace Setup Status

✅ **Already Complete** (not blocked by DBAL build):
- dbal/development added to workspaces
- @metabuilder/dbal added to frontend dependencies
- TypeScript path aliases configured
- npm install works

⏳ **Waiting for DBAL Build Fix**:
- DBAL compilation to dist/
- Frontend @/dbal imports to resolve

---

## Token Note

Workspace setup is complete and correct. The DBAL build issues are pre-existing code problems that need to be fixed separately. Recommend fixing DBAL build as next task (separate from TD-1).
