# /admin/database Page Implementation Specification

## Overview

Complete specification for the `/admin/database` page integrating three database management components (database_stats, entity_browser, database_export_import) with comprehensive tab-based interface, state management, and API integration.

**Permission Level**: Requires supergod level 5+ (highest permission)

**Architecture**: React Server Component (page route) → Client Components (tabs) → JSON Components (rendered from database_manager package)

---

## 1. File Structure

```
/frontends/nextjs/src/
├── app/
│   └── admin/
│       └── database/
│           └── page.tsx                    [Main page route - Server Component]
│
├── hooks/
│   ├── admin/
│   │   └── database/
│   │       ├── useDatabaseStats.ts         [Stats fetching + auto-refresh]
│   │       ├── useEntityBrowser.ts         [Entity browser state management]
│   │       ├── useDatabaseExport.ts        [Export functionality]
│   │       └── useDatabaseImport.ts        [Import functionality]
│
├── lib/
│   ├── admin/
│   │   └── database/
│   │       ├── database-page-handlers.ts   [All handler implementations]
│   │       ├── entity-detail-modal.ts      [Entity detail/edit modal logic]
│   │       └── import-results-display.ts   [Import results formatting]
│   └── api/
│       └── admin-database-client.ts        [Type-safe API client]
│
└── components/
    └── admin/
        └── database/
            ├── DatabaseTabs.tsx            [Tab container + layout]
            ├── StatsTab.tsx                [Stats tab wrapper]
            ├── EntitiesTab.tsx             [Entities tab wrapper]
            ├── ExportImportTab.tsx         [Export/Import tab wrapper]
            ├── EntityDetail.tsx            [Entity detail/edit modal]
            └── ImportResults.tsx           [Import results display]
```

---

## 2. Data Structures & Types

### 2.1 Tab State

```typescript
// /frontends/nextjs/src/app/admin/database/page.tsx

interface DatabasePageState {
  // Tab management
  activeTab: 'stats' | 'entities' | 'export'

  // Stats tab
  stats: DatabaseStats | null
  statsLoading: boolean
  statsError: string | null
  statsRefreshInterval: 'off' | '60s' | '30s' | '10s'

  // Entities tab
  selectedEntityType: string
  entityRecords: EntityRecord[]
  entityLoading: boolean
  entityError: string | null
  entityPagination: {
    page: number
    pageSize: number
    total: number
  }
  entitySort: {
    column: string
    order: 'asc' | 'desc'
  }
  entityFilters: Record<string, string>

  // Export/Import tab
  exportFormat: 'json' | 'yaml' | 'sql'
  exportEntityTypes: string[]
  exportLoading: boolean
  exportError: string | null

  importFile: File | null
  importFormat: 'json' | 'yaml' | 'sql' | 'auto'
  importMode: 'append' | 'upsert' | 'replace'
  importDryRun: boolean
  importLoading: boolean
  importError: string | null
  importResults: ImportResults | null

  // Modals
  selectedEntity: EntityRecord | null
  showEntityDetail: boolean
  showImportResults: boolean
}
```

### 2.2 API Response Types

```typescript
// /frontends/nextjs/src/lib/api/admin-database-client.ts

interface DatabaseStats {
  tableCount: number
  totalRecords: number
  storageSize: number
  lastVacuum: string | null
  activeConnections: number
  health: 'good' | 'warning' | 'critical'
  healthDetails: {
    reason: string
    recommendation: string
  }
  timestamp: string
}

interface EntityRecord {
  id: string
  [key: string]: unknown
}

interface ImportResults {
  imported: number
  skipped: number
  errors: {
    row: number
    error: string
  }[]
  warnings: string[]
  dryRun: boolean
  duration: number
}

interface ExportResult {
  fileName: string
  size: number
  format: 'json' | 'yaml' | 'sql'
  entityCount: number
  recordCount: number
}
```

---

## 3. Component Implementation

### 3.1 Main Page Route

