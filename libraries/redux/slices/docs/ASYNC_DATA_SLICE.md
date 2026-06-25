# asyncDataSlice Documentation

Technical reference for the Redux async data management slice that powers all data fetching and mutations.

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2026-01-23

---

## Overview

The `asyncDataSlice` is a Redux Toolkit slice that provides a centralized, normalized store for all async data operations. It handles:

- Generic data fetching with automatic retries
- Mutations (create, update, delete)
- Request deduplication
- Automatic cleanup of old requests
- Pagination support
- Error handling and recovery
- State inspection via selectors

**Why Redux instead of external libraries?**

1. **Single source of truth** - All state in Redux DevTools
2. **Time-travel debugging** - Replay requests with Redux DevTools
3. **Reduced dependencies** - No external query library needed
4. **Better SSR** - Explicit state management for Next.js
5. **Predictable** - Standard Redux patterns everyone knows

---

## State Shape

### AsyncRequest Interface

Each request in flight or completed is represented as an `AsyncRequest`:

```typescript
interface AsyncRequest {
  // Identity
  id: string                      // Unique request ID
  
  // Status
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  
  // Data
  data: unknown                   // Response data (any type)
  error: string | null            // Error message if failed
  
  // Retry Configuration
  retryCount: number              // How many times this has retried
  maxRetries: number              // Maximum allowed retries
  retryDelay: number              // Delay between retries (ms)
  
  // Caching
  lastRefetch: number             // Timestamp of last refetch
  refetchInterval: number | null  // Auto-refetch interval (ms) or null
  
  // Lifecycle
  createdAt: number               // When request was created
  isRefetching: boolean           // Currently refetching with existing data?
}
```

### Full Redux State

```typescript
interface AsyncDataState {
  requests: Record<string, AsyncRequest>  // Keyed by request ID
  globalLoading: boolean                   // Any request loading?
  globalError: string | null               // Most recent error
}

// Root state shape
{
  asyncData: {
    requests: {
      "fetch_/api/users": { id: "...", status: "succeeded", data: [...], ... },
      "mutation_createUser_123": { id: "...", status: "pending", ... }
    },
    globalLoading: false,
    globalError: null
  }
}
```

---

## Async Thunks

Thunks are the main way to trigger async operations. They return a Promise that resolves with the result.

### fetchAsyncData

Fetch data from any async source with automatic retries.

**Signature:**
```typescript
fetchAsyncData(params: {
  id: string                          // Unique request ID
  fn: () => Promise<T>                // Async function to execute
  options?: {
    maxRetries?: number               // Default: 3
    retryDelay?: number               // Default: 1000
    refetchInterval?: number | null   // Default: null (no polling)
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  }
}): Promise<T>
```

**Example - Basic Fetch:**
```typescript
import { useDispatch } from 'react-redux'
import { fetchAsyncData } from '@metabuilder/redux-slices'

export function UserList() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAsyncData({
      id: 'fetch_/api/users',
      fn: () => fetch('/api/users').then(r => r.json())
    }))
  }, [])
}
```

**Example - With Retries:**
```typescript
dispatch(fetchAsyncData({
  id: 'fetch_data_with_retries',
  fn: async () => {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  options: {
    maxRetries: 5,
    retryDelay: 2000  // Exponential backoff: 2s, 4s, 8s, 16s, 32s
  }
}))
```

**Example - With Polling:**
```typescript
dispatch(fetchAsyncData({
  id: 'fetch_stats',
  fn: () => fetch('/api/stats').then(r => r.json()),
  options: {
    refetchInterval: 5000  // Auto-refetch every 5 seconds
  }
}))
```

### mutateAsyncData

Execute a write operation (create, update, delete).

**Signature:**
```typescript
mutateAsyncData(params: {
  id: string                        // Unique mutation ID
  fn: (payload: T) => Promise<R>    // Mutation function
  payload: T                        // Data to send
  options?: {
    maxRetries?: number
    retryDelay?: number
    onSuccess?: (result: R, payload: T) => void
    onError?: (error: Error, payload: T) => void
  }
}): Promise<R>
```

**Example - Create:**
```typescript
dispatch(mutateAsyncData({
  id: 'mutation_createUser_' + Date.now(),
  fn: (user) => fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(user)
  }).then(r => r.json()),
  payload: { name: 'John', email: 'john@example.com' },
  options: {
    onSuccess: (newUser) => {
      console.log('User created:', newUser)
      // Refetch list here
    }
  }
}))
```

**Example - Update:**
```typescript
dispatch(mutateAsyncData({
  id: 'mutation_updateUser_' + userId,
  fn: (updates) => fetch(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }).then(r => r.json()),
  payload: { name: 'Jane', email: 'jane@example.com' }
}))
```

### refetchAsyncData

Manually refetch data without clearing existing data (soft refresh).

