# JSON-Driven UI Architecture Guide

## Overview

This application uses a **declarative JSON-driven architecture** that allows you to build entire user interfaces from configuration rather than code. Combined with **atomic components** (all under 150 LOC) and **custom hooks** for business logic, this creates a highly maintainable and rapidly prototype-able system.

## Core Concepts

### 1. JSON Schema Definition

Define your entire UI using JSON schemas with:
- **Data Sources**: KV store, computed values, static data
- **Components**: Shadcn UI components with props and bindings
- **Actions**: CRUD operations, toasts, navigation
- **Events**: User interactions that trigger actions

### 2. Atomic Components

Small, focused, reusable components:
- **Atoms** (< 50 LOC): ActionButton, IconButton, DataList, LoadingSpinner
- **Molecules** (50-100 LOC): StatCard, EmptyState, SearchBar
- **Organisms** (100-150 LOC): DataTable, FormBuilder, Dashboard

### 3. Custom Hooks

Extract business logic into reusable hooks:
- **Data Management**: useCRUD, useSearch, useSort, useJSONData
- **UI State**: useDialog, useActionExecutor
- **Forms**: useForm, useFormField

## Quick Start

### Define a Page Schema

```typescript
import { PageSchema } from '@/types/json-ui'

export const myPageSchema: PageSchema = {
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
          type: 'h1',
          props: { 
            className: 'text-3xl font-bold',
            children: 'My Page'
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

### Use Custom Hooks

```typescript
import { useCRUD, useSearch, useDialog } from '@/hooks'

function MyComponent() {
  // CRUD operations with persistence
  const { items, create, update, remove } = useCRUD({
    key: 'my-items',
    defaultValue: [],
    persist: true
  })
  
  // Search functionality
  const { query, setQuery, filtered } = useSearch({
    items,
    searchFields: ['name', 'description']
  })
  
  // Dialog state management
  const dialog = useDialog()
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {filtered.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={dialog.open}>Open</button>
      <Dialog open={dialog.isOpen} onOpenChange={dialog.setOpen}>
        {/* dialog content */}
      </Dialog>
    </div>
  )
}
```

### Build Atomic Components

```typescript
// Atom: Single responsibility, no business logic
export function ActionButton({ icon, label, onClick }: Props) {
  return (
    <Button onClick={onClick}>
      {icon}
      {label && <span className="ml-2">{label}</span>}
    </Button>
  )
}

