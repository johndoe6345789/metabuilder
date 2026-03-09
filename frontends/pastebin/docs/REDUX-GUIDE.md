# Redux Implementation Guide

This document explains the Redux state management architecture implemented in the CodeSnippet application.

## Overview

The application uses **Redux Toolkit** (RTK) for centralized state management. Redux provides a predictable state container that makes the application easier to understand, debug, and test.

## Store Structure

```
src/store/
├── index.ts              # Store configuration
├── hooks.ts              # Typed Redux hooks
├── selectors.ts          # Memoized selectors
└── slices/
    ├── snippetsSlice.ts  # Snippet state & actions
    ├── namespacesSlice.ts # Namespace state & actions
    └── uiSlice.ts        # UI state & actions
```

## State Slices

### 1. Snippets Slice

**Location:** `src/store/slices/snippetsSlice.ts`

**State:**
```typescript
{
  items: Snippet[]           // All snippets
  loading: boolean           // Loading state for async operations
  error: string | null       // Error message if operations fail
  selectedIds: Set<string>   // IDs of selected snippets (for bulk operations)
  selectionMode: boolean     // Whether selection mode is active
}
```

**Async Actions (Thunks):**
- `fetchAllSnippets()` - Load all snippets from database
- `fetchSnippetsByNamespace(namespaceId)` - Load snippets for specific namespace
- `createSnippet(snippetData)` - Create new snippet
- `updateSnippet(snippet)` - Update existing snippet
- `deleteSnippet(id)` - Delete snippet by ID
- `bulkMoveSnippets({ snippetIds, targetNamespaceId })` - Move multiple snippets to namespace

**Sync Actions:**
- `toggleSelectionMode()` - Enable/disable selection mode
- `toggleSnippetSelection(id)` - Toggle selection of specific snippet
- `clearSelection()` - Clear all selections
- `selectAllSnippets()` - Select all current snippets

### 2. Namespaces Slice

**Location:** `src/store/slices/namespacesSlice.ts`

**State:**
```typescript
{
  items: Namespace[]        // All namespaces
  selectedId: string | null // Currently selected namespace ID
  loading: boolean          // Loading state
  error: string | null      // Error message
}
```

**Async Actions:**
- `fetchNamespaces()` - Load all namespaces and ensure default exists
- `createNamespace(name)` - Create new namespace
- `deleteNamespace(id)` - Delete namespace (moves snippets to default)

**Sync Actions:**
- `setSelectedNamespace(id)` - Switch to different namespace

### 3. UI Slice

**Location:** `src/store/slices/uiSlice.ts`

**State:**
```typescript
{
  dialogOpen: boolean          // Snippet editor dialog open/closed
  viewerOpen: boolean          // Snippet viewer dialog open/closed
  editingSnippet: Snippet | null // Snippet being edited (null for new)
  viewingSnippet: Snippet | null // Snippet being viewed
  searchQuery: string          // Current search text
}
```

**Sync Actions:**
- `openDialog(snippet)` - Open editor dialog (snippet = null for new, snippet = existing for edit)
- `closeDialog()` - Close editor dialog
- `openViewer(snippet)` - Open viewer dialog with snippet
- `closeViewer()` - Close viewer dialog
- `setSearchQuery(query)` - Update search query

## Selectors

**Location:** `src/store/selectors.ts`

Selectors provide optimized access to state with memoization to prevent unnecessary re-renders.

**Basic Selectors:**
```typescript
selectSnippets(state)              // Get all snippets
selectSnippetsLoading(state)       // Get loading state
selectSelectionMode(state)         // Get selection mode
selectSelectedIds(state)           // Get selected snippet IDs
selectNamespaces(state)            // Get all namespaces
selectSelectedNamespaceId(state)   // Get selected namespace ID
selectSearchQuery(state)           // Get search query
selectDialogOpen(state)            // Get dialog open state
selectViewerOpen(state)            // Get viewer open state
selectEditingSnippet(state)        // Get editing snippet
selectViewingSnippet(state)        // Get viewing snippet
```

**Computed Selectors (Memoized):**
```typescript
selectSelectedNamespace(state)     // Get full selected namespace object
selectFilteredSnippets(state)      // Get snippets filtered by search query
selectSelectedSnippets(state)      // Get full snippet objects for selected IDs
```

## Custom Hooks

**Location:** `src/store/hooks.ts`

Type-safe hooks for accessing Redux:

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks'

