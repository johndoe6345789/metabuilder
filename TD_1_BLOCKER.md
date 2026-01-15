# TD-1 BLOCKER: DBAL Workspace Dependency Setup

**Status**: 🚨 Blocking Phase 2 Frontend Refactoring
**Severity**: Critical - Prevents 100+ file refactoring from proceeding

---

## Problem

The DBAL refactoring requires DBAL to be available as a **workspace dependency** that the frontend can import from, but currently:

1. **DBAL is not a workspace dependency**
   - `/dbal/development/` exists but is not linked in root `package.json` workspaces
   - Frontend path alias `@/dbal` → `../../dbal/development/src` points to source, not built module
   - `import { getDBALClient } from '@/dbal'` fails because module can't be resolved at runtime

2. **DBAL needs to be built before frontend can use it**
   - DBAL has TypeScript source in `src/` directory
   - Needs to compile to `dist/` via `npm run build`
   - Package.json specifies `main: dist/index.js` but dist may not exist

3. **Frontend path alias points to source, not dist**
   - Current: `@/dbal` → `../../dbal/development/src`
   - Should be: `@/dbal` → `../../dbal/development/dist` (after building)
   - OR: Set up proper npm workspace

---

## Root Cause

The original design had `getAdapter()` exported directly from frontend code, so there was no external DBAL dependency. Now we're externalizing DBAL, but the build/dependency setup hasn't been configured.

---

## Solution Options

### Option A: Set Up npm Workspaces (Recommended)

**Steps**:
1. Update root `package.json` to define workspaces
2. Update `@/dbal` path alias to use npm resolution (not relative path)
3. DBAL builds automatically when frontend installs
4. Cleaner separation: DBAL is a proper package dependency

**Implementation**:
```json
// root package.json
{
  "workspaces": [
    "dbal/development",
    "frontends/nextjs"
  ]
}
```

```json
// frontends/nextjs/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/dbal": ["../../../dbal/development/dist"],
      "@/dbal/*": ["../../../dbal/development/dist/*"],
      "@/*": ["./src/*"]
    }
  }
}
```

### Option B: Build DBAL First

**Steps**:
1. Manually build DBAL: `npm --prefix dbal/development run build`
2. Keep path alias pointing to `dist/`
3. Simple but requires manual build steps

### Option C: Keep Everything as Source

**Steps**:
1. Update DBAL tsconfig to compile to same location
2. Update path aliases to point to source
3. Works but less clean

---

## Recommendation

**Use Option A (npm Workspaces)** because:
- Standard Node.js practice
- Automatic build integration
- Clear separation of concerns
- Enables independent versioning of DBAL
- Supports Phase 3 C++ daemon transition later

---

## Next Steps

1. **Document workspace setup** in separate task
2. **Update root package.json** with workspaces declaration
3. **Update frontend tsconfig.json** paths
4. **Build DBAL**: `npm install && npm --prefix dbal/development run build`
5. **Verify**: `npm --prefix frontends/nextjs run typecheck`
6. **Resume TD-1 Phase 2** refactoring after workspace is working

---

## Files to Modify

1. `/package.json` (root) - Add workspaces
2. `/frontends/nextjs/tsconfig.json` - Update paths
3. `/dbal/development/tsconfig.json` (verify output dir)

---

## Blocker Details

```
Error: Cannot find module '@/lib/db-client' or its corresponding type declarations
Reason: db-client imports @/dbal, but @/dbal not resolvable at runtime
Fix: Set up proper DBAL package dependency via workspaces
```

---

## Token Note

Estimated effort: 2-3 hours of careful setup work
Recommend: User decision on whether to proceed with workspace setup, or continue with other TD items first (TD-2, TD-3, TD-4 don't have this blocker)
