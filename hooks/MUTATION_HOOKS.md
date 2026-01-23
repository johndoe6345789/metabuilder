# State Mutation Hooks

This document describes the 5 new state mutation hooks added to `/hooks/`. These hooks provide reusable state management patterns for common React use cases.

## Overview

| Hook | Purpose | Return Type |
|------|---------|-------------|
| **useToggle** | Boolean state toggle | `{ value, toggle, setValue, setTrue, setFalse }` |
| **usePrevious** | Track previous value | `T \| undefined` |
| **useStateWithHistory** | State with undo/redo | `{ value, setValue, undo, redo, canUndo, canRedo, history }` |
| **useAsync** | Async function wrapper | `{ data, loading, error, execute, reset }` |
| **useUndo** | Simplified undo/redo | `{ value, setValue, undo, redo, reset, canUndo, canRedo }` |

## Detailed API Reference

### 1. useToggle

Boolean state management with multiple toggle options.

**Import:**
```typescript
import { useToggle } from '@/hooks/useToggle'
```

**Signature:**
```typescript
function useToggle(initialValue?: boolean): UseToggleReturn

interface UseToggleReturn {
  value: boolean
  toggle: () => void
  setValue: (value: boolean | ((prev: boolean) => boolean)) => void
  setTrue: () => void
  setFalse: () => void
}
```

**Example:**
```typescript
const { value, toggle, setValue, setTrue, setFalse } = useToggle(false)

return (
  <div>
    <p>Menu is {value ? 'open' : 'closed'}</p>
    <Button onClick={toggle}>Toggle Menu</Button>
    <Button onClick={setTrue}>Open</Button>
    <Button onClick={setFalse}>Close</Button>
  </div>
)
```

**Use Cases:**
- Modal/dialog visibility
- Show/hide menu or panel
- Conditional rendering
- Toggle features on/off

---

### 2. usePrevious

Track the previous value of any state or prop across renders.

**Import:**
```typescript
import { usePrevious } from '@/hooks/usePrevious'
```

**Signature:**
```typescript
function usePrevious<T>(value: T): T | undefined
```

**Example:**
```typescript
const [count, setCount] = useState(0)
const prevCount = usePrevious(count)

return (
  <div>
    <p>Current: {count}</p>
    <p>Previous: {prevCount ?? 'none'}</p>
    <Button onClick={() => setCount(count + 1)}>Increment</Button>
  </div>
)
```

**Use Cases:**
- Detect value changes
- Compare current vs previous
- Form dirty state tracking
- Animation triggers based on value changes
- Conditional effects

**Important:** Returns `undefined` on first render.

---

### 3. useStateWithHistory

State management with full undo/redo history capability.

**Import:**
```typescript
import { useStateWithHistory } from '@/hooks/useStateWithHistory'
```

**Signature:**
```typescript
function useStateWithHistory<T>(
  initialValue: T,
  options?: UseStateWithHistoryOptions
): UseStateWithHistoryReturn<T>

interface UseStateWithHistoryOptions {
  maxHistory?: number // default: 100
}

interface UseStateWithHistoryReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  history: T[]
}
```

**Example:**
```typescript
const { value, setValue, undo, redo, canUndo, canRedo, history } = useStateWithHistory('initial')

return (
  <div>
    <p>Current: {value}</p>
    <p>History size: {history.length}</p>
    <TextField value={value} onChange={(e) => setValue(e.target.value)} />
    <Button onClick={undo} disabled={!canUndo}>Undo</Button>
    <Button onClick={redo} disabled={!canRedo}>Redo</Button>
  </div>
)
```

**Use Cases:**
- Text editor undo/redo
- Form draft history
- Canvas drawing operations
- Configuration changes tracking
- Multi-step workflows

**Features:**
- Limits history size (configurable)
- Removes "future" history when new value set after undo
- Full history array accessible
- Type-safe for any value type

---

### 4. useAsync

Async function wrapper with automatic loading, error, and data state management.

**Import:**
```typescript
import { useAsync } from '@/hooks/useAsync'
```

**Signature:**
```typescript
function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  deps?: any[],
  options?: UseAsyncOptions
): UseAsyncReturn<T>

interface UseAsyncOptions {
  immediate?: boolean // default: false - execute on mount
  resetErrorOnRetry?: boolean // default: true
  resetDataOnRetry?: boolean // default: false
}

interface UseAsyncReturn<T> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
  execute: (...args: any[]) => Promise<T | undefined>
  reset: () => void
}
```

