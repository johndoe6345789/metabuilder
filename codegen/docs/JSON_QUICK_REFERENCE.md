# Quick Reference: JSON-Driven Pages

## File Structure

```
src/
├── config/pages/
│   ├── model-designer.json          # Models page schema
│   ├── component-tree.json          # Component Trees page schema
│   └── workflow-designer.json       # Workflows page schema
├── components/
│   ├── JSONModelDesigner.tsx        # Models wrapper component
│   ├── JSONComponentTreeManager.tsx # Trees wrapper component
│   └── JSONWorkflowDesigner.tsx     # Workflows wrapper component
└── lib/
    └── json-ui/
        └── page-renderer.tsx        # Core JSON renderer
```

## Creating a New JSON Page

### 1. Create the JSON Schema

`src/config/pages/my-page.json`:
```json
{
  "id": "my-page",
  "name": "My Page",
  "layout": { "type": "single" },
  "dataSources": [
    {
      "id": "items",
      "type": "kv",
      "key": "app-items",
      "defaultValue": []
    },
    {
      "id": "selectedId",
      "type": "static",
      "defaultValue": null
    },
    {
      "id": "selectedItem",
      "type": "computed",
      "compute": "(data) => data.items?.find(i => i.id === data.selectedId)",
      "dependencies": ["items", "selectedId"]
    }
  ],
  "components": [
    {
      "id": "root",
      "type": "div",
      "props": { "className": "h-full p-6" },
      "children": []
    }
  ]
}
```

### 2. Create the Wrapper Component

`src/components/JSONMyPage.tsx`:
```tsx
import { PageRenderer } from '@/lib/json-ui/page-renderer'
import myPageSchema from '@/config/pages/my-page.json'
import { PageSchema } from '@/types/json-ui'

interface JSONMyPageProps {
  items: any[]
  onItemsChange: (items: any[]) => void
}

export function JSONMyPage({ items, onItemsChange }: JSONMyPageProps) {
  const schema = myPageSchema as PageSchema

  const handleCustomAction = async (action: any, event?: any) => {
    console.log('[JSONMyPage] Custom action:', action, event)
  }

  return <PageRenderer schema={schema} onCustomAction={handleCustomAction} />
}
```

### 3. Register in Component Registry

`src/lib/component-registry.ts`:
```typescript
JSONMyPage: lazyWithPreload(
  () => import('@/components/JSONMyPage').then(m => ({ default: m.JSONMyPage })),
  'JSONMyPage'
),
```

### 4. Add to Pages Config

`src/config/pages.json`:
```json
{
  "id": "my-page-json",
  "title": "My Page (JSON)",
  "icon": "Icon",
  "component": "JSONMyPage",
  "enabled": true,
  "toggleKey": "myPageJSON",
  "order": 99,
  "props": {
    "state": ["items"],
    "actions": ["onItemsChange:setItems"]
  }
}
```

### 5. Create Seed Data

```typescript
seed_kv_store_tool({
  key: "app-items",
  operation: "set",
  value: [
    { id: "1", name: "Item 1", description: "First item" },
    { id: "2", name: "Item 2", description: "Second item" }
  ]
})
```

## Common Patterns

### Data Source Types

**KV (Persistent)**:
```json
{
  "id": "myData",
  "type": "kv",
  "key": "app-my-data",
  "defaultValue": []
}
```

**Static (Component State)**:
```json
{
  "id": "tempValue",
  "type": "static",
  "defaultValue": ""
}
```

**Computed (Derived)**:
```json
{
  "id": "filteredItems",
  "type": "computed",
  "compute": "(data) => data.items.filter(i => i.active)",
  "dependencies": ["items"]
}
```

### Component Bindings

**Simple Binding**:
```json
{
  "type": "Text",
  "bindings": {
    "children": { "source": "itemName" }
  }
}
```

