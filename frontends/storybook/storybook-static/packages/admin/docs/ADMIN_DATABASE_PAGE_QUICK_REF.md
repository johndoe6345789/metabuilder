# /admin/database Page - Quick Reference Guide

## File Structure to Create

```
/frontends/nextjs/src/
├── app/
│   └── admin/
│       └── database/
│           └── page.tsx                              (380+ lines)
│
├── components/
│   └── admin/
│       └── database/
│           ├── DatabaseTabs.tsx                      (50 lines)
│           ├── StatsTab.tsx                          (120 lines)
│           ├── EntitiesTab.tsx                       (150 lines)
│           ├── ExportImportTab.tsx                   (180 lines)
│           ├── EntityDetail.tsx                      (100 lines)
│           └── ImportResults.tsx                     (90 lines)
│
├── hooks/
│   └── admin/
│       └── database/
│           ├── useDatabaseStats.ts                   (60 lines)
│           ├── useEntityBrowser.ts                   (130 lines)
│           ├── useDatabaseExport.ts                  (80 lines)
│           └── useDatabaseImport.ts                  (90 lines)
│
└── lib/
    ├── api/
    │   └── admin-database-client.ts                  (180 lines)
    ├── admin/
    │   └── database/
    │       ├── database-page-types.ts                (50 lines - optional)
    │       ├── entity-detail-modal.ts                (80 lines - optional)
    │       └── import-results-display.ts             (70 lines - optional)
    └── auth/
        └── check-admin-permission.ts                 (20 lines)
```

**Total Implementation**: ~1,700 lines of TypeScript

---

## Component Dependency Tree

```
AdminDatabasePage (page.tsx)
├── Permission Check
│   └── getCurrentUser() → User.level >= 5
├── Tab Container
│   ├── DatabaseTabs.tsx (UI only)
│   └── Active Tab Content
│       ├── StatsTab.tsx
│       │   ├── useDatabaseStats hook
│       │   ├── LoadingIndicator
│       │   └── ErrorState
│       ├── EntitiesTab.tsx
│       │   ├── useEntityBrowser hook
│       │   ├── Table with sorting/filtering
│       │   └── Pagination
│       └── ExportImportTab.tsx
│           ├── useDatabaseExport hook
│           ├── useDatabaseImport hook
│           └── Form controls
├── EntityDetail Modal
│   └── onEntityEdit handler
├── ImportResults Modal
│   └── ImportResults component
└── API Calls
    └── admin-database-client.ts
        ├── fetchDatabaseStats()
        ├── fetchEntityRecords()
        ├── updateEntity()
        ├── deleteEntity()
        ├── exportDatabase()
        └── importDatabase()
```

---

## State Management Summary

### Page-Level State (13 pieces)
```typescript
// Tab
const [activeTab, setActiveTab] = useState<'stats' | 'entities' | 'export'>('stats')

// Stats (4 state)
const [stats, setStats] = useState(null)
const [statsLoading, setStatsLoading] = useState(false)
const [statsError, setStatsError] = useState(null)
const [statsRefreshInterval, setStatsRefreshInterval] = useState('off')

// Entities (7 state)
const [selectedEntityType, setSelectedEntityType] = useState('User')
const [entityRecords, setEntityRecords] = useState([])
const [entityLoading, setEntityLoading] = useState(false)
const [entityError, setEntityError] = useState(null)
const [entityPagination, setEntityPagination] = useState({ page: 1, pageSize: 25, total: 0 })
const [entitySort, setEntitySort] = useState({ column: 'id', order: 'asc' })
const [entityFilters, setEntityFilters] = useState({})

// Export (4 state)
const [exportFormat, setExportFormat] = useState('json')
const [exportEntityTypes, setExportEntityTypes] = useState(['all'])
const [exportLoading, setExportLoading] = useState(false)
const [exportError, setExportError] = useState(null)

// Import (6 state)
const [importFile, setImportFile] = useState(null)
const [importFormat, setImportFormat] = useState('auto')
const [importMode, setImportMode] = useState('upsert')
const [importDryRun, setImportDryRun] = useState(true)
const [importLoading, setImportLoading] = useState(false)
const [importError, setImportError] = useState(null)
const [importResults, setImportResults] = useState(null)

// Modals (3 state)
const [selectedEntity, setSelectedEntity] = useState(null)
const [showEntityDetail, setShowEntityDetail] = useState(false)
const [showImportResults, setShowImportResults] = useState(false)
```

---

## Handler Functions Quick Reference

### Stats Handlers
```typescript
async function onRefreshStats()
  // GET /api/admin/database/stats
  // Updates: stats, statsLoading, statsError

// Auto-refresh effect
useEffect(() => {
  if (statsRefreshInterval === 'off') return
  const timer = setInterval(() => onRefreshStats(), interval)
}, [statsRefreshInterval])
```

