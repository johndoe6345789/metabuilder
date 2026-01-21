# Redux Integration with IndexedDB and Flask API

## Overview

This project implements a comprehensive Redux Toolkit integration with:
- **IndexedDB** for local browser storage
- **Flask API** for remote server synchronization
- **Atomic component trees** from JSON structures

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Components                        │
│                   (UI Layer with Hooks)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Redux Toolkit Store                       │
│  ┌──────────┬──────────┬────────────┬──────────┬─────────┐ │
│  │ Project  │  Files   │  Models    │Components│  Theme  │ │
│  │  Slice   │  Slice   │   Slice    │  Slice   │  Slice  │ │
│  └──────────┴──────────┴────────────┴──────────┴─────────┘ │
│  ┌───────────────┬─────────────┬─────────────┬───────────┐ │
│  │ ComponentTrees│  Workflows  │   Lambdas   │   Sync    │ │
│  │     Slice     │    Slice    │    Slice    │   Slice   │ │
│  └───────────────┴─────────────┴─────────────┴───────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐            ┌────────▼────────┐
│   IndexedDB     │            │   Flask API     │
│  (Local Store)  │◄──Sync────►│ (Remote Store)  │
└─────────────────┘            └─────────────────┘
```

## Redux Slices

### 1. Project Slice (`projectSlice.ts`)
Manages project metadata and overall project state.

```typescript
import { useAppDispatch, useAppSelector } from '@/store'
import { createProject, loadProjects } from '@/store/slices/projectSlice'

// Usage
const dispatch = useAppDispatch()
const projects = useAppSelector(state => state.project.projects)

// Create a new project
dispatch(createProject({ name: 'My Project', description: 'Description' }))

// Load all projects
dispatch(loadProjects())
```

### 2. Files Slice (`filesSlice.ts`)
Manages file operations with IndexedDB and Flask sync.

```typescript
import { useReduxFiles } from '@/hooks/use-redux-files'

const { files, save, remove, setActive } = useReduxFiles()

// Save a file
save({
  id: 'file-1',
  name: 'Component.tsx',
  content: 'export default function() {}',
  language: 'typescript',
  path: '/src/components',
  updatedAt: Date.now()
})
```

### 3. Component Trees Slice (`componentTreesSlice.ts`)
Manages JSON component trees for atomic component rendering.

```typescript
import { useReduxComponentTrees } from '@/hooks/use-redux-component-trees'

const { trees, updateNode, setActive } = useReduxComponentTrees()

// Update a node in the tree
updateNode('tree-1', 'node-1', {
  props: { className: 'updated-class' }
})
```

### 4. Models Slice (`modelsSlice.ts`)
Manages data models and schemas.

```typescript
import { useAppDispatch } from '@/store'
import { saveModel } from '@/store/slices/modelsSlice'

dispatch(saveModel({
  id: 'model-1',
  name: 'User',
  fields: [
    { id: 'f1', name: 'email', type: 'string', required: true },
    { id: 'f2', name: 'name', type: 'string', required: true }
  ],
  updatedAt: Date.now()
}))
```

### 5. Components Slice (`componentsSlice.ts`)
Manages atomic/molecule/organism components.

```typescript
import { useAppDispatch } from '@/store'
import { saveComponent } from '@/store/slices/componentsSlice'

dispatch(saveComponent({
  id: 'comp-1',
  name: 'Button',
  type: 'atom',
  code: 'export function Button() { return <button /> }',
  updatedAt: Date.now()
}))
```

### 6. Workflows Slice (`workflowsSlice.ts`)
Manages workflow diagrams and visual programming.

### 7. Lambdas Slice (`lambdasSlice.ts`)
Manages serverless function definitions.

### 8. Theme Slice (`themeSlice.ts`)
Manages theme configuration and styling.

```typescript
import { useAppDispatch } from '@/store'
import { updateThemeColors } from '@/store/slices/themeSlice'

dispatch(updateThemeColors({
  primary: 'oklch(0.58 0.24 265)',
  accent: 'oklch(0.75 0.20 145)'
}))
```

### 9. Settings Slice (`settingsSlice.ts`)
Manages application settings.

```typescript
import { useAppDispatch } from '@/store'
import { toggleAutoSync, setSyncInterval } from '@/store/slices/settingsSlice'

dispatch(toggleAutoSync())
dispatch(setSyncInterval(60000)) // 60 seconds
```

### 10. Sync Slice (`syncSlice.ts`)
Manages synchronization between IndexedDB and Flask API.

```typescript
import { useReduxSync } from '@/hooks/use-redux-sync'

const { 
  syncToFlask, 
  syncFromFlask, 
  flaskConnected,
  status 
} = useReduxSync()

// Push local data to Flask
syncToFlask()

// Pull data from Flask
syncFromFlask()
```

## Custom Hooks

### `useReduxFiles()`
Simplified hook for file operations.

```typescript
const {
  files,          // Array of all files
  activeFile,     // Currently active file
  activeFileId,   // ID of active file
  loading,        // Loading state
  error,          // Error message
  load,           // Load all files
  save,           // Save a file
  remove,         // Delete a file
  setActive       // Set active file
} = useReduxFiles()
```

### `useReduxComponentTrees()`
Simplified hook for component tree operations.

```typescript
const {
  trees,          // Array of all trees
  activeTree,     // Currently active tree
  activeTreeId,   // ID of active tree
  loading,        // Loading state
  error,          // Error message
  load,           // Load all trees
  save,           // Save a tree
  remove,         // Delete a tree
  setActive,      // Set active tree
  updateNode      // Update a specific node
} = useReduxComponentTrees()
```

### `useReduxSync()`
Simplified hook for synchronization operations.

```typescript
const {
  status,            // 'idle' | 'syncing' | 'success' | 'error'
  lastSyncedAt,      // Timestamp of last sync
  flaskConnected,    // Flask connection status
  flaskStats,        // Flask storage statistics
  error,             // Error message
  syncToFlask,       // Push to Flask
  syncFromFlask,     // Pull from Flask
  checkConnection,   // Check Flask connection
  clearFlaskData,    // Clear Flask storage
  reset              // Reset sync status
} = useReduxSync()
```

## Flask API Middleware

The Flask sync middleware (`flaskSync.ts`) provides:

### Individual Sync Operations
```typescript
import { syncToFlask, fetchFromFlask } from '@/store/middleware/flaskSync'