**File**: `/frontends/nextjs/src/app/admin/database/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { AccessDenied } from '@/components/AccessDenied'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { StatsTab } from '@/components/admin/database/StatsTab'
import { EntitiesTab } from '@/components/admin/database/EntitiesTab'
import { ExportImportTab } from '@/components/admin/database/ExportImportTab'
import { DatabaseTabs } from '@/components/admin/database/DatabaseTabs'
import type { DatabasePageState } from '@/lib/admin/database/database-page-types'

// Disable static generation - requires dynamic database access
export const dynamic = 'force-dynamic'

interface AdminDatabasePageProps {}

export default function AdminDatabasePage({}: AdminDatabasePageProps) {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  const [user, setUser] = useState<{ id: string; level: number } | null>(null)
  const [loading, setLoading] = useState(true)

  // Tab state
  const [activeTab, setActiveTab] = useState<'stats' | 'entities' | 'export'>('stats')

  // Stats tab state
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [statsRefreshInterval, setStatsRefreshInterval] = useState<'off' | '60s' | '30s' | '10s'>('off')

  // Entities tab state
  const [selectedEntityType, setSelectedEntityType] = useState<string>('User')
  const [entityRecords, setEntityRecords] = useState<EntityRecord[]>([])
  const [entityLoading, setEntityLoading] = useState(false)
  const [entityError, setEntityError] = useState<string | null>(null)
  const [entityPagination, setEntityPagination] = useState({ page: 1, pageSize: 25, total: 0 })
  const [entitySort, setEntitySort] = useState({ column: 'id', order: 'asc' as const })
  const [entityFilters, setEntityFilters] = useState<Record<string, string>>({})

  // Export/Import tab state
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml' | 'sql'>('json')
  const [exportEntityTypes, setExportEntityTypes] = useState<string[]>(['all'])
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const [importFile, setImportFile] = useState<File | null>(null)
  const [importFormat, setImportFormat] = useState<'json' | 'yaml' | 'sql' | 'auto'>('auto')
  const [importMode, setImportMode] = useState<'append' | 'upsert' | 'replace'>('upsert')
  const [importDryRun, setImportDryRun] = useState(true)
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResults, setImportResults] = useState<ImportResults | null>(null)

  // Modal state
  const [selectedEntity, setSelectedEntity] = useState<EntityRecord | null>(null)
  const [showEntityDetail, setShowEntityDetail] = useState(false)
  const [showImportResults, setShowImportResults] = useState(false)

  // =========================================================================
  // INITIALIZATION & PERMISSIONS
  // =========================================================================

  useEffect(() => {
    async function checkPermissions() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.level < 5) {
          // Unauthorized - require supergod level 5
          setUser(null)
        } else {
          setUser(currentUser)
          // Load initial stats
          await onRefreshStats()
        }
      } catch (error) {
        console.error('[AdminDatabasePage] Permission check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkPermissions()
  }, [])

  // Auto-refresh stats based on interval
  useEffect(() => {
    if (statsRefreshInterval === 'off') return

    const intervals: Record<string, number> = {
      '10s': 10000,
      '30s': 30000,
      '60s': 60000,
    }

    const timer = setInterval(() => {
      onRefreshStats()
    }, intervals[statsRefreshInterval])

    return () => clearInterval(timer)
  }, [statsRefreshInterval])

  // =========================================================================
  // HANDLER FUNCTIONS
  // =========================================================================

  /**
   * Refresh database statistics
   */
  async function onRefreshStats() {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const response = await fetch('/api/admin/database/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`)
      }

      const data = (await response.json()) as DatabaseStats
      setStats(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setStatsError(message)
      console.error('[AdminDatabasePage] Stats refresh failed:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  /**
   * Load entities of selected type
   */
  async function onEntityTypeChange(type: string) {
    setSelectedEntityType(type)
    setEntityPagination({ page: 1, pageSize: 25, total: 0 })
    setEntityFilters({})
    setEntitySort({ column: 'id', order: 'asc' })
    await loadEntityRecords(type, 1, 25, {}, { column: 'id', order: 'asc' })
  }

  /**
   * Load entity records with pagination, sorting, filtering
   */
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
      const params = new URLSearchParams({
        entityType,
        page: page.toString(),
        pageSize: pageSize.toString(),
        sort: `${sort.column}:${sort.order}`,
        ...filters,
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
      setEntityRecords(data.records)
      setEntityPagination({ page, pageSize, total: data.total })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setEntityError(message)
      console.error('[AdminDatabasePage] Entity load failed:', error)
    } finally {
      setEntityLoading(false)
    }
  }

  /**
   * Handle entity sorting
   */
  async function onEntitySort(column: string, order: 'asc' | 'desc') {
    setEntitySort({ column, order })
    await loadEntityRecords(
      selectedEntityType,
      1,
      entityPagination.pageSize,
      entityFilters,
      { column, order }
    )
  }

  /**
   * Handle entity filtering
   */
  async function onEntityFilter(field: string, value: string) {
    const updatedFilters = { ...entityFilters, [field]: value }
    setEntityFilters(updatedFilters)
    await loadEntityRecords(
      selectedEntityType,
      1,
      entityPagination.pageSize,
      updatedFilters,
      entitySort
    )
  }

  /**
   * Handle entity pagination
   */
  async function onEntityPageChange(page: number) {
    await loadEntityRecords(
      selectedEntityType,
      page,
      entityPagination.pageSize,
      entityFilters,
      entitySort
    )
  }

  /**
   * View entity details
   */
  function onEntityView(entity: EntityRecord) {
    setSelectedEntity(entity)
    setShowEntityDetail(true)
  }

  /**
   * Edit entity (in modal)
   */
  async function onEntityEdit(id: string, updates: Record<string, unknown>) {
    try {
      const response = await fetch(
        `/api/admin/database/entities/${selectedEntityType}/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to update entity: ${response.statusText}`)
      }

      // Reload records
      await loadEntityRecords(
        selectedEntityType,
        entityPagination.page,
        entityPagination.pageSize,
        entityFilters,
        entitySort
      )
      setShowEntityDetail(false)
      // Show success toast (implement via toast provider)
    } catch (error) {
      console.error('[AdminDatabasePage] Entity edit failed:', error)
      // Show error toast
    }
  }

  /**
   * Delete entity with confirmation
   */
  async function onEntityDelete(id: string) {
    if (!window.confirm(`Delete ${selectedEntityType} record ${id}? This cannot be undone.`)) {
      return
    }

    try {
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

      // Reload records
      await loadEntityRecords(
        selectedEntityType,
        entityPagination.page,
        entityPagination.pageSize,
        entityFilters,
        entitySort
      )
      // Show success toast
    } catch (error) {
      console.error('[AdminDatabasePage] Entity delete failed:', error)
      // Show error toast
    }
  }

  /**
   * Export database data
   */
  async function onExport() {
    setExportLoading(true)
    setExportError(null)
    try {
      const response = await fetch('/api/admin/database/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityTypes: exportEntityTypes,
          format: exportFormat,
        }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || `export.${exportFormat}`
        : `export.${exportFormat}`

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)

      // Show success toast
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setExportError(message)
      console.error('[AdminDatabasePage] Export failed:', error)
    } finally {
      setExportLoading(false)
    }
  }

  /**
   * Import database data
   */
  async function onImport() {
    if (!importFile) {
      setImportError('Please select a file')
      return
    }

    setImportLoading(true)
    setImportError(null)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      formData.append('format', importFormat)
      formData.append('mode', importMode)
      formData.append('dryRun', importDryRun.toString())

      const response = await fetch('/api/admin/database/import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`)
      }

      const results = (await response.json()) as ImportResults
      setImportResults(results)
      setShowImportResults(true)

      // If not dry-run and successful, reload entities
      if (!importDryRun && results.errors.length === 0) {
        await loadEntityRecords(
          selectedEntityType,
          entityPagination.page,
          entityPagination.pageSize,
          entityFilters,
          entitySort
        )
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setImportError(message)
      console.error('[AdminDatabasePage] Import failed:', error)
    } finally {
      setImportLoading(false)
    }
  }

  // =========================================================================
  // PERMISSION CHECK
  // =========================================================================

  if (loading) {
    return <LoadingIndicator />
  }

  if (!user || user.level < 5) {
    return <AccessDenied requiredLevel={5} userLevel={user?.level ?? 0} />
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Database Manager</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage database statistics, entities, and perform imports/exports
        </p>
      </div>

      <DatabaseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: 'stats',
            label: 'Statistics',
            content: (
              <StatsTab
                stats={stats}
                loading={statsLoading}
                error={statsError}
                refreshInterval={statsRefreshInterval}
                onRefresh={onRefreshStats}
                onRefreshIntervalChange={setStatsRefreshInterval}
              />
            ),
          },
          {
            id: 'entities',
            label: 'Entities',
            content: (
              <EntitiesTab
                selectedEntityType={selectedEntityType}
                records={entityRecords}
                loading={entityLoading}
                error={entityError}
                pagination={entityPagination}
                sort={entitySort}
                filters={entityFilters}
                onEntityTypeChange={onEntityTypeChange}
                onSort={onEntitySort}
                onFilter={onEntityFilter}
                onPageChange={onEntityPageChange}
                onView={onEntityView}
                onDelete={onEntityDelete}
              />
            ),
          },
          {
            id: 'export',
            label: 'Export/Import',
            content: (
              <ExportImportTab
                // Export props
                exportFormat={exportFormat}
                exportEntityTypes={exportEntityTypes}
                exportLoading={exportLoading}
                exportError={exportError}
                onExportFormatChange={setExportFormat}
                onExportEntityTypesChange={setExportEntityTypes}
                onExport={onExport}
                // Import props
                importFile={importFile}
                importFormat={importFormat}
                importMode={importMode}
                importDryRun={importDryRun}
                importLoading={importLoading}
                importError={importError}
                onImportFileChange={setImportFile}
                onImportFormatChange={setImportFormat}
                onImportModeChange={setImportMode}
                onImportDryRunChange={setImportDryRun}
                onImport={onImport}
              />
            ),
          },
        ]}
      />

      {/* Entity Detail Modal */}
      {showEntityDetail && selectedEntity && (
        <EntityDetail
          entity={selectedEntity}
          entityType={selectedEntityType}
          onSave={onEntityEdit}
          onClose={() => setShowEntityDetail(false)}
        />
      )}

      {/* Import Results Modal */}
      {showImportResults && importResults && (
        <ImportResults
          results={importResults}
          onClose={() => setShowImportResults(false)}
        />
      )}
    </div>
  )
}
```

### 3.2 Tab Components

**File**: `/frontends/nextjs/src/components/admin/database/DatabaseTabs.tsx`

```typescript
'use client'

