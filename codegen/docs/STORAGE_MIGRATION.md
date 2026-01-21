# Storage Migration Guide

## Overview

CodeForge has migrated from Spark KV-based storage to **IndexedDB** as the primary local database solution. This provides:

- ✅ **Better Performance**: Structured queries with indexes
- ✅ **More Storage**: No 10MB limit like LocalStorage
- ✅ **Structured Data**: Organized collections instead of flat key-value
- ✅ **Offline First**: Robust offline capabilities
- ✅ **Backward Compatible**: Spark KV still available as fallback

## Architecture

### Storage Layers

```
┌─────────────────────────────────────┐
│     Application Layer               │
│  (React Components & Hooks)         │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│     Hybrid Storage API              │
│  • Prefers IndexedDB                │
│  • Falls back to Spark KV           │
│  • Automatic sync/migration         │
└─────────────┬───────────────────────┘
              │
      ┌───────┴────────┐
      │                │
┌─────▼──────┐  ┌─────▼──────┐
│ IndexedDB  │  │  Spark KV  │
│ (Primary)  │  │ (Fallback) │
└────────────┘  └────────────┘
```

### IndexedDB Schema

```typescript
{
  projects: {
    id: string,
    name: string,
    files: any[],
    models: any[],
    // ... full project data
  },
  files: {
    id: string,
    name: string,
    content: string,
    language: string,
  },
  models: {
    id: string,
    name: string,
    fields: any[],
  },
  components: {
    id: string,
    name: string,
    code: string,
  },
  workflows: {
    id: string,
    name: string,
    nodes: any[],
    edges: any[],
  },
  settings: {
    key: string,
    value: any,
  }
}
```

## Usage

### Basic Storage Hook

Replace `useKV` from Spark with `useStorage`:

```typescript
// ❌ Old way (Spark KV only)
import { useKV } from '@github/spark/hooks'
const [todos, setTodos] = useKV('todos', [])

// ✅ New way (IndexedDB + Spark KV fallback)
import { useStorage } from '@/hooks/use-storage'
const [todos, setTodos] = useStorage('todos', [])
```

### Collection-Based Storage

For structured data collections:

```typescript
import { useIndexedDB } from '@/hooks/use-indexed-db'

// Single item by ID
const [project, updateProject, deleteProject, loading] = 
  useIndexedDB('projects', projectId, defaultProject)

// All items in collection
const [allProjects, refresh, loading] = 
  useIndexedDBCollection('projects')
```

### Direct Database Access

For advanced queries:

```typescript
import { db } from '@/lib/db'

// Get by ID
const project = await db.get('projects', 'proj-123')

// Get all
const allProjects = await db.getAll('projects')

// Query by index
const recentProjects = await db.query(
  'projects',
  'updatedAt',
  IDBKeyRange.lowerBound(Date.now() - 7 * 24 * 60 * 60 * 1000)
)

// Save
await db.put('projects', {
  id: 'proj-123',
  name: 'My Project',
  // ...
})

// Delete
await db.delete('projects', 'proj-123')
```

## Migration

### Automatic Migration

The hybrid storage system automatically handles migration:

1. On first read, checks IndexedDB
2. If not found, checks Spark KV
3. On write, saves to both (if enabled)

### Manual Migration

Use the Storage Settings page or programmatically:

```typescript
import { storage } from '@/lib/storage'

// Migrate all data from Spark KV to IndexedDB
const { migrated, failed } = await storage.migrateFromSparkKV()
console.log(`Migrated ${migrated} items, ${failed} failed`)

// Sync IndexedDB back to Spark KV (backup)
const { synced, failed } = await storage.syncToSparkKV()
console.log(`Synced ${synced} items, ${failed} failed`)
```

### Storage Settings UI

Access via Settings → Storage Management:

- **View Statistics**: See item counts in each storage
- **Migrate Data**: One-click migration from Spark KV
- **Sync to Cloud**: Backup IndexedDB to Spark KV
- **Clear Data**: Emergency data reset

## Configuration

### Storage Options

```typescript
import { HybridStorage } from '@/lib/storage'

// Custom configuration
const customStorage = new HybridStorage({
  useIndexedDB: true,      // Enable IndexedDB
  useSparkKV: true,        // Enable Spark KV fallback
  preferIndexedDB: true,   // Try IndexedDB first
})
```

### Pre-configured Instances

```typescript
import { 
  storage,              // Default: IndexedDB preferred, Spark KV fallback
  indexedDBOnlyStorage, // IndexedDB only
  sparkKVOnlyStorage    // Spark KV only
} from '@/lib/storage'
```

## Best Practices

### 1. Use Functional Updates

Always use functional updates for concurrent-safe operations:

```typescript
// ❌ Wrong - stale closure
setTodos([...todos, newTodo])

// ✅ Correct - always current
setTodos((current) => [...current, newTodo])
```

### 2. Structured Data in Collections

Store structured data in typed collections:

```typescript
// ❌ Wrong - flat key-value
await storage.set('project-123', projectData)

// ✅ Correct - structured collection
await db.put('projects', {
  id: '123',
  ...projectData
})
```

### 3. Error Handling

Always handle storage errors gracefully:

```typescript
try {
  await updateProject(newData)
} catch (error) {
  console.error('Failed to save project:', error)
  toast.error('Save failed. Please try again.')
}
```

### 4. Periodic Backups

Regularly sync to Spark KV for backup:

```typescript
// Backup on significant changes
useEffect(() => {
  if (hasUnsavedChanges) {
    storage.syncToSparkKV().catch(console.error)
  }
}, [hasUnsavedChanges])
```

## Performance Benefits

### Before (Spark KV Only)

- 🐌 Linear search through all keys
- 🐌 No indexes or structured queries
- 🐌 Serialization overhead on every access
- ⚠️ 10MB storage limit

### After (IndexedDB Primary)

- ⚡ Indexed queries (O(log n))
- ⚡ Structured collections with schemas
- ⚡ Efficient binary storage
- ✅ ~1GB+ storage (browser dependent)

## Browser Support

IndexedDB is supported in all modern browsers:

- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ Mobile browsers

Spark KV automatically serves as fallback if IndexedDB is unavailable.

## Troubleshooting

### "Database not initialized" Error

```typescript
// Ensure init is called before use
await db.init()
const data = await db.get('projects', 'proj-123')
```

### Storage Quota Exceeded

```typescript
// Check available storage
if (navigator.storage && navigator.storage.estimate) {
  const { usage, quota } = await navigator.storage.estimate()
  console.log(`Using ${usage} of ${quota} bytes`)
}
```

### Data Migration Issues

1. Check browser console for specific errors
2. Verify Spark KV data exists: `window.spark.kv.keys()`
3. Clear IndexedDB and retry migration
4. Use Storage Settings UI for guided migration

## Future Enhancements

- [ ] **Remote Sync**: Sync to cloud database
- [ ] **Compression**: Compress large datasets
- [ ] **Encryption**: Encrypt sensitive data at rest
- [ ] **Import/Export**: JSON export for portability
- [ ] **Version Control**: Track data changes over time

## Summary

The migration to IndexedDB provides:

1. **Better Performance**: Structured queries with indexes
2. **More Capacity**: Gigabytes instead of megabytes
3. **Backward Compatible**: Spark KV still works
4. **Easy Migration**: One-click data transfer
5. **Flexible**: Use IndexedDB, Spark KV, or both

The hybrid storage system ensures your data is always accessible while providing the performance benefits of a proper database.
