# Component Tree JSON Loading System

## Overview

This system loads molecule and organism component trees from JSON files into the application's KV store on startup. Component trees define the hierarchical structure of reusable UI components with their props, children, and metadata.

## File Structure

```
src/
├── config/
│   └── component-trees/
│       ├── index.ts           # Exports and utility functions
│       ├── molecules.json     # Molecule component trees
│       └── organisms.json     # Organism component trees
├── hooks/
│   └── use-component-tree-loader.ts  # Hook for loading and managing trees
└── components/
    ├── ComponentTreeViewer.tsx        # UI for viewing component trees
    └── ComponentTreeDemoPage.tsx      # Demo page
```

## Component Tree Structure

Each component tree follows this schema:

```typescript
interface ComponentTree {
  id: string                    // Unique identifier
  name: string                  // Display name
  description: string           // Description of the component
  category: 'molecule' | 'organism'  // Component category
  rootNodes: ComponentNode[]    // Root component nodes
  createdAt: number            // Timestamp
  updatedAt: number            // Timestamp
}

interface ComponentNode {
  id: string                    // Unique node ID
  type: string                  // Component type (Button, Card, etc.)
  name: string                  // Node name
  props: Record<string, any>   // Component props
  children: ComponentNode[]    // Child nodes
}
```

## JSON Files

### molecules.json

Contains component trees for molecule-level components:
- SearchInput
- DataCard
- StatCard
- ActionBar
- EmptyState
- FileTabs

### organisms.json

Contains component trees for organism-level components:
- AppHeader
- NavigationMenu
- SchemaEditorCanvas
- TreeListPanel
- DataTable
- SchemaEditorSidebar

## Usage

### Loading Component Trees

Component trees are automatically loaded on application startup via the `App.tsx` initialization:

```typescript
const { loadComponentTrees } = useComponentTreeLoader()

useEffect(() => {
  loadSeedData()
    .then(() => loadComponentTrees())
    .then(() => console.log('Trees loaded'))
}, [])
```

### Using the Hook

```typescript
import { useComponentTreeLoader } from '@/hooks/use-component-tree-loader'

function MyComponent() {
  const {
    isLoaded,
    isLoading,
    error,
    moleculeTrees,
    organismTrees,
    allTrees,
    getComponentTreeById,
    getComponentTreeByName,
    getComponentTreesByCategory,
    reloadFromJSON,
  } = useComponentTreeLoader()

  // Access trees from memory
  const molecules = moleculeTrees

  // Get tree from KV store
  const tree = await getComponentTreeById('mol-tree-1')

  // Reload from JSON files
  await reloadFromJSON()
}
```

### Viewing Component Trees

Use the `ComponentTreeViewer` component to visualize and explore loaded trees:

```typescript
import { ComponentTreeViewer } from '@/components/ComponentTreeViewer'

function MyPage() {
  return <ComponentTreeViewer />
}
```

## API Reference

### useComponentTreeLoader()

Returns an object with:

- `isLoaded: boolean` - Whether trees have been loaded
- `isLoading: boolean` - Whether loading is in progress
- `error: Error | null` - Any loading error
- `moleculeTrees: ComponentTree[]` - Array of molecule trees
- `organismTrees: ComponentTree[]` - Array of organism trees
- `allTrees: ComponentTree[]` - All trees combined
- `loadComponentTrees()` - Load trees from JSON to KV store
- `getComponentTrees()` - Get all trees from KV store
- `getComponentTreesByCategory(category)` - Get trees by category
- `getComponentTreeById(id)` - Get tree by ID
- `getComponentTreeByName(name)` - Get tree by name
- `reloadFromJSON()` - Force reload from JSON files

### Config Functions

From `@/config/component-trees`:

```typescript
import componentTreesData from '@/config/component-trees'

// Access trees
const molecules = componentTreesData.molecules
const organisms = componentTreesData.organisms
const all = componentTreesData.all

// Utility functions
const tree = componentTreesData.getById('mol-tree-1')
const tree = componentTreesData.getByName('SearchInput')
const trees = componentTreesData.getByCategory('molecule')
```

## Adding New Component Trees

1. Edit `molecules.json` or `organisms.json`:

```json
{
  "molecules": [
    {
      "id": "mol-tree-new",
      "name": "NewComponent",
      "description": "Description of the component",
      "category": "molecule",
      "rootNodes": [
        {
          "id": "root-1",
          "type": "div",
          "name": "Container",
          "props": {
            "className": "flex gap-2"
          },
          "children": []
        }
      ],
      "createdAt": 1704067200000,
      "updatedAt": 1704067200000
    }
  ]
}
```

2. Reload in the application:

```typescript
const { reloadFromJSON } = useComponentTreeLoader()
await reloadFromJSON()
```

Or restart the application for automatic loading.

## Features

- **Automatic Loading**: Trees are loaded on app startup
- **Merge Strategy**: New trees are merged with existing trees, preserving user modifications
- **Category Filtering**: Filter trees by molecule/organism category
- **Type Safety**: Full TypeScript support
- **Error Handling**: Graceful error handling with user feedback
- **Hot Reload**: Reload from JSON without restarting the app
- **Visual Explorer**: Built-in UI for viewing tree structures

## Benefits

1. **Separation of Concerns**: Component structures defined in JSON, separate from implementation
2. **Reusability**: Trees can be referenced and reused across the application
3. **Documentation**: JSON serves as living documentation of component hierarchy
4. **Version Control**: Easy to track changes to component structures
5. **Tooling**: Can be generated or validated by external tools

## Integration with Existing System

The component tree system integrates with:

- **Project State**: Trees stored in KV store alongside other project data
- **Seed Data**: Loaded automatically with seed data on startup
- **Component Trees Feature**: Used by existing component tree builder/manager
- **Atomic Design**: Follows atomic design principles (molecules, organisms)

## Future Enhancements

Potential improvements:

- JSON schema validation
- Component tree code generation
- Visual tree editor with drag-and-drop
- Tree composition (combining multiple trees)
- Tree versioning and history
- Export trees to React code
- Import trees from existing React components