import React from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface DatabaseTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: Tab[]
}

export function DatabaseTabs({ activeTab, onTabChange, tabs }: DatabaseTabsProps) {
  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex space-x-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}
```

**File**: `/frontends/nextjs/src/components/admin/database/StatsTab.tsx`

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
  if (loading && !stats) {
    return <LoadingIndicator />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load statistics"
        description={error}
        action={{ label: 'Retry', onClick: onRefresh }}
      />
    )
  }

  if (!stats) {
    return <ErrorState title="No statistics available" />
  }

  const healthColor = {
    good: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  }[stats.health]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>

        <select
          value={refreshInterval}
          onChange={(e) =>
            onRefreshIntervalChange(
              e.target.value as 'off' | '60s' | '30s' | '10s'
            )
          }
          className="px-4 py-2 border rounded"
        >
          <option value="off">Auto-refresh: Off</option>
          <option value="60s">Auto-refresh: 60s</option>
          <option value="30s">Auto-refresh: 30s</option>
          <option value="10s">Auto-refresh: 10s</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Table Count */}
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600">Tables</p>
          <p className="text-2xl font-bold">{stats.tableCount}</p>
        </div>

        {/* Total Records */}
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</p>
        </div>

        {/* Storage Size */}
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600">Storage Size</p>
          <p className="text-2xl font-bold">
            {(stats.storageSize / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>

        {/* Last Vacuum */}
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600">Last Vacuum</p>
          <p className="text-sm font-mono">
            {stats.lastVacuum
              ? new Date(stats.lastVacuum).toLocaleDateString()
              : 'Never'}
          </p>
        </div>

        {/* Active Connections */}
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600">Active Connections</p>
          <p className="text-2xl font-bold">{stats.activeConnections}</p>
        </div>

        {/* Health Status */}
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600">Health</p>
          <p className={`px-2 py-1 rounded text-sm font-bold inline-block ${healthColor}`}>
            {stats.health.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Health Details */}
      <div className={`p-4 rounded-lg ${healthColor}`}>
        <p className="font-semibold mb-2">Health Details</p>
        <p className="text-sm mb-3">{stats.healthDetails.reason}</p>
        <p className="text-sm font-semibold">Recommendation:</p>
        <p className="text-sm">{stats.healthDetails.recommendation}</p>
      </div>

      {/* Last Updated */}
      <p className="text-xs text-gray-500 text-right">
        Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
      </p>
    </div>
  )
}
```

