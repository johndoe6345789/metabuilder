# Linting Status & Cleanup Plan

## Current Status
**Total Warnings: 525**

The codebase currently has 525 ESLint/TypeScript warnings across the project. These are **warnings, not errors**, meaning the application builds and runs successfully.

## Warning Categories

### 1. TypeScript `any` Types (Most Common - ~300 warnings)
**Issue:** `@typescript-eslint/no-explicit-any`
**Files Affected:** Nearly all files with type annotations
**Priority:** Medium
**Reason:** The app uses a highly dynamic JSON-driven architecture where strict typing is challenging

**Strategy:**
- Create proper TypeScript interfaces for JSON schemas
- Use `unknown` instead of `any` where appropriate
- Add type guards for runtime validation
- Consider using `Record<string, unknown>` for truly dynamic objects

### 2. Unused Variables/Imports (~100 warnings)
**Issue:** `@typescript-eslint/no-unused-vars`
**Files Affected:** Throughout the codebase
**Priority:** High (easy wins)
**Examples:**
- Unused imports like `Toaster`, `CardContent`, `Label`
- Unused destructured values
- Unused function parameters

**Strategy:**
- Remove unused imports
- Prefix unused parameters with `_` (e.g., `_config`, `_index`)
- Remove dead code

### 3. React Hooks Dependencies (~50 warnings)
**Issue:** `react-hooks/exhaustive-deps`
**Files Affected:** Components with useEffect, useCallback, useMemo
**Priority:** Medium-High (can cause bugs)

**Strategy:**
- Add missing dependencies
- Use useCallback for function dependencies
- Wrap objects/arrays in useMemo
- Carefully evaluate exhaustive-deps warnings (some may be intentional)

### 4. Fast Refresh Export Issues (~15 warnings)
**Issue:** `react-refresh/only-export-components`
**Files Affected:** UI component files that also export constants
**Priority:** Low (doesn't affect production)

**Strategy:**
- Move constants to separate files
- Use `allowConstantExport` (already enabled in config)

### 5. Specific File Issues
- Empty catch blocks (use comment or remove console.log) - **FIXED**
- Naming conflicts (EmptyState, LoadingState, StatCard) - **FIXED**
- Missing type definitions in orchestration/JSON-UI systems

## Pragmatic Approach

Given the codebase is **a low-code/no-code platform that generates code**, many `any` types are justifiable:
- JSON schemas are inherently dynamic
- Component props are defined at runtime
- The system needs flexibility for code generation

## Cleanup Phases

### Phase 1: Quick Wins (Completed)
- [x] Fix naming conflicts in component exports
- [x] Remove empty catch blocks with unused error variables
- [ ] Remove unused imports (automated with IDE)
- [ ] Prefix unused args with underscore

### Phase 2: Type Safety
- [ ] Create comprehensive interfaces for JSON schemas
- [ ] Replace `any` with `unknown` in data sources
- [ ] Add type guards for runtime validation
- [ ] Define proper types for component registry

### Phase 3: React Best Practices
- [ ] Fix exhaustive-deps warnings
- [ ] Optimize re-renders with proper memoization
- [ ] Extract constants from component files

### Phase 4: Architecture
- [ ] Consider using Zod schemas for runtime validation
- [ ] Generate TypeScript types from JSON schemas
- [ ] Implement stricter typing in orchestration layer

## Notes
- Warnings are currently set to not fail the build (they're warnings, not errors)
- The app functions correctly despite these warnings
- Many warnings are inherent to the flexible/dynamic nature of the platform
- Prioritize fixing warnings that could cause actual bugs (hooks deps, unused vars)

## CI/CD Linting
Current lint job shows warnings but doesn't fail. Consider:
1. Keeping current behavior (warnings only)
2. OR: Setting error threshold (fail if > X warnings)
3. OR: Making specific rules errors (e.g., no-unused-vars)

## Related Files
- `eslint.config.js` - ESLint configuration
- `.github/workflows/lint.yml` - CI lint workflow
