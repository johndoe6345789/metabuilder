# JSON-Driven UI & Atomic Components

## Overview

This project demonstrates a comprehensive JSON-driven UI architecture with atomic component design and custom React hooks. Build entire applications from declarative JSON schemas while maintaining clean, maintainable code through small, focused components.

## Key Features

### 🎯 JSON-Driven UI System
- Define complete page layouts using JSON schemas
- Automatic data source management (KV persistence, computed values, static data)
- Declarative action system (CRUD, navigation, toasts)
- Component bindings and event handlers
- Type-safe schema definitions

### 🧩 Atomic Component Library
- **Atoms** (< 50 LOC): Basic building blocks
  - `Heading`, `Text`, `List`, `Grid`
  - `StatusBadge`
- **Molecules** (50-100 LOC): Composed components
  - `DataCard`, `SearchInput`, `ActionBar`
- **Organisms** (100-150 LOC): Complex compositions
  - All components follow strict LOC limits for maintainability

### 🪝 Custom React Hooks

#### Data Management
- **`useCRUD<T>`** - Complete CRUD operations with KV persistence
- **`useSearch<T>`** - Multi-field search with filtering
- **`useFilter<T>`** - Advanced filtering with multiple operators
- **`useSort<T>`** - Multi-key sorting with direction toggle
- **`useJSONData`** - Flexible data management
- **`usePagination<T>`** - Pagination logic
- **`useLocalStorage<T>`** - Browser storage management

#### UI State
- **`useDialog`** - Dialog/modal state management
- **`useToggle`** - Boolean state with helpers
- **`useForm<T>`** - Complete form handling with validation
- **`useActionExecutor`** - Execute JSON-defined actions

## Quick Start

### Using JSON Schemas

```typescript
import { PageRenderer } from '@/lib/json-ui/page-renderer'
import { hydrateSchema } from '@/schemas/schema-loader'
import analyticsDashboardJson from '@/schemas/analytics-dashboard.json'

const dashboardSchema = hydrateSchema(analyticsDashboardJson)

export function DashboardPage() {
  return <PageRenderer schema={dashboardSchema} />
}
```

### Using Atomic Components

```typescript
import { DataCard, SearchInput, ActionBar } from '@/components/molecules'
import { Grid, Heading } from '@/components/atoms'
import { useCRUD, useSearch } from '@/hooks/data'

export function MyPage() {
  const { items, create, remove } = useCRUD({
    key: 'my-items',
    defaultValue: [],
    persist: true
  })
  
  const { query, setQuery, filtered } = useSearch({
    items,
    searchFields: ['name', 'description']
  })
  
  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>My Page</Heading>
      
      <Grid cols={3} gap={4}>
        <DataCard title="Total" value={items.length} />
      </Grid>
      
      <SearchInput 
        value={query} 
        onChange={setQuery}
        placeholder="Search..." 
      />
      
      <ActionBar
        title="Items"
        actions={[
          { label: 'Add', onClick: () => create({...}) }
        ]}
      />
    </div>
  )
}
```

### Using Custom Hooks

```typescript
import { useForm } from '@/hooks/ui'

interface FormData {
  name: string
  email: string
}

export function MyForm() {
  const form = useForm<FormData>({
    initialValues: { name: '', email: '' },
    validate: (values) => {
      const errors: any = {}
      if (!values.name) errors.name = 'Name is required'
      if (!values.email) errors.email = 'Email is required'
      return errors
    },
    onSubmit: async (values) => {
      console.log('Form submitted:', values)
    }
  })
  
  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.getFieldProps('name')} />
      {form.errors.name && <span>{form.errors.name}</span>}
      
      <button type="submit" disabled={!form.isValid}>
        Submit
      </button>
    </form>
  )
}
```

## JSON Schema Structure

```typescript
const mySchema: PageSchema = {
  id: 'my-page',
  name: 'My Page',
  layout: { type: 'single' },
  
  // Data sources
  dataSources: [
    {
      id: 'items',
      type: 'kv',              // Persisted to KV store
      key: 'my-items',
      defaultValue: []
    },
    {
      id: 'stats',
      type: 'computed',         // Computed from other data
      compute: (data) => ({
        total: data.items?.length || 0
      }),
      dependencies: ['items']
    }
  ],
  
  // UI components
  components: [
    {
      id: 'root',
      type: 'div',
      props: { className: 'p-6' },
      children: [
        {
          id: 'title',
          type: 'Heading',
          props: { 
            level: 1,
            children: 'My Page'
          }
        },
        {
          id: 'stat-card',
          type: 'DataCard',
          props: { title: 'Total Items' },
          bindings: {
            value: { source: 'stats', path: 'total' }
          }
        },
        {
          id: 'add-button',
          type: 'Button',
          props: { children: 'Add Item' },
          events: [
            {
              event: 'click',
              actions: [
                {
                  id: 'create-item',
                  type: 'create',
                  target: 'items',
                  compute: (data) => ({
                    id: Date.now(),
                    name: 'New Item'
                  })
                },
                {
                  id: 'show-toast',
                  type: 'show-toast',
                  message: 'Item added!',
                  variant: 'success'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Available Components

### Atoms
- `Heading` - Semantic headings (h1-h6)
- `Text` - Text with variants (body, caption, muted, small)
- `List` - Render lists from arrays
- `Grid` - Responsive grid layouts
- `StatusBadge` - Colored status indicators

### Molecules
- `DataCard` - Stat cards with icon, trend, loading states
- `SearchInput` - Search with clear button
- `ActionBar` - Title with action buttons

### Shadcn UI Components
All shadcn components are available: `Button`, `Card`, `Input`, `Dialog`, `Tabs`, `Badge`, `Progress`, etc.

## Action Types

### CRUD Actions
- **create**: Add new items to data source
- **update**: Modify existing data
- **delete**: Remove items from data source

### UI Actions
- **show-toast**: Display notification (success, error, info, warning)
- **navigate**: Navigate to different route
- **open-dialog**: Open a dialog
- **close-dialog**: Close a dialog

### Value Actions
- **set-value**: Set data source value
- **toggle-value**: Toggle boolean value
- **increment**: Increment numeric value
- **decrement**: Decrement numeric value

## Data Source Types

### KV (Persistent)
Persists data between sessions using Spark's KV store.

```typescript
{
  id: 'todos',
  type: 'kv',
  key: 'app-todos',
  defaultValue: []
}
```

### Static (Session Only)
Data lives only in memory, reset on page reload.

```typescript
{
  id: 'searchQuery',
  type: 'static',
  defaultValue: ''
}
```

### Computed (Derived)
Automatically recomputes when dependencies change.

```typescript
{
  id: 'stats',
  type: 'computed',
  compute: (data) => ({
    total: data.todos.length,
    completed: data.todos.filter(t => t.completed).length
  }),
  dependencies: ['todos']
}
```

## Hook Examples

### useCRUD
```typescript
const { items, create, read, update, remove, clear } = useCRUD({
  key: 'todos',
  defaultValue: [],
  persist: true
})