**File**: `/frontends/nextjs/src/components/admin/database/EntitiesTab.tsx`

```typescript
'use client'

import React from 'react'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/EmptyState'
import type { EntityRecord } from '@/lib/api/admin-database-client'

interface EntitiesTabProps {
  selectedEntityType: string
  records: EntityRecord[]
  loading: boolean
  error: string | null
  pagination: { page: number; pageSize: number; total: number }
  sort: { column: string; order: 'asc' | 'desc' }
  filters: Record<string, string>
  onEntityTypeChange: (type: string) => Promise<void>
  onSort: (column: string, order: 'asc' | 'desc') => Promise<void>
  onFilter: (field: string, value: string) => Promise<void>
  onPageChange: (page: number) => Promise<void>
  onView: (entity: EntityRecord) => void
  onDelete: (id: string) => Promise<void>
}

export function EntitiesTab({
  selectedEntityType,
  records,
  loading,
  error,
  pagination,
  sort,
  filters,
  onEntityTypeChange,
  onSort,
  onFilter,
  onPageChange,
  onView,
  onDelete,
}: EntitiesTabProps) {
  const entityTypes = ['User', 'Credential', 'PageConfig', 'Session', 'Workflow', 'Component']

  if (loading && records.length === 0) {
    return <LoadingIndicator />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load entities"
        description={error}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Entity Type Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Entity Type</label>
        <select
          value={selectedEntityType}
          onChange={(e) => onEntityTypeChange(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          {entityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {records.length > 0 &&
                Object.keys(records[0] || {})
                  .slice(0, 5)
                  .map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() =>
                        onSort(
                          column,
                          sort.column === column && sort.order === 'asc'
                            ? 'desc'
                            : 'asc'
                        )
                      }
                    >
                      {column}
                      {sort.column === column && (
                        <span className="ml-2">
                          {sort.order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                  ))}
              <th className="px-4 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {Object.values(record)
                  .slice(0, 5)
                  .map((value, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3 text-sm">
                      {typeof value === 'object'
                        ? JSON.stringify(value).slice(0, 50)
                        : String(value).slice(0, 50)}
                    </td>
                  ))}
                <td className="px-4 py-3 text-sm space-x-2">
                  <button
                    onClick={() => onView(record)}
                    className="text-blue-500 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onDelete(record.id as string)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {records.length} of {pagination.total} records
        </p>
        <div className="space-x-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pagination.page} of{' '}
            {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={
              pagination.page >=
              Math.ceil(pagination.total / pagination.pageSize)
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
```

**File**: `/frontends/nextjs/src/components/admin/database/ExportImportTab.tsx`

