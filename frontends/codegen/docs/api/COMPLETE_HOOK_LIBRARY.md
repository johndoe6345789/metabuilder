# Complete Hook Library Reference

## Overview

The CodeForge hook library provides comprehensive, reusable React hooks organized by domain. All hooks are under 150 LOC, fully typed, and designed for composition.

## Organization

```
src/hooks/
├── data/              # Data management hooks
├── ui/                # UI state management hooks
├── forms/             # Form and validation hooks
├── feature-ideas/     # Feature-specific hooks
├── core/              # Core utility hooks
├── ai/                # AI integration hooks
└── orchestration/     # JSON orchestration hooks
```

## Data Management Hooks

### `useArray<T>(key, defaultValue)`

Enhanced array management with persistence.

**Features:**
- Add/remove items
- Update items with predicates
- Find and filter operations
- Auto-persists to KV store

**Example:**
```typescript
import { useArray } from '@/hooks/data'

const { items, add, remove, update, find, count } = useArray<Todo>('todos', [])

add({ id: '1', text: 'Learn hooks', done: false })
update(
  (todo) => todo.id === '1',
  (todo) => ({ ...todo, done: true })
)
remove((todo) => todo.done)
```

### `useCRUD<T>(items, setItems)`

Complete CRUD operations for entity management.

**Features:**
- Create, read, update, delete operations
- Selection management
- Duplicate functionality
- Type-safe operations

**Example:**
```typescript
import { useCRUD } from '@/hooks/data'
import { useKV } from '@github/spark/hooks'

const [tasks, setTasks] = useKV('tasks', [])
const {
  create,
  update,
  remove,
  selected,
  setSelectedId
} = useCRUD(tasks, setTasks)

create({ id: '1', name: 'New Task', status: 'pending' })
update('1', { status: 'completed' })
setSelectedId('1')
```

### `useSearch<T>(items, searchKeys, debounceMs)`

Debounced search across multiple fields.

**Features:**
- Multi-field search
- Debounced input
- Type-safe key selection
- Performance optimized

**Example:**
```typescript
import { useSearch } from '@/hooks/data'

const { query, setQuery, results, isSearching } = useSearch(
  users,
  ['name', 'email', 'role'],
  300
)

// In your component
<Input value={query} onChange={(e) => setQuery(e.target.value)} />
{results.map(user => <UserCard key={user.id} user={user} />)}
```

### `useDebounce<T>(value, delay)`

Debounce any value changes.

**Example:**
```typescript
import { useDebounce } from '@/hooks/data'

const [input, setInput] = useState('')
const debouncedInput = useDebounce(input, 500)

useEffect(() => {
  // API call with debounced value
  fetchResults(debouncedInput)
}, [debouncedInput])
```

### `useSort<T>(items, defaultKey)`

Sort items by any key with direction toggle.

**Features:**
- String, number, and generic comparison
- Toggle ascending/descending
- Type-safe sort keys

**Example:**
```typescript
import { useSort } from '@/hooks/data'

const { sortedItems, sortKey, sortDirection, toggleSort } = useSort(
  products,
  'name'
)

<Button onClick={() => toggleSort('price')}>
  Sort by Price {sortKey === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
</Button>
```

### `usePagination<T>(items, initialPageSize)`

Client-side pagination with full controls.

**Features:**
- Page navigation
- Dynamic page size
- Has next/prev indicators
- Total page calculation

**Example:**
```typescript
import { usePagination } from '@/hooks/data'

const {
  items,
  page,
  totalPages,
  nextPage,
  prevPage,
  goToPage,
  hasNext,
  hasPrev
} = usePagination(allItems, 20)

<Button onClick={prevPage} disabled={!hasPrev}>Previous</Button>
<span>Page {page} of {totalPages}</span>
<Button onClick={nextPage} disabled={!hasNext}>Next</Button>
```

## UI State Hooks

### `useDialog(initialOpen)`

Simple dialog/modal state management.

**Example:**
```typescript
import { useDialog } from '@/hooks/ui'

const { isOpen, open, close, toggle } = useDialog()

<Button onClick={open}>Open Dialog</Button>
<Dialog open={isOpen} onOpenChange={(open) => open ? open() : close()}>
  ...
</Dialog>
```

### `useTabs<T>(defaultTab)`

Type-safe tab navigation.