// Molecule: Composition of atoms
export function SearchBar({ value, onChange, onClear }: Props) {
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={onChange} />
      <ActionButton 
        icon={<X />} 
        onClick={onClear}
        variant="ghost"
      />
    </div>
  )
}
```

## Data Source Types

### KV (Persistent)
```typescript
{
  id: 'todos',
  type: 'kv',
  key: 'app-todos',
  defaultValue: []
}
```
Data persists between sessions using the KV store.

### Static (Session Only)
```typescript
{
  id: 'searchQuery',
  type: 'static',
  defaultValue: ''
}
```
Data lives only in memory, reset on page reload.

### Computed (Derived)
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
Automatically recomputes when dependencies change.

## Action Types

### CRUD Actions

**Create**: Add new items
```typescript
{
  type: 'create',
  target: 'todos',
  compute: (data) => ({ 
    id: Date.now(), 
    text: data.newTodo 
  })
}
```

**Update**: Modify existing data
```typescript
{
  type: 'update',
  target: 'todos',
  compute: (data) => 
    data.todos.map(t => 
      t.id === selectedId ? { ...t, completed: true } : t
    )
}
```

**Delete**: Remove items
```typescript
{
  type: 'delete',
  target: 'todos',
  path: 'id',
  value: todoId
}
```

### UI Actions

**Show Toast**
```typescript
{
  type: 'show-toast',
  message: 'Task completed!',
  variant: 'success' // success | error | info | warning
}
```

**Navigate**
```typescript
{
  type: 'navigate',
  path: '/dashboard'
}
```

### Value Actions

**Set Value**
```typescript
{
  type: 'set-value',
  target: 'searchQuery',
  compute: (data, event) => event.target.value
}
```

**Toggle Value**
```typescript
{
  type: 'toggle-value',
  target: 'showCompleted'
}
```

**Increment/Decrement**
```typescript
{
  type: 'increment',
  target: 'counter',
  value: 1
}
```

## Component Bindings

Bind component props to data sources:

```typescript
{
  id: 'input',
  type: 'Input',
  bindings: {
    value: { 
      source: 'searchQuery' 
    },
    placeholder: {
      source: 'settings',
      path: 'inputPlaceholder'
    }
  }
}
```

With transformations:

```typescript
{
  bindings: {
    children: {
      source: 'count',
      transform: (value) => `${value} items`
    }
  }
}
```

## Component Pattern Templates

Use these patterns as starting points when authoring JSON schemas. Each example includes
recommended prop shapes and binding strategies for predictable rendering and data flow.

### Form Pattern (Create/Edit)

**Recommended prop shape**
- `name`: field identifier used in data mappings.
- `label`: user-facing label.
- `placeholder`: optional hint text.
- `type`: input type (`text`, `email`, `number`, `date`, etc.).
- `required`: boolean for validation UI.

**Schema example**
```typescript
{
  id: 'profile-form',
  type: 'form',
  props: {
    className: 'space-y-4'
  },
  children: [
    {
      id: 'first-name',
      type: 'Input',
      props: {
        name: 'firstName',
        label: 'First name',
        placeholder: 'Ada',
        required: true
      },
      bindings: {
        value: { source: 'formState', path: 'firstName' }
      },
      events: [
        {
          event: 'change',
          actions: [
            {
              type: 'set-value',
              target: 'formState',
              path: 'firstName',
              compute: (data, event) => event.target.value
            }
          ]
        }
      ]
    },
    {
      id: 'email',
      type: 'Input',
      props: {
        name: 'email',
        label: 'Email',
        placeholder: 'ada@lovelace.dev',
        type: 'email'
      },
      bindings: {
        value: { source: 'formState', path: 'email' }
      },
      events: [
        {
          event: 'change',
          actions: [
            {
              type: 'set-value',
              target: 'formState',
              path: 'email',
              compute: (data, event) => event.target.value
            }
          ]
        }
      ]
    },
    {
      id: 'save-profile',
      type: 'Button',
      props: { children: 'Save profile' },
      events: [
        {
          event: 'click',
          actions: [
            {
              type: 'create',
              target: 'profiles',
              compute: (data) => ({
                id: Date.now(),
                ...data.formState
              })
            },
            {
              type: 'set-value',
              target: 'formState',
              value: { firstName: '', email: '' }
            }
          ]
        }
      ]
    }
  ]
}
```

**Recommended bindings**
- Use `bindings.value` for inputs and update a single `formState` data source.
- Use `set-value` with `path` to update individual fields and avoid cloning the whole object.

### Card Pattern (Summary/Stat)

**Recommended prop shape**
- `title`: primary label.
- `description`: supporting copy.
- `badge`: optional status tag.
- `icon`: optional leading icon name or component id.

**Schema example**
```typescript
{
  id: 'stats-card',
  type: 'Card',
  props: { className: 'p-4' },
  children: [
    {
      id: 'card-header',
      type: 'div',
      props: { className: 'flex items-center justify-between' },
      children: [
        {
          id: 'card-title',
          type: 'h3',
          bindings: {
            children: { source: 'stats', path: 'title' }
          },
          props: { className: 'text-lg font-semibold' }
        },
        {
          id: 'card-badge',
          type: 'Badge',
          bindings: {
            children: { source: 'stats', path: 'status' },
            variant: {
              source: 'stats',
              path: 'status',
              transform: (value) => (value === 'Active' ? 'success' : 'secondary')
            }
          }
        }
      ]
    },
    {
      id: 'card-description',
      type: 'p',
      props: { className: 'text-sm text-muted-foreground' },
      bindings: {
        children: { source: 'stats', path: 'description' }
      }
    }
  ]
}
```

**Recommended bindings**
- Bind the card text fields directly to a `stats` data source.
- Use `transform` for simple presentation mappings (status to badge variant).

### List Pattern (Collection + Row Actions)

**Recommended prop shape**
- `items`: array data source bound at the list container.
- `keyField`: unique field for list keys.
- `primary`: main text content (usually `name` or `title`).
- `secondary`: supporting text (optional).
- `actions`: array of action configs for row-level events.

**Schema example**
```typescript
{
  id: 'task-list',
  type: 'div',
  bindings: {
    children: {
      source: 'tasks',
      transform: (items) =>
        items.map((item) => ({
          id: `task-${item.id}`,
          type: 'div',
          props: { className: 'flex items-center justify-between py-2' },
          children: [
            {
              id: `task-name-${item.id}`,
              type: 'span',
              bindings: {
                children: { source: 'item', path: 'name' }
              }
            },
            {
              id: `task-toggle-${item.id}`,
              type: 'Button',
              props: { size: 'sm', variant: 'outline' },
              bindings: {
                children: {
                  source: 'item',
                  path: 'completed',
                  transform: (value) => (value ? 'Undo' : 'Complete')
                }
              },
              events: [
                {
                  event: 'click',
                  actions: [
                    {
                      type: 'update',
                      target: 'tasks',
                      id: item.id,
                      compute: (data) => ({
                        ...item,
                        completed: !item.completed
                      })
                    }
                  ]
                }
              ]
            }
          ]
        }))
    }
  }
}
```

**Recommended bindings**
- Use a `transform` to map collection items into child component schemas.
- Use `{ source: 'item', path: 'field' }` when binding inside the item loop for clarity and efficiency.

## Event Handling

### Simple Event
```typescript
{
  events: [
    {
      event: 'click',
      actions: [{ type: 'show-toast', message: 'Clicked!' }]
    }
  ]
}
```

### Conditional Event
```typescript
{
  events: [
    {
      event: 'click',
      condition: (data) => data.searchQuery.length > 0,
      actions: [/* ... */]
    }
  ]
}
```

### Multiple Actions
```typescript
{
  events: [
    {
      event: 'click',
      actions: [
        { type: 'create', target: 'items', /* ... */ },
        { type: 'set-value', target: 'input', value: '' },
        { type: 'show-toast', message: 'Added!' }
      ]
    }
  ]
}
```

## Available Custom Hooks

### Data Hooks

#### `useCRUD<T>`
Complete CRUD operations with KV persistence
```typescript
const { items, create, read, update, remove, clear } = useCRUD({
  key: 'todos',
  defaultValue: [],
  persist: true
})
```

#### `useSearch<T>`
Multi-field search with filtering
```typescript
const { query, setQuery, filtered, resultCount } = useSearch({
  items: todos,
  searchFields: ['text', 'tags'],
  caseSensitive: false
})
```

#### `useSort<T>`
Multi-key sorting with direction toggle
```typescript
const { sorted, field, direction, toggleSort } = useSort({
  items: todos,
  initialField: 'createdAt',
  initialDirection: 'desc'
})
```

#### `useJSONData`
Flexible data management with optional persistence
```typescript
const { value, setValue, updatePath, reset } = useJSONData({
  key: 'user-prefs',
  defaultValue: {},
  persist: true
})
```

### UI Hooks

#### `useDialog`
Dialog/modal state management
```typescript
const dialog = useDialog(false)
// dialog.isOpen, dialog.open(), dialog.close(), dialog.toggle()
```

#### `useActionExecutor`
Execute JSON-defined actions
```typescript
const { executeAction, executeActions } = useActionExecutor(context)
await executeAction({ type: 'create', target: 'items', /* ... */ })
```

## Best Practices

### 1. Keep Components Small
- **Atoms**: < 50 LOC
- **Molecules**: 50-100 LOC
- **Organisms**: 100-150 LOC
- If larger, split into smaller pieces

### 2. Extract Logic to Hooks
```typescript
// ❌ Bad: Logic in component
function TodoList() {
  const [todos, setTodos] = useState([])
  const addTodo = (text) => setTodos([...todos, { id: Date.now(), text }])
  const removeTodo = (id) => setTodos(todos.filter(t => t.id !== id))
  // ...
}