```typescript
'use client'

import React from 'react'
import { ErrorState } from '@/components/EmptyState'

interface ExportImportTabProps {
  // Export props
  exportFormat: 'json' | 'yaml' | 'sql'
  exportEntityTypes: string[]
  exportLoading: boolean
  exportError: string | null
  onExportFormatChange: (format: 'json' | 'yaml' | 'sql') => void
  onExportEntityTypesChange: (types: string[]) => void
  onExport: () => Promise<void>
  // Import props
  importFile: File | null
  importFormat: 'json' | 'yaml' | 'sql' | 'auto'
  importMode: 'append' | 'upsert' | 'replace'
  importDryRun: boolean
  importLoading: boolean
  importError: string | null
  onImportFileChange: (file: File | null) => void
  onImportFormatChange: (format: 'json' | 'yaml' | 'sql' | 'auto') => void
  onImportModeChange: (mode: 'append' | 'upsert' | 'replace') => void
  onImportDryRunChange: (dryRun: boolean) => void
  onImport: () => Promise<void>
}

export function ExportImportTab({
  // Export props
  exportFormat,
  exportEntityTypes,
  exportLoading,
  exportError,
  onExportFormatChange,
  onExportEntityTypesChange,
  onExport,
  // Import props
  importFile,
  importFormat,
  importMode,
  importDryRun,
  importLoading,
  importError,
  onImportFileChange,
  onImportFormatChange,
  onImportModeChange,
  onImportDryRunChange,
  onImport,
}: ExportImportTabProps) {
  const entityOptions = ['all', 'User', 'Credential', 'PageConfig', 'Session', 'Workflow']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Export Section */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-bold">Export Data</h3>

        {exportError && (
          <ErrorState
            title="Export Error"
            description={exportError}
          />
        )}

        {/* Entity Type Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Entity Types
          </label>
          <select
            multiple
            value={exportEntityTypes}
            onChange={(e) =>
              onExportEntityTypesChange(
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            className="w-full px-4 py-2 border rounded"
          >
            {entityOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select multiple types or just "all"
          </p>
        </div>

        {/* Format Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <div className="space-y-2">
            {(['json', 'yaml', 'sql'] as const).map((format) => (
              <label key={format} className="flex items-center">
                <input
                  type="radio"
                  name="export-format"
                  value={format}
                  checked={exportFormat === format}
                  onChange={(e) =>
                    onExportFormatChange(e.target.value as typeof format)
                  }
                  className="mr-2"
                />
                {format.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={exportLoading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {exportLoading ? 'Exporting...' : 'Export'}
        </button>
      </div>

      {/* Import Section */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-bold">Import Data</h3>

        {importError && (
          <ErrorState
            title="Import Error"
            description={importError}
          />
        )}

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">File</label>
          <input
            type="file"
            onChange={(e) => onImportFileChange(e.target.files?.[0] || null)}
            accept=".json,.yaml,.yml,.sql"
            className="w-full px-4 py-2 border rounded"
          />
          {importFile && (
            <p className="text-sm text-gray-600 mt-1">{importFile.name}</p>
          )}
        </div>

        {/* Format Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <select
            value={importFormat}
            onChange={(e) =>
              onImportFormatChange(e.target.value as typeof importFormat)
            }
            className="w-full px-4 py-2 border rounded"
          >
            <option value="auto">Auto-detect</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        {/* Import Mode */}
        <div>
          <label className="block text-sm font-medium mb-2">Mode</label>
          <div className="space-y-2">
            {(['append', 'upsert', 'replace'] as const).map((mode) => (
              <label key={mode} className="flex items-center">
                <input
                  type="radio"
                  name="import-mode"
                  value={mode}
                  checked={importMode === mode}
                  onChange={(e) =>
                    onImportModeChange(e.target.value as typeof mode)
                  }
                  className="mr-2"
                />
                <span>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  <span className="text-xs text-gray-500 ml-2">
                    {mode === 'append' && '(Add all new records)'}
                    {mode === 'upsert' && '(Update or insert)'}
                    {mode === 'replace' && '(Replace all data)'}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Dry Run Checkbox */}
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={importDryRun}
            onChange={(e) => onImportDryRunChange(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Dry run (preview without modifying)</span>
        </label>

        {/* Import Button */}
        <button
          onClick={onImport}
          disabled={importLoading || !importFile}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {importLoading ? 'Importing...' : 'Import'}
        </button>
      </div>
    </div>
  )
}
```

### 3.3 Modal Components

**File**: `/frontends/nextjs/src/components/admin/database/EntityDetail.tsx`

```typescript
'use client'

import React, { useState } from 'react'
import type { EntityRecord } from '@/lib/api/admin-database-client'

interface EntityDetailProps {
  entity: EntityRecord
  entityType: string
  onSave: (id: string, updates: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

export function EntityDetail({
  entity,
  entityType,
  onSave,
  onClose,
}: EntityDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [updates, setUpdates] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(entity.id as string, updates)
      setIsEditing(false)
      setUpdates({})
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {entityType} Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Entity Details */}
        <div className="space-y-4">
          {Object.entries(entity).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key}
              </label>
              {isEditing && key !== 'id' ? (
                <input
                  type="text"
                  value={
                    (updates[key] ?? value) as string
                  }
                  onChange={(e) =>
                    setUpdates({
                      ...updates,
                      [key]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded bg-white"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded text-sm font-mono">
                  {typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Close
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setUpdates({})
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

**File**: `/frontends/nextjs/src/components/admin/database/ImportResults.tsx`

```typescript
'use client'

import React from 'react'
import type { ImportResults } from '@/lib/api/admin-database-client'

interface ImportResultsProps {
  results: ImportResults
  onClose: () => void
}