// ✅ CORRECT - Use functional updates
create({ id: Date.now(), text: 'New todo' })
update(todoId, { completed: true })
remove(todoId)
```

### useSearch
```typescript
const { query, setQuery, filtered, hasQuery, resultCount } = useSearch({
  items: todos,
  searchFields: ['text', 'tags'],
  caseSensitive: false
})
```

### useFilter
```typescript
const { filtered, filters, addFilter, removeFilter, clearFilters } = useFilter({
  items: todos,
  initialFilters: [
    { field: 'status', operator: 'equals', value: 'active' }
  ]
})

addFilter({ field: 'priority', operator: 'in', value: ['high', 'medium'] })
```

### useForm
```typescript
const form = useForm({
  initialValues: { name: '', email: '' },
  validate: (values) => {
    const errors: any = {}
    if (!values.name) errors.name = 'Required'
    return errors
  },
  onSubmit: async (values) => {
    // Handle submission
  }
})

// Use in JSX
<input {...form.getFieldProps('name')} />
```

## Demo Pages

1. **AtomicComponentDemo** - Shows all atomic components and hooks in action
2. **DashboardDemoPage** - Complete JSON-driven dashboard with projects
3. **JSONUIPage** - Original JSON UI examples

## Best Practices

### 1. Keep Components Small
- Atoms: < 50 LOC
- Molecules: 50-100 LOC
- Organisms: 100-150 LOC

### 2. Extract Logic to Hooks
❌ Bad: Logic in component
```typescript
const [items, setItems] = useState([])
const addItem = () => setItems([...items, newItem])
```

✅ Good: Logic in hook
```typescript
const { items, create } = useCRUD({ key: 'items', defaultValue: [] })
```

### 3. Use Computed Data Sources
❌ Bad: Computing in render
```typescript
const completed = todos.filter(t => t.completed).length
```

✅ Good: Computed data source
```typescript
{
  id: 'stats',
  type: 'computed',
  compute: (data) => ({
    completed: data.todos.filter(t => t.completed).length
  }),
  dependencies: ['todos']
}
```

### 4. Compose Atomic Components
Build complex UIs from simple atoms:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    <Grid cols={3} gap={4}>
      <DataCard title="Total" value={stats.total} />
      <DataCard title="Active" value={stats.active} />
      <DataCard title="Done" value={stats.done} />
    </Grid>
  </CardContent>
</Card>
```

## File Structure

```
src/
├── components/
│   ├── atoms/           # < 50 LOC components
│   │   ├── Heading.tsx
│   │   ├── Text.tsx
│   │   ├── List.tsx
│   │   ├── Grid.tsx
│   │   └── StatusBadge.tsx
│   ├── molecules/       # 50-100 LOC components
│   │   ├── DataCard.tsx
│   │   ├── SearchInput.tsx
│   │   └── ActionBar.tsx
│   └── ui/              # shadcn components
├── hooks/
│   ├── data/            # Data management hooks
│   │   ├── use-crud.ts
│   │   ├── use-search.ts
│   │   ├── use-filter.ts
│   │   └── use-sort.ts
│   └── ui/              # UI state hooks
│       ├── use-dialog.ts
│       ├── use-toggle.ts
│       └── use-form.ts
├── lib/
│   └── json-ui/         # JSON UI system
│       ├── page-renderer.tsx
│       ├── component-renderer.tsx
│       └── component-registry.tsx
├── schemas/             # JSON page schemas
│   ├── analytics-dashboard.json
│   ├── todo-list.json
│   ├── dashboard-simple.json
│   ├── new-molecules-showcase.json
│   ├── compute-functions.ts
│   └── schema-loader.ts
└── types/
    └── json-ui.ts       # TypeScript types
```

## Documentation

- **JSON_UI_GUIDE.md** - Complete JSON UI documentation
- **PRD.md** - Product requirements and design decisions

## Contributing

When adding new components or hooks:
1. Follow LOC limits (atoms < 50, molecules < 100, organisms < 150)
2. Add TypeScript types
3. Update component registry if adding UI components
4. Document in README
5. Add examples

---

**Built with React, TypeScript, Tailwind CSS, and Shadcn UI**
