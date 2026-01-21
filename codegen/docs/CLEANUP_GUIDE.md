# ESLint Warning Cleanup Guide

This document provides patterns for quickly fixing the 525 ESLint warnings in the codebase.

## Quick Fixes

### 1. Unused Imports
**Pattern:** `'X' is defined but never used`

**Fix:** Remove the import
```typescript
// Before
import { Card, CardContent, Label } from '@/components/ui'

// After  
import { Card } from '@/components/ui'
```

### 2. Unused Function Parameters
**Pattern:** `'paramName' is defined but never used`

**Fix:** Prefix with underscore
```typescript
// Before
const handleClick = (event, index) => {
  doSomething()
}

// After
const handleClick = (_event, _index) => {
  doSomething()
}
```

### 3. Unused Destructured Variables
**Pattern:** `'variable' is assigned a value but never used`

**Fix:** Remove from destructuring
```typescript
// Before
const { data, error, isLoading } = useQuery()

// After
const { data } = useQuery()
```

### 4. Empty Catch Blocks
**Pattern:** `Empty block statement`

**Fix:** Add comment or remove unused error
```typescript
// Before
try {
  JSON.parse(value)
} catch (error) {
  console.debug('Invalid JSON:', error)
}

// After
try {
  JSON.parse(value)
} catch {
  // Ignore invalid JSON during typing
}
```

### 5. React Hook Dependencies
**Pattern:** `React Hook X has missing dependencies`

**Fix:** Add dependencies or suppress with comment
```typescript
// Option 1: Add dependency
useEffect(() => {
  fetchData(id)
}, [id, fetchData]) // Added fetchData

// Option 2: Intentionally ignore (with explanation)
useEffect(() => {
  // Only run on mount
  initialize()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

### 6. `any` Types in Dynamic JSON Systems
**Pattern:** `Unexpected any. Specify a different type`

**When to keep:** JSON schemas, component registries, dynamic props
**When to fix:** Function parameters, return types, simple objects

```typescript
// Keep any for truly dynamic systems
interface ComponentRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: React.ComponentType<any>
}

// Fix for known structures
interface UserData {
  id: string
  name: string
  email: string
}
```

## Automated Fixes

### Using VSCode
1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Run "ESLint: Fix all auto-fixable Problems"
3. Review changes before committing

### Using CLI
```bash
# Fix all auto-fixable issues
npm run lint -- --fix

# Fix specific file
npx eslint --fix src/components/MyComponent.tsx
```

## Priority Order

1. **High Priority** (Can cause bugs)
   - Remove unused variables that shadow others
   - Fix exhaustive-deps that could cause stale closures
   - Fix typing errors in function calls

2. **Medium Priority** (Code quality)
   - Remove unused imports (speeds up builds)
   - Prefix unused params with underscore
   - Add proper types where straightforward

3. **Low Priority** (Cosmetic)
   - Fast refresh warnings
   - any types in JSON/dynamic systems
   - Optional chaining suggestions

## Files to Skip (For Now)

These files have intentionally loose typing due to their dynamic nature:
- `src/lib/json-ui/**/*.ts` - JSON-driven UI system
- `src/config/orchestration/**/*.ts` - Dynamic orchestration
- `src/schemas/**/*.ts` - Schema definitions with any
- `packages/spark-tools/**/*.ts` - External package

## Bulk Patterns to Search/Replace

### Remove unused console imports
Search: `import.*console.*from`
Action: Review and remove if not used

### Fix underscore params
Search: `\(([a-z]+),\s*([a-z]+)\)\s*=>`
Review: Check if params are used, prefix with _ if not

### Empty catch blocks with unused error
Search: `catch\s*\(error\)\s*\{[^}]*\}`
Replace: `catch { /* intentionally empty */ }`

## Testing After Cleanup

1. Run full lint: `npm run lint`
2. Run type check: `npm run type-check` (if available)
3. Run tests: `npm test`
4. Build: `npm run build`
5. Manual smoke test in dev: `npm run dev`

## Notes

- Don't fix all 525 at once - do batches by file/directory
- Always test after each batch
- Commit frequently with clear messages
- Some `any` types are justified in this codebase
- Focus on fixes that improve code quality, not just reduce warnings