export function ImportResults({ results, onClose }: ImportResultsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Import {results.dryRun ? '(Dry Run) ' : ''}Results
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">Imported</p>
            <p className="text-2xl font-bold text-green-700">
              {results.imported}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600">Skipped</p>
            <p className="text-2xl font-bold text-yellow-700">
              {results.skipped}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600">Errors</p>
            <p className="text-2xl font-bold text-red-700">
              {results.errors.length}
            </p>
          </div>
        </div>

        {/* Errors */}
        {results.errors.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Errors</h3>
            <div className="bg-red-50 rounded-lg p-4 text-sm space-y-2 max-h-40 overflow-y-auto">
              {results.errors.map((err, idx) => (
                <div key={idx} className="text-red-700">
                  <strong>Row {err.row}:</strong> {err.error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {results.warnings.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Warnings</h3>
            <div className="bg-yellow-50 rounded-lg p-4 text-sm space-y-1 max-h-40 overflow-y-auto">
              {results.warnings.map((warn, idx) => (
                <div key={idx} className="text-yellow-700">
                  {warn}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duration */}
        <p className="text-xs text-gray-500 mb-4">
          Completed in {(results.duration / 1000).toFixed(2)}s
        </p>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 4. API Client

**File**: `/frontends/nextjs/src/lib/api/admin-database-client.ts`

```typescript
/**
 * Type-safe API client for admin database endpoints
 * Handles all communication with /api/admin/database/* endpoints
 */

export interface DatabaseStats {
  tableCount: number
  totalRecords: number
  storageSize: number
  lastVacuum: string | null
  activeConnections: number
  health: 'good' | 'warning' | 'critical'
  healthDetails: {
    reason: string
    recommendation: string
  }
  timestamp: string
}

export interface EntityRecord {
  id: string
  [key: string]: unknown
}

export interface ImportResults {
  imported: number
  skipped: number
  errors: {
    row: number
    error: string
  }[]
  warnings: string[]
  dryRun: boolean
  duration: number
}

export interface ExportOptions {
  entityTypes: string[]
  format: 'json' | 'yaml' | 'sql'
}

export interface ImportOptions {
  format: 'json' | 'yaml' | 'sql' | 'auto'
  mode: 'append' | 'upsert' | 'replace'
  dryRun: boolean
}

/**
 * Fetch database statistics
 */
export async function fetchDatabaseStats(): Promise<DatabaseStats> {
  const response = await fetch('/api/admin/database/stats')
  if (!response.ok) {
    throw new Error(`Failed to fetch database stats: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Fetch entity records
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

  const response = await fetch(`/api/admin/database/entities?${params}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch entities: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Update entity record
 */
export async function updateEntity(
  entityType: string,
  id: string,
  updates: Record<string, unknown>
): Promise<EntityRecord> {
  const response = await fetch(
    `/api/admin/database/entities/${entityType}/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }
  )
  if (!response.ok) {
    throw new Error(`Failed to update entity: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Delete entity record
 */
export async function deleteEntity(
  entityType: string,
  id: string
): Promise<void> {
  const response = await fetch(
    `/api/admin/database/entities/${entityType}/${id}`,
    {
      method: 'DELETE',
    }
  )
  if (!response.ok) {
    throw new Error(`Failed to delete entity: ${response.statusText}`)
  }
}

/**
 * Export database data
 */
export async function exportDatabase(options: ExportOptions): Promise<Blob> {
  const response = await fetch('/api/admin/database/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })
  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`)
  }
  return response.blob()
}

/**
 * Import database data
 */
export async function importDatabase(
  file: File,
  options: ImportOptions
): Promise<ImportResults> {
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
    throw new Error(`Import failed: ${response.statusText}`)
  }
  return response.json()
}
```

---

## 5. Custom Hooks

### 5.1 useDatabaseStats Hook

**File**: `/frontends/nextjs/src/hooks/admin/database/useDatabaseStats.ts`

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

export function useDatabaseStats(autoRefresh: boolean = false): UseDatabaseStatsResult {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDatabaseStats()
      setStats(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!autoRefresh) return

    const timer = setInterval(() => {
      refresh()
    }, 60000)

    return () => clearInterval(timer)
  }, [autoRefresh, refresh])

  return { stats, loading, error, refresh }
}
```

### 5.2 useEntityBrowser Hook

**File**: `/frontends/nextjs/src/hooks/admin/database/useEntityBrowser.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'
import { fetchEntityRecords, updateEntity, deleteEntity } from '@/lib/api/admin-database-client'
import type { EntityRecord } from '@/lib/api/admin-database-client'

export interface UseEntityBrowserResult {
  records: EntityRecord[]
  loading: boolean
  error: string | null
  pagination: { page: number; pageSize: number; total: number }
  sort: { column: string; order: 'asc' | 'desc' }
  filters: Record<string, string>
  loadRecords: (
    entityType: string,
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>,
    sort?: { column: string; order: 'asc' | 'desc' }
  ) => Promise<void>
  setSort: (column: string, order: 'asc' | 'desc') => Promise<void>
  setFilter: (field: string, value: string) => Promise<void>
  setPage: (page: number) => Promise<void>
  updateRecord: (id: string, updates: Record<string, unknown>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
}

export function useEntityBrowser(): UseEntityBrowserResult {
  const [records, setRecords] = useState<EntityRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0 })
  const [sort, setSort] = useState({ column: 'id', order: 'asc' as const })
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentEntityType, setCurrentEntityType] = useState<string>('')

  const loadRecords = useCallback(
    async (
      entityType: string,
      page = 1,
      pageSize = 25,
      newFilters: Record<string, string> = {},
      newSort: { column: string; order: 'asc' | 'desc' } = { column: 'id', order: 'asc' }
    ) => {
      setLoading(true)
      setError(null)
      try {
        setCurrentEntityType(entityType)
        const data = await fetchEntityRecords(entityType, page, pageSize, newFilters, newSort)
        setRecords(data.records)
        setPagination({ page, pageSize, total: data.total })
        setSort(newSort)
        setFilters(newFilters)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const setSort_impl = useCallback(
    async (column: string, order: 'asc' | 'desc') => {
      await loadRecords(currentEntityType, 1, pagination.pageSize, filters, {
        column,
        order,
      })
    },
    [currentEntityType, pagination.pageSize, filters, loadRecords]
  )

  const setFilter = useCallback(
    async (field: string, value: string) => {
      const newFilters = { ...filters, [field]: value }
      await loadRecords(currentEntityType, 1, pagination.pageSize, newFilters, sort)
    },
    [currentEntityType, pagination.pageSize, sort, filters, loadRecords]
  )

  const setPage = useCallback(
    async (page: number) => {
      await loadRecords(currentEntityType, page, pagination.pageSize, filters, sort)
    },
    [currentEntityType, pagination.pageSize, filters, sort, loadRecords]
  )

  const updateRecord = useCallback(
    async (id: string, updates: Record<string, unknown>) => {
      try {
        await updateEntity(currentEntityType, id, updates)
        await loadRecords(currentEntityType, pagination.page, pagination.pageSize, filters, sort)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      }
    },
    [currentEntityType, pagination.page, pagination.pageSize, filters, sort, loadRecords]
  )

  const deleteRecord = useCallback(
    async (id: string) => {
      try {
        await deleteEntity(currentEntityType, id)
        await loadRecords(currentEntityType, pagination.page, pagination.pageSize, filters, sort)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      }
    },
    [currentEntityType, pagination.page, pagination.pageSize, filters, sort, loadRecords]
  )

  return {
    records,
    loading,
    error,
    pagination,
    sort,
    filters,
    loadRecords,
    setSort: setSort_impl,
    setFilter,
    setPage,
    updateRecord,
    deleteRecord,
  }
}
```

### 5.3 useDatabaseExport Hook

**File**: `/frontends/nextjs/src/hooks/admin/database/useDatabaseExport.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'
import { exportDatabase } from '@/lib/api/admin-database-client'

export interface UseDatabaseExportResult {
  format: 'json' | 'yaml' | 'sql'
  entityTypes: string[]
  loading: boolean
  error: string | null
  setFormat: (format: 'json' | 'yaml' | 'sql') => void
  setEntityTypes: (types: string[]) => void
  export: () => Promise<void>
}

export function useDatabaseExport(): UseDatabaseExportResult {
  const [format, setFormat] = useState<'json' | 'yaml' | 'sql'>('json')
  const [entityTypes, setEntityTypes] = useState<string[]>(['all'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const export_impl = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const blob = await exportDatabase({ entityTypes, format })

      // Download file
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `export.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [format, entityTypes])

  return {
    format,
    entityTypes,
    loading,
    error,
    setFormat,
    setEntityTypes,
    export: export_impl,
  }
}
```

### 5.4 useDatabaseImport Hook

**File**: `/frontends/nextjs/src/hooks/admin/database/useDatabaseImport.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'
import { importDatabase } from '@/lib/api/admin-database-client'
import type { ImportResults } from '@/lib/api/admin-database-client'

export interface UseDatabaseImportResult {
  file: File | null
  format: 'json' | 'yaml' | 'sql' | 'auto'
  mode: 'append' | 'upsert' | 'replace'
  dryRun: boolean
  loading: boolean
  error: string | null
  results: ImportResults | null
  setFile: (file: File | null) => void
  setFormat: (format: 'json' | 'yaml' | 'sql' | 'auto') => void
  setMode: (mode: 'append' | 'upsert' | 'replace') => void
  setDryRun: (dryRun: boolean) => void
  import: () => Promise<void>
}

export function useDatabaseImport(): UseDatabaseImportResult {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<'json' | 'yaml' | 'sql' | 'auto'>('auto')
  const [mode, setMode] = useState<'append' | 'upsert' | 'replace'>('upsert')
  const [dryRun, setDryRun] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ImportResults | null>(null)

  const import_impl = useCallback(async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const importResults = await importDatabase(file, {
        format,
        mode,
        dryRun,
      })
      setResults(importResults)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [file, format, mode, dryRun])

  return {
    file,
    format,
    mode,
    dryRun,
    loading,
    error,
    results,
    setFile,
    setFormat,
    setMode,
    setDryRun,
    import: import_impl,
  }
}
```

---

## 6. Permission Checking Middleware

**File**: `/frontends/nextjs/src/lib/auth/check-admin-permission.ts`

```typescript
/**
 * Check if user has admin database access (level 5+ - supergod)
 */
export async function checkAdminDatabasePermission(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/current-user')
    if (!response.ok) return false

    const user = (await response.json()) as { level: number } | null
    return user !== null && user.level >= 5
  } catch {
    return false
  }
}
```

---

## 7. API Endpoints (Expected Implementation)

These endpoints are designed by Subagent 3. Implementation should be at:

```typescript
// GET /api/admin/database/stats
// Returns: DatabaseStats

// GET /api/admin/database/entities?entityType=User&page=1&pageSize=25&sort=id:asc&[filters]
// Returns: { records: EntityRecord[], total: number }

// PATCH /api/admin/database/entities/:entityType/:id
// Body: Record<string, unknown>
// Returns: EntityRecord

// DELETE /api/admin/database/entities/:entityType/:id
// Returns: { success: boolean }

// POST /api/admin/database/export
// Body: { entityTypes: string[], format: 'json'|'yaml'|'sql' }
// Returns: File download

// POST /api/admin/database/import
// Body: FormData with file, format, mode, dryRun
// Returns: ImportResults
```

---

## 8. Integration Points

### 8.1 With JSONComponentRenderer

The page can optionally render the three JSON components from database_manager package:

```typescript
// Optional: Render from JSON package instead of custom components
<JSONComponentRenderer
  component={databaseStatsComponent}
  props={{
    stats,
    onRefresh,
    refreshInterval,
  }}
  allComponents={databaseManagerComponents}
/>
```

### 8.2 With Toast Notifications

Add success/error toasts (requires toast provider):

```typescript
import { useToast } from '@/hooks/useToast'

const { toast } = useToast()

// After successful operation
toast.success('Entity updated successfully')

// After error
toast.error('Failed to update entity: ' + error.message)
```

### 8.3 With Permission System

```typescript
import { getCurrentUser } from '@/lib/auth/get-current-user'

// Check supergod level (5) on page load
const user = await getCurrentUser()
if (!user || user.level < 5) {
  return <AccessDenied requiredLevel={5} userLevel={user?.level ?? 0} />
}
```

---

## 9. Error Handling Strategy

| Error Type | Handling | UI |
|------------|----------|-----|
| Network error | Retry button | Error state with message |
| Permission denied | Redirect to login | AccessDenied component |
| Validation error | Show field-specific errors | Form inline errors |
| Import validation | Show error list | ImportResults modal with errors array |
| Export failure | Show error message | Error state with retry |
| Delete confirmation | Window confirm dialog | User must confirm |
| Entity not found | 404 response | Show "Record not found" message |
| Database error | 500 response | Show generic error + details |

---

## 10. Loading States & UX

| State | Indicator | Feedback |
|-------|-----------|----------|
| Stats loading | Skeleton loader | Grey placeholder grid |
| Entities loading | Table skeleton | Pulsing row placeholders |
| Export progress | Spinner + "Exporting..." | Disabled button |
| Import progress | Spinner + "Importing..." | Disabled button |
| Refresh interval active | Badge "Auto-refresh: 60s" | Color indicator |
| Dry-run mode | Badge "Dry Run" | Yellow background |
| Successful operation | Toast notification | Green success message |
| Error state | Error card + retry | Red error message |

---

## 11. Security Considerations

1. **Permission Check**: Verify `user.level >= 5` before any database operation
2. **CSRF Protection**: Use Next.js built-in CSRF token handling
3. **Rate Limiting**: API endpoints should implement rate limits on sensitive operations
4. **Audit Logging**: All modifications (update, delete, import) should be logged
5. **Dry-Run Mode**: Default to dry-run for imports to prevent accidental data loss
6. **Confirmation Dialogs**: Require confirmation for destructive operations (delete, replace import)
7. **Sensitive Data**: Never log full entity records containing passwords/secrets

---

## 12. Testing Strategy

### Unit Tests
- Handler functions with mocked API calls
- Hook logic with test utilities
- Component rendering with mocked props

### Integration Tests
- Tab navigation flow
- Form submission and validation
- API error handling and retries

### E2E Tests
- Complete user flow: Load page → Switch tabs → Perform actions
- Permission checks and access denial
- File upload/download functionality

---

## 13. Future Enhancements

1. **Advanced Filtering**: SQL-style WHERE clause builder
2. **Bulk Operations**: Select multiple records and perform batch operations
3. **Query Builder**: Graphical query builder for advanced filtering
4. **Backup/Restore**: One-click database backup and restore
5. **Performance Tuning**: Index suggestions and query analysis
6. **Replication Status**: Monitor master-replica sync status
7. **Custom Reports**: Schedule and export custom data reports
8. **Audit Trail**: View detailed changelog of all modifications

---

This comprehensive specification provides complete implementation guidance for the `/admin/database` page with all three components, full state management, API integration, error handling, and UX patterns.

