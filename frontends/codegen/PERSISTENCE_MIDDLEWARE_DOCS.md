# Redux Persistence Middleware Documentation

## Overview

The Redux Persistence Middleware system provides automatic synchronization between Redux state, IndexedDB (local storage), and Flask API (remote storage). This system ensures data consistency, provides offline-first capabilities, and enables seamless sync operations.

## Architecture

```
┌─────────────────┐
│  Redux Actions  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Persistence Middleware     │
│  • Debouncing (300ms)       │
│  • Batch Operations         │
│  • Queue Management         │
└────────┬────────────────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│  IndexedDB   │    │  Flask API   │   │   Metrics    │
│  (Local)     │    │  (Remote)    │   │  Tracking    │
└──────────────┘    └──────────────┘   └──────────────┘
```

## Middleware Components

### 1. Persistence Middleware

**Purpose:** Automatically persists Redux state changes to IndexedDB and optionally syncs to Flask API.

**Features:**
- Automatic persistence with configurable debouncing (default: 300ms)
- Batch operations for improved performance
- Per-slice configuration
- Support for both PUT and DELETE operations
- Queue management to prevent overwhelming storage systems

**Configuration:**
```typescript
const config = {
  storeName: 'files',      // IndexedDB store name
  enabled: true,           // Enable/disable persistence
  syncToFlask: true,       // Sync to Flask API
  debounceMs: 300,         // Debounce time in milliseconds
  batchSize: 10,           // Max operations per batch
}
```

**Supported Actions:**
- `addItem`, `updateItem`, `removeItem`
- `saveFile`, `saveModel`, `saveComponent`, etc.
- `setFiles`, `setModels`, `setComponents`, etc.
- `deleteFile`, `deleteModel`, `deleteComponent`, etc.

### 2. Sync Monitor Middleware

**Purpose:** Tracks metrics and performance of sync operations.

**Metrics Tracked:**
- Total operations count
- Successful operations count
- Failed operations count
- Last operation timestamp
- Average operation duration
- Operation time history (last 100 operations)

**Usage:**
```typescript
import { getSyncMetrics, subscribeSyncMetrics } from '@/store/middleware'

// Get current metrics
const metrics = getSyncMetrics()

// Subscribe to metric updates
const unsubscribe = subscribeSyncMetrics((newMetrics) => {
  console.log('Sync metrics updated:', newMetrics)
})
```

### 3. Auto-Sync Middleware

**Purpose:** Provides automatic periodic synchronization with Flask API.

**Features:**
- Configurable sync interval (default: 30 seconds)
- Optional sync-on-change mode
- Change tracking with configurable queue size
- Automatic connection health checks
- Manual sync trigger support

**Configuration:**
```typescript
import { configureAutoSync } from '@/store/middleware'

configureAutoSync({
  enabled: true,           // Enable auto-sync
  intervalMs: 30000,       // Sync every 30 seconds
  syncOnChange: true,      // Sync immediately when changes detected
  maxQueueSize: 50,        // Max changes before forcing sync
})
```

## React Hooks

### `usePersistence()`

A comprehensive hook for interacting with the persistence system.

**Returns:**
```typescript
{
  status: {
    enabled: boolean
    lastSyncTime: number | null
    syncStatus: 'idle' | 'syncing' | 'success' | 'error'
    error: string | null
    flaskConnected: boolean
  },
  metrics: {
    totalOperations: number
    successfulOperations: number
    failedOperations: number
    lastOperationTime: number
    averageOperationTime: number
  },
  autoSyncStatus: {
    enabled: boolean
    lastSyncTime: number
    changeCounter: number
    nextSyncIn: number | null
  },
  flush: () => Promise<void>
  configure: (sliceName: string, config: any) => void
  enable: (sliceName: string) => void
  disable: (sliceName: string) => void
  resetMetrics: () => void
  configureAutoSync: (config: any) => void
  syncNow: () => Promise<void>
}
```

**Example:**
```typescript
import { usePersistence } from '@/hooks/use-persistence'

function MyComponent() {
  const { status, metrics, syncNow } = usePersistence()

  return (
    <div>
      <p>Status: {status.syncStatus}</p>
      <p>Success Rate: {(metrics.successfulOperations / metrics.totalOperations * 100)}%</p>
      <button onClick={syncNow}>Sync Now</button>
    </div>
  )
}
```

## Persistence Dashboard

A visual dashboard component for monitoring and controlling the persistence system.

**Features:**
- Real-time connection status
- Sync metrics visualization
- Auto-sync configuration
- Manual sync operations
- Error reporting

