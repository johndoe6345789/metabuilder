# /admin/database Page - Code Examples & Patterns

## Example 1: Basic Handler Implementation

### Stats Refresh Handler
```typescript
// In page.tsx
async function onRefreshStats() {
  setStatsLoading(true)
  setStatsError(null)
  try {
    const response = await fetch('/api/admin/database/stats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch stats: ${response.statusText} - ${errorText}`)
    }

    const data = (await response.json()) as DatabaseStats
    setStats(data)

    // Optional: Show success toast
    console.log('[AdminDatabasePage] Stats refreshed successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    setStatsError(message)
    console.error('[AdminDatabasePage] Stats refresh failed:', error)
  } finally {
    setStatsLoading(false)
  }
}
```

### Auto-Refresh Effect
```typescript
// In page.tsx useEffect
useEffect(() => {
  if (statsRefreshInterval === 'off') return

  const intervals: Record<string, number> = {
    '10s': 10000,
    '30s': 30000,
    '60s': 60000,
  }

  const timer = setInterval(() => {
    console.log('[AutoRefresh] Refreshing stats...')
    onRefreshStats()
  }, intervals[statsRefreshInterval])

  return () => {
    clearInterval(timer)
    console.log('[AutoRefresh] Cleared interval')
  }
}, [statsRefreshInterval, onRefreshStats])
```

---

## Example 2: Entity CRUD Operations

### Load Entities with Pagination/Sorting/Filtering
```typescript
async function loadEntityRecords(
  entityType: string,
  page: number,
  pageSize: number,
  filters: Record<string, string>,
  sort: { column: string; order: 'asc' | 'desc' }
) {
  setEntityLoading(true)
  setEntityError(null)

  try {
    // Build query parameters
    const params = new URLSearchParams({
      entityType,
      page: page.toString(),
      pageSize: pageSize.toString(),
      sort: `${sort.column}:${sort.order}`,
      // Add all filters
      ...filters,
    })

    console.log(`[EntityBrowser] Loading ${entityType} records:`, {
      page,
      pageSize,
      sort: `${sort.column}:${sort.order}`,
      filters,
    })

    const response = await fetch(`/api/admin/database/entities?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch entities: ${response.statusText}`)
    }

    const data = (await response.json()) as {
      records: EntityRecord[]
      total: number
    }

    console.log(`[EntityBrowser] Loaded ${data.records.length} records, total: ${data.total}`)
    setEntityRecords(data.records)
    setEntityPagination({ page, pageSize, total: data.total })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    setEntityError(message)
    console.error('[EntityBrowser] Load failed:', error)
  } finally {
    setEntityLoading(false)
  }
}
```

### Handle Sorting
```typescript
async function onEntitySort(column: string, order: 'asc' | 'desc') {
  console.log(`[EntitySort] Sorting by ${column} ${order}`)

  setEntitySort({ column, order })

  // Reset to first page when sorting changes
  await loadEntityRecords(
    selectedEntityType,
    1,  // Reset to page 1
    entityPagination.pageSize,
    entityFilters,
    { column, order }
  )
}
```

### Handle Filtering
```typescript
async function onEntityFilter(field: string, value: string) {
  console.log(`[EntityFilter] Filtering ${field} = "${value}"`)

  const updatedFilters = { ...entityFilters, [field]: value }
  setEntityFilters(updatedFilters)

  // Reset to first page when filter changes
  await loadEntityRecords(
    selectedEntityType,
    1,  // Reset to page 1
    entityPagination.pageSize,
    updatedFilters,
    entitySort
  )
}
```

### Delete with Confirmation
```typescript
async function onEntityDelete(id: string) {
  // Show confirmation dialog
  const confirmed = window.confirm(
    `Are you sure you want to delete this ${selectedEntityType} record (ID: ${id})?\n\nThis action cannot be undone.`
  )

  if (!confirmed) {
    console.log('[EntityDelete] User cancelled deletion')
    return
  }

  try {
    console.log(`[EntityDelete] Deleting ${selectedEntityType}/${id}`)

    const response = await fetch(
      `/api/admin/database/entities/${selectedEntityType}/${id}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete entity: ${response.statusText}`)
    }

    console.log('[EntityDelete] Successfully deleted, reloading records...')

    // Reload records after successful deletion
    await loadEntityRecords(
      selectedEntityType,
      entityPagination.page,
      entityPagination.pageSize,
      entityFilters,
      entitySort
    )

    // Show success notification
    // toast.success(`${selectedEntityType} record deleted`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[EntityDelete] Failed:', error)
    // Show error notification
    // toast.error(`Failed to delete: ${message}`)
  }
}
```

---

## Example 3: Export Implementation

### Export Handler
```typescript
async function onExport() {
  setExportLoading(true)
  setExportError(null)

  try {
    console.log('[Export] Starting export:', {
      format: exportFormat,
      entityTypes: exportEntityTypes,
    })

    const response = await fetch('/api/admin/database/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityTypes: exportEntityTypes,
        format: exportFormat,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Export failed: ${response.statusText} - ${errorText}`)
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition')
    let fileName = `export.${exportFormat}`

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/)
      if (match && match[1]) {
        fileName = match[1]
      }
    }

    console.log(`[Export] File name: ${fileName}`)

    // Download the blob
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()

    // Cleanup
    window.URL.revokeObjectURL(url)

    console.log('[Export] Successfully downloaded', {
      fileName,
      size: blob.size,
    })

    // Show success notification
    // toast.success(`Exported ${blob.size} bytes to ${fileName}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    setExportError(message)
    console.error('[Export] Failed:', error)
    // toast.error(`Export failed: ${message}`)
  } finally {
    setExportLoading(false)
  }
}
```

---

## Example 4: Import Implementation

### Import Handler with FormData
```typescript
async function onImport() {
  // Validate file selection
  if (!importFile) {
    setImportError('Please select a file to import')
    return
  }

  setImportLoading(true)
  setImportError(null)

  try {
    console.log('[Import] Starting import:', {
      fileName: importFile.name,
      fileSize: importFile.size,
      format: importFormat,
      mode: importMode,
      dryRun: importDryRun,
    })

    // Create FormData
    const formData = new FormData()
    formData.append('file', importFile)
    formData.append('format', importFormat)
    formData.append('mode', importMode)
    formData.append('dryRun', importDryRun.toString())

    const response = await fetch('/api/admin/database/import', {
      method: 'POST',
      body: formData,  // Don't set Content-Type header, browser will set it with boundary
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Import failed: ${response.statusText} - ${errorText}`)
    }

    const results = (await response.json()) as ImportResults

    console.log('[Import] Completed:', {
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors.length,
      dryRun: results.dryRun,
      duration: results.duration,
    })

    setImportResults(results)
    setShowImportResults(true)

    // If not dry-run and no errors, reload entities
    if (!importDryRun && results.errors.length === 0) {
      console.log('[Import] Reloading entity records...')
      await loadEntityRecords(
        selectedEntityType,
        entityPagination.page,
        entityPagination.pageSize,
        entityFilters,
        entitySort
      )
    }

    // Show notification
    if (importDryRun) {
      // toast.info(`Dry run: ${results.imported} records would be imported`)
    } else {
      // toast.success(`Imported ${results.imported} records`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    setImportError(message)
    console.error('[Import] Failed:', error)
    // toast.error(`Import failed: ${message}`)
  } finally {
    setImportLoading(false)
  }
}
```

---

## Example 5: Component Implementation

### StatsTab Component Full Example
```typescript
'use client'

import React from 'react'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/EmptyState'
import type { DatabaseStats } from '@/lib/api/admin-database-client'

interface StatsTabProps {
  stats: DatabaseStats | null
  loading: boolean
  error: string | null
  refreshInterval: 'off' | '60s' | '30s' | '10s'
  onRefresh: () => Promise<void>
  onRefreshIntervalChange: (interval: 'off' | '60s' | '30s' | '10s') => void
}

export function StatsTab({
  stats,
  loading,
  error,
  refreshInterval,
  onRefresh,
  onRefreshIntervalChange,
}: StatsTabProps) {
  const healthColor = {
    good: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  }[stats?.health ?? 'good']

  // Initial loading state
  if (loading && !stats) {
    return <LoadingIndicator />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load database statistics"
        description={error}
        action={{
          label: 'Retry',
          onClick: onRefresh,
        }}
      />
    )
  }

  // No data
  if (!stats) {
    return (
      <ErrorState
        title="No statistics available"
        description="Unable to retrieve database statistics"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`px-4 py-2 bg-blue-500 text-white rounded font-medium transition-colors ${
            loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600 active:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <span className="inline-block mr-2">⟳</span>
              Refreshing...
            </>
          ) : (
            <>
              <span className="inline-block mr-2">↻</span>
              Refresh
            </>
          )}
        </button>

        <select
          value={refreshInterval}
          onChange={(e) =>
            onRefreshIntervalChange(
              e.target.value as 'off' | '60s' | '30s' | '10s'
            )
          }
          className="px-4 py-2 border border-gray-300 rounded font-medium bg-white text-gray-700 hover:border-gray-400"
        >
          <option value="off">Auto-refresh: Off</option>
          <option value="60s">Auto-refresh: Every 60s</option>
          <option value="30s">Auto-refresh: Every 30s</option>
          <option value="10s">Auto-refresh: Every 10s</option>
        </select>

        {refreshInterval !== 'off' && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
            🔄 Auto-refreshing
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Table Count */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Tables</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.tableCount}
              </p>
            </div>
            <div className="text-4xl text-blue-300">📊</div>
          </div>
        </div>

        {/* Total Records */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Records</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalRecords.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl text-green-300">📈</div>
          </div>
        </div>

        {/* Storage Size */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Storage Size</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(stats.storageSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="text-4xl text-purple-300">💾</div>
          </div>
        </div>

        {/* Last Vacuum */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 font-medium">Last Vacuum</p>
          <p className="text-lg font-bold text-gray-900 mt-2 font-mono">
            {stats.lastVacuum
              ? new Date(stats.lastVacuum).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Never'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.lastVacuum
              ? new Date(stats.lastVacuum).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </p>
        </div>

        {/* Active Connections */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 font-medium">Active Connections</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.activeConnections}
          </p>
        </div>

        {/* Health Status */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 font-medium mb-2">Health</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${healthColor}`}
          >
            {stats.health.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Health Alert */}
      {stats.health !== 'good' && (
        <div className={`p-4 rounded-lg border-l-4 ${healthColor}`}>
          <p className="font-semibold text-sm mb-2">⚠️ Health Alert</p>
          <p className="text-sm mb-3">{stats.healthDetails.reason}</p>
          <div className="bg-white bg-opacity-50 p-3 rounded text-sm">
            <p className="font-semibold mb-1">💡 Recommended Action:</p>
            <p>{stats.healthDetails.recommendation}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
        </p>
        {loading && <span className="text-xs text-gray-400">Updating...</span>}
      </div>
    </div>
  )
}
```

---

## Example 6: Hook Implementation

### useDatabaseStats Hook
```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchDatabaseStats } from '@/lib/api/admin-database-client'
import type { DatabaseStats } from '@/lib/api/admin-database-client'

export interface UseDatabaseStatsResult {
  stats: DatabaseStats | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for managing database statistics
 * Handles fetching, error handling, and automatic refresh
 */
export function useDatabaseStats(autoRefresh: boolean = false): UseDatabaseStatsResult {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized refresh function
  const refresh = useCallback(async () => {
    console.log('[useDatabaseStats] Refreshing statistics...')
    setLoading(true)
    setError(null)

    try {
      const data = await fetchDatabaseStats()
      setStats(data)
      console.log('[useDatabaseStats] Statistics refreshed successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('[useDatabaseStats] Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    console.log('[useDatabaseStats] Mounted, performing initial fetch')
    refresh()
  }, [refresh])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) {
      console.log('[useDatabaseStats] Auto-refresh disabled')
      return
    }

    console.log('[useDatabaseStats] Auto-refresh enabled, setting interval to 60s')
    const timer = setInterval(() => {
      console.log('[useDatabaseStats] Auto-refresh triggered')
      refresh()
    }, 60000)

    return () => {
      console.log('[useDatabaseStats] Clearing auto-refresh interval')
      clearInterval(timer)
    }
  }, [autoRefresh, refresh])

  return { stats, loading, error, refresh }
}
```

---

## Example 7: API Client Implementation

### Type-Safe API Client
```typescript
/**
 * Type-safe API client for admin database endpoints
 * All functions include proper error handling and logging
 */

export interface DatabaseStats {
  tableCount: number
  totalRecords: number
  storageSize: number
  lastVacuum: string | null
  activeConnections: number
  health: 'good' | 'warning' | 'critical'
  healthDetails: { reason: string; recommendation: string }
  timestamp: string
}

export interface EntityRecord {
  id: string
  [key: string]: unknown
}

export interface ImportResults {
  imported: number
  skipped: number
  errors: Array<{ row: number; error: string }>
  warnings: string[]
  dryRun: boolean
  duration: number
}

/**
 * Fetch database statistics
 * @throws Error if the request fails
 */
export async function fetchDatabaseStats(): Promise<DatabaseStats> {
  console.log('[API] GET /api/admin/database/stats')

  const response = await fetch('/api/admin/database/stats', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${text}`
    )
  }

  const data = (await response.json()) as DatabaseStats
  console.log('[API] Response received:', data)
  return data
}

/**
 * Fetch entity records with pagination, sorting, and filtering
 * @throws Error if the request fails
 */
export async function fetchEntityRecords(
  entityType: string,
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, string> = {},
  sort: { column: string; order: 'asc' | 'desc' } = { column: 'id', order: 'asc' }
): Promise<{ records: EntityRecord[]; total: number }> {
  const params = new URLSearchParams({
    entityType,
    page: page.toString(),
    pageSize: pageSize.toString(),
    sort: `${sort.column}:${sort.order}`,
    ...filters,
  })

  console.log(`[API] GET /api/admin/database/entities?${params}`)

  const response = await fetch(`/api/admin/database/entities?${params}`)

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${text}`
    )
  }

  const data = (await response.json()) as { records: EntityRecord[]; total: number }
  console.log('[API] Response received:', {
    recordsCount: data.records.length,
    total: data.total,
  })
  return data
}

/**
 * Update entity record
 * @throws Error if the request fails
 */
export async function updateEntity(
  entityType: string,
  id: string,
  updates: Record<string, unknown>
): Promise<EntityRecord> {
  console.log(`[API] PATCH /api/admin/database/entities/${entityType}/${id}`, updates)

  const response = await fetch(
    `/api/admin/database/entities/${entityType}/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${text}`
    )
  }

  const data = (await response.json()) as EntityRecord
  console.log('[API] Entity updated successfully:', data)
  return data
}

/**
 * Delete entity record
 * @throws Error if the request fails
 */
export async function deleteEntity(
  entityType: string,
  id: string
): Promise<void> {
  console.log(`[API] DELETE /api/admin/database/entities/${entityType}/${id}`)

  const response = await fetch(
    `/api/admin/database/entities/${entityType}/${id}`,
    { method: 'DELETE' }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${text}`
    )
  }

  console.log('[API] Entity deleted successfully')
}

/**
 * Export database data
 * @throws Error if the request fails
 */
export async function exportDatabase(options: {
  entityTypes: string[]
  format: 'json' | 'yaml' | 'sql'
}): Promise<Blob> {
  console.log('[API] POST /api/admin/database/export', options)

  const response = await fetch('/api/admin/database/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${text}`
    )
  }

  const blob = await response.blob()
  console.log('[API] Export successful, blob size:', blob.size)
  return blob
}

/**
 * Import database data
 * @throws Error if the request fails
 */
export async function importDatabase(
  file: File,
  options: {
    format: 'json' | 'yaml' | 'sql' | 'auto'
    mode: 'append' | 'upsert' | 'replace'
    dryRun: boolean
  }
): Promise<ImportResults> {
  console.log('[API] POST /api/admin/database/import', {
    fileName: file.name,
    fileSize: file.size,
    ...options,
  })

  const formData = new FormData()
  formData.append('file', file)
  formData.append('format', options.format)
  formData.append('mode', options.mode)
  formData.append('dryRun', options.dryRun.toString())

  const response = await fetch('/api/admin/database/import', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${text}`
    )
  }

  const data = (await response.json()) as ImportResults
  console.log('[API] Import completed:', {
    imported: data.imported,
    skipped: data.skipped,
    errors: data.errors.length,
  })
  return data
}
```

---

## Example 8: Error Handling Patterns

### Try-Catch Pattern
```typescript
try {
  // Operation that might fail
  const data = await fetchDatabaseStats()
  setStats(data)
} catch (error) {
  // Type-safe error handling
  const message = error instanceof Error ? error.message : 'Unknown error'
  setError(message)
  console.error('[Component] Error:', error)
} finally {
  // Cleanup
  setLoading(false)
}
```

### Async/Await with Type Guard
```typescript
async function handleAsyncOperation() {
  try {
    const response = await fetch('/api/endpoint')

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = (await response.json()) as ExpectedType
    return data
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error)
    } else if (error instanceof SyntaxError) {
      console.error('JSON parse error:', error)
    } else if (error instanceof Error) {
      console.error('Application error:', error.message)
    } else {
      console.error('Unknown error:', error)
    }
    throw error
  }
}
```

### Chained Promises with Error Recovery
```typescript
loadEntityRecords(type, 1, 25, {}, { column: 'id', order: 'asc' })
  .then(() => {
    console.log('Records loaded successfully')
    // Show success notification
  })
  .catch((error) => {
    console.error('Failed to load records:', error)
    // Show error notification
    // Optionally provide retry option
  })
```

---

## Example 9: State Updates Best Practices

### Batch Updates
```typescript
// ❌ Bad: Multiple setState calls trigger re-renders
setEntityRecords(data.records)
setEntityPagination({ page, pageSize, total })
setEntityLoading(false)

// ✅ Good: Combine related state
const [entityState, setEntityState] = useState({
  records: [],
  pagination: { page: 1, pageSize: 25, total: 0 },
  loading: false,
})

setEntityState({
  records: data.records,
  pagination: { page, pageSize, total },
  loading: false,
})
```

### Conditional Updates
```typescript
// Only update if the current entityType matches
if (currentEntityType === entityType) {
  setEntityRecords(data.records)
}
```

### Preserving Previous State
```typescript
// Preserve existing filters when adding a new one
const updatedFilters = { ...entityFilters, [field]: value }
setEntityFilters(updatedFilters)

// Preserve pagination state when sorting
const newSort = { column, order }
// Reset to page 1 but keep other pagination values
await loadRecords(..., 1, pagination.pageSize, ...)
```

---

## Example 10: Loading State Patterns

### Skeleton Loader
```typescript
{loading && !data ? (
  <LoadingSkeleton
    lines={5}
    className="space-y-4"
  />
) : null}
```

### Disabled State
```typescript
<button
  onClick={onRefresh}
  disabled={loading}
  className={loading ? 'opacity-50 cursor-not-allowed' : '...'}
>
  {loading ? 'Loading...' : 'Refresh'}
</button>
```

### Conditional Rendering
```typescript
{loading && !stats ? (
  <LoadingIndicator />
) : error ? (
  <ErrorState error={error} onRetry={refresh} />
) : stats ? (
  <StatsDisplay stats={stats} />
) : null}
```

---

These examples demonstrate production-ready patterns for the `/admin/database` page implementation.

