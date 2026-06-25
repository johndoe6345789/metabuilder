# @metabuilder/hooks-utils

Utility hooks library for MetaBuilder - data grid operations, async management, and timing utilities.

## Installation

```bash
npm install @metabuilder/hooks-utils
```

## Hooks

### useTableState

Unified data grid state management combining pagination, sorting, filtering, and searching.

```typescript
import { useTableState } from '@metabuilder/hooks-utils'

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', status: 'active' },
  { id: 2, name: 'Bob', email: 'bob@example.com', status: 'inactive' },
]

const table = useTableState(users, {
  pageSize: 10,
  searchFields: ['name', 'email'],
  defaultSort: { field: 'name', direction: 'asc' }
})

// Use in component
<input
  placeholder="Search..."
  value={table.search}
  onChange={(e) => table.setSearch(e.target.value)}
/>

<button onClick={() => table.sort('name')}>
  Sort by Name {table.sort?.field === 'name' && table.sort?.direction}
</button>

<button onClick={() => table.addFilter({ field: 'status', operator: 'eq', value: 'active' })}>
  Filter Active
</button>

// Render paginated results
{table.paginatedItems.map(user => (
  <div key={user.id}>{user.name}</div>
))}

<button onClick={table.prevPage} disabled={table.currentPage === 1}>Prev</button>
<span>Page {table.currentPage} of {table.totalPages}</span>
<button onClick={table.nextPage} disabled={table.currentPage === table.totalPages}>Next</button>
```

**Features:**
- Multi-column sorting with ascending/descending
- Multi-filter with operators: `eq`, `contains`, `startsWith`, `endsWith`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`
- Full-text search across specified fields
- Configurable page size
- Reset to initial state

---

### useAsyncOperation

Non-Redux async operation management with automatic retry and response caching.

```typescript
import { useAsyncOperation } from '@metabuilder/hooks-utils'

const { data, isLoading, error, execute, retry } = useAsyncOperation(
  () => fetch('/api/users').then(r => r.json()),
  {
    retryCount: 3,
    retryDelay: 1000,
    cacheKey: 'users',
    cacheTTL: 60000, // 1 minute
    onSuccess: (data) => console.log('Loaded:', data),
    onError: (error) => console.error('Failed:', error.message),
  }
)

// Auto-execute on mount
useEffect(() => {
  execute()
}, [execute])

if (isLoading) return <Spinner />
if (error) return <Error message={error.message} onRetry={retry} />
return <UserList users={data} />
```

**Features:**
- Automatic retry with exponential backoff
- Response caching with TTL
- Request deduplication
- Status tracking: `idle`, `pending`, `succeeded`, `failed`
- Error handling with typed errors
- Abort capability

---

### useDebounced

Debounces a value with optional leading/trailing edge control.

```typescript
import { useDebounced } from '@metabuilder/hooks-utils'

const [value, setValue] = useState('')
const { value: debouncedValue, cancel, isPending } = useDebounced(value, 300, {
  leading: false,
  trailing: true
})

useEffect(() => {
  if (debouncedValue) {
    searchApi(debouncedValue)
  }
}, [debouncedValue])

<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Type to search..."
/>
{isPending && <Spinner />}
```

**Features:**
- Configurable delay
- Leading/trailing edge options
- Cancel pending debounce
- isPending state tracking

---

### useThrottled

Throttles a value to emit at most once per interval.

```typescript
import { useThrottled } from '@metabuilder/hooks-utils'

const scrollY = useWindowScroll()
const { value: throttledY } = useThrottled(scrollY, 100, {
  leading: true,
  trailing: false
})

// Fires at most every 100ms
useEffect(() => {
  updateScrollIndicator(throttledY)
}, [throttledY])
```

**Use cases:**
- Scroll handlers
- Resize listeners
- Drag operations
- Real-time updates

---

## API Reference

### useTableState

```typescript
interface UseTableStateOptions<T> {
  searchFields?: (keyof T)[]
  pageSize?: number
  defaultSort?: SortConfig<T>
  defaultFilters?: Filter<T>[]
  defaultSearch?: string
}

interface UseTableStateReturn<T> {
  items: T[]
  filteredItems: T[]
  paginatedItems: T[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  prevPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  sort: SortConfig<T> | null
  sort: (field: keyof T, direction?: 'asc' | 'desc') => void
  clearSort: () => void
  filters: Filter<T>[]
  addFilter: (filter: Filter<T>) => void
  removeFilter: (index: number) => void
  updateFilter: (index: number, filter: Filter<T>) => void
  clearFilters: () => void
  search: string
  setSearch: (query: string) => void
  clearSearch: () => void
  reset: () => void
  hasActiveFilters: boolean
  hasSearch: boolean
}
```

### useAsyncOperation

```typescript
interface UseAsyncOperationOptions {
  retryCount?: number
  retryDelay?: number
  retryBackoff?: number
  cacheKey?: string
  cacheTTL?: number
  onSuccess?: <T>(data: T) => void
  onError?: (error: AsyncError) => void
  onStatusChange?: (status: AsyncStatus) => void
  autoExecute?: boolean
}

interface UseAsyncOperationReturn<T> {
  data: T | null
  error: AsyncError | null
  status: AsyncStatus
  isLoading: boolean
  isIdle: boolean
  isSuccess: boolean
  isError: boolean
  execute: () => Promise<T | null>
  retry: () => Promise<T | null>
  refetch: () => Promise<T | null>
  reset: () => void
}
```

---

## Best Practices

1. **useTableState**: Use for any list/table UI that needs sorting, filtering, or pagination
2. **useAsyncOperation**: Use instead of manual Promise handling for non-Redux apps
3. **useDebounced**: Use for form inputs, search fields, and value updates
4. **useThrottled**: Use for scroll, resize, and drag listeners

## Related Packages

- `@metabuilder/hooks-forms` - Form management with validation
- `@metabuilder/hooks` - Core custom hooks
- `@metabuilder/redux-slices` - Redux state management