**Signature:**
```typescript
refetchAsyncData(params: {
  id: string                    // Request ID to refetch
  fn: () => Promise<T>          // Updated fetch function
}): Promise<T>
```

**Example:**
```typescript
dispatch(refetchAsyncData({
  id: 'fetch_/api/users',
  fn: () => fetch('/api/users').then(r => r.json())
}))
```

### cleanupAsyncRequests

Remove requests older than 5 minutes to prevent memory leaks.

**Signature:**
```typescript
cleanupAsyncRequests(options?: {
  maxAge?: number  // Default: 300000 (5 minutes)
}): undefined
```

**Example:**
```typescript
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { cleanupAsyncRequests } from '@metabuilder/redux-slices'

export function AppCleanup() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Clean up old requests periodically
    const interval = setInterval(() => {
      dispatch(cleanupAsyncRequests({ maxAge: 600000 }))  // 10 minutes
    }, 60000)  // Every minute

    return () => clearInterval(interval)
  }, [])
}
```

---

## Selectors

Selectors extract data from Redux state in a typed, memoized way.

### selectAsyncRequest

Get a single request by ID.

**Signature:**
```typescript
selectAsyncRequest(state: RootState, requestId: string): AsyncRequest | undefined
```

**Example:**
```typescript
import { useSelector } from 'react-redux'
import { selectAsyncRequest } from '@metabuilder/redux-slices'

export function UserList() {
  const request = useSelector(state => selectAsyncRequest(state, 'fetch_/api/users'))

  return (
    <>
      {request?.status === 'pending' && <div>Loading...</div>}
      {request?.status === 'succeeded' && (
        <div>{request.data?.map(u => <div key={u.id}>{u.name}</div>)}</div>
      )}
      {request?.status === 'failed' && <div>Error: {request.error}</div>}
    </>
  )
}
```

### selectAsyncData

Get just the data from a request.

**Signature:**
```typescript
selectAsyncData<T>(state: RootState, requestId: string): T | undefined
```

**Example:**
```typescript
const users = useSelector(state =>
  selectAsyncData<User[]>(state, 'fetch_/api/users')
)
```

### selectAsyncLoading

Check if a request is loading.

**Signature:**
```typescript
selectAsyncLoading(state: RootState, requestId: string): boolean
```

**Example:**
```typescript
const isLoading = useSelector(state =>
  selectAsyncLoading(state, 'fetch_/api/users')
)
```

### selectAsyncError

Get error message from a request.

**Signature:**
```typescript
selectAsyncError(state: RootState, requestId: string): string | null
```

**Example:**
```typescript
const error = useSelector(state =>
  selectAsyncError(state, 'fetch_/api/users')
)
```

### selectAsyncRefetching

Check if a request is currently refetching (data exists but being updated).

**Signature:**
```typescript
selectAsyncRefetching(state: RootState, requestId: string): boolean
```

**Example:**
```typescript
const isRefetching = useSelector(state =>
  selectAsyncRefetching(state, 'fetch_/api/users')
)
```

### selectAllAsyncRequests

Get all requests in state.

**Signature:**
```typescript
selectAllAsyncRequests(state: RootState): Record<string, AsyncRequest>
```

**Example:**
```typescript
const allRequests = useSelector(selectAllAsyncRequests)
const pendingCount = Object.values(allRequests).filter(r => r.status === 'pending').length
```

---

## Reducers

Reducers handle synchronous state updates.

### setRequestLoading

Mark a request as loading.

```typescript
dispatch(setRequestLoading({ requestId: 'fetch_/api/users' }))
```

### setRequestData

Set response data for a request.

```typescript
dispatch(setRequestData({
  requestId: 'fetch_/api/users',
  data: [{ id: 1, name: 'John' }]
}))
```

### setRequestError

Set error for a failed request.

```typescript
dispatch(setRequestError({
  requestId: 'fetch_/api/users',
  error: 'Failed to fetch users'
}))
```

### clearRequest

Remove a request from state entirely.

```typescript
dispatch(clearRequest('fetch_/api/users'))
```

### resetAsyncState

Clear all requests and reset to initial state.

```typescript
dispatch(resetAsyncState())
```

---

## Request ID Conventions

Request IDs should be unique and descriptive. Common patterns:

```typescript
// Fetches
`fetch_${url}`                           // fetch_/api/users
`fetch_${url}_${JSON.stringify(params)}` // fetch_/api/posts_{"sort":"date"}

// Mutations
`mutation_${action}_${date.now()}`       // mutation_createUser_1674499200000
`mutation_${action}_${id}`               // mutation_updateUser_123

// Polling
`poll_${url}_${interval}`                // poll_/api/stats_5000

// Pagination
`paginated_${url}_${pageNum}`            // paginated_/api/posts_1
```

---

## Direct Slice Usage

While hooks are recommended, you can use the slice directly:

```typescript
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAsyncData,
  selectAsyncData,
  selectAsyncLoading,
  selectAsyncError
} from '@metabuilder/redux-slices'

export function UserList() {
  const dispatch = useDispatch()
  const users = useSelector(state => selectAsyncData(state, 'fetch_/api/users'))
  const isLoading = useSelector(state => selectAsyncLoading(state, 'fetch_/api/users'))
  const error = useSelector(state => selectAsyncError(state, 'fetch_/api/users'))

  useEffect(() => {
    if (!users) {
      dispatch(fetchAsyncData({
        id: 'fetch_/api/users',
        fn: () => fetch('/api/users').then(r => r.json())
      }))
    }
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return <div>{users?.map(u => <div key={u.id}>{u.name}</div>)}</div>
}
```

---

## Debugging with Redux DevTools

The Redux DevTools browser extension shows all async operations:

1. **Install** Redux DevTools (Chrome/Firefox)
2. **Open** DevTools while using the app
3. **Look for** actions like:
   - `asyncData/fetchAsyncData/pending` - Request started
   - `asyncData/fetchAsyncData/fulfilled` - Request succeeded
   - `asyncData/fetchAsyncData/rejected` - Request failed
   - `asyncData/setRequestData` - Data set
   - `asyncData/setRequestError` - Error set

4. **Inspect** the action payload and resulting state
5. **Time travel** by clicking earlier actions to debug issues

---

## Performance Tips

### 1. Reuse Request IDs

Use consistent IDs so requests are cached:

```typescript
// GOOD - Same ID = cached
const id = 'fetch_/api/users'
dispatch(fetchAsyncData({ id, fn: () => fetch(...) }))
// Later...
dispatch(fetchAsyncData({ id, fn: () => fetch(...) }))  // Uses cache

// BAD - Different IDs = duplicate requests
dispatch(fetchAsyncData({ 
  id: `fetch_users_${Math.random()}`,  // ❌ Random ID
  fn: () => fetch(...) 
}))
```

### 2. Manual Cleanup for Long-Lived Apps

Periodically clean up old requests to prevent memory growth:

```typescript
// In your app root component
useEffect(() => {
  const interval = setInterval(() => {
    dispatch(cleanupAsyncRequests())
  }, 60000)  // Every minute
  return () => clearInterval(interval)
}, [])
```

### 3. Refetch vs Full Fetch

Use `refetchAsyncData` to update existing data without clearing:

```typescript
// GOOD - Soft refresh, data stays visible
dispatch(refetchAsyncData({
  id: 'fetch_/api/users',
  fn: () => fetch('/api/users').then(r => r.json())
}))

// LESS IDEAL - Clears data, UX is jarring
dispatch(clearRequest('fetch_/api/users'))
dispatch(fetchAsyncData({
  id: 'fetch_/api/users',
  fn: () => fetch('/api/users').then(r => r.json())
}))
```

---

## Examples

### Fetch with Retry

```typescript
dispatch(fetchAsyncData({
  id: 'fetch_critical_data',
  fn: async () => {
    const res = await fetch('/api/critical-data')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  options: {
    maxRetries: 5,
    retryDelay: 1000  // Exponential backoff
  }
}))
```

### Mutation with Refetch

```typescript
// Create user and refresh list
await dispatch(mutateAsyncData({
  id: 'mutation_createUser_' + Date.now(),
  fn: (user) => fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(user)
  }).then(r => r.json()),
  payload: newUser
}))

// Refetch the list
dispatch(refetchAsyncData({
  id: 'fetch_/api/users',
  fn: () => fetch('/api/users').then(r => r.json())
}))
```

### Polling

```typescript
dispatch(fetchAsyncData({
  id: 'poll_/api/stats',
  fn: () => fetch('/api/stats').then(r => r.json()),
  options: {
    refetchInterval: 5000  // Every 5 seconds
  }
}))

// Stop polling
dispatch(clearRequest('poll_/api/stats'))
```

### Request Deduplication

```typescript
// Component 1
dispatch(fetchAsyncData({
  id: 'fetch_/api/users',  // Same ID
  fn: () => fetch('/api/users').then(r => r.json())
}))

// Component 2 (at same time)
dispatch(fetchAsyncData({
  id: 'fetch_/api/users',  // Same ID - uses existing request!
  fn: () => fetch('/api/users').then(r => r.json())
}))

// Result: Only ONE API call made, both components share result
```

---

## Related Documentation

- [useReduxAsyncData Hook](../hooks-async/README.md#useReduxAsyncData)
- [useReduxMutation Hook](../hooks-async/README.md#useReduxMutation)
- [Redux Async Data Guide](../../docs/guides/REDUX_ASYNC_DATA_GUIDE.md)
- [Implementation Source](./src/slices/asyncDataSlice.ts)

---

**Questions?** Check the hooks-async implementation to see how these selectors and thunks are used in practice.