// ✅ Good: Logic in hook
function TodoList() {
  const { items: todos, create, remove } = useCRUD({
    key: 'todos',
    defaultValue: []
  })
  // Component only handles UI
}
```

### 3. Use Computed Data Sources
```typescript
// ❌ Bad: Computing in render
components: [{
  type: 'div',
  props: {
    children: `${data.todos.filter(t => t.completed).length} completed`
  }
}]

// ✅ Good: Computed data source
dataSources: [
  {
    id: 'stats',
    type: 'computed',
    compute: (data) => ({
      completed: data.todos.filter(t => t.completed).length
    })
  }
],
components: [{
  bindings: {
    children: {
      source: 'stats',
      path: 'completed',
      transform: (v) => `${v} completed`
    }
  }
}]
```

### 4. Chain Actions
```typescript
// Multiple related actions in sequence
events: [{
  event: 'click',
  actions: [
    { type: 'create', /* ... */ },      // 1. Add item
    { type: 'set-value', /* ... */ },   // 2. Clear input
    { type: 'show-toast', /* ... */ }   // 3. Show feedback
  ]
}]
```

### 5. Leverage Atomic Composition
```typescript
// Build complex UIs from simple atoms
<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    <DataList
      items={filtered}
      renderItem={(item) => (
        <div className="flex gap-2">
          <ActionButton icon={<Edit />} onClick={() => edit(item)} />
          <ActionButton icon={<Trash />} onClick={() => remove(item.id)} />
        </div>
      )}
    />
  </CardContent>