**Path Binding**:
```json
{
  "type": "Text",
  "bindings": {
    "children": {
      "source": "selectedItem",
      "path": "name"
    }
  }
}
```

**Transform Binding**:
```json
{
  "type": "Badge",
  "bindings": {
    "variant": {
      "source": "status",
      "transform": "(val) => val === 'active' ? 'success' : 'secondary'"
    }
  }
}
```

### Event Handlers

**Simple Action**:
```json
{
  "type": "Button",
  "events": [
    {
      "event": "click",
      "actions": [
        {
          "id": "open-dialog",
          "type": "set-value",
          "target": "dialogOpen",
          "value": true
        }
      ]
    }
  ]
}
```

**Conditional Action**:
```json
{
  "event": "click",
  "actions": [...],
  "condition": "(data) => data.items.length > 0"
}
```

### Conditional Rendering

```json
{
  "type": "div",
  "condition": {
    "source": "selectedItem",
    "transform": "(val) => !!val"
  },
  "children": [...]
}
```

## Layout Patterns

### Sidebar + Main Content

```json
{
  "type": "div",
  "props": { "className": "h-full flex" },
  "children": [
    {
      "id": "sidebar",
      "type": "div",
      "props": { "className": "w-80 border-r" },
      "children": []
    },
    {
      "id": "main",
      "type": "div",
      "props": { "className": "flex-1" },
      "children": []
    }
  ]
}
```

### Empty State

```json
{
  "type": "div",
  "condition": {
    "source": "items",
    "transform": "(val) => !val || val.length === 0"
  },
  "props": { "className": "text-center p-12" },
  "children": [
    {
      "type": "Heading",
      "props": { "children": "No Items Yet" }
    },
    {
      "type": "Button",
      "props": { "children": "Create First Item" },
      "events": [...]
    }
  ]
}
```

### List/Grid

```json
{
  "type": "div",
  "props": { "className": "grid grid-cols-3 gap-4" },
  "children": []
}
```

## Debugging Tips

### Log Data Sources
Add this to your wrapper component:
```typescript
console.log('[Page] Schema:', schema)
console.log('[Page] Data sources:', schema.dataSources)
```

### Check Computed Values
The PageRenderer's `data` object contains all data sources:
```typescript
const { data } = useDataSources(schema.dataSources)
console.log('[Page] All data:', data)
```

### Validate Bindings
Ensure source IDs match data source IDs:
```json
{
  "bindings": {
    "prop": {
      "source": "myDataSource"  // Must match dataSources[].id
    }
  }
}
```

## Best Practices

1. **Use KV for persistent data** - User preferences, saved items, app state
2. **Use static for UI state** - Dialog open/closed, selected tabs, temp values
3. **Use computed for derived data** - Filtered lists, calculated totals, selected items
4. **Keep compute functions simple** - Complex logic should be in custom hooks
5. **Name sources descriptively** - `selectedWorkflow` not `sel`, `filteredItems` not `items2`
6. **Document complex schemas** - Add comments in the JSON (strip before runtime)
7. **Test with seed data** - Always provide realistic default data
8. **Validate schemas** - Use TypeScript types to catch errors early

## Performance Tips

- Minimize computed dependencies - Only include what's actually used
- Use path bindings - `{ source: "item", path: "name" }` is more efficient
- Lazy load heavy components - Use code splitting for complex editors
- Cache expensive computations - Consider memoization for heavy transforms
- Limit nesting depth - Deep component trees slow rendering

## Common Issues

**Issue**: Computed value not updating
**Fix**: Check dependencies array includes all used sources

**Issue**: Binding shows undefined
**Fix**: Ensure data source exists and has a value before binding

**Issue**: Event not firing
**Fix**: Verify event name matches React event (e.g., `click` not `onClick`)

**Issue**: Condition not working
**Fix**: Transform function must return boolean, check for null/undefined

**Issue**: Component not rendering
**Fix**: Ensure component type matches registry name exactly
