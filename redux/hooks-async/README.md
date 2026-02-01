# @metabuilder/hooks-async

Redux-backed async data and mutation hooks - drop-in replacement for TanStack React Query.

## Features

- ✅ **API Compatible** - Same interfaces as `useQuery`/`useMutation`
- ✅ **Redux-Backed** - All state in Redux store, observable via DevTools
- ✅ **Request Deduplication** - Prevents duplicate concurrent requests
- ✅ **Auto Cleanup** - Old requests removed automatically (>5min)
- ✅ **Retry Logic** - Automatic retries with configurable backoff
- ✅ **Refetch Support** - Manual refetch, refetch on focus, auto-refetch intervals
- ✅ **Pagination** - Built-in pagination helper
- ✅ **Multi-Step Mutations** - Execute sequences of mutations

## Hooks

### `useReduxAsyncData`

Fetch data with automatic caching and retry logic.

```typescript
import { useReduxAsyncData } from '@metabuilder/hooks-async'

function UserProfile() {
  const { data, isLoading, error, refetch } = useReduxAsyncData(
    async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      onSuccess: (data) => console.log('User loaded:', data),
      onError: (error) => console.error('Failed:', error),
      refetchOnFocus: true,
    }
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return <div>{data?.name}</div>
}
```

### `useReduxMutation`

Execute write operations (POST, PUT, DELETE).

```typescript
import { useReduxMutation } from '@metabuilder/hooks-async'

function CreateUserForm() {
  const { mutate, isLoading, error } = useReduxMutation(
    async (userData) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      return res.json()
    },
    {
      onSuccess: (user) => console.log('User created:', user),
      onError: (error) => console.error('Failed:', error),
    }
  )

  const handleSubmit = async (formData) => {
    try {
      const user = await mutate(formData)
      console.log('Created:', user)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit(new FormData(e.target))
    }}>
      {/* form fields */}
    </form>
  )
}
```

### `useReduxPaginatedAsyncData`

Fetch paginated data with built-in pagination controls.

```typescript
const { data, currentPage, nextPage, prevPage, isLoading } =
  useReduxPaginatedAsyncData(
    (page, pageSize) => fetchUsers(page, pageSize),
    { pageSize: 20 }
  )
```

## Architecture

```
redux/hooks-async/
├── src/
│   ├── useReduxAsyncData.ts        # Primary async hook + pagination
│   ├── useReduxMutation.ts         # Mutation hook + multi-step mutations
│   ├── index.ts                    # Public exports
│   └── __tests__/
│       ├── useReduxAsyncData.test.ts
│       └── useReduxMutation.test.ts
├── package.json                    # Dependencies: Redux, React
├── tsconfig.json                   # TypeScript config
└── README.md                        # This file
```

## State Shape

All async state is stored in Redux:

```typescript
// Redux State
{
  asyncData: {
    requests: {
      [requestId]: {
        id: string
        status: 'idle' | 'pending' | 'succeeded' | 'failed'
        data: unknown
        error: string | null
        retryCount: number
        maxRetries: number
        lastRefetch: number
        refetchInterval: number | null
        isRefetching: boolean
      }
    },
    globalLoading: boolean
    globalError: string | null
  }
}
```

## Testing

```bash
npm run test --workspace=@metabuilder/hooks-async
npm run typecheck --workspace=@metabuilder/hooks-async
npm run build --workspace=@metabuilder/hooks-async
```

## Migration from TanStack

Replace imports:

```typescript
// Before
import { useQuery, useMutation } from '@tanstack/react-query'

// After
import { useReduxAsyncData, useReduxMutation } from '@metabuilder/hooks-async'

// Use identically
const query = useReduxAsyncData(fetchFn, options)
const mutation = useReduxMutation(mutateFn, options)
```

## Performance Considerations

- **Request Deduplication**: Same requestId = same cache entry
- **Memory Management**: Old requests (>5min) auto-cleanup
- **DevTools**: Full Redux DevTools support for debugging
- **Selector Memoization**: Use selectors for efficient re-renders

## Error Handling

Errors are stored in Redux and available via:

```typescript
const { error } = useReduxAsyncData(fetchFn)
// Access via selector
const error = useSelector((s) => selectAsyncError(s, requestId))
```

## References

- [asyncDataSlice.ts](../slices/src/slices/asyncDataSlice.ts) - Redux slice
- [TANSTACK_TO_REDUX_MIGRATION_CHECKLIST.txt](../../txt/TANSTACK_TO_REDUX_MIGRATION_CHECKLIST.txt) - Full migration plan
- [CLAUDE.md](../../CLAUDE.md) - Project guidelines
