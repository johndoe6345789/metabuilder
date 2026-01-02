# Lua Removal Plan for Next.js Frontend

## Overview

Remove all Lua execution and replace with JSON-based package loading.

## Directories to Remove

### Complete Removal
- `/src/lib/lua/` - Entire Lua engine, execution, and utilities
- `/src/lib/lua-lib/` - Lua library utilities
- `/src/lib/db/lua-scripts/` - Lua script database operations
- `/src/components/editors/lua/` - Lua editor components
- `/src/components/LuaBlocksEditor.tsx`
- `/src/components/LuaEditor.tsx`
- `/src/components/LuaSnippetLibrary.tsx`

### Individual Files
- `/src/lib/lua-engine.ts`
- `/src/lib/lua-examples.ts`
- `/src/lib/lua-snippets.ts`

## Files to Update

### Replace Lua Package Loading
- `/src/lib/ui-pages/load-page-from-lua-packages.ts` → Convert to JSON loading
- `/src/lib/lua/ui/load-lua-ui-package.ts` → Create JSON equivalent
- `/src/lib/lua/ui/generate-component-tree.tsx` → Update for JSON

### Remove Lua References
- `/src/app/ui/[[...slug]]/page.tsx` - Update to use JSON packages
- `/src/lib/rendering/declarative-component-renderer/lua/` - Remove Lua execution
- `/src/lib/workflow/nodes/execute-lua-node.ts` - Remove or replace
- `/src/lib/security/functions/scanners/language-scanners/scan-lua.ts` - Remove

### Database Operations
- Remove lua-scripts tables/operations
- Keep general script storage for JSON

## Replacement Strategy

### 1. JSON Package Loader
Create `/src/lib/packages/json/load-json-package.ts`:
- Load package.json metadata
- Load components/ui.json
- Load permissions/roles.json
- No code execution, pure data loading

### 2. JSON Component Renderer
Create `/src/lib/rendering/json-component-renderer.tsx`:
- Render JSON component definitions
- Template expression evaluation
- Conditional rendering
- Use component registry

### 3. Page Loading
Update `/src/lib/ui-pages/load-page-from-json-packages.ts`:
- Load pages from JSON packages
- No Lua execution
- Pure declarative rendering

## Testing Strategy

1. Create JSON package loader
2. Test with existing JSON packages
3. Update page rendering
4. Remove Lua directories
5. Remove Lua database operations
6. Update all imports
7. Test full application

## Implementation Order

1. ✅ Create JSON package loading utilities
2. ✅ Update component rendering for JSON
3. ✅ Update page loading
4. Remove Lua directories
5. Remove Lua components
6. Update database schema
7. Update imports and references
8. Test and validate
