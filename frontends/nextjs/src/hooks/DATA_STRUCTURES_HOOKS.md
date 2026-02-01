# Data Structure Management Hooks

This document describes the 5 data structure management hooks designed for React state management of common data structures.

## Overview

These hooks provide TypeScript-first, strongly-typed state management for Set, Map, Array, Stack, and Queue data structures. Each hook follows React best practices with proper dependency tracking and memoization.

## Hooks

### 1. useSet - Typed Set State Management

Manages a `Set<T>` with full operation support.

**File**: `/src/hooks/useSet.ts`

**Usage**:
```typescript
import { useSet } from '@/hooks'

function MyComponent() {
  const { values, add, remove, has, toggle, clear } = useSet<string>(['a', 'b'])

  return (
    <div>
      <button onClick={() => add('c')}>Add C</button>
      <button onClick={() => remove('a')}>Remove A</button>
      <p>Has B: {has('b').toString()}</p>
      <p>Items: {Array.from(values).join(', ')}</p>
    </div>
  )
}
```

**API**:
```typescript
interface UseSetReturn<T> {
  values: Set<T>              // Current set
  add: (value: T) => void     // Add value to set
  remove: (value: T) => void  // Remove value from set
  has: (value: T) => boolean  // Check if value exists
  toggle: (value: T) => void  // Add/remove value
  clear: () => void           // Clear all values
}
```

**Features**:
- Automatically deduplicates values (Set behavior)
- Memoized operations with useCallback
- Supports any comparable type (primitives, objects)
- Toggle operation for easy on/off switching

---

### 2. useMap - Typed Map State Management

Manages a `Map<K, V>` with full operation support.

**File**: `/src/hooks/useMap.ts`

**Usage**:
```typescript
import { useMap } from '@/hooks'

function MyComponent() {
  const { data, set, get, delete: deleteKey, clear, entries, keys, values }
    = useMap<string, number>([['count', 5]])

  return (
    <div>
      <button onClick={() => set('count', (get('count') || 0) + 1)}>
        Increment
      </button>
      <p>Count: {get('count')}</p>
      <p>Keys: {Array.from(keys()).join(', ')}</p>
    </div>
  )
}
```

**API**:
```typescript
interface UseMapReturn<K, V> {
  data: Map<K, V>                          // Current map
  set: (key: K, value: V) => void          // Set key-value pair
  get: (key: K) => V | undefined           // Get value by key
  delete: (key: K) => void                 // Delete by key
  clear: () => void                        // Clear all entries
  has: (key: K) => boolean                 // Check if key exists
  entries: () => IterableIterator<[K, V]> // Get entries iterator
  keys: () => IterableIterator<K>          // Get keys iterator
  values: () => IterableIterator<V>        // Get values iterator
}
```

**Features**:
- Direct Map semantics with all standard operations
- Iterator accessors for entries, keys, and values
- Supports any key/value types
- Overwrites existing keys automatically

---

### 3. useArray - Array Operations Hook

Manages arrays with comprehensive mutation operations.

**File**: `/src/hooks/useArray.ts`

**Usage**:
```typescript
import { useArray } from '@/hooks'

function MyComponent() {
  const { items, push, pop, shift, unshift, insert, remove, swap, filter, map, length, get }
    = useArray<string>(['a', 'b', 'c'])

  return (
    <div>
      <button onClick={() => push('d')}>Add item</button>
      <button onClick={() => pop()}>Remove last</button>
      <button onClick={() => shift()}>Remove first</button>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>Length: {length}</p>
    </div>
  )
}
```

**API**:
```typescript
interface UseArrayReturn<T> {
  items: T[]                                    // Current array
  push: (item: T) => void                       // Add to end
  pop: () => T | undefined                      // Remove from end
  shift: () => T | undefined                    // Remove from start
  unshift: (item: T) => void                    // Add to start
  insert: (index: number, item: T) => void      // Insert at index
  remove: (index: number) => void               // Remove at index
  swap: (indexA: number, indexB: number) => void // Swap two elements
  clear: () => void                             // Clear array
  filter: (predicate: (item: T) => boolean) => void // Filter in-place
  map: <R,>(callback: (item: T) => R) => R[]   // Map to new array
  length: number                                // Current length
  get: (index: number) => T | undefined         // Get by index
}
```

**Features**:
- All standard array mutations
- insert/remove with bounds checking
- Swap operation for reordering
- Filter operation for in-place filtering
- Map operation returns new array (read-only)
- Length property for convenience

---

### 4. useStack - Stack/LIFO Operations

Manages stack (Last In First Out) data structure.

**File**: `/src/hooks/useStack.ts`

**Usage**:
```typescript
import { useStack } from '@/hooks'

function BrowserHistory() {
  const { items, push, pop, peek, clear, isEmpty, size } = useStack<string>()

  return (
    <div>
      <button onClick={() => push('https://google.com')}>Visit</button>
      <button onClick={() => pop()} disabled={isEmpty}>Back</button>
      <p>Current: {peek()}</p>
      <p>History size: {size}</p>
    </div>
  )
}
```

**API**:
```typescript
interface UseStackReturn<T> {
  items: T[]                    // Stack items (bottom to top)
  push: (item: T) => void       // Push item (add to top)
  pop: () => T | undefined      // Pop item (remove from top)
  peek: () => T | undefined     // Peek at top without removing
  clear: () => void             // Clear all items
  isEmpty: boolean              // True if empty
  size: number                  // Number of items
}
```

