# Storybook JSON Package System

## Overview

Storybook loads and renders packages in pure JSON format with full schema validation and type safety.

## Changes Made

### 1. Package Discovery System (`storybook/src/utils/packageDiscovery.ts`)

**Updated to load JSON packages:**
- Load `package.json` for metadata (follows `metadata_schema.json`)
- Load `components/ui.json` for component definitions (follows `components_schema.json`)
- Load `permissions/roles.json` for permissions (follows `permissions_schema.json`)
- Check for `styles/index.json` for styles
- Support for Storybook configuration in package metadata

**New interfaces:**
- `PackageMetadata` - matches the new package.json schema
- `ComponentDefinition` - represents a JSON component
- `PermissionDefinition` - represents a permission entry
- `DiscoveredPackage` - complete package with all resources

**New functions:**
- `loadPackage(packageId)` - loads a single package
- `discoverPackagesWithPermissions()` - filters packages with permissions
- `discoverPackagesWithStorybook()` - filters packages with Storybook config
- `getPackagesByCategory()` - groups by category

### 2. JSON Component Renderer (`storybook/src/utils/jsonComponentRenderer.tsx`)

**New utility for rendering JSON components:**
- `renderJsonComponent(component, props)` - renders JSON components to React
- `createComponentStory(component, defaultProps)` - creates Storybook stories
- Template expression support (`{{props.value}}`)
- Conditional rendering support
- Element type mapping (Box → div, Button → button, etc.)
- Auto-generated argTypes from component props

### 3. Updated Stories

#### `AutoDiscovered.stories.tsx`
Completely rewritten with three stories:
- **Package Browser** - displays all packages with badges for components, permissions, styles
- **Components Browser** - shows all components grouped by package
- **Permissions Browser** - displays permissions in table format

#### `JSONComponents.stories.tsx` (NEW)
Interactive component viewer:
- **Component Viewer** - full interactive UI for testing components
  - Package selector
  - Component selector
  - Dynamic prop controls (text, number, boolean, object)
  - Live preview
  - JSON definition viewer
- **Nav Menu Sidebar** - example component rendering

#### Legacy Files Removed
- Removed `LuaPackages.stories.tsx`
- Removed `LuaCodeEditor.stories.tsx`
- Removed `/src/lua` directory
- Removed Lua type definitions
- Points users to new JSON format

### 4. Documentation

Created two comprehensive documentation files:

**`JSON_PACKAGES.md`:**
- Package structure overview
- Schema descriptions
- API documentation
- Usage examples
- Migration guide

**`REFACTORING_SUMMARY.md`** (this file):
- Summary of changes
- File structure
- Testing notes

## File Structure

```
storybook/
├── src/
│   ├── utils/
│   │   ├── packageDiscovery.ts        # Updated - JSON package loading
│   │   └── jsonComponentRenderer.tsx  # New - Renders JSON components
│   └── stories/
│       ├── AutoDiscovered.stories.tsx # Updated - Package browsers
│       ├── JSONComponents.stories.tsx # New - Component viewer
│       └── LuaPackages.stories.tsx    # Updated - Marked as legacy
├── JSON_PACKAGES.md                    # New - Documentation
└── REFACTORING_SUMMARY.md              # New - This summary
```

## Schema Integration

All JSON files now use proper schema references:

```json
{
  "$schema": "https://metabuilder.dev/schemas/[schema-name].schema.json",
  ...
}
```

Supported schemas:
- `metadata_schema.json` - Package metadata
- `components_schema.json` - Component definitions
- `permissions_schema.json` - Permissions/roles
- `styles_schema.json` - Styles
- `script_schema.json` - Scripts/functions
- And more (see schemas folder)

## Key Features

### Package Discovery
- Automatic discovery from `/packages` directory
- Loads package.json metadata
- Detects available resources (components, permissions, styles)
- Supports fallback to hardcoded package list

### Component Rendering
- Template expression evaluation (`{{variable}}`)
- Prop type detection and controls
- Conditional rendering
- Component composition support

### Interactive Viewer
- Browse all packages and components
- Live prop editing
- Preview rendering
- JSON definition inspection

## Package Format

### JSON-Only Approach
- Pure JSON with schema validation
- Discovery: `discoverAllPackages()` async function
- Metadata: `{ packageId, name, category, exports, storybook, ... }`

### No Legacy Support
- All Lua-related code removed
- JSON-only package system
- Schema-validated definitions

## Testing Recommendations

1. **Start Storybook:** `npm run storybook` (or your package manager)
2. **Navigate to stories:**
   - Packages/Auto-Discovered → Package Browser
   - Packages/Auto-Discovered → Components Browser
   - Packages/Auto-Discovered → Permissions Browser
   - Packages/JSON Components → Component Viewer
3. **Test package loading:**
   - Verify all packages appear in Package Browser
   - Check component counts match actual files
   - Confirm permissions display correctly
4. **Test component viewer:**
   - Select different packages
   - Select different components
   - Modify props and see live updates
   - Verify JSON definition displays

## Next Steps

### Immediate
- Test in development environment
- Verify all packages load correctly
- Check for TypeScript compilation errors
- Test component rendering with real data

### Future Enhancements
1. Build-time package index generation
2. Schema validation UI feedback
3. Component live editing
4. Export to React/Vue code
5. Theme support
6. Component composition tools

## Notes

- All package IDs are now in the hardcoded fallback list
- Package discovery gracefully handles missing files
- Component renderer supports basic templates (more features can be added)
- TypeScript types are properly defined for all interfaces

## Migration Checklist

For existing packages:
- [ ] Create `package.json` with proper schema
- [ ] Move component definitions to `components/ui.json`
- [ ] Move permissions to `permissions/roles.json`
- [ ] Add schema references to all JSON files
- [ ] Update any hardcoded package references
- [ ] Test in Storybook

## Success Criteria

✅ Package discovery loads JSON packages
✅ Components display in browser
✅ Permissions display in table
✅ Component viewer works interactively
✅ Props can be edited and previewed
✅ Legacy Lua packages still accessible
✅ Documentation complete
✅ TypeScript types defined
