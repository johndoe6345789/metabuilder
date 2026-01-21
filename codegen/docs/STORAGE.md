# Unified Storage System

CodeForge features a unified storage system that automatically selects the best available storage backend for your data persistence needs.

## Storage Backends

The system supports four storage backends:

### 1. **IndexedDB (Default)**
- **Type**: Browser-native key-value store
- **Persistence**: Data stored in browser IndexedDB
- **Pros**:
  - No additional dependencies
  - Large storage capacity (usually >50MB, can be GBs)
  - Fast for simple key-value operations
  - Works offline
  - Native browser support
  - **Default behavior** - works out of the box
- **Cons**:
  - No SQL query support
  - More complex API
  - Asynchronous only

### 2. **Flask Backend (Optional)**
- **Type**: Remote HTTP API with SQLite database
- **Persistence**: Data stored on Flask server with SQLite
- **When Used**: Only when explicitly configured via UI settings or environment variable
- **Pros**: 
  - Cross-device synchronization
  - Centralized data management
  - SQL query support on server
  - Scalable storage capacity
  - Works with Docker
- **Cons**: 
  - Requires running backend server
  - Network latency
  - Requires configuration
- **Setup**: See backend/README.md for installation
- **Configuration**:
  - **UI**: Go to Settings → Storage and enable Flask backend
  - **Environment Variable**: Set `VITE_FLASK_BACKEND_URL=http://your-backend-url:5001` in `.env` file

### 3. **SQLite (Optional)**
- **Type**: On-disk database via WASM
- **Persistence**: Data stored in browser localStorage as serialized SQLite database
- **Pros**: 
  - SQL query support
  - Better performance for complex queries
  - More robust data integrity
  - Works offline
- **Cons**: 
  - Requires sql.js library (optional dependency)
  - Slightly larger bundle size
  - localStorage size limits (~5-10MB)
- **Installation**: `npm install sql.js`

### 4. **Spark KV (Fallback)**
- **Type**: Cloud key-value store
- **Persistence**: Data stored in Spark runtime
- **Pros**:
  - No size limits
  - Synced across devices
  - Persistent beyond browser
- **Cons**:
  - Requires Spark runtime
  - Online only
  - Slower than local storage

## Usage

### Basic Usage

```typescript
import { unifiedStorage } from '@/lib/unified-storage'

// Get data
const value = await unifiedStorage.get<MyType>('my-key')

// Set data
await unifiedStorage.set('my-key', myData)

// Delete data
await unifiedStorage.delete('my-key')

// Get all keys
const keys = await unifiedStorage.keys()

// Clear all data
await unifiedStorage.clear()

// Check current backend
const backend = await unifiedStorage.getBackend()
console.log(`Using: ${backend}`) // 'sqlite', 'indexeddb', or 'sparkkv'
```

### React Hook

```typescript
import { useUnifiedStorage } from '@/hooks/use-unified-storage'

function MyComponent() {
  const [todos, setTodos, deleteTodos] = useUnifiedStorage('todos', [])

  const addTodo = async (todo: Todo) => {
    // ALWAYS use functional updates to avoid stale data
    await setTodos((current) => [...current, todo])
  }

  const removeTodo = async (id: string) => {
    await setTodos((current) => current.filter(t => t.id !== id))
  }

  return (
    <div>
      <button onClick={() => addTodo({ id: '1', text: 'New Todo' })}>
        Add Todo
      </button>
      <button onClick={deleteTodos}>Clear All</button>
    </div>
  )
}
```

### Storage Backend Management

```typescript
import { useStorageBackend } from '@/hooks/use-unified-storage'

function StorageManager() {
  const {
    backend,
    isLoading,
    switchToFlask,
    switchToIndexedDB,
    switchToSQLite,
    exportData,
    importData,
  } = useStorageBackend()

  return (
    <div>
      <p>Current backend: {backend}</p>
      <button onClick={() => switchToFlask('http://localhost:5001')}>
        Switch to Flask
      </button>
      <button onClick={switchToIndexedDB}>Switch to IndexedDB</button>
      <button onClick={switchToSQLite}>Switch to SQLite</button>
      <button onClick={async () => {
        const data = await exportData()
        console.log('Exported:', data)
      }}>
        Export Data
      </button>
    </div>
  )
}
```

## Migration Between Backends

The system supports seamless migration between storage backends:

```typescript
// Migrate to Flask backend
await unifiedStorage.switchToFlask('http://localhost:5001')

// Migrate to IndexedDB (preserves all data)
await unifiedStorage.switchToIndexedDB()

// Migrate to SQLite (preserves all data)
await unifiedStorage.switchToSQLite()
```

When switching backends:
1. All existing data is exported from the current backend
2. The new backend is initialized
3. All data is imported into the new backend
4. The preference is saved for future sessions

## Data Export/Import

Export and import data for backup or migration purposes:

```typescript
// Export all data as JSON
const data = await unifiedStorage.exportData()
const json = JSON.stringify(data, null, 2)

// Save to file
const blob = new Blob([json], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'codeforge-backup.json'
a.click()

// Import data from JSON
const imported = JSON.parse(jsonString)
await unifiedStorage.importData(imported)
```