**Example - Manual Execution:**
```typescript
const fetchUser = async (userId: string) => {
  const res = await fetch(`/api/users/${userId}`)
  return res.json()
}

const { data, loading, error, execute } = useAsync(fetchUser)

return (
  <div>
    {loading && <Spinner />}
    {error && <Alert severity="error">{error.message}</Alert>}
    {data && <UserProfile user={data} />}
    <Button onClick={() => execute('123')}>Fetch User</Button>
  </div>
)
```

**Example - Automatic Execution:**
```typescript
const { data: posts, loading, error } = useAsync(
  async () => {
    const res = await fetch('/api/posts')
    return res.json()
  },
  [],
  { immediate: true }
)

return (
  <div>
    {loading && <Skeleton />}
    {posts?.map(post => <PostCard key={post.id} post={post} />)}
  </div>
)
```

**Use Cases:**
- API data fetching
- Async operations with loading states
- Error handling and user feedback
- Retry mechanisms
- Form submissions

**Features:**
- Prevents state updates after unmount
- Configurable error/data reset on retry
- Pass arguments to async function
- Reset all states

---

### 5. useUndo

Simplified undo/redo wrapper for any value, lighter than `useStateWithHistory`.

**Import:**
```typescript
import { useUndo } from '@/hooks/useUndo'
```

**Signature:**
```typescript
function useUndo<T>(initialValue: T): UseUndoReturn<T>

interface UseUndoReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  undo: () => void
  redo: () => void
  reset: (value?: T) => void
  canUndo: boolean
  canRedo: boolean
}
```

**Example:**
```typescript
const { value, setValue, undo, redo, reset, canUndo, canRedo } = useUndo({ x: 0, y: 0 })

return (
  <div>
    <Canvas
      position={value}
      onChange={(newPos) => setValue(newPos)}
    />
    <Toolbar>
      <Button onClick={undo} disabled={!canUndo}>Undo</Button>
      <Button onClick={redo} disabled={!canRedo}>Redo</Button>
      <Button onClick={() => reset()}>Reset</Button>
    </Toolbar>
  </div>
)
```

**Use Cases:**
- Simple undo/redo without full history
- Lightweight state tracking
- Form value changes
- Canvas position/zoom
- Configuration adjustments

**Differences from `useStateWithHistory`:**
- No maxHistory limit (stores only past, present, future)
- Simpler implementation, smaller bundle
- Good for finite undo/redo scenarios
- No history array access

---

## Comparison Table

| Feature | useToggle | usePrevious | useStateWithHistory | useAsync | useUndo |
|---------|-----------|-------------|--------------------|---------|----|
| Tracks state | ✓ | ✗ (read-only) | ✓ | ✓ (data) | ✓ |
| Undo capability | ✗ | ✗ | ✓ | ✗ | ✓ |
| History array | ✗ | ✗ | ✓ | ✗ | ✗ |
| Async support | ✗ | ✗ | ✗ | ✓ | ✗ |
| Bundle size | Small | Tiny | Medium | Medium | Small |
| Generic typing | ✗ (boolean) | ✓ | ✓ | ✓ | ✓ |

---

## Installation & Usage

All hooks are located in `/hooks/` and can be imported directly:

```typescript
import { useToggle } from '@/hooks/useToggle'
import { usePrevious } from '@/hooks/usePrevious'
import { useStateWithHistory } from '@/hooks/useStateWithHistory'
import { useAsync } from '@/hooks/useAsync'
import { useUndo } from '@/hooks/useUndo'
```

Or using absolute imports:

```typescript
import { useToggle } from '/path/to/hooks/useToggle'
```

---

## Best Practices

1. **useToggle** - Use for simple boolean states. Don't overcomplicate with extra logic.
2. **usePrevious** - Always check for `undefined` on first render.
3. **useStateWithHistory** - Set reasonable `maxHistory` limits to prevent memory issues.
4. **useAsync** - Always handle the `error` state for better UX.
5. **useUndo** - Use for lightweight undo/redo, not complex workflows.

---

## Performance Considerations

- All hooks use `useCallback` to memoize functions where appropriate
- `useAsync` prevents state updates after unmount
- `useStateWithHistory` includes configurable history size limits
- `usePrevious` uses `useRef` (no re-renders)
- `useToggle` and `useUndo` are optimized for minimal re-renders