### Entity Handlers
```typescript
async function onEntityTypeChange(type)
  // Resets pagination/sort/filters
  // Calls loadEntityRecords()

async function loadEntityRecords(type, page, pageSize, filters, sort)
  // GET /api/admin/database/entities?...

async function onEntitySort(column, order)
  // Calls loadEntityRecords() with new sort

async function onEntityFilter(field, value)
  // Calls loadEntityRecords() with new filters

async function onEntityPageChange(page)
  // Calls loadEntityRecords() with new page

function onEntityView(entity)
  // Sets selectedEntity, opens modal

async function onEntityEdit(id, updates)
  // PATCH /api/admin/database/entities/:id
  // Reloads entity list after success

async function onEntityDelete(id)
  // window.confirm() → DELETE /api/admin/database/entities/:id
  // Reloads entity list after success
```

### Export/Import Handlers
```typescript
async function onExport()
  // POST /api/admin/database/export
  // Downloads blob as file

async function onImport()
  // POST /api/admin/database/import (FormData)
  // Sets importResults, shows modal
```

---

## API Call Patterns

### Pattern 1: Fetch with Error Handling
```typescript
async function onRefreshStats() {
  setStatsLoading(true)
  setStatsError(null)
  try {
    const response = await fetch('/api/admin/database/stats')
    if (!response.ok) throw new Error(`Status: ${response.statusText}`)
    const data = await response.json()
    setStats(data)
  } catch (error) {
    setStatsError(error.message)
  } finally {
    setStatsLoading(false)
  }
}
```

### Pattern 2: POST with JSON
```typescript
async function onExport() {
  const response = await fetch('/api/admin/database/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entityTypes: exportEntityTypes,
      format: exportFormat,
    }),
  })
}
```

### Pattern 3: POST with FormData
```typescript
async function onImport() {
  const formData = new FormData()
  formData.append('file', importFile)
  formData.append('format', importFormat)
  formData.append('mode', importMode)
  formData.append('dryRun', importDryRun.toString())

  const response = await fetch('/api/admin/database/import', {
    method: 'POST',
    body: formData,
  })
}
```

### Pattern 4: Query Parameters
```typescript
async function loadEntityRecords(entityType, page, pageSize, filters, sort) {
  const params = new URLSearchParams({
    entityType,
    page: page.toString(),
    pageSize: pageSize.toString(),
    sort: `${sort.column}:${sort.order}`,
    ...filters,
  })

  const response = await fetch(
    `/api/admin/database/entities?${params}`
  )
}
```

---

## Component Props Interface Quick Reference

### DatabaseTabs
```typescript
interface DatabaseTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: Array<{
    id: string
    label: string
    content: React.ReactNode
  }>
}
```

### StatsTab
```typescript
interface StatsTabProps {
  stats: DatabaseStats | null
  loading: boolean
  error: string | null
  refreshInterval: 'off' | '60s' | '30s' | '10s'
  onRefresh: () => Promise<void>
  onRefreshIntervalChange: (interval: ...) => void
}
```

### EntitiesTab
```typescript
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
```

### ExportImportTab
```typescript
interface ExportImportTabProps {
  // Export
  exportFormat: 'json' | 'yaml' | 'sql'
  exportEntityTypes: string[]
  exportLoading: boolean
  exportError: string | null
  onExportFormatChange: (format: ...) => void
  onExportEntityTypesChange: (types: string[]) => void
  onExport: () => Promise<void>

  // Import
  importFile: File | null
  importFormat: 'json' | 'yaml' | 'sql' | 'auto'
  importMode: 'append' | 'upsert' | 'replace'
  importDryRun: boolean
  importLoading: boolean
  importError: string | null
  onImportFileChange: (file: File | null) => void
  onImportFormatChange: (format: ...) => void
  onImportModeChange: (mode: ...) => void
  onImportDryRunChange: (dryRun: boolean) => void
  onImport: () => Promise<void>
}
```

### EntityDetail
```typescript
interface EntityDetailProps {
  entity: EntityRecord
  entityType: string
  onSave: (id: string, updates: Record<string, unknown>) => Promise<void>
  onClose: () => void
}
```

### ImportResults
```typescript
interface ImportResultsProps {
  results: ImportResults
  onClose: () => void
}
```

---

## Type Definitions Quick Reference

### DatabaseStats
```typescript
interface DatabaseStats {
  tableCount: number
  totalRecords: number
  storageSize: number                    // bytes
  lastVacuum: string | null              // ISO timestamp
  activeConnections: number
  health: 'good' | 'warning' | 'critical'
  healthDetails: {
    reason: string
    recommendation: string
  }
  timestamp: string                      // ISO timestamp
}
```

### EntityRecord
```typescript
interface EntityRecord {
  id: string
  [key: string]: unknown
}
```

