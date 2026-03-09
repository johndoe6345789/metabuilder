# Hook Library Reference

## Data Management Hooks

### useDataSource
Unified data source manager supporting KV storage, static data, and computed values.

```typescript
import { useDataSource } from '@/hooks/data'

const { data, setData, isLoading } = useDataSource({
  id: 'myData',
  type: 'kv',
  key: 'app-data',
  defaultValue: []
})
```

**Config Options:**
- `type`: 'kv' | 'static' | 'computed'
- `key`: KV storage key (for type='kv')
- `defaultValue`: Initial value
- `compute`: Function for computed data
- `dependencies`: Array of dependency IDs

---

### useCRUD
Complete CRUD operations for any data type with functional updates.

```typescript
import { useCRUD } from '@/hooks/data'
import { useKV } from '@github/spark/hooks'

const [items, setItems] = useKV('todos', [])
const crud = useCRUD({ items, setItems, idField: 'id' })

crud.create({ id: Date.now(), title: 'New task' })
const item = crud.read(123)
crud.update(123, { completed: true })
crud.delete(123)
const all = crud.list()
```

---

### useSearchFilter
Search and filter with multiple fields support.

```typescript
import { useSearchFilter } from '@/hooks/data'

const {
  searchQuery,
  setSearchQuery,
  filters,
  setFilter,
  clearFilters,
  filtered,
  count
} = useSearchFilter({
  items: myData,
  searchFields: ['name', 'description'],
  filterFn: (item, filters) => item.status === filters.status
})
```

---

### useSort
Sortable list with direction toggle.

```typescript
import { useSort } from '@/hooks/data'

const {
  sorted,
  sortField,
  sortDirection,
  toggleSort,
  resetSort
} = useSort({
  items: myData,
  defaultField: 'name',
  defaultDirection: 'asc'
})
```

---

### usePagination
Full pagination logic with navigation.

```typescript
import { usePagination } from '@/hooks/data'

const {
  items: paginatedItems,
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  prevPage,
  hasNext,
  hasPrev,
  startIndex,
  endIndex
} = usePagination({
  items: myData,
  pageSize: 10,
  initialPage: 1
})
```

---

### useSelection
Multi/single selection with bulk operations.

```typescript
import { useSelection } from '@/hooks/data'

const {
  selected,
  toggle,
  select,
  deselect,
  selectAll,
  deselectAll,
  isSelected,
  getSelected,
  count,
  hasSelection
} = useSelection({
  items: myData,
  multiple: true,
  idField: 'id'
})
```

---

## Form Hooks

### useFormField
Individual field validation and state management.

```typescript
import { useFormField } from '@/hooks/forms'

const field = useFormField({
  name: 'email',
  defaultValue: '',
  rules: [
    {
      validate: (val) => val.includes('@'),
      message: 'Must be valid email'
    }
  ]
})

<input
  value={field.value}
  onChange={(e) => field.onChange(e.target.value)}
  onBlur={field.onBlur}
/>
{field.touched && field.error && <span>{field.error}</span>}
```

---

### useForm
Form submission with async support.

```typescript
import { useForm } from '@/hooks/forms'

const { submit, isSubmitting } = useForm({
  fields: { email: {...}, password: {...} },
  onSubmit: async (values) => {
    await api.submit(values)
  }
})
```

---

## Best Practices

1. **Always use functional updates with useCRUD:**
   ```typescript
   // ✅ CORRECT
   crud.create(newItem)
   crud.update(id, updates)
   
   // ❌ WRONG - Never manually modify items
   setItems([...items, newItem]) // Can cause data loss!
   ```

2. **Combine hooks for complex scenarios:**
   ```typescript
   const [items, setItems] = useKV('data', [])
   const crud = useCRUD({ items, setItems })
   const { filtered } = useSearchFilter({ items })
   const { sorted } = useSort({ items: filtered })
   const { items: page } = usePagination({ items: sorted })
   ```

3. **Use computed data sources for derived state:**
   ```typescript
   useDataSource({
     type: 'computed',
     compute: (data) => ({
       total: data.items?.length || 0,
       completed: data.items?.filter(i => i.done).length || 0
     }),
     dependencies: ['items']
   })
   ```