</Card>
```

## Example: Complete Todo App

See `/src/schemas/todo-list.json` for a full working example with:
- KV persistence
- Computed statistics
- CRUD operations
- Action chaining
- Conditional rendering
- Event handling

## Migration Strategy

### Phase 1: Extract Hooks
1. Identify repeated logic patterns
2. Create custom hooks
3. Replace inline logic with hook calls

### Phase 2: Break Down Components
1. Identify large components (>150 LOC)
2. Split into atoms, molecules, organisms
3. Compose back together

### Phase 3: Define JSON Schemas
1. Convert simple pages to JSON first
2. Test with PageRenderer
3. Gradually migrate complex pages

## Performance Tips

1. **Use `useMemo` for expensive computations**
2. **Implement virtual scrolling for large lists**
3. **Lazy load heavy components**
4. **Debounce search and filter operations**
5. **Use computed data sources instead of computing in render**

## Troubleshooting

### Data not persisting?
- Check data source type is 'kv'
- Verify key is unique
- Ensure useKV is called unconditionally

### Actions not executing?
- Check action type spelling
- Verify target matches data source id
- Ensure compute function returns correct type

### Components not rendering?
- Check component type is registered
- Verify props match component API
- Check conditional bindings

## Resources

- **Type Definitions**: `/src/types/json-ui.ts`
- **JSON Schemas**: `/src/schemas/*.json`
- **Compute Functions**: `/src/schemas/compute-functions.ts`
- **Schema Loader**: `/src/schemas/schema-loader.ts`
- **Custom Hooks**: `/src/hooks/data/` and `/src/hooks/ui/`
- **Atomic Components**: `/src/components/atoms/`
- **Component Registry**: `/src/lib/json-ui/component-registry.ts`

---

**Built with ❤️ using React, TypeScript, and Shadcn UI**
