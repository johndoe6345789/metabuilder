# Quick Reference: Hooks & JSON Orchestration

## 🚀 Quick Start

### Using Hooks

```typescript
// 1. Import what you need
import { useArray, useSearch } from '@/hooks/data'
import { useDialog, useSelection } from '@/hooks/ui'
import { useForm } from '@/hooks/forms'

// 2. Use in your component
function MyComponent() {
  const { items, add, remove } = useArray('my-data', [])
  const { query, results } = useSearch(items, ['name'])
  const dialog = useDialog()
  
  return <div>{/* Your UI */}</div>
}
```

### Creating JSON Pages

```json
{
  "id": "my-page",
  "name": "My Page",
  "layout": { "type": "single" },
  "dataSources": [
    { "id": "data", "type": "kv", "key": "my-key", "defaultValue": [] }
  ],
  "components": [
    { "id": "root", "type": "Card", "children": [] }
  ],
  "actions": [
    { "id": "add", "type": "create", "target": "data" }
  ]
}
```

## 📦 Hook Cheat Sheet

### Data Hooks

```typescript
// Arrays
const { items, add, remove, update, count } = useArray('key', [])

// CRUD
const { create, read, update, remove, selected } = useCRUD(items, setItems)

// Search
const { query, setQuery, results } = useSearch(items, ['field1', 'field2'])

// Sort
const { sortedItems, toggleSort } = useSort(items, 'name')

// Pagination
const { items, page, nextPage, prevPage } = usePagination(items, 10)
```

### UI Hooks

```typescript
// Dialog
const { isOpen, open, close } = useDialog()

// Tabs
const { activeTab, switchTab } = useTabs('default')

// Selection
const { toggle, selectAll, isSelected } = useSelection()

// Clipboard
const { copy, copied } = useClipboard('Copied!')
```

### Form Hooks

```typescript
// Single field
const field = useFormField('', [
  { validate: (v) => v.length > 0, message: 'Required' }
])

// Full form
const form = useForm({
  initialValues: { name: '', email: '' },
  validate: (values) => ({}),
  onSubmit: async (values) => { /* save */ }
})
```

## 🗂️ JSON Schema Cheat Sheet

### Data Sources

```json
{
  "dataSources": [
    { "id": "todos", "type": "kv", "key": "todos", "defaultValue": [] },
    { "id": "user", "type": "api", "endpoint": "/api/user" },
    { "id": "stats", "type": "computed", "transform": "calc" }
  ]
}
```

### Actions

```json
{
  "actions": [
    { "id": "add", "type": "create", "target": "todos" },
    { "id": "edit", "type": "update", "target": "todos" },
    { "id": "delete", "type": "delete", "target": "todos" },
    { "id": "nav", "type": "navigate", "target": "home" },
    { "id": "custom", "type": "custom", "handler": "myHandler" }
  ]
}
```

### Components

```json
{
  "components": [
    {
      "id": "btn",
      "type": "Button",
      "props": { "children": "Click me" },
      "eventHandlers": { "onClick": "add" }
    },
    {
      "id": "input",
      "type": "Input",
      "dataBinding": "formData.name"
    }
  ]
}
```

## 🎯 Common Patterns

### Pattern 1: List with Search and Sort

```typescript
function ListPage() {
  const { items, add, remove } = useArray('items', [])
  const { results, setQuery } = useSearch(items, ['name'])
  const { sortedItems, toggleSort } = useSort(results, 'name')
  
  return <div>{/* render sortedItems */}</div>
}
```

### Pattern 2: Form with Validation

```typescript
function FormPage() {
  const form = useForm({
    initialValues: { name: '', email: '' },
    validate: (v) => {
      const errors: any = {}
      if (!v.name) errors.name = 'Required'
      if (!v.email.includes('@')) errors.email = 'Invalid'
      return errors
    },
    onSubmit: async (v) => {
      await api.save(v)
      toast.success('Saved!')
    }
  })
  
  return <form onSubmit={form.handleSubmit}>{/* fields */}</form>
}
```

### Pattern 3: Master-Detail View

```typescript
function MasterDetail() {
  const { items } = useArray('items', [])
  const { selected, setSelectedId } = useCRUD(items, () => {})
  
  return (
    <div className="grid grid-cols-2">
      <div>{/* list */}</div>
      <div>{selected && /* detail */}</div>
    </div>
  )
}
```

### Pattern 4: Bulk Operations

```typescript
function BulkActions() {
  const { items, remove } = useArray('items', [])
  const { selectedIds, toggle, selectAll } = useSelection()
  
  const deleteSelected = () => {
    selectedIds.forEach(id => {
      remove(item => item.id === id)
    })
  }
  
  return <div>{/* UI */}</div>
}
```

## 🔧 Tips & Tricks

### Tip 1: Compose Hooks
```typescript
function useMyFeature() {
  const data = useArray('key', [])
  const search = useSearch(data.items, ['name'])
  return { ...data, ...search }
}
```

### Tip 2: Custom Validation
```typescript
const email = useFormField('', [
  { validate: v => v.includes('@'), message: 'Invalid email' },
  { validate: v => v.length > 5, message: 'Too short' }
])
```

### Tip 3: Conditional Actions
```json
{
  "actions": [
    {
      "id": "save",
      "type": "custom",
      "handler": "conditionalSave"
    }
  ]
}
```

```typescript
const handlers = {
  conditionalSave: async (data) => {
    if (validate(data)) {
      await save(data)
    }
  }
}
```

### Tip 4: Nested Data Binding
```json
{
  "id": "email",
  "type": "Input",
  "dataBinding": "user.profile.email"
}
```

## 📁 File Organization

```
src/
├── hooks/
│   ├── data/          # useArray, useCRUD, useSearch
│   ├── ui/            # useDialog, useTabs, useSelection
│   └── forms/         # useForm, useFormField
├── config/
│   ├── orchestration/ # Engine files
│   └── pages/         # JSON page definitions
└── components/
    └── ...            # React components (< 150 LOC)
```

## 🐛 Debugging

### Debug Hook State
```typescript
const data = useArray('key', [])
console.log('Items:', data.items)
console.log('Count:', data.count)
```

### Debug JSON Rendering
```typescript
<PageRenderer schema={schema} debug={true} />
```

### Validate JSON Schema
```typescript
import { PageSchemaDefinition } from '@/config/orchestration/schema'

const result = PageSchemaDefinition.safeParse(mySchema)
if (!result.success) {
  console.error(result.error)
}
```

## 📚 Full Documentation

- **Hooks**: `../api/COMPLETE_HOOK_LIBRARY.md`
- **JSON**: `../architecture/JSON_ORCHESTRATION_COMPLETE.md`
- **Summary**: `../history/PHASE4_IMPLEMENTATION_COMPLETE.md`

## 🆘 Need Help?

1. Check the documentation files
2. Look at example pages in `/src/config/pages/`
3. Review hook implementations in `/src/hooks/`
4. Test with the PageRenderer

---

**Quick Links:**
- Hooks: `/src/hooks/`
- Orchestration: `/src/config/orchestration/`
- Examples: `/src/config/pages/`
- Docs: `../api/COMPLETE_HOOK_LIBRARY.md`
