# Redux Persistence Middleware - Quick Start Guide

## What is it?

The Redux Persistence Middleware automatically saves your Redux state changes to IndexedDB and optionally syncs them with a Flask API backend. **No manual database calls needed!**

## Key Features

✅ **Automatic Persistence** - State changes are automatically saved  
✅ **Debounced Writes** - Efficient 300ms debouncing prevents excessive writes  
✅ **Flask Sync** - Optional bidirectional sync with remote API  
✅ **Metrics Tracking** - Real-time performance monitoring  
✅ **Auto-Sync** - Periodic automatic synchronization  
✅ **Zero Configuration** - Works out of the box  

## How It Works

```
Redux Action → Middleware Intercepts → Queue (300ms debounce) → IndexedDB + Flask API
```

## Basic Usage

### 1. Just Use Redux Normally

```typescript
import { useAppDispatch } from '@/store'
import { saveFile } from '@/store/slices/filesSlice'

function MyComponent() {
  const dispatch = useAppDispatch()
  
  const handleSave = () => {
    // That's it! Middleware handles persistence automatically
    dispatch(saveFile({
      id: 'file-1',
      name: 'example.js',
      content: 'console.log("Hello")',
      language: 'javascript',
      path: '/src/example.js',
      updatedAt: Date.now()
    }))
  }
  
  return <button onClick={handleSave}>Save</button>
}
```

### 2. Monitor Persistence Status

```typescript
import { usePersistence } from '@/hooks/use-persistence'

function StatusBar() {
  const { status, metrics } = usePersistence()
  
  return (
    <div>
      <span>Status: {status.syncStatus}</span>
      <span>Operations: {metrics.totalOperations}</span>
      <span>Success Rate: {(metrics.successfulOperations / metrics.totalOperations * 100)}%</span>
    </div>
  )
}
```

### 3. Configure Auto-Sync

```typescript
import { usePersistence } from '@/hooks/use-persistence'

function Settings() {
  const { configureAutoSync } = usePersistence()
  
  const enableAutoSync = () => {
    configureAutoSync({
      enabled: true,
      intervalMs: 30000,  // Sync every 30 seconds
      syncOnChange: true,  // Sync when changes detected
      maxQueueSize: 50     // Force sync after 50 changes
    })
  }
  
  return <button onClick={enableAutoSync}>Enable Auto-Sync</button>
}
```

## Supported Redux Actions

The middleware automatically handles these action patterns:

### Files
- `files/addItem`, `files/updateItem`, `files/removeItem`
- `files/saveFile`, `files/deleteFile`
- `files/setFiles`

### Models
- `models/addItem`, `models/updateItem`, `models/removeItem`
- `models/saveModel`, `models/deleteModel`
- `models/setModels`

### Components
- `components/addItem`, `components/updateItem`, `components/removeItem`
- `components/saveComponent`, `components/deleteComponent`
- `components/setComponents`

### Component Trees
- `componentTrees/addItem`, `componentTrees/updateItem`, `componentTrees/removeItem`
- `componentTrees/saveComponentTree`, `componentTrees/deleteComponentTree`
- `componentTrees/setComponentTrees`

### Workflows, Lambdas, Theme
- Same pattern as above for `workflows/*`, `lambdas/*`, `theme/*`

## Advanced Usage

### Flush Pending Operations

```typescript
import { usePersistence } from '@/hooks/use-persistence'

function SaveButton() {
  const { flush } = usePersistence()
  
  const handleCriticalSave = async () => {
    // Force immediate persistence of all pending operations
    await flush()
    console.log('All data persisted!')
  }
  
  return <button onClick={handleCriticalSave}>Save Now</button>
}
```

### Configure Per-Slice Settings

```typescript
import { configurePersistence } from '@/store/middleware'

// Disable Flask sync for local-only data
configurePersistence('settings', {
  syncToFlask: false
})

// Increase debounce for frequently updated data
configurePersistence('theme', {
  debounceMs: 1000
})

// Reduce debounce for critical data
configurePersistence('files', {
  debounceMs: 100
})
```

### Disable/Enable Persistence

```typescript
import { disablePersistence, enablePersistence } from '@/store/middleware'

// Temporarily disable persistence (e.g., during bulk operations)
disablePersistence('files')

// ... perform bulk operations ...

// Re-enable persistence
enablePersistence('files')
```

### Manual Sync

```typescript
import { useAppDispatch } from '@/store'
import { syncToFlaskBulk, syncFromFlaskBulk } from '@/store/slices/syncSlice'

function SyncButtons() {
  const dispatch = useAppDispatch()
  
  return (
    <>
      <button onClick={() => dispatch(syncToFlaskBulk())}>
        Push to Flask
      </button>
      <button onClick={() => dispatch(syncFromFlaskBulk())}>
        Pull from Flask
      </button>
    </>
  )
}
```