// In components:
const dispatch = useAppDispatch()          // Typed dispatch
const snippets = useAppSelector(selectSnippets) // Typed selector
```

## Usage Example

```typescript
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchSnippetsByNamespace,
  createSnippet,
  deleteSnippet,
} from '@/store/slices/snippetsSlice'
import {
  selectFilteredSnippets,
  selectSnippetsLoading,
  selectSearchQuery,
} from '@/store/selectors'
import { setSearchQuery } from '@/store/slices/uiSlice'

function MyComponent() {
  const dispatch = useAppDispatch()
  
  // Select state
  const snippets = useAppSelector(selectFilteredSnippets)
  const loading = useAppSelector(selectSnippetsLoading)
  const searchQuery = useAppSelector(selectSearchQuery)
  
  // Load snippets on mount
  useEffect(() => {
    dispatch(fetchSnippetsByNamespace('default-namespace-id'))
  }, [dispatch])
  
  // Handle search
  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query))
  }
  
  // Create snippet
  const handleCreate = async () => {
    try {
      await dispatch(createSnippet({
        title: 'New Snippet',
        description: 'Description',
        code: 'console.log("Hello")',
        language: 'javascript',
        category: 'JavaScript',
      })).unwrap()
      
      console.log('Snippet created successfully')
    } catch (error) {
      console.error('Failed to create snippet:', error)
    }
  }
  
  // Delete snippet
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteSnippet(id)).unwrap()
      console.log('Snippet deleted')
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search snippets..."
      />
      
      <button onClick={handleCreate}>Create Snippet</button>
      
      {snippets.map(snippet => (
        <div key={snippet.id}>
          <h3>{snippet.title}</h3>
          <button onClick={() => handleDelete(snippet.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

## Benefits

### 1. Predictable State Updates
- All state changes go through reducers
- Same input always produces same output
- Easy to trace how state changes over time

### 2. Debugging
- Redux DevTools extension shows:
  - Every action dispatched
  - State before and after each action
  - Time-travel debugging (undo/redo actions)
  - Action history and diffs

### 3. Testing
```typescript
import { configureStore } from '@reduxjs/toolkit'
import snippetsReducer, { createSnippet } from './slices/snippetsSlice'

describe('Snippets Slice', () => {
  it('should handle createSnippet', async () => {
    const store = configureStore({
      reducer: { snippets: snippetsReducer }
    })
    
    await store.dispatch(createSnippet({
      title: 'Test',
      // ... other fields
    }))
    
    const state = store.getState()
    expect(state.snippets.items).toHaveLength(1)
    expect(state.snippets.items[0].title).toBe('Test')
  })
})
```

### 4. Performance
- Memoized selectors prevent unnecessary re-renders
- Only components using changed state re-render
- Efficient state updates with Immer

### 5. Type Safety
- Full TypeScript integration
- IntelliSense for all actions and state
- Compile-time error catching

## Migration from Component State

**Before (Component State):**
```typescript
function SnippetManager() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(false)
  
  const loadSnippets = async () => {
    setLoading(true)
    const data = await getAllSnippets()
    setSnippets(data)
    setLoading(false)
  }
  
  // Pass down through props...
}
```

**After (Redux):**
```typescript
function SnippetManager() {
  const dispatch = useAppDispatch()
  const snippets = useAppSelector(selectSnippets)
  const loading = useAppSelector(selectSnippetsLoading)
  
  useEffect(() => {
    dispatch(fetchAllSnippets())
  }, [dispatch])
  
  // State available anywhere via hooks - no prop drilling
}
```

## Best Practices

1. **Use Async Thunks for Side Effects**
   - Database calls
   - API requests
   - Any async operations

2. **Keep Slices Focused**
   - Each slice manages related state
   - Don't create mega-slices

3. **Use Selectors**
   - Don't access state directly
   - Use memoized selectors for computed values
   - Prevents unnecessary re-renders

4. **Handle Loading States**
   - Show loading indicators during async operations
   - Handle errors gracefully
   - Use pending/fulfilled/rejected cases

5. **Type Everything**
   - Define state interfaces
   - Type action payloads
   - Use typed hooks

## Redux DevTools

Install the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools):

- **Chrome:** [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- **Firefox:** [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

Features:
- Inspect every action and state change
- Time-travel debugging
- Action replay
- State diff viewer
- Export/import state

## Further Reading

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux Style Guide](https://redux.js.org/style-guide/)
- [Using Redux with TypeScript](https://redux.js.org/usage/usage-with-typescript)
- [Redux DevTools Guide](https://github.com/reduxjs/redux-devtools)