### ImportResults
```typescript
interface ImportResults {
  imported: number
  skipped: number
  errors: Array<{
    row: number
    error: string
  }>
  warnings: string[]
  dryRun: boolean
  duration: number                       // milliseconds
}
```

---

## Common UI Patterns

### Loading Skeleton
```typescript
{loading && !data ? (
  <LoadingIndicator />
) : null}
```

### Error State
```typescript
{error ? (
  <ErrorState
    title="Failed to load"
    description={error}
    action={{ label: 'Retry', onClick: onRefresh }}
  />
) : null}
```

### Confirmation Dialog
```typescript
if (!window.confirm(`Delete ${entityType} record? This cannot be undone.`)) {
  return
}
// proceed with delete
```

### File Download
```typescript
const blob = await response.blob()
const url = window.URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = fileName
link.click()
window.URL.revokeObjectURL(url)
```

### Tab Navigation
```typescript
<div className="flex space-x-2 border-b">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => onTabChange(tab.id)}
      className={activeTab === tab.id ? 'border-blue-500 text-blue-600' : '...'}
    >
      {tab.label}
    </button>
  ))}
</div>
```

---

## Key Implementation Decisions

| Decision | Rationale |
|----------|-----------|
| **Page-level state** instead of Redux | Simpler for small feature scope |
| **useCallback hooks** | Prevent unnecessary re-renders |
| **FormData for file upload** | Proper multipart/form-data handling |
| **Window.confirm** for delete | Native browser UI, no extra modal |
| **Dry-run default to true** | Safety-first import pattern |
| **Query params for pagination** | Shareable URLs, bookmarkable state |
| **useEffect for auto-refresh** | Clean separation of concerns |
| **Type-safe API client** | Full TypeScript coverage |

---

## Testing Quick Checklist

### Unit Tests to Write
- [ ] `onRefreshStats()` with mocked fetch
- [ ] `loadEntityRecords()` with different params
- [ ] `onEntityEdit()` success and error cases
- [ ] `onExport()` blob generation and download
- [ ] `onImport()` FormData construction
- [ ] `useDatabaseStats` hook state changes
- [ ] `useEntityBrowser` CRUD operations
- [ ] Component renders with various props

### Integration Tests to Write
- [ ] Tab switching flow
- [ ] Entity type change and load
- [ ] Sort → Filter → Paginate workflow
- [ ] Export format selection and download
- [ ] Import with dry-run and actual
- [ ] Error retry flows

### E2E Tests to Write
- [ ] Complete stats auto-refresh
- [ ] Entity CRUD workflow
- [ ] File import/export round-trip
- [ ] Permission check on page load

---

## Performance Tips

1. **Memoize handlers** - Use useCallback to prevent recreating functions
2. **Separate state** - Don't bundle unrelated state
3. **Lazy load modals** - Only render when needed
4. **Pagination** - Default to 25 items per page
5. **Debounce filters** - Consider 300ms debounce on filter input
6. **Cache entity types** - Don't refetch same entity type
7. **Request cancellation** - Abort in-flight requests on unmount

---

## Deployment Checklist

- [ ] Permission endpoints tested
- [ ] All API endpoints implemented
- [ ] Error handling tested for each endpoint
- [ ] Rate limiting configured on backend
- [ ] Audit logging added to mutations
- [ ] CSRF tokens configured
- [ ] Tests passing (unit + integration + E2E)
- [ ] Documentation updated
- [ ] Route added to navigation menu
- [ ] Database_manager package seed updated
- [ ] Monitored for errors in production

---

## Estimated Development Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup & scaffolding | 1 hour | File structure created |
| Page component | 2 hours | Main page with state |
| Tab components | 2 hours | All 3 tabs rendering |
| Modal components | 1.5 hours | Detail & results modals |
| Hooks | 1.5 hours | All 4 hooks |
| API client | 1 hour | Type-safe client |
| Integration | 2 hours | Connect all pieces |
| Testing | 3 hours | Unit + integration + E2E |
| Polish & docs | 1 hour | Styling & documentation |
| **Total** | **15.5 hours** | **Production-ready** |

---

## Resources & References

- **Main Spec**: `/ADMIN_DATABASE_PAGE_SPEC.md` (2,500+ lines)
- **Summary**: `/ADMIN_DATABASE_PAGE_SUMMARY.md`
- **Project Docs**: `CLAUDE.md`, `AGENTS.md`, `ARCHITECTURE.md`
- **Component Examples**: `/frontends/nextjs/src/components/`
- **Hook Examples**: `/frontends/nextjs/src/hooks/`
- **API Patterns**: `/frontends/nextjs/src/app/api/`

---

**Quick Reference Version**: 1.0
**Last Updated**: January 21, 2026
**Status**: Ready for Implementation
