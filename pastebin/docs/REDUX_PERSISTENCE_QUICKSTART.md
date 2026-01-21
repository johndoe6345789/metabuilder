# Redux Persistence Middleware - Quick Start Guide

## What is it?

The Redux persistence middleware automatically saves your Redux state to the database whenever specific actions are dispatched. No manual database calls needed!

## 30-Second Setup

The middleware is already configured in your Redux store. Just dispatch actions as normal:

```typescript
import { useAppDispatch } from '@/store/hooks'
import { createSnippet } from '@/store/slices/snippetsSlice'

function MyComponent() {
  const dispatch = useAppDispatch()
  
  const handleSave = () => {
    dispatch(createSnippet({
      title: 'My Snippet',
      code: 'console.log("Hello")',
      language: 'JavaScript',
      category: 'Examples',
      description: 'A test snippet'
    }))
    // That's it! Database save happens automatically
  }
  
  return <button onClick={handleSave}>Save</button>
}
```

## What Gets Persisted?

These actions trigger automatic database saves:
- Creating/updating/deleting snippets
- Moving snippets between namespaces
- Creating/deleting namespaces

## Configuration

Access settings via the Settings page or programmatically:

```typescript
import { usePersistenceConfig } from '@/store/hooks'

function Settings() {
  const { config, togglePersistence, updateDebounceDelay } = usePersistenceConfig()
  
  return (
    <div>
      <button onClick={togglePersistence}>
        {config.enabled ? 'Disable' : 'Enable'} Auto-Save
      </button>
      <input 
        type="range" 
        min="0" 
        max="1000" 
        value={config.debounceMs}
        onChange={(e) => updateDebounceDelay(Number(e.target.value))}
      />
    </div>
  )
}
```

## How to Verify It's Working

1. Open browser DevTools → Console
2. Perform an action (create/edit snippet)
3. Look for: `[Redux Persistence] State synced to database`
4. Open DevTools → Application → IndexedDB → CodeSnippetDB
5. The database should be updated

## Common Use Cases

### Creating a Snippet
```typescript
dispatch(createSnippet({
  title: 'Array Map Example',
  code: 'const doubled = [1,2,3].map(x => x * 2)',
  language: 'JavaScript',
  category: 'Arrays',
  description: 'Simple array mapping'
}))
// Auto-saved ✓
```

### Updating a Snippet
```typescript
dispatch(updateSnippet({
  ...existingSnippet,
  title: 'Updated Title',
  code: 'Updated code here'
}))
// Auto-saved ✓
```

### Deleting a Snippet
```typescript
dispatch(deleteSnippet('snippet-id-123'))
// Auto-saved ✓
```

### Bulk Operations
```typescript
dispatch(bulkMoveSnippets({
  snippetIds: ['id1', 'id2', 'id3'],
  targetNamespaceId: 'namespace-xyz'
}))
// Auto-saved ✓
```

## Performance

- **Debouncing**: Multiple rapid actions are batched (default 100ms)
- **Queue Management**: Saves are serialized to prevent race conditions
- **Error Handling**: Failures are logged but don't break your app
- **Retry Logic**: Failed saves automatically retry up to 3 times

## Troubleshooting

### "No logs in console"
- Check if persistence is enabled in Settings
- Verify logging is enabled (Settings → Redux Persistence → Debug Logging)

### "Database not updating"
- Check browser console for errors
- Verify IndexedDB is available
- Try exporting/importing database (Settings page)

### "Performance issues"
- Increase debounce delay in Settings
- Check database size (Settings → Database Statistics)

## Advanced Usage

### Disable for Testing
```typescript
import { disablePersistence, enablePersistence } from '@/store/middleware'

beforeEach(() => {
  disablePersistence() // Don't save during tests
})

afterEach(() => {
  enablePersistence() // Re-enable after tests
})
```

### Custom Debounce
```typescript
import { setDebounceDelay } from '@/store/middleware'

setDebounceDelay(500) // Wait 500ms before saving
```

### Monitor Actions
```typescript
import { getPersistenceConfig } from '@/store/middleware'

const config = getPersistenceConfig()
console.log('Monitored actions:', config.actions)
```

## Best Practices

1. ✅ Always use async thunks for database operations
2. ✅ Keep reducers pure and immutable
3. ✅ Let middleware handle all persistence
4. ✅ Export backups regularly (Settings page)
5. ❌ Don't manually call `saveDB()` in components
6. ❌ Don't mix manual saves with middleware

## Need More Info?

- Full documentation: `src/store/middleware/README.md`
- Configuration options: `src/store/middleware/persistenceConfig.ts`
- Example component: `src/components/PersistenceExample.tsx`
- Settings UI: `src/components/PersistenceSettings.tsx`

## Questions?

Check the browser console for debugging information:
- `[Redux Persistence] State synced to database` = Success
- `[Redux Persistence] Error syncing to database` = Error (check details)
- `[Redux Persistence] Retrying save (N/3)...` = Automatic retry in progress
