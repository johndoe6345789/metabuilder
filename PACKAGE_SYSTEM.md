# Package System Architecture

This document describes the modular package system where each component lives in its own isolated folder structure with seed data, static content, and Lua scripts.

## Package Structure

Each package follows this structure:

```
/packages/{package_name}/
  ├── seed/
  │   ├── components.json    # Component hierarchy definitions
  │   ├── scripts.lua         # Lua logic for the component
  │   └── metadata.json       # Package metadata and exports
  ├── static_content/
  │   ├── examples.json       # Usage examples
  │   ├── assets/             # Images, icons, etc.
  │   └── docs.md             # Documentation
  └── README.md               # Package overview
```

## Available Packages

### UI Components

#### admin_dialog
- **Purpose**: Reusable admin dialog with dynamic form fields and validation
- **Location**: `/packages/admin_dialog/`
- **Exports**: Dialog components, form validation scripts
- **Dependencies**: None
- **shadcn Components**: Dialog, DialogContent, DialogHeader, Button

#### data_table
- **Purpose**: Advanced data table with search, sort, filter, and CRUD
- **Location**: `/packages/data_table/`
- **Exports**: Table component, data manipulation scripts
- **Dependencies**: None
- **shadcn Components**: Table, Card, Input, Button

#### form_builder
- **Purpose**: Dynamic form builder with validation and field types
- **Location**: `/packages/form_builder/`
- **Exports**: Form components, validation scripts
- **Dependencies**: None
- **shadcn Components**: Card, Input, Textarea, Select, Switch, Checkbox

#### nav_menu
- **Purpose**: Responsive navigation menu with user section
- **Location**: `/packages/nav_menu/`
- **Exports**: Navigation components, routing scripts
- **Dependencies**: None
- **shadcn Components**: Button, Avatar

#### notification_center
- **Purpose**: Real-time notification center with filtering
- **Location**: `/packages/notification_center/`
- **Exports**: Notification components, state management scripts
- **Dependencies**: None
- **shadcn Components**: Button, Badge, Popover, ScrollArea

### Page Templates

#### dashboard
- **Purpose**: Customizable dashboard with stats and widgets
- **Location**: `/packages/dashboard/`
- **Exports**: Dashboard layout, widget system
- **Dependencies**: None
- **shadcn Components**: Card, Button

## Package Glue System

The package glue system (`src/lib/package-glue.ts`) is responsible for:

1. **Loading packages**: Import all package definitions from their folders
2. **Registry management**: Maintain a central registry of all packages
3. **Dependency resolution**: Check and resolve package dependencies
4. **Installation**: Install components and scripts into the database
5. **Export for seeding**: Generate seed data from all packages

### Usage

```typescript
import { buildPackageRegistry, installPackage } from '@/lib/package-glue'

// Build the registry
const registry = await buildPackageRegistry()

// Install a package
const result = await installPackage(registry, 'admin_dialog', db)

// Export all for seeding
const seedData = exportAllPackagesForSeed(registry)
```

## Creating New Packages

### Step 1: Create Package Structure

```bash
mkdir -p packages/my_package/seed
mkdir -p packages/my_package/static_content
```

### Step 2: Define Components

Create `packages/my_package/seed/components.json`:

```json
[
  {
    "id": "my_component_root",
    "type": "div",
    "props": {
      "className": "container"
    },
    "children": ["my_component_child"]
  }
]
```

### Step 3: Write Lua Scripts

Create `packages/my_package/seed/scripts.lua`:

```lua
function my_package_init(config)
  return {
    data = config.data or {}
  }
end

function my_package_update(state, newData)
  local newState = table_clone(state)
  newState.data = newData
  return newState
end
```

### Step 4: Define Metadata

Create `packages/my_package/seed/metadata.json`:

```json
{
  "packageId": "my_package",
  "name": "My Package",
  "version": "1.0.0",
  "description": "Description here",
  "author": "MetaBuilder System",
  "category": "ui-component",
  "dependencies": [],
  "exports": {
    "components": ["my_component_root"],
    "scripts": ["my_package_init", "my_package_update"]
  }
}
```

### Step 5: Register in Glue

Update `src/lib/package-glue.ts`:

```typescript
import myPackageComponents from '../../packages/my_package/seed/components.json'
import myPackageMetadata from '../../packages/my_package/seed/metadata.json'

// In buildPackageRegistry():
const myPackageScripts = await loadLuaScript('my_package')
registry['my_package'] = {
  ...myPackageMetadata,
  components: myPackageComponents,
  scripts: myPackageScripts,
  examples: {}
}
```

## Benefits

1. **Modularity**: Each package is self-contained and independent
2. **Reusability**: Packages can be easily imported and reused
3. **Maintainability**: Changes to one package don't affect others
4. **Scalability**: New packages can be added without modifying core code
5. **Distribution**: Packages can be exported as zip files for sharing
6. **Declarative**: Everything is defined in JSON and Lua, minimal TypeScript

## Package Categories

- `ui-component`: Reusable UI components
- `page-template`: Full page templates
- `feature`: Complete features (forum, chat, etc.)
- `utility`: Helper functions and utilities
- `integration`: Third-party integrations

## Future Enhancements

- Package versioning and updates
- Package marketplace
- Dependency version constraints
- Automated testing for packages
- Package CLI tools
- Hot-reloading of packages in development