## Backend Detection

The system automatically detects and selects the best available backend on initialization:

1. **Flask** is attempted first if `localStorage.getItem('codeforge-prefer-flask') === 'true'`
2. **IndexedDB** is attempted next if available in the browser
3. **SQLite** is attempted if `localStorage.getItem('codeforge-prefer-sqlite') === 'true'`
4. **Spark KV** is used as a last resort fallback

You can check which backend is in use:

```typescript
const backend = await unifiedStorage.getBackend()
// Returns: 'flask' | 'indexeddb' | 'sqlite' | 'sparkkv' | null
```

## Performance Considerations

### Flask Backend
- Best for: Cross-device sync, centralized data, team collaboration
- Read: Moderate (network latency)
- Write: Moderate (network latency)
- Capacity: Large (server disk space)

### IndexedDB
- Best for: Simple key-value storage, large data volumes, offline-first
- Read: Very fast (optimized for key lookups)
- Write: Very fast (optimized browser API)
- Capacity: Large (typically 50MB+, can scale to GBs)

### SQLite
- Best for: Complex queries, relational data, SQL support
- Read: Fast (in-memory queries)
- Write: Moderate (requires serialization to localStorage)
- Capacity: Limited by localStorage (~5-10MB)

### Spark KV
- Best for: Cross-device sync, cloud persistence
- Read: Moderate (network latency)
- Write: Moderate (network latency)
- Capacity: Unlimited

## Troubleshooting

### Flask Backend Not Available

If Flask backend fails to connect:
1. Check backend is running: `curl http://localhost:5001/health`
2. Verify CORS is enabled on backend
3. Check the Flask URL is correct in settings
4. System will automatically fallback to IndexedDB
5. See backend/README.md for backend setup

### SQLite Not Available

If SQLite fails to initialize:
1. Check console for errors
2. Ensure sql.js is installed: `npm install sql.js`
3. System will automatically fallback to IndexedDB

### IndexedDB Quota Exceeded

If IndexedDB storage is full:
1. Clear old data: `await unifiedStorage.clear()`
2. Export important data first
3. Consider switching to Flask backend for unlimited storage

### Data Not Persisting

1. Check which backend is active: `await unifiedStorage.getBackend()`
2. Verify browser supports storage (check if in private mode)
3. Check browser console for errors
4. Try exporting/importing data to refresh storage

## Best Practices

1. **Use Functional Updates**: Always use functional form of setState to avoid stale data:
   ```typescript
   // ❌ WRONG - can lose data
   setTodos([...todos, newTodo])
   
   // ✅ CORRECT - always safe
   setTodos((current) => [...current, newTodo])
   ```

2. **Handle Errors**: Wrap storage operations in try-catch:
   ```typescript
   try {
     await unifiedStorage.set('key', value)
   } catch (error) {
     console.error('Storage failed:', error)
     toast.error('Failed to save data')
   }
   ```

3. **Export Regularly**: Create backups of important data:
   ```typescript
   const backup = await unifiedStorage.exportData()
   // Save backup somewhere safe
   ```

4. **Use Appropriate Backend**: Choose based on your needs:
   - Team collaboration, cross-device → Flask backend
   - Local-only, small data → IndexedDB
   - Local-only, needs SQL → SQLite (install sql.js)
   - Cloud sync needed → Spark KV

## UI Component

The app includes a `StorageSettings` component that provides a user-friendly interface for:
- Viewing current storage backend
- Switching between backends (Flask, IndexedDB, SQLite)
- Configuring Flask backend URL
- Exporting/importing data
- Viewing storage statistics

Add it to your settings page:

```typescript
import { StorageSettings } from '@/components/molecules'

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <StorageSettings />
    </div>
  )
}
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Unified Storage API             │
│  (unifiedStorage.get/set/delete/keys)   │
└──────────────┬──────────────────────────┘
               │
               ├─ Automatic Backend Detection
               │
       ┌───────┴───────┬─────────────┬────────┬────────┐
       │               │             │        │        │
       ▼               ▼             ▼        ▼        ▼
┌────────────┐ ┌─────────────┐ ┌─────────┐ ┌────┐ ┌────┐
│   Flask    │ │  IndexedDB  │ │ SQLite  │ │ KV │ │ ?  │
│  (optional)│ │  (default)  │ │(optional│ │    │ │Next│
└────────────┘ └─────────────┘ └─────────┘ └────┘ └────┘
       │               │             │        │
       │               └─────┬───────┴────────┘
       │                     │
       ▼                     ▼
  HTTP Server          Browser Storage
   (SQLite)
```

## Future Enhancements

- [ ] Add compression for large data objects
- [ ] Implement automatic backup scheduling
- [ ] Add support for native file system API
- [ ] Support for WebSQL (legacy browsers)
- [ ] Encrypted storage option
- [ ] Storage analytics and usage metrics
- [ ] Automatic data migration on version changes
- [ ] Flask backend authentication/authorization
- [ ] Multi-user support with Flask backend
- [ ] Real-time sync with WebSockets
