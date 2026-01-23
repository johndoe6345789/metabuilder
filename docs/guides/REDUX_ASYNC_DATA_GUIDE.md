# Redux Async Data Management Guide

This guide explains how to use Redux for all async data operations (fetching, mutations) in MetaBuilder applications.

**Version**: 2.0.0  
**Status**: Production Ready  
**Last Updated**: 2026-01-23

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [useReduxAsyncData Hook](#usereduxasyncdata-hook)
3. [useReduxMutation Hook](#usereduxmutation-hook)
4. [Advanced Patterns](#advanced-patterns)
5. [Error Handling](#error-handling)
6. [Performance & Optimization](#performance--optimization)
7. [Migration from TanStack](#migration-from-tanstack)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

The Redux hooks are already available through `@metabuilder/api-clients`:

```bash
npm install @metabuilder/api-clients
```

### Basic Data Fetching

```typescript
import { useReduxAsyncData } from '@metabuilder/api-clients'

export function UserList() {
  const { data: users, isLoading, error } = useReduxAsyncData(
    async () => {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    }
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return <div>{users?.map(u => <div key={u.id}>{u.name}</div>)}</div>
}
```

### Basic Mutation

```typescript
import { useReduxMutation } from '@metabuilder/api-clients'

export function CreateUserForm() {
  const { mutate, isLoading } = useReduxMutation(
    async (user: CreateUserInput) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(user)
      })
      return response.json()
    }
  )

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutate({ name: 'John', email: 'john@example.com' })
    }}>
      <button disabled={isLoading}>{isLoading ? 'Creating...' : 'Create'}</button>
    </form>
  )
}
```

---

## useReduxAsyncData Hook

### Complete Signature

```typescript
function useReduxAsyncData<T>(
  fetchFn: () => Promise<T>,
  options?: AsyncDataOptions<T>
): UseAsyncDataResult<T>
```

### Options

```typescript
interface AsyncDataOptions<T> {
  // Automatic retry configuration
  maxRetries?: number              // Default: 3 (max retry attempts)
  retryDelay?: number              // Default: 1000ms (exponential backoff)
  retryOn?: (error: Error) => boolean  // Custom retry condition
  
  // Refetch configuration
  enabled?: boolean                // Default: true (enable/disable fetching)
  refetchOnFocus?: boolean         // Default: true (refetch when tab focused)
  refetchOnReconnect?: boolean     // Default: true (refetch on connection restore)
  refetchInterval?: number         // Default: undefined (polling interval in ms)
  staleTime?: number               // Default: 0 (time until data considered stale)
  
  // Callbacks
  onSuccess?: (data: T) => void    // Called when fetch succeeds
  onError?: (error: Error) => void // Called when fetch fails
  onSettled?: () => void           // Called when fetch completes
  
  // Advanced
  dependencies?: unknown[]         // Re-fetch when dependencies change
  cacheKey?: string               // Custom cache key (auto-generated otherwise)
  signal?: AbortSignal            // Abort signal for cancellation
}
```

### Return Value

```typescript
interface UseAsyncDataResult<T> {
  // Data state
  data: T | undefined             // Fetched data
  isLoading: boolean               // True on initial load
  isRefetching: boolean            // True during refetch (data still available)
  error: Error | null              // Error if fetch failed
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  
  // Control methods
  refetch: () => Promise<T>        // Manually refetch data
  retry: () => Promise<T>          // Retry failed fetch
  reset: () => void                // Reset to initial state
}
```

### Examples

#### Basic Fetch

```typescript
const { data, isLoading } = useReduxAsyncData(
  () => fetch('/api/data').then(r => r.json())
)
```

#### Conditional Fetch

```typescript
const { data } = useReduxAsyncData(
  () => fetch('/api/user').then(r => r.json()),
  { enabled: !!currentUserId }
)
```

#### With Dependencies

```typescript
const { data: user } = useReduxAsyncData(
  () => fetch(`/api/users/${userId}`).then(r => r.json()),
  { dependencies: [userId] }  // Refetch when userId changes
)
```

#### With Polling

```typescript
const { data: stats } = useReduxAsyncData(
  () => fetch('/api/stats').then(r => r.json()),
  { 
    refetchInterval: 5000,  // Poll every 5 seconds
    staleTime: 3000         // Consider data stale after 3 seconds
  }
)
```

#### With Custom Error Handling

```typescript
const { data, error, retry } = useReduxAsyncData(
  async () => {
    const res = await fetch('/api/data')
    if (res.status === 401) {
      // Handle unauthorized
      window.location.href = '/login'
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  {
    maxRetries: 5,
    retryDelay: 2000,
    retryOn: (error) => {
      // Retry on network errors, not client errors
      return !error.message.includes('400') && !error.message.includes('401')
    },
    onError: (error) => {
      console.error('Fetch failed:', error)
      // Show toast notification
    }
  }
)
```

#### Pagination

```typescript
const { data: page, hasNextPage, fetchNext } = useReduxPaginatedAsyncData(
  async (pageNumber) => {
    const res = await fetch(`/api/posts?page=${pageNumber}`)
    return res.json()  // Should return { items: [], hasMore: true }
  },
  { 
    pageSize: 20,
    initialPage: 1,
    onSuccess: (newPage) => console.log('Loaded page:', newPage)
  }
)

return (
  <>
    {page?.items?.map(item => <div key={item.id}>{item.name}</div>)}
    {hasNextPage && <button onClick={() => fetchNext()}>Load More</button>}
  </>
)
```

---

## useReduxMutation Hook

### Complete Signature

```typescript
function useReduxMutation<TPayload, TResult>(
  mutationFn: (payload: TPayload) => Promise<TResult>,
  options?: MutationOptions<TPayload, TResult>
): UseMutationResult<TPayload, TResult>
```

### Options

```typescript
interface MutationOptions<TPayload, TResult> {
  // Callbacks
  onSuccess?: (result: TResult, payload: TPayload) => void
  onError?: (error: Error, payload: TPayload) => void
  onSettled?: () => void
  onStatusChange?: (status: 'idle' | 'pending' | 'succeeded' | 'failed') => void
  
  // Advanced
  retry?: number                   // Default: 1 (retry count)
  retryDelay?: number              // Default: 1000ms
}
```

### Return Value

```typescript
interface UseMutationResult<TPayload, TResult> {
  // Mutation execution
  mutate: (payload: TPayload) => Promise<TResult>
  mutateAsync: (payload: TPayload) => Promise<TResult>
  
  // State
  isLoading: boolean               // Mutation in progress
  error: Error | null              // Error if mutation failed
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  data: TResult | undefined        // Last successful result
  
  // Control
  reset: () => void                // Reset to idle state
  abort: () => void                // Cancel ongoing mutation
}
```

### Examples

#### Create Operation

```typescript
const { mutate, isLoading, error } = useReduxMutation<CreateUserInput, User>(
  async (user) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    if (!res.ok) throw new Error('Failed to create user')
    return res.json()
  }
)

const handleSubmit = async (formData) => {
  try {
    const newUser = await mutate(formData)
    console.log('User created:', newUser)
  } catch (err) {
    console.error('Error:', err)
  }
}
```

#### Update Operation

```typescript
const { mutate: updateUser, isLoading } = useReduxMutation<Partial<User>, User>(
  async (updates) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
    return res.json()
  }
)
```

#### Delete Operation

```typescript
const { mutate: deleteUser } = useReduxMutation<number, void>(
  async (userId) => {
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete user')
  }
)
```

#### With Callbacks

```typescript
const { mutate } = useReduxMutation(
  async (user: User) => {
    // API call
  },
  {
    onSuccess: (result, payload) => {
      console.log('Created:', result)
      // Refetch data, close dialog, etc.
    },
    onError: (error, payload) => {
      console.error('Failed:', error)
      // Show error toast
    },
    onSettled: () => {
      console.log('Done')
    }
  }
)
```

#### Sequential Mutations

```typescript
const createUserMutation = useReduxMutation(...)
const assignRoleMutation = useReduxMutation(...)

const handleCreateUserWithRole = async (user, role) => {
  try {
    // First: create user
    const newUser = await createUserMutation.mutate(user)
    
    // Second: assign role
    await assignRoleMutation.mutate({ userId: newUser.id, role })
    
    console.log('User created and role assigned')
  } catch (err) {
    console.error('Failed:', err)
  }
}
```

---

## Advanced Patterns

### Refetch After Mutation

A common pattern is to refetch data after a mutation succeeds:

```typescript
export function PostManager() {
  const { data: posts, refetch } = useReduxAsyncData(
    () => fetch('/api/posts').then(r => r.json())
  )

  const { mutate: createPost } = useReduxMutation(
    async (post: CreatePostInput) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(post)
      })
      return res.json()
    },
    {
      onSuccess: () => {
        refetch()  // Refresh the list
      }
    }
  )

  return (
    <>
      {posts?.map(post => <div key={post.id}>{post.title}</div>)}
      <button onClick={() => createPost({ title: 'New Post' })}>Add</button>
    </>
  )
}
```

### Optimistic Updates

Update UI before mutation completes:

```typescript
export function LikeButton({ postId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked)
  
  const { mutate: toggleLike } = useReduxMutation(
    async (postId) => {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })
      return res.json()
    },
    {
      onError: () => {
        // Revert on error
        setLiked(!liked)
      }
    }
  )

  const handleClick = () => {
    setLiked(!liked)  // Optimistic update
    toggleLike(postId)
  }

  return <button onClick={handleClick}>{liked ? 'Unlike' : 'Like'}</button>
}
```

### Request Deduplication

Prevent duplicate API calls when multiple components fetch the same data:

```typescript
// component1.tsx
const { data: users1 } = useReduxAsyncData(
  () => fetch('/api/users').then(r => r.json())
)

// component2.tsx - same request
const { data: users2 } = useReduxAsyncData(
  () => fetch('/api/users').then(r => r.json())  // Same URL
)

// Only ONE API call is made - results are cached and shared
```

### Custom Hooks on Top of Redux

Build domain-specific hooks:

```typescript
// hooks/useUsers.ts
export function useUsers() {
  return useReduxAsyncData(
    async () => {
      const res = await fetch('/api/users')
      return res.json()
    },
    { refetchInterval: 30000 }  // Refresh every 30 seconds
  )
}

export function useCreateUser() {
  return useReduxMutation(
    async (user: CreateUserInput) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(user)
      })
      return res.json()
    }
  )
}

// Usage
const { data: users } = useUsers()
const { mutate: createUser } = useCreateUser()
```

### Form Integration

```typescript
export function UserForm() {
  const { mutate: saveUser, isLoading, error } = useReduxMutation(...)

  const { register, handleSubmit } = useForm<User>()

  const onSubmit = async (data) => {
    try {
      await saveUser(data)
      alert('Saved!')
    } catch (err) {
      // Form library handles error display
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  )
}
```

---

## Error Handling

### Basic Error Display

```typescript
const { error } = useReduxAsyncData(...)

if (error) {
  return <div className="error">Failed to load: {error.message}</div>
}
```

### Error with Retry

```typescript
const { error, retry, isLoading } = useReduxAsyncData(...)

if (error) {
  return (
    <div className="error">
      <p>{error.message}</p>
      <button onClick={retry} disabled={isLoading}>
        Retry
      </button>
    </div>
  )
}
```

### Error Boundary Integration

```typescript
export function DataFetcher() {
  const { data, error } = useReduxAsyncData(...)

  if (error) {
    throw error  // Propagate to Error Boundary
  }

  return <div>{data}</div>
}
```

### Type-Specific Error Handling

```typescript
const { mutate } = useReduxMutation(
  async (user: User) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    })

    if (res.status === 400) {
      const error = await res.json()
      throw new Error(error.message)
    }

    if (res.status === 409) {
      throw new Error('User already exists')
    }

    if (!res.ok) {
      throw new Error('Server error')
    }

    return res.json()
  },
  {
    onError: (error) => {
      if (error.message.includes('already exists')) {
        // Handle duplicate
      } else if (error.message.includes('Server')) {
        // Handle server error
      }
    }
  }
)
```

---

## Performance & Optimization

### Request Deduplication

Redux automatically deduplicates concurrent requests to the same endpoint:

```typescript
// All of these make only ONE API call
const res1 = useReduxAsyncData(() => fetch('/api/users'))
const res2 = useReduxAsyncData(() => fetch('/api/users'))
const res3 = useReduxAsyncData(() => fetch('/api/users'))
```

### Stale Time and Refetch

Control when data is considered "stale":

```typescript
const { data, isRefetching } = useReduxAsyncData(
  () => fetch('/api/data').then(r => r.json()),
  {
    staleTime: 5000,        // Data fresh for 5 seconds
    refetchOnFocus: true    // Refetch when tab regains focus
  }
)
```

### Manual Cache Control

```typescript
const dispatch = useDispatch()
import { cleanupAsyncRequests } from '@metabuilder/redux-slices'

// Clean up old requests to prevent memory leaks
dispatch(cleanupAsyncRequests())
```

### Pagination for Large Datasets

Instead of loading all data, use pagination:

```typescript
const { data: page, hasNextPage, fetchNext } = useReduxPaginatedAsyncData(
  (pageNum) => fetch(`/api/items?page=${pageNum}`).then(r => r.json()),
  { pageSize: 50 }
)

return (
  <>
    {page?.items?.map(item => <div key={item.id}>{item}</div>)}
    {hasNextPage && <button onClick={fetchNext}>Load More</button>}
  </>
)
```

---

## Migration from TanStack

If you're migrating from TanStack React Query, follow these simple steps:

### 1. Update Imports

```typescript
// BEFORE
import { useQuery, useMutation } from '@tanstack/react-query'

// AFTER
import { useReduxAsyncData, useReduxMutation } from '@metabuilder/api-clients'
```

### 2. Rename Hooks

```typescript
// BEFORE
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(r => r.json())
})

// AFTER
const { data, isLoading, error } = useReduxAsyncData(
  () => fetch('/api/users').then(r => r.json())
)
```

### 3. Update Mutation Signatures

```typescript
// BEFORE
const { mutate, isLoading } = useMutation({
  mutationFn: (user: User) => fetch('/api/users', { method: 'POST', body: JSON.stringify(user) }).then(r => r.json()),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
})

// AFTER
const { data: users, refetch } = useReduxAsyncData(...)
const { mutate, isLoading } = useReduxMutation(
  (user: User) => fetch('/api/users', { method: 'POST', body: JSON.stringify(user) }).then(r => r.json()),
  { onSuccess: () => refetch() }
)
```

### 4. Remove Provider

```typescript
// BEFORE
import { QueryClientProvider } from '@tanstack/react-query'

<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>

// AFTER - Provider is already configured at app root
// No changes needed in component tree
```

---

## Troubleshooting

### Issue: Data not updating after mutation

**Solution**: Use `refetch()` after mutation succeeds:

```typescript
const { refetch } = useReduxAsyncData(...)
const { mutate } = useReduxMutation(..., {
  onSuccess: () => refetch()
})
```

### Issue: Memory leaks with polling

**Solution**: Clean up interval on unmount:

```typescript
useEffect(() => {
  return () => {
    dispatch(cleanupAsyncRequests())
  }
}, [])
```

### Issue: Stale data displayed

**Solution**: Adjust `staleTime` or force refetch:

```typescript
const { data, refetch } = useReduxAsyncData(
  fetchFn,
  { staleTime: 0 }  // Always consider data stale
)

// Or manually refetch
refetch()
```

### Issue: Duplicate API calls

**Solution**: This is expected behavior - Redux deduplicates automatically. If you're seeing true duplicates, check:

1. Component renders twice in development mode (React.StrictMode)
2. Dependency array in `useEffect` is correct
3. Request ID is stable (it is by default)

### Issue: TypeScript errors with generics

**Solution**: Provide explicit types:

```typescript
interface UserResponse { id: number; name: string }

const { data } = useReduxAsyncData<UserResponse>(
  () => fetch('/api/users').then(r => r.json())
)

const { mutate } = useReduxMutation<CreateUserInput, UserResponse>(
  (input) => createUser(input)
)
```

---

## Related Documentation

- [asyncDataSlice Reference](../redux/slices/ASYNC_DATA_SLICE.md)
- [Redux Hooks API](../redux/hooks-async/README.md)
- [docs/CLAUDE.md - Async Data Management](../CLAUDE.md#async-data-management-with-redux)

---

**Questions?** Check the [redux/hooks-async](../../redux/hooks-async) directory for implementation details.