**Example:**
```typescript
import { useTabs } from '@/hooks/ui'

const { activeTab, switchTab, isActive } = useTabs<'overview' | 'details' | 'settings'>('overview')

<Tabs value={activeTab} onValueChange={switchTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
  </TabsList>
</Tabs>
```

### `useSelection<T>()`

Multi-select state management.

**Features:**
- Select/deselect individual items
- Select all/deselect all
- Toggle selection
- Selection count

**Example:**
```typescript
import { useSelection } from '@/hooks/ui'

const {
  selectedIds,
  toggle,
  selectAll,
  deselectAll,
  isSelected,
  count
} = useSelection()

<Checkbox
  checked={isSelected(item.id)}
  onCheckedChange={() => toggle(item.id)}
/>
{count > 0 && <Badge>{count} selected</Badge>}
```

### `useClipboard(successMessage)`

Copy to clipboard with feedback.

**Example:**
```typescript
import { useClipboard } from '@/hooks/ui'

const { copied, copy } = useClipboard('Copied to clipboard!')

<Button onClick={() => copy(codeSnippet)}>
  {copied ? 'Copied!' : 'Copy'}
</Button>
```

## Form Hooks

### `useFormField<T>(initialValue, rules)`

Single form field with validation.

**Features:**
- Validation rules
- Touch state
- Error messages
- Reset functionality

**Example:**
```typescript
import { useFormField } from '@/hooks/forms'

const email = useFormField('', [
  {
    validate: (v) => v.includes('@'),
    message: 'Invalid email'
  },
  {
    validate: (v) => v.length > 0,
    message: 'Email required'
  }
])

<Input
  value={email.value}
  onChange={(e) => email.onChange(e.target.value)}
  onBlur={email.onBlur}
/>
{email.touched && email.error && <span>{email.error}</span>}
```

### `useForm<T>(config)`

Complete form management with validation.

**Features:**
- Multi-field state
- Validation schema
- Async submit handling
- Touch tracking per field

**Example:**
```typescript
import { useForm } from '@/hooks/forms'

const form = useForm({
  initialValues: {
    name: '',
    email: '',
    message: ''
  },
  validate: (values) => {
    const errors: Record<string, string> = {}
    if (!values.email.includes('@')) {
      errors.email = 'Invalid email'
    }
    return errors
  },
  onSubmit: async (values) => {
    await api.submitForm(values)
    toast.success('Form submitted!')
  }
})

<form onSubmit={form.handleSubmit}>
  <Input
    value={form.values.email}
    onChange={(e) => form.setValue('email', e.target.value)}
  />
  {form.errors.email && <span>{form.errors.email}</span>}
  <Button type="submit" disabled={form.isSubmitting}>
    {form.isSubmitting ? 'Submitting...' : 'Submit'}
  </Button>
</form>
```

## Hook Composition

Hooks are designed to be composed together:

```typescript
import { useArray, useSearch, useSort, usePagination } from '@/hooks/data'
import { useSelection } from '@/hooks/ui'

function useProductList() {
  const { items, add, remove, update } = useArray<Product>('products', [])
  const { results, query, setQuery } = useSearch(items, ['name', 'category'])
  const { sortedItems, toggleSort } = useSort(results, 'name')
  const { items: pagedItems, ...pagination } = usePagination(sortedItems, 10)
  const selection = useSelection<Product>()

  return {
    products: pagedItems,
    add,
    remove,
    update,
    search: { query, setQuery },
    sort: { toggleSort },
    pagination,
    selection,
  }
}
```

## Best Practices

1. **Keep hooks focused**: One responsibility per hook
2. **Use composition**: Combine simple hooks for complex behavior
3. **Type everything**: Leverage TypeScript for safety
4. **Handle loading/error**: Always consider async states
5. **Memoize callbacks**: Use `useCallback` for stable references
6. **Document dependencies**: Clear about what causes re-renders

## Performance Tips

- Use `useCallback` and `useMemo` where appropriate
- Avoid creating new objects/arrays in render
- Leverage the functional update pattern for `setState`
- Consider `useTransition` for non-urgent updates
- Profile with React DevTools

## Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useArray } from '@/hooks/data'

test('useArray adds items correctly', () => {
  const { result } = renderHook(() => useArray('test-key', []))
  
  act(() => {
    result.current.add({ id: '1', name: 'Test' })
  })
  
  expect(result.current.items).toHaveLength(1)
  expect(result.current.items[0].name).toBe('Test')
})
```
