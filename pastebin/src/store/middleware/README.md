# Redux Persistence Middleware

## Overview

The Redux persistence middleware automatically syncs Redux state changes to the database (IndexedDB or Flask backend) without requiring manual save calls throughout your application.

## How It Works

The middleware intercepts specific Redux actions and triggers a database save operation automatically. This ensures that all state changes are persisted to the database in real-time.

### Key Features

1. **Automatic Persistence**: No manual database save calls needed
2. **Debounced Writes**: Multiple rapid actions are batched with a 100ms debounce
3. **Error Handling**: Graceful error handling with console logging
4. **Backend Agnostic**: Works with both IndexedDB and Flask backend
5. **Zero Configuration**: Just add to your Redux store

## Architecture

```
Redux Action Dispatched
    ↓
Redux Reducer Updates State
    ↓
Persistence Middleware Intercepts
    ↓
Checks if Action Requires Persistence
    ↓
Debounces Multiple Rapid Actions (100ms)
    ↓
Calls saveDB() to Export SQL.js Database
    ↓
Saves to IndexedDB or Flask Backend
```

## Monitored Actions

The middleware automatically persists state for these actions:

- `snippets/create/fulfilled` - When a new snippet is created
- `snippets/update/fulfilled` - When a snippet is updated
- `snippets/delete/fulfilled` - When a snippet is deleted
- `snippets/bulkMove/fulfilled` - When snippets are moved between namespaces
- `namespaces/create/fulfilled` - When a new namespace is created
- `namespaces/delete/fulfilled` - When a namespace is deleted

## Usage

### Installation

The middleware is already integrated into the Redux store at `src/store/index.ts`:

```typescript
import { persistenceMiddleware } from './middleware/persistenceMiddleware'

export const store = configureStore({
  reducer: {
    snippets: snippetsReducer,
    namespaces: namespacesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(persistenceMiddleware),
})
```

### Using in Components

You don't need to do anything special! Just dispatch your Redux actions as normal:

```typescript
import { useAppDispatch } from '@/store/hooks'
import { createSnippet, updateSnippet, deleteSnippet } from '@/store/slices/snippetsSlice'

function MyComponent() {
  const dispatch = useAppDispatch()
  
  const handleCreate = () => {
    dispatch(createSnippet({
      title: 'My Snippet',
      code: 'console.log("Hello")',
      language: 'JavaScript',
      category: 'Examples',
      description: 'A simple example'
    }))
    // Database save happens automatically!
  }
  
  const handleUpdate = (snippet: Snippet) => {
    dispatch(updateSnippet({
      ...snippet,
      title: 'Updated Title'
    }))
    // Database save happens automatically!
  }
  
  const handleDelete = (id: string) => {
    dispatch(deleteSnippet(id))
    // Database save happens automatically!
  }
  
  return (
    // Your component JSX
  )
}
```

## Performance Optimizations

### Debouncing

The middleware uses a debounce mechanism to prevent excessive database writes:

```typescript
let persistenceQueue: Promise<void> = Promise.resolve()
let pendingSync = false

// Only one save operation can be pending at a time
if (!pendingSync) {
  pendingSync = true
  
  persistenceQueue = persistenceQueue.then(async () => {
    await new Promise(resolve => setTimeout(resolve, 100)) // 100ms debounce
    await saveDB()
    pendingSync = false
  })
}
```

This means:
- Multiple actions within 100ms are batched into a single save
- Prevents database thrashing during rapid user interactions
- Maintains data consistency

### Queue Management

The middleware maintains a promise queue to ensure saves happen in order:
- Saves are serialized (one at a time)
- Previous saves complete before new ones start
- No race conditions or data corruption

## Storage Backends

The middleware works seamlessly with both storage backends:

### IndexedDB (Default)
- Browser-based local storage
- No server required
- Unlimited storage capacity
- Offline-first

### Flask Backend (Optional)
- Server-based storage
- Cross-device sync
- Centralized data management
- Configured via `src/lib/storage.ts`