**Use Cases**:
- Browser history/navigation
- Undo/redo functionality
- Expression evaluation
- Depth-first search algorithms
- Function call stack simulation

---

### 5. useQueue - Queue/FIFO Operations

Manages queue (First In First Out) data structure.

**File**: `/src/hooks/useQueue.ts`

**Usage**:
```typescript
import { useQueue } from '@/hooks'

function TaskProcessor() {
  const { items, enqueue, dequeue, peek, clear, isEmpty, size } = useQueue<Task>()

  const processNextTask = () => {
    const task = dequeue()
    if (task) executeTask(task)
  }

  return (
    <div>
      <button onClick={() => enqueue(newTask)}>Add Task</button>
      <button onClick={processNextTask} disabled={isEmpty}>Process</button>
      <p>Queue size: {size}</p>
      <p>Next task: {peek()?.name}</p>
    </div>
  )
}
```

**API**:
```typescript
interface UseQueueReturn<T> {
  items: T[]                    // Queue items (front to back)
  enqueue: (item: T) => void    // Add item to back
  dequeue: () => T | undefined  // Remove item from front
  peek: () => T | undefined     // Peek at front without removing
  clear: () => void             // Clear all items
  isEmpty: boolean              // True if empty
  size: number                  // Number of items
}
```

**Use Cases**:
- Task/job processing queues
- Event handling
- Breadth-first search algorithms
- Print job queues
- Request/response handling

---

## Testing

Each hook has comprehensive test coverage:

- **useSet.test.ts**: 11 tests covering add, remove, toggle, clear operations
- **useMap.test.ts**: 14 tests covering set, get, delete, iterators
- **useArray.test.ts**: 18 tests covering all array operations
- **useStack.test.ts**: 14 tests covering LIFO semantics
- **useQueue.test.ts**: 16 tests covering FIFO semantics

Run tests:
```bash
npm test -- src/hooks/__tests__/use{Set,Map,Array,Stack,Queue}.test.ts
```

All 73 tests pass successfully.

---

## Performance Considerations

### Memory
- Each hook maintains state in React memory
- For large data structures, consider pagination or virtualization
- useRef is used in Stack/Queue for immediate return values

### State Updates
- All operations use functional setState for batching
- useCallback with proper dependencies prevents unnecessary re-renders
- Consider useTransition for long-running operations

### Recommendations
- **Set**: Good for membership testing, up to ~10k items
- **Map**: Good for key-value lookups, up to ~10k entries
- **Array**: Good for indexed access, up to ~5k items (consider virtualization above)
- **Stack**: Good for bounded operations like undo/redo
- **Queue**: Good for task processing with moderate queue depth

---

## Examples

### Example 1: Tag Selection with useSet

```typescript
function TagSelector() {
  const { values, toggle, clear } = useSet<string>()
  const tags = ['React', 'TypeScript', 'Next.js', 'Tailwind']

  return (
    <div>
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => toggle(tag)}
          style={{ fontWeight: values.has(tag) ? 'bold' : 'normal' }}
        >
          {tag}
        </button>
      ))}
      <button onClick={clear}>Clear</button>
      <p>Selected: {Array.from(values).join(', ')}</p>
    </div>
  )
}
```

### Example 2: Form State with useMap

```typescript
function FormComponent() {
  const { data, set, get, clear } = useMap<string, string>()

  const handleChange = (field: string, value: string) => {
    set(field, value)
  }

  return (
    <form onSubmit={() => console.log(Object.fromEntries(data))}>
      <input
        value={get('email') || ''}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="Email"
      />
      <button type="button" onClick={clear}>Reset</button>
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Example 3: Undo/Redo with useStack

```typescript
function Editor() {
  const history = useStack<string>()
  const [current, setCurrent] = useState('')

  const handleEdit = (text: string) => {
    history.push(current)
    setCurrent(text)
  }

  const handleUndo = () => {
    const previous = history.pop()
    if (previous !== undefined) setCurrent(previous)
  }

  return (
    <div>
      <textarea
        value={current}
        onChange={(e) => handleEdit(e.target.value)}
      />
      <button onClick={handleUndo} disabled={history.isEmpty}>
        Undo
      </button>
    </div>
  )
}
```

---

## Integration with Redux

These hooks work well alongside Redux for:
- **Local component state**: Use these hooks
- **Global app state**: Use Redux (already available in project)
- **Mixed approach**: Use these for temporary/local data structures

Example:
```typescript
import { useDispatch, useSelector } from 'react-redux'
import { useQueue } from '@/hooks'

function NotificationCenter() {
  const { enqueue, dequeue } = useQueue<Notification>()
  const notifications = useSelector(selectNotifications)

  // Local queue for display
  // Global Redux for persistence
}
```

---

## Browser Compatibility

All hooks use standard JavaScript features and work in:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Modern mobile browsers

TypeScript 5.9.3+ required for type annotations.

---

## Future Enhancements

Potential additions:
- **usePriority Queue**: Sorted queue by priority
- **useLinkedList**: Doubly-linked list operations
- **useGraph**: Graph adjacency operations
- **useTree**: Tree traversal and manipulation
- **useLRU**: Least Recently Used cache
