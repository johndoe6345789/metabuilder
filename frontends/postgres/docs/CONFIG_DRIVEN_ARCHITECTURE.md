# Config-Driven Architecture Guide

## Overview

This repository has been refactored to use a **config-driven architecture** where most of the React component structure, wiring, and actions are defined in `src/config/features.json` rather than in JSX/TSX files. This approach:

- **Reduces boilerplate code** - Most UI wiring is done via configuration
- **Improves maintainability** - Changes to UI structure can be made in JSON
- **Enables rapid prototyping** - New features can be scaffolded from config
- **Promotes reusability** - Atomic components and hooks are truly reusable
- **Simplifies testing** - Playbooks defined in JSON for E2E tests

## Architecture Components

### 1. Component Tree Renderer (`src/utils/componentTreeRenderer.tsx`)

The core of the config-driven architecture. It reads component tree definitions from `features.json` and dynamically renders React components.

**Features:**
- Template interpolation: `{{variable}}` syntax
- Conditional rendering: `condition` property
- Loops: `forEach` property for arrays
- Action mapping: Maps string action names to functions
- Icon rendering: Automatic Material-UI icon resolution

**Example usage:**

```tsx
import { ComponentTreeRenderer } from '@/utils/componentTreeRenderer';
import { getComponentTree } from '@/utils/featureConfig';

const tree = getComponentTree('DashboardStatsCards');

<ComponentTreeRenderer 
  tree={tree}
  context={{
    data: { statsCards: [...] },
    actions: { handleClick: () => {} },
    state: { isOpen: false }
  }}
/>
```

### 2. Hooks (`src/hooks/`)

Small, focused hooks for data fetching and business logic:

#### `useApiCall`
Generic hook for API calls with loading/error states.

```tsx
const { data, loading, error, execute } = useApiCall();

// Execute API call
await execute('/api/endpoint', {
  method: 'POST',
  body: { data: 'value' }
});
```

#### `useTables`
Manage database tables (list, create, drop).

```tsx
const { tables, loading, error, createTable, dropTable } = useTables();

// Create a table
await createTable('users', [
  { name: 'id', type: 'INTEGER' },
  { name: 'name', type: 'VARCHAR' }
]);
```

#### `useTableData`
Fetch and manage table data.

```tsx
const { data, loading, error, fetchTableData } = useTableData('users');
```

#### `useColumnManagement`
Column operations (add, modify, drop).

```tsx
const { addColumn, modifyColumn, dropColumn } = useColumnManagement();

await addColumn('users', {
  columnName: 'email',
  dataType: 'VARCHAR'
});
```

### 3. Features Configuration (`src/config/features.json`)

The central configuration file containing:

#### Component Trees (`componentTrees`)
Define entire component hierarchies:

```json
{
  "componentTrees": {
    "DashboardStatsCards": {
      "component": "Grid",
      "props": { "container": true, "spacing": 3 },
      "children": [
        {
          "component": "Grid",
          "forEach": "statsCards",
          "props": { "item": true, "xs": 12, "sm": 6, "md": 3 },
          "children": [
            {
              "component": "Card",
              "children": [...]
            }
          ]
        }
      ]
    }
  }
}
```

#### Component Props (`componentProps`)
Schema definitions for all available components:

```json
{
  "componentProps": {
    "Button": {
      "description": "Material-UI Button component",
      "category": "inputs",
      "props": {
        "text": { "type": "string", "description": "Button text" },
        "variant": { 
          "type": "enum", 
          "values": ["text", "outlined", "contained"],
          "default": "text"
        }
      }
    }
  }
}
```

#### Playwright Playbooks (`playwrightPlaybooks`)
E2E test scenarios defined in JSON:

```json
{
  "playwrightPlaybooks": {
    "createTable": {
      "name": "Create Table Workflow",
      "description": "Test creating a new database table",
      "tags": ["admin", "table", "crud"],
      "steps": [
        { "action": "goto", "url": "/admin/dashboard" },
        { "action": "click", "selector": "text=Table Manager" },
        { "action": "click", "selector": "button:has-text('Create Table')" }
      ]
    }
  }
}
```

#### Storybook Stories (`storybookStories`)
Storybook story configurations:

