# JSON Package Format in Storybook

This document describes the Storybook integration for loading packages in pure JSON format.

## Overview

Storybook supports the JSON-based package format defined in the `/schemas/package-schemas/` directory. All packages use pure JSON definitions that are easy to work with, validate, and extend.

## Package Structure

Packages are now defined using JSON files with the following structure:

```
packages/
  my_package/
    package.json          # Package metadata (schema: metadata_schema.json)
    components/
      ui.json             # Component definitions (schema: components_schema.json)
    permissions/
      roles.json          # Permission definitions (schema: permissions_schema.json)
    styles/
      index.json          # Style definitions (schema: styles_schema.json)
    scripts/
      functions.json      # Script definitions (schema: script_schema.json)
    types/
      index.json          # Type definitions (schema: types_schema.json)
```

## Key Files

### 1. Package Discovery (`storybook/src/utils/packageDiscovery.ts`)

This module handles automatic discovery and loading of JSON packages:

- `discoverAllPackages()` - Discovers all packages by loading their package.json files
- `loadPackage(packageId)` - Loads a single package with all its resources
- `discoverPackagesWithComponents()` - Filters packages with component definitions
- `discoverPackagesWithPermissions()` - Filters packages with permission definitions
- `discoverPackagesWithStyles()` - Filters packages with style definitions
- `getPackagesByCategory()` - Groups packages by category
- `getPackagesByLevel()` - Groups packages by minimum permission level

### 2. JSON Component Renderer (`storybook/src/utils/jsonComponentRenderer.tsx`)

This module renders JSON component definitions to React elements:

- `renderJsonComponent(component, props)` - Renders a JSON component with given props
- `createComponentStory(component, defaultProps)` - Creates a Storybook story for a component
- Supports template expressions like `{{props.title}}`
- Handles conditional rendering
- Maps JSON element types to HTML/React elements

### 3. Storybook Stories

#### Auto-Discovered Packages (`storybook/src/stories/AutoDiscovered.stories.tsx`)

Three main stories for browsing packages:

- **Package Browser** - Shows all discovered packages with their metadata
- **Components Browser** - Lists all components from all packages
- **Permissions Browser** - Displays all permissions in a table format

#### JSON Components (`storybook/src/stories/JSONComponents.stories.tsx`)

Interactive component viewer:

- **Component Viewer** - Interactive tool to browse and test components
  - Select package and component
  - Adjust props dynamically
  - Live preview
  - View JSON definition
- **Nav Menu Sidebar** - Example rendering of a specific component

#### Legacy Lua Packages (`storybook/src/stories/LuaPackages.stories.tsx`)

Renamed and updated to clarify this is for legacy Lua-based packages.

## Schema Validation

All JSON files reference their schemas using the `$schema` property:

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-metadata.schema.json",
  "packageId": "my_package",
  "name": "My Package",
  ...
}
```

Available schemas:

- `metadata_schema.json` - Package metadata (package.json)
- `components_schema.json` - UI component definitions
- `permissions_schema.json` - Permission and role definitions
- `styles_schema.json` - Style definitions
- `script_schema.json` - Script/function definitions
- `types_schema.json` - Type definitions
- `entities_schema.json` - Entity/data model definitions
- `api_schema.json` - API endpoint definitions
- `forms_schema.json` - Form definitions
- `storybook_schema.json` - Storybook-specific configuration

## Package Metadata Fields

Key fields in `package.json`:

```json
{
  "packageId": "my_package",        // Unique identifier (snake_case)
  "name": "My Package",             // Display name
  "version": "1.0.0",               // Semver version
  "description": "...",             // Package description
  "category": "ui",                 // Category for organization
  "minLevel": 2,                    // Minimum permission level
  "primary": false,                 // Featured package flag
  "exports": {                      // Exported items
    "components": ["Button", "Card"],
    "scripts": ["validate", "transform"]
  },
  "storybook": {                    // Storybook configuration
    "featured": true,
    "excludeFromDiscovery": false,
    "stories": [...]
  }
}
```

## Component Definitions

Components are defined in `components/ui.json`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/json-script-components.schema.json",
  "schemaVersion": "2.0.0",
  "package": "my_package",
  "components": [
    {
      "id": "my_button",
      "name": "MyButton",
      "description": "A customizable button component",
      "props": [
        {
          "name": "label",
          "type": "string",
          "required": true,
          "description": "Button text"
        }
      ],
      "render": {
        "type": "element",
        "template": {
          "type": "button",
          "className": "btn",
          "children": "{{label}}"
        }
      }
    }
  ]
}
```

## Permission Definitions

Permissions are defined in `permissions/roles.json`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/permissions.schema.json",
  "schemaVersion": "1.0.0",
  "package": "my_package",
  "permissions": [
    {
      "id": "my_package.view",
      "name": "View My Package",
      "description": "View package content",
      "resource": "my_package",
      "action": "read",
      "scope": "global",
      "minLevel": 2
    }
  ],
  "resources": [
    {
      "id": "my_package",
      "name": "My Package",
      "type": "component",
      "actions": ["read", "create", "update", "delete"]
    }
  ]
}
```

## Running Storybook

```bash
cd storybook
npm run storybook
```

Then navigate to:
- **Packages/Auto-Discovered** - Browse all packages
- **Packages/JSON Components** - Interactive component viewer

## Package Format

All packages use pure JSON format with schema validation:

1. `package.json` - Package metadata with schema reference
2. `components/ui.json` - Component definitions
3. `permissions/roles.json` - Permission and role definitions
4. `styles/index.json` - Style definitions
5. All files include `$schema` references for validation

## Future Enhancements

Potential improvements:

1. **Build-time package index** - Generate `/packages-index.json` during build
2. **Component live editing** - Edit component JSON in Storybook
3. **Schema validation UI** - Visual feedback for schema errors
4. **Component composition** - Compose components from other components
5. **Theme support** - Apply different themes to components
6. **Export to code** - Generate React/Vue code from JSON components