## Monitoring & Debugging

### View Dashboard

Navigate to the **Persistence** page in the app to see:
- Real-time connection status
- Sync metrics and performance
- Auto-sync configuration
- Manual sync controls
- Error reporting

### Subscribe to Metrics

```typescript
import { subscribeSyncMetrics } from '@/store/middleware'

useEffect(() => {
  const unsubscribe = subscribeSyncMetrics((metrics) => {
    console.log('Metrics updated:', metrics)
    
    if (metrics.failedOperations > 10) {
      alert('High failure rate detected!')
    }
  })
  
  return unsubscribe
}, [])
```

### Check Connection Status

```typescript
import { useAppSelector } from '@/store'

function ConnectionIndicator() {
  const connected = useAppSelector((state) => state.sync.flaskConnected)
  const status = useAppSelector((state) => state.sync.status)
  
  return (
    <div>
      {connected ? '🟢 Connected' : '🔴 Offline'}
      <span> | Status: {status}</span>
    </div>
  )
}
```

## Performance Tips

### 1. Use Appropriate Debounce Times
- **Fast UI updates**: 100-200ms (search, filters)
- **Standard forms**: 300ms (default, recommended)
- **Non-critical data**: 500-1000ms (preferences, settings)

### 2. Batch Operations
```typescript
// ❌ Bad - Multiple individual operations
files.forEach(file => dispatch(saveFile(file)))

// ✅ Good - Single batch operation
dispatch(setFiles(files))
```

### 3. Disable During Bulk Operations
```typescript
import { disablePersistence, enablePersistence, flushPersistence } from '@/store/middleware'

async function importData(largeDataset) {
  disablePersistence('files')
  
  // Perform bulk operations without persistence overhead
  largeDataset.forEach(item => dispatch(addItem(item)))
  
  enablePersistence('files')
  
  // Flush once after all operations
  await flushPersistence()
}
```

## Common Patterns

### Create with Auto-Save
```typescript
const handleCreate = () => {
  dispatch(saveFile({
    id: generateId(),
    name: 'new-file.js',
    content: '',
    language: 'javascript',
    path: '/src/new-file.js',
    updatedAt: Date.now()
  }))
  // Automatically persisted and synced!
}
```

### Update with Auto-Save
```typescript
const handleUpdate = (fileId, newContent) => {
  dispatch(updateFile({
    id: fileId,
    content: newContent,
    updatedAt: Date.now()
  }))
  // Automatically persisted and synced!
}
```

### Delete with Auto-Save
```typescript
const handleDelete = (fileId) => {
  dispatch(deleteFile(fileId))
  // Automatically removed from storage!
}
```

## Troubleshooting

### Data not persisting?
1. Check that the slice is configured in `persistenceMiddleware.ts`
2. Verify the action matches supported patterns
3. Check console for errors

### High failure rate?
1. Check Flask API is running
2. Verify network connection
3. Check IndexedDB quota not exceeded

### Slow performance?
1. Increase debounce time
2. Reduce sync frequency
3. Disable Flask sync for non-critical data

## Example: Complete CRUD Component

```typescript
import { useAppDispatch, useAppSelector } from '@/store'
import { saveFile, deleteFile } from '@/store/slices/filesSlice'
import { usePersistence } from '@/hooks/use-persistence'

function FileManager() {
  const dispatch = useAppDispatch()
  const files = useAppSelector((state) => state.files.files)
  const { status } = usePersistence()
  
  const create = (name, content) => {
    dispatch(saveFile({
      id: `file-${Date.now()}`,
      name,
      content,
      language: 'javascript',
      path: `/src/${name}`,
      updatedAt: Date.now()
    }))
  }
  
  const update = (id, content) => {
    const file = files.find(f => f.id === id)
    if (file) {
      dispatch(saveFile({
        ...file,
        content,
        updatedAt: Date.now()
      }))
    }
  }
  
  const remove = (id) => {
    dispatch(deleteFile(id))
  }
  
  return (
    <div>
      <div>Status: {status.syncStatus}</div>
      {files.map(file => (
        <div key={file.id}>
          <span>{file.name}</span>
          <button onClick={() => update(file.id, 'new content')}>Edit</button>
          <button onClick={() => remove(file.id)}>Delete</button>
        </div>
      ))}
      <button onClick={() => create('new.js', '')}>New File</button>
    </div>
  )
}
```

## Learn More

- Full documentation: `PERSISTENCE_MIDDLEWARE_DOCS.md`
- View live dashboard: Navigate to **Persistence** page
- Try the demo: Navigate to **Persistence Demo** page