```json
{
  "storybookStories": {
    "DataGrid": {
      "default": {
        "name": "Default",
        "args": {
          "columns": [...],
          "rows": [...]
        }
      }
    }
  }
}
```

## How to Use This Architecture

### Creating a New Config-Driven Component

1. **Define the component tree in `features.json`:**

```json
{
  "componentTrees": {
    "MyNewComponent": {
      "component": "Box",
      "props": { "sx": { "p": 2 } },
      "children": [
        {
          "component": "Typography",
          "props": {
            "variant": "h5",
            "text": "{{data.title}}"
          }
        },
        {
          "component": "Button",
          "props": {
            "variant": "contained",
            "text": "Click Me",
            "onClick": "handleClick"
          }
        }
      ]
    }
  }
}
```

2. **Create a thin wrapper component:**

```tsx
'use client';

import { getComponentTree } from '@/utils/featureConfig';
import { ComponentTreeRenderer } from '@/utils/componentTreeRenderer';

export default function MyNewComponent() {
  const tree = getComponentTree('MyNewComponent');
  
  const actions = {
    handleClick: () => console.log('Clicked!'),
  };
  
  const data = {
    title: 'My Title',
  };
  
  return (
    <ComponentTreeRenderer 
      tree={tree}
      context={{ data, actions, state: {} }}
    />
  );
}
```

### Refactoring an Existing Component

**Before:**
```tsx
export default function TableManager({ tables, onCreateTable, onDropTable }) {
  return (
    <Box>
      <Typography variant="h5">Table Management</Typography>
      <Button onClick={() => onCreateTable()}>Create Table</Button>
      <List>
        {tables.map(table => (
          <ListItem key={table.name}>
            <ListItemText primary={table.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
```

**After:**
```tsx
export default function TableManager() {
  const tree = getComponentTree('TableManagerTab');
  const { tables, createTable } = useTables();
  
  const actions = {
    openCreateDialog: () => { /* ... */ },
  };
  
  return (
    <ComponentTreeRenderer 
      tree={tree}
      context={{ 
        data: { tables }, 
        actions, 
        state: {} 
      }}
    />
  );
}
```

## Testing

### Unit Tests

Tests are co-located with the code in `src/`:

- `src/hooks/useApiCall.test.ts` - Hook logic tests
- `src/utils/componentTreeRenderer.test.tsx` - Renderer tests

Run tests:
```bash
npm test
```

### E2E Tests

Playwright tests use playbook definitions from `features.json`:

```typescript
import { getAllPlaywrightPlaybooks } from '@/utils/featureConfig';

const playbooks = getAllPlaywrightPlaybooks();
const playbook = playbooks.createTable;

// Execute playbook steps...
```

Run E2E tests:
```bash
npm run test:e2e
```

## Examples

See `src/components/examples/` for working examples:

- **DashboardStatsExample.tsx** - Stats cards rendered from config
- **ConfigDrivenTableManager.tsx** - Full table management from config

## Benefits of This Approach

1. **Less Code**: 70%+ reduction in component code
2. **Easier Testing**: Playbooks in JSON, reusable test utilities
3. **Better Type Safety**: Config schemas with TypeScript types
4. **Rapid Prototyping**: New features scaffolded from config
5. **Consistent UI**: All components follow same patterns
6. **Easy Refactoring**: Change UI structure without touching code

## Best Practices

1. **Keep wrapper components thin** - They should only:
   - Fetch/manage data (via hooks)
   - Define action handlers
   - Call ComponentTreeRenderer

2. **Use hooks for business logic** - All data fetching, state management, and side effects

3. **Define reusable component trees** - Break down complex UIs into smaller trees

4. **Validate configs** - Use `validateComponentProps()` to check component definitions

5. **Document in features.json** - Add descriptions to all config entries

## Migration Strategy

For existing components:

1. Extract business logic to hooks
2. Define component tree in features.json
3. Replace JSX with ComponentTreeRenderer
4. Add tests
5. Verify functionality
6. Remove old code

## Future Enhancements

- Visual config editor
- Real-time config validation
- Component tree visualization
- Auto-generated Storybook stories from config
- Config versioning and migrations
