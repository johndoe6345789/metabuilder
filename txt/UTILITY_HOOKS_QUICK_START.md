# Utility Hooks Quick Start Guide

## Installation

Both packages are already part of the monorepo. Just import them:

```typescript
import { useTableState, useAsyncOperation, useDebounced, useThrottled } from '@metabuilder/hooks-utils'
import { useFormBuilder } from '@metabuilder/hooks-forms'
```

## Common Patterns

### 1. Data Table with Search, Filter, Sort, Pagination

```typescript
import { useTableState } from '@metabuilder/hooks-utils'

interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
}

function UserTable({ users }: { users: User[] }) {
  const table = useTableState(users, {
    pageSize: 10,
    searchFields: ['name', 'email'],
    defaultSort: { field: 'name', direction: 'asc' }
  })

  return (
    <>
      <input
        placeholder="Search users..."
        value={table.search}
        onChange={(e) => table.setSearch(e.target.value)}
      />

      <button onClick={() => table.sort('name')}>
        Sort by Name {table.sort?.field === 'name' ? `(${table.sort.direction})` : ''}
      </button>

      <select onChange={(e) => {
        if (e.target.value) {
          table.addFilter({
            field: 'status',
            operator: 'eq',
            value: e.target.value
          })
        } else {
          table.clearFilters()
        }
      }}>
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <table>
        <tbody>
          {table.paginatedItems.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={table.prevPage} disabled={table.currentPage === 1}>Prev</button>
        <span>Page {table.currentPage} of {table.totalPages}</span>
        <button onClick={table.nextPage} disabled={table.currentPage === table.totalPages}>Next</button>
      </div>
    </>
  )
}
```

### 2. Async Data Fetching with Retry

```typescript
import { useAsyncOperation } from '@metabuilder/hooks-utils'

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error, retry } = useAsyncOperation(
    () => fetch(`/api/users/${userId}`).then(r => r.json()),
    {
      retryCount: 3,
      retryDelay: 1000,
      cacheKey: `user-${userId}`,
      cacheTTL: 60000, // 1 minute
    }
  )

  useEffect(() => {
    // Auto-execute on mount
    const loadUser = async () => {
      await execute()
    }
    loadUser()
  }, [])

  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} onRetry={retry} />
  if (!user) return <Empty />

  return <Profile user={user} />
}
```

### 3. Search Input with Debounce

```typescript
import { useDebounced } from '@metabuilder/hooks-utils'

function SearchUsers() {
  const [query, setQuery] = useState('')
  const { value: debouncedQuery, isPending } = useDebounced(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery)
    }
  }, [debouncedQuery])

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {isPending && <Spinner />}
    </>
  )
}
```

### 4. Form with Validation and Field Arrays

```typescript
import { useFormBuilder } from '@metabuilder/hooks-forms'

interface UserForm {
  name: string
  email: string
  emails: string[]
}

function UserForm() {
  const form = useFormBuilder<UserForm>({
    initialValues: {
      name: '',
      email: '',
      emails: ['']
    },
    validation: (values) => {
      const errors: ValidationErrors<UserForm> = {}
      if (!values.name) errors.name = 'Name required'
      if (!values.email.includes('@')) errors.email = 'Invalid email'
      return errors
    },
    onSubmit: async (values) => {
      await submitUser(values)
    },
    validateOnBlur: true,
  })

  const emailArray = form.getFieldArray('emails')

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.submit() }}>
      <div>
        <input
          value={form.values.name}
          onChange={(e) => form.setFieldValue('name', e.target.value)}
          onBlur={() => form.setFieldTouched('name')}
        />
        {form.touched.name && form.errors.name && (
          <span className="error">{form.errors.name}</span>
        )}
      </div>

      <div>
        <input
          type="email"
          value={form.values.email}
          onChange={(e) => form.setFieldValue('email', e.target.value)}
          onBlur={() => form.setFieldTouched('email')}
        />
        {form.touched.email && form.errors.email && (
          <span className="error">{form.errors.email}</span>
        )}
      </div>

      <fieldset>
        <legend>Additional Emails</legend>
        {emailArray.values.map((email, idx) => (
          <div key={idx}>
            <input
              value={email}
              onChange={(e) => {
                const newEmails = [...emailArray.values]
                newEmails[idx] = e.target.value
                form.setFieldValue('emails', newEmails)
              }}
            />
            <button onClick={() => emailArray.remove(idx)}>Remove</button>
          </div>
        ))}
        <button onClick={() => emailArray.add('')}>Add Email</button>
      </fieldset>

      <button type="submit" disabled={form.isSubmitting || !form.isValid}>
        {form.isSubmitting ? 'Saving...' : 'Save'}
      </button>

      {form.submitError && (
        <div className="error">{form.submitError}</div>
      )}
    </form>
  )
}
```

### 5. Scroll Event with Throttle

```typescript
import { useThrottled } from '@metabuilder/hooks-utils'

function ScrollIndicator() {
  const [scrollY, setScrollY] = useState(0)
  const { value: throttledY } = useThrottled(scrollY, 100)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // This fires at most every 100ms
    updateScrollBar(throttledY)
  }, [throttledY])

  return <div style={{ transform: `translateY(${throttledY}px)` }} />
}
```

## Migration Checklist

### When to use these hooks:

- **useTableState**: Replace manual pagination, sorting, filtering, search logic
- **useAsyncOperation**: Replace manual Promise handling and retry logic
- **useDebounced**: Replace manual debounce in search/filter inputs
- **useThrottled**: Replace manual throttle in scroll/resize handlers
- **useFormBuilder**: Replace custom form state management and validation

### How to migrate:

1. Identify duplicate logic in your component
2. Import the appropriate hook
3. Replace manual state with hook calls
4. Delete old validation/state management code
5. Test that functionality still works

## Common Issues

### Q: useTableState resets to page 1 when I search
**A**: This is intentional - when filters change, page should reset. If you want different behavior, use `setPage` after `setSearch`.

### Q: useAsyncOperation caching not working
**A**: Make sure you provide a unique `cacheKey` and set `cacheTTL` (time-to-live in ms). Cache is global per key.

### Q: useFormBuilder validation fires before I'm done typing
**A**: Use `validateOnChange: false` and `validateOnBlur: true` for better UX.

### Q: useDebounced is still calling too often
**A**: Increase the delay value (in milliseconds). 300ms is good for most cases.

### Q: Can I use these with Redux?
**A**: Yes! These hooks are compatible with Redux apps. Just dispatch actions in `onSubmit` callbacks.

## Performance Tips

1. **useTableState**: Re-renders only visible items, not all 1000+ rows
2. **useAsyncOperation**: Use `cacheKey` to avoid refetching same data
3. **useDebounced**: Higher delay (500-1000ms) = fewer API calls for search
4. **useThrottled**: Lower interval (50-100ms) for smooth scroll/drag
5. **useFormBuilder**: Use `getFieldError` selectors to avoid full re-renders

## Related Documentation

- Full API Reference: `redux/hooks-utils/README.md`
- Form Examples: `redux/hooks-forms/README.md`
- Architecture: `txt/UTILITY_HOOKS_IMPLEMENTATION_2026-01-23.md`
- Project Guide: `CLAUDE.md` → "Utility Hooks" section