The `saveDB()` function automatically detects which backend to use based on your configuration.

## Logging

The middleware provides detailed console logging for debugging:

```
[Redux Persistence] State synced to database
[Redux Persistence] Error syncing to database: <error details>
```

You can disable logging by removing or commenting out the `console.log` statements.

## Error Handling

Errors are caught and logged but don't prevent the application from functioning:

```typescript
try {
  await saveDB()
  console.log('[Redux Persistence] State synced to database')
} catch (error) {
  console.error('[Redux Persistence] Error syncing to database:', error)
}
```

This ensures:
- App continues working even if database saves fail
- Errors are visible in console for debugging
- No unhandled promise rejections

## Adding New Actions

To persist additional actions, add them to the `PERSISTENCE_ACTIONS` array:

```typescript
const PERSISTENCE_ACTIONS = [
  'snippets/create/fulfilled',
  'snippets/update/fulfilled',
  'snippets/delete/fulfilled',
  'snippets/bulkMove/fulfilled',
  'namespaces/create/fulfilled',
  'namespaces/delete/fulfilled',
  'myNewSlice/create/fulfilled', // Add your new action here
]
```

## Testing

To verify the middleware is working:

1. Open browser DevTools → Console
2. Perform an action (create/update/delete snippet)
3. Look for the log: `[Redux Persistence] State synced to database`
4. Open Application → IndexedDB → CodeSnippetDB → database
5. Verify the database binary has been updated

## Troubleshooting

### Database not saving
- Check browser console for errors
- Verify IndexedDB is available in your browser
- Check if browser storage quota is exceeded
- Verify Redux actions are dispatching correctly

### Slow performance
- Check if debounce delay (100ms) needs adjustment
- Verify database size isn't too large
- Consider increasing debounce for very large datasets

### Data loss
- Ensure actions are following the async thunk pattern
- Verify reducers are updating state immutably
- Check that `fulfilled` actions are being dispatched
- Review error logs for failed saves

## Advanced Configuration

### Custom Debounce Delay

Adjust the debounce delay for your needs:

```typescript
await new Promise(resolve => setTimeout(resolve, 250)) // 250ms debounce
```

### Conditional Persistence

Add logic to skip persistence for certain conditions:

```typescript
if (PERSISTENCE_ACTIONS.includes(actionType)) {
  // Skip persistence in test environment
  if (process.env.NODE_ENV === 'test') {
    return result
  }
  
  // Your existing persistence logic
}
```

### Custom Logging

Replace console logging with your logging service:

```typescript
import { logEvent } from '@/lib/analytics'

try {
  await saveDB()
  logEvent('database_save_success', { action: actionType })
} catch (error) {
  logEvent('database_save_error', { action: actionType, error })
}
```

## Related Files

- `src/store/middleware/persistenceMiddleware.ts` - Middleware implementation
- `src/store/index.ts` - Store configuration with middleware
- `src/lib/db.ts` - Database operations and saveDB() function
- `src/lib/storage.ts` - Storage backend configuration
- `src/store/slices/snippetsSlice.ts` - Snippet actions
- `src/store/slices/namespacesSlice.ts` - Namespace actions

## Best Practices

1. **Use Async Thunks**: Always use `createAsyncThunk` for database operations
2. **Immutable Updates**: Ensure reducers update state immutably
3. **Error Boundaries**: Add error boundaries to catch any persistence failures
4. **Monitor Performance**: Watch for excessive saves in production
5. **Backup Data**: Implement periodic backups for critical data
6. **Test Offline**: Verify persistence works offline (IndexedDB mode)
7. **Handle Migrations**: Plan for database schema changes

## Future Enhancements

Potential improvements:
- Configurable debounce delays per action type
- Retry logic for failed saves
- Optimistic updates with rollback
- Background sync using Service Workers
- Compression for large databases
- Periodic automatic backups
- Delta syncing for partial updates
- Conflict resolution for multi-device sync