**Usage:**
```typescript
import { PersistenceDashboard } from '@/components/PersistenceDashboard'

function App() {
  return <PersistenceDashboard />
}
```

## API Reference

### Persistence Control

```typescript
// Flush all pending operations immediately
await flushPersistence()

// Configure a specific slice
configurePersistence('files', {
  debounceMs: 500,
  syncToFlask: false,
})

// Enable/disable persistence for a slice
enablePersistence('models')
disablePersistence('theme')
```

### Sync Operations

```typescript
import { syncToFlaskBulk, syncFromFlaskBulk } from '@/store/slices/syncSlice'

// Push all data to Flask
dispatch(syncToFlaskBulk())

// Pull all data from Flask
dispatch(syncFromFlaskBulk())

// Check Flask connection
dispatch(checkFlaskConnection())
```

### Metrics Management

```typescript
import { getSyncMetrics, resetSyncMetrics } from '@/store/middleware'

// Get current metrics
const metrics = getSyncMetrics()

// Reset all metrics
resetSyncMetrics()
```

## Data Flow Examples

### Create Operation
```
User creates file
  → Redux action dispatched (files/addItem)
  → Persistence middleware intercepts action
  → Item added to persistence queue with 300ms debounce
  → After debounce, item saved to IndexedDB
  → If syncToFlask enabled, item synced to Flask API
  → Sync monitor tracks operation
  → Metrics updated
```

### Update Operation
```
User edits file
  → Redux action dispatched (files/updateItem)
  → Persistence middleware intercepts
  → Existing debounce timer cleared
  → New debounce timer started (300ms)
  → After debounce, updated item saved to IndexedDB
  → Item synced to Flask API
  → Auto-sync change counter incremented
```

### Auto-Sync Operation
```
Auto-sync timer fires (every 30s)
  → Check if changes pending
  → If changes > 0, trigger bulk sync
  → Collect all items from IndexedDB
  → Send bulk request to Flask API
  → Update last sync timestamp
  → Reset change counter
  → Update connection status
```

## Performance Considerations

### Debouncing
- Default 300ms debounce prevents excessive writes
- Each new action resets the timer for that item
- Independent timers per item (files:123, models:456)

### Batching
- Operations batched for IndexedDB efficiency
- Maximum 10 operations per batch by default
- Failed operations don't block successful ones

### Queue Management
- FIFO queue ensures order
- Latest operation for a key overwrites previous
- Automatic flush on component unmount

## Error Handling

### Connection Failures
- Automatically detected via health checks
- System gracefully degrades to local-only mode
- Queued operations retained for next successful connection

### Operation Failures
- Failed operations logged to console
- Metrics track failure count
- Error messages displayed in dashboard
- Toast notifications for user feedback

### Data Conflicts
- Detected during sync operations
- Timestamp comparison used for detection
- Manual resolution via conflict resolution UI
- Multiple resolution strategies available

## Best Practices

### 1. Enable Auto-Sync for Production
```typescript
configureAutoSync({
  enabled: true,
  intervalMs: 30000,
  syncOnChange: true,
})
```

### 2. Monitor Metrics Regularly
```typescript
useEffect(() => {
  const unsubscribe = subscribeSyncMetrics((metrics) => {
    if (metrics.failedOperations > 10) {
      console.warn('High failure rate detected')
    }
  })
  return unsubscribe
}, [])
```

### 3. Flush on Critical Operations
```typescript
async function saveProject() {
  // ... save project data ...
  await flushPersistence()
  // Ensure all data is persisted before continuing
}
```

### 4. Configure Per-Slice Settings
```typescript
// Disable Flask sync for local-only data
configurePersistence('settings', {
  syncToFlask: false,
})

// Increase debounce for frequently updated data
configurePersistence('theme', {
  debounceMs: 1000,
})
```

## Troubleshooting

### Problem: Data not syncing to Flask
**Solution:** Check Flask connection status in dashboard. Verify Flask API is running and accessible.

### Problem: High failure rate
**Solution:** Check network connection. Verify IndexedDB quota not exceeded. Check console for detailed error messages.

### Problem: Slow performance
**Solution:** Increase debounce time. Reduce sync frequency. Disable Flask sync for non-critical data.

### Problem: Auto-sync not working
**Solution:** Verify auto-sync is enabled in settings. Check that Flask is connected. Verify change counter is incrementing.

## Future Enhancements

- [ ] Optimistic updates with rollback
- [ ] Selective sync by data type
- [ ] Compression for large payloads
- [ ] Differential sync (only changed fields)
- [ ] WebSocket real-time sync
- [ ] Multi-device sync with conflict resolution
- [ ] Offline queue with retry logic
- [ ] Sync progress indicators