// Sync a single item to Flask
await syncToFlask('files', 'file-1', fileData)

// Fetch a single item from Flask
const data = await fetchFromFlask('files', 'file-1')

// Delete from Flask
await syncToFlask('files', 'file-1', null, 'delete')
```

### Bulk Operations
```typescript
import { 
  syncAllToFlask, 
  fetchAllFromFlask,
  getFlaskStats,
  clearFlaskStorage
} from '@/store/middleware/flaskSync'

// Push all data to Flask
await syncAllToFlask({
  'files:file-1': fileData,
  'models:model-1': modelData
})

// Pull all data from Flask
const allData = await fetchAllFromFlask()

// Get Flask statistics
const stats = await getFlaskStats()
// Returns: { total_keys, total_size_bytes, database_path }

// Clear Flask storage
await clearFlaskStorage()
```

## IndexedDB Integration

The IndexedDB integration (`db.ts`) provides direct database access:

```typescript
import { db } from '@/lib/db'

// Get a single item
const file = await db.get('files', 'file-1')

// Get all items
const files = await db.getAll('files')

// Save an item
await db.put('files', fileData)

// Delete an item
await db.delete('files', 'file-1')

// Clear a store
await db.clear('files')

// Query by index
const results = await db.query('files', 'path', '/src/components')

// Count items
const count = await db.count('files')
```

## Flask API Endpoints

The Flask backend provides these REST endpoints:

### Storage Operations
- `GET /api/storage/keys` - List all keys
- `GET /api/storage/<key>` - Get value by key
- `PUT /api/storage/<key>` - Set/update value
- `DELETE /api/storage/<key>` - Delete value
- `POST /api/storage/clear` - Clear all data

### Bulk Operations
- `GET /api/storage/export` - Export all data
- `POST /api/storage/import` - Import data

### Utilities
- `GET /api/storage/stats` - Get storage statistics
- `GET /health` - Health check

## Auto-Sync Feature

Redux automatically syncs to Flask when `autoSync` is enabled:

```typescript
import { useAppDispatch } from '@/store'
import { toggleAutoSync, setSyncInterval } from '@/store/slices/settingsSlice'

// Enable auto-sync
dispatch(toggleAutoSync())

// Set sync interval (milliseconds)
dispatch(setSyncInterval(30000)) // Every 30 seconds
```

The sync hook automatically:
1. Checks Flask connection on mount
2. Starts auto-sync interval if enabled
3. Syncs all Redux state to Flask periodically
4. Updates sync status and timestamps

## Environment Configuration

Set the Flask API URL via environment variable:

```env
VITE_FLASK_API_URL=http://localhost:5001
```

Or it defaults to `http://localhost:5001`.

## Demo Component

The `ReduxIntegrationDemo` component showcases:
- Redux store state visualization
- IndexedDB operations
- Flask API connectivity
- Real-time sync status
- CRUD operations for files
- Component tree display

To use it:

```typescript
import { Provider } from 'react-redux'
import { store } from '@/store'
import { ReduxIntegrationDemo } from '@/components/ReduxIntegrationDemo'

function App() {
  return (
    <Provider store={store}>
      <ReduxIntegrationDemo />
    </Provider>
  )
}
```

## Best Practices

### 1. Always Use Typed Hooks
```typescript
// ✅ Good
import { useAppDispatch, useAppSelector } from '@/store'

// ❌ Avoid
import { useDispatch, useSelector } from 'react-redux'
```

### 2. Use Custom Hooks for Common Operations
```typescript
// ✅ Good
const { files, save } = useReduxFiles()

// ❌ Verbose
const dispatch = useAppDispatch()
const files = useAppSelector(state => state.files.files)
dispatch(saveFile(fileData))
```

### 3. Handle Loading and Error States
```typescript
const { files, loading, error } = useReduxFiles()

if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
return <FileList files={files} />
```

### 4. Use Async Thunks for Side Effects
```typescript
// Redux automatically handles loading/error states
export const saveFile = createAsyncThunk(
  'files/saveFile',
  async (file: FileItem) => {
    await db.put('files', file)
    await syncToFlask('files', file.id, file)
    return file
  }
)
```

### 5. Leverage Auto-Sync for Background Operations
Enable auto-sync for seamless background synchronization without manual triggers.

## Troubleshooting

### Flask Connection Issues
- Check Flask is running on the configured port
- Verify CORS settings in Flask app
- Check network/firewall settings

### IndexedDB Issues
- Clear browser data if corrupted
- Check browser console for errors
- Verify IndexedDB support in browser

### Sync Conflicts
- Flask always overwrites on push
- Pull from Flask overwrites local data
- Implement conflict resolution if needed

## Next Steps

1. Implement conflict resolution for sync operations
2. Add optimistic updates for better UX
3. Implement offline-first patterns
4. Add data migration utilities
5. Create Redux DevTools integration
6. Add comprehensive error recovery
