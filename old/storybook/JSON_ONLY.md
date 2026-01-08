# Storybook JSON-Only System

## Overview

Storybook has been fully converted to use **JSON-only** packages. All Lua-related code has been removed.

## What Was Removed

### Files Deleted
- `/src/lua/` - Entire Lua execution directory
- `/src/discovery/` - Lua-specific package discovery
- `/src/mocks/lua-engine.ts` - Lua engine mocks
- `/src/types/fengari.d.ts` - Lua type definitions
- `/src/types/lua-types.ts` - Lua type definitions
- `/src/components/LuaPackageRenderer.tsx` - Lua rendering component
- `/src/stories/LuaPackages.stories.tsx` - Lua package stories
- `/src/stories/LuaCodeEditor.stories.tsx` - Lua code editor stories

### Code Changes
- `/src/components/registry.tsx` - Removed `LuaScriptViewer` component and Lua helper functions
- `/.storybook/main.ts` - Updated comments to reference JSON packages
- All `LuaComponentProps` renamed to `ComponentProps`

## What Remains

### Core JSON System
- `/src/utils/packageDiscovery.ts` - JSON package discovery
- `/src/utils/jsonComponentRenderer.tsx` - JSON component rendering
- `/src/stories/AutoDiscovered.stories.tsx` - Package browsers
- `/src/stories/JSONComponents.stories.tsx` - Interactive component viewer
- `/src/components/registry.tsx` - Component registry (JSON-compatible)

## Package Format

All packages now use pure JSON:

```
packages/
  my_package/
    package.json          # Metadata (required)
    components/
      ui.json             # Components (optional)
    permissions/
      roles.json          # Permissions (optional)
    styles/
      index.json          # Styles (optional)
```

## Benefits of JSON-Only Approach

1. **Simpler** - No Lua runtime, no compilation
2. **Safer** - No code execution, just data loading
3. **Faster** - Direct JSON parsing
4. **Validated** - All files reference JSON schemas
5. **Type-safe** - TypeScript types for all structures
6. **Portable** - Works anywhere JSON works

## Available Stories

Navigate to these sections in Storybook:

- **Packages/Auto-Discovered**
  - Package Browser - View all packages
  - Components Browser - Browse all components
  - Permissions Browser - View all permissions

- **Packages/JSON Components**
  - Component Viewer - Interactive component tester
  - Nav Menu Sidebar - Example component

## Component Rendering

JSON components are rendered using `jsonComponentRenderer.tsx`:

```typescript
import { renderJsonComponent } from '../utils/jsonComponentRenderer'

// Load component from JSON
const component = await loadPackage('my_package')
  .then(pkg => pkg.components.find(c => c.id === 'my_component'))

// Render with props
const element = renderJsonComponent(component, {
  title: 'Hello',
  subtitle: 'World'
})
```

## Schema Validation

All JSON files include schema references:

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-metadata.schema.json",
  "packageId": "my_package",
  ...
}
```

IDEs and validators can use these to provide:
- Autocomplete
- Validation
- Documentation
- Error checking

## Next Steps

1. Remove any remaining Lua references in package files
2. Ensure all packages have proper `package.json`
3. Add schema references to all JSON files
4. Test package loading in Storybook
5. Extend JSON component renderer as needed

## FAQ

### Can I still run Lua code?

No. All Lua support has been removed from Storybook. Use JSON component definitions instead.

### How do I convert Lua components to JSON?

1. Extract component structure from Lua
2. Map to JSON component schema
3. Use declarative template format
4. Add to `components/ui.json`

### What about dynamic behavior?

JSON components support:
- Template expressions (`{{props.value}}`)
- Conditional rendering
- Iteration over arrays
- Event handlers (via registry)

For complex logic, implement in TypeScript and reference from JSON.

### Where are the schemas?

All schemas are in `/schemas/package-schemas/` and served at runtime via `/schemas/`.

## Support

For questions or issues:
1. Check the schema documentation in `/schemas/`
2. Review example packages in `/schemas/package-schemas/examples/`
3. Examine working packages in `/packages/`
4. Open an issue if needed
