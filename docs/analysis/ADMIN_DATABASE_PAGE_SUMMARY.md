# /admin/database Page - Implementation Summary

## Overview

Complete TypeScript implementation specification for a production-grade database management page integrating three specialized components (database_stats, entity_browser, database_export_import) into a unified tabbed interface.

**Status**: Phase 3 Design Document
**Permission Level**: Supergod (Level 5+)
**Architecture**: React Server Component with Client Components

---

## Key Components

### 1. Main Page Route
- **File**: `/frontends/nextjs/src/app/admin/database/page.tsx`
- **Type**: React Server Component with client-side rendering
- **Responsibility**: Permission checks, tab state management, handler orchestration
- **Key Features**:
  - Supergod level (5+) permission check
  - Three-tab interface (Stats, Entities, Export/Import)
  - Full state management for all tabs
  - Modal management for entity details and import results
  - Auto-refresh support for statistics

### 2. Tab Components (3)
- **StatsTab**: Real-time database statistics with auto-refresh
- **EntitiesTab**: CRUD interface for database records with pagination/sorting/filtering
- **ExportImportTab**: Data export in multiple formats and import with dry-run support

### 3. Modal Components (2)
- **EntityDetail**: View/edit entity records with save functionality
- **ImportResults**: Display detailed import results with error/warning lists

### 4. Supporting Hooks (4)
- **useDatabaseStats**: Statistics fetching with optional auto-refresh
- **useEntityBrowser**: Entity CRUD state management
- **useDatabaseExport**: Export configuration and download handling
- **useDatabaseImport**: Import configuration and result handling

### 5. API Client
- **File**: `/frontends/nextjs/src/lib/api/admin-database-client.ts`
- **Type-Safe**: Full TypeScript types for all requests/responses
- **Functions**:
  - `fetchDatabaseStats()` - GET database statistics
  - `fetchEntityRecords()` - GET entities with pagination/sort/filter
  - `updateEntity()` - PATCH entity record
  - `deleteEntity()` - DELETE entity record
  - `exportDatabase()` - POST export request
  - `importDatabase()` - POST import request

---

## Data Flow Architecture

```
User → Page.tsx (Permission Check)
         ↓
      [Render Tabs]
         ↓
    ┌────┼────┐
    ↓    ↓    ↓
  Stats Entities Export/Import
   ↓     ↓        ↓
  [Get stats] [Browse/CRUD] [Upload/Download]
   ↓     ↓        ↓
API Endpoints:
  /api/admin/database/stats
  /api/admin/database/entities
  /api/admin/database/export
  /api/admin/database/import
```

---

## State Management Structure

### Tab State
- `activeTab`: 'stats' | 'entities' | 'export'

### Stats Tab
- `stats`: DatabaseStats | null
- `statsLoading`: boolean
- `statsError`: string | null
- `statsRefreshInterval`: 'off' | '60s' | '30s' | '10s'

### Entities Tab
- `selectedEntityType`: string
- `entityRecords`: EntityRecord[]
- `entityLoading`: boolean
- `entityError`: string | null
- `entityPagination`: { page, pageSize, total }
- `entitySort`: { column, order }
- `entityFilters`: Record<string, string>

### Export/Import Tab
- Export: `format`, `entityTypes`, `loading`, `error`
- Import: `file`, `format`, `mode`, `dryRun`, `loading`, `error`, `results`

### Modal State
- `selectedEntity`: EntityRecord | null
- `showEntityDetail`: boolean
- `showImportResults`: boolean

---

## Handler Functions (13 Total)

| Handler | Purpose | API Call |
|---------|---------|----------|
| `onRefreshStats()` | Fetch latest database stats | GET /api/admin/database/stats |
| `onEntityTypeChange(type)` | Switch entity type and load | GET /api/admin/database/entities |
| `loadEntityRecords(...)` | Load with pagination/sort/filter | GET /api/admin/database/entities |
| `onEntitySort(column, order)` | Change sorting | GET /api/admin/database/entities |
| `onEntityFilter(field, value)` | Apply filter | GET /api/admin/database/entities |
| `onEntityPageChange(page)` | Change page | GET /api/admin/database/entities |
| `onEntityView(entity)` | Open detail modal | (local state) |
| `onEntityEdit(id, updates)` | Save entity changes | PATCH /api/admin/database/entities/:id |
| `onEntityDelete(id)` | Delete entity with confirm | DELETE /api/admin/database/entities/:id |
| `onExport()` | Download exported data | POST /api/admin/database/export |
| `onImport()` | Import file data | POST /api/admin/database/import |
| `onTabChange(tab)` | Switch active tab | (local state) |
| Auto-refresh effect | Periodically refresh stats | GET /api/admin/database/stats |

---

## File Organization

```
/frontends/nextjs/src/
├── app/
│   └── admin/
│       └── database/
│           └── page.tsx                    [Main page - 380 lines]
│
├── components/
│   └── admin/
│       └── database/
│           ├── DatabaseTabs.tsx            [Tab container]
│           ├── StatsTab.tsx                [Stats display]
│           ├── EntitiesTab.tsx             [Entity CRUD]
│           ├── ExportImportTab.tsx         [Export/Import]
│           ├── EntityDetail.tsx            [Detail modal]
│           └── ImportResults.tsx           [Results modal]
│
├── hooks/
│   └── admin/
│       └── database/
│           ├── useDatabaseStats.ts         [Stats hook]
│           ├── useEntityBrowser.ts         [Browser hook]
│           ├── useDatabaseExport.ts        [Export hook]
│           └── useDatabaseImport.ts        [Import hook]
│
└── lib/
    ├── api/
    │   └── admin-database-client.ts        [Type-safe API client]
    └── auth/
        └── check-admin-permission.ts       [Permission verification]
```

---

## Component Integration Points

### With JSONComponentRenderer
The page supports rendering JSON components from `database_manager` package:

```typescript
<JSONComponentRenderer
  component={component}
  props={{ stats, onRefresh, ... }}
  allComponents={allComponents}
/>
```

### With Auth System
- `getCurrentUser()` - Get current user and verify supergod level (5+)
- `AccessDenied` component - Show if insufficient permissions

### With Toast Notifications
Success/error toasts after all mutations (requires toast provider)

### With Error Boundaries
`ErrorBoundary` component wraps page for error handling

---

## API Endpoint Contracts

### GET /api/admin/database/stats
Returns real-time database statistics including health status

**Response**:
```json
{
  "tableCount": 12,
  "totalRecords": 2850,
  "storageSize": 5242880,
  "lastVacuum": "2024-01-21T10:30:00Z",
  "activeConnections": 3,
  "health": "good|warning|critical",
  "healthDetails": {
    "reason": "...",
    "recommendation": "..."
  },
  "timestamp": "2024-01-21T15:45:00Z"
}
```

### GET /api/admin/database/entities
List entity records with pagination, sorting, filtering

**Query Params**:
- `entityType`: string
- `page`: number (default: 1)
- `pageSize`: number (default: 25)
- `sort`: "column:asc|desc"
- `[field]`: filter value

**Response**:
```json
{
  "records": [...],
  "total": 1250
}
```

### PATCH /api/admin/database/entities/:entityType/:id
Update entity record

**Request**:
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

**Response**: Updated EntityRecord

### DELETE /api/admin/database/entities/:entityType/:id
Delete entity record (with confirmation dialog)

### POST /api/admin/database/export
Export data in specified format

**Request**:
```json
{
  "entityTypes": ["all"] or ["User", "Credential"],
  "format": "json|yaml|sql"
}
```

**Response**: File download with Content-Disposition header

### POST /api/admin/database/import
Import data with validation and optional dry-run

**Request**: FormData with:
- `file`: File object
- `format`: "json|yaml|sql|auto"
- `mode`: "append|upsert|replace"
- `dryRun`: "true|false"

**Response**:
```json
{
  "imported": 150,
  "skipped": 5,
  "errors": [
    { "row": 12, "error": "Invalid email format" }
  ],
  "warnings": [...],
  "dryRun": true,
  "duration": 1250
}
```

---

## Features & Capabilities

### Statistics Tab
✅ Real-time database metrics (table count, records, storage, connections)
✅ Health status with color-coding (green/yellow/red)
✅ Manual refresh button
✅ Auto-refresh interval selector (off, 10s, 30s, 60s)
✅ Detailed health recommendations
✅ Last updated timestamp

### Entities Tab
✅ Entity type selector (User, Credential, PageConfig, Session, Workflow, Component)
✅ Pagination (configurable page size)
✅ Sorting (click column header to toggle asc/desc)
✅ Filtering (field-by-field filtering)
✅ View entity details
✅ Edit entity with in-modal form
✅ Delete with confirmation dialog
✅ Loading states and error handling

### Export/Import Tab
✅ Export format selector (JSON, YAML, SQL)
✅ Entity type multi-select for export
✅ One-click download
✅ File upload with drag-and-drop support
✅ Format auto-detection (or manual selection)
✅ Import mode selector (append, upsert, replace)
✅ Dry-run checkbox for safe preview
✅ Detailed results display (imported/skipped/errors)
✅ Validation error list with row numbers

---

## Error Handling Strategy

| Scenario | Handling | UX |
|----------|----------|-----|
| Network error | Retry button | Error card with message |
| Permission denied | Redirect/AccessDenied | Clear access denial message |
| Validation error | Show field errors | Form inline errors |
| Import validation | Error list | Modal with error array |
| Export failure | Retry option | Error state |
| Entity not found | 404 handling | "Record not found" |
| Database error | Show details | Error card with details |
| Delete confirmation | Window.confirm() | Native dialog |

---

## Security Features

✅ Supergod level (5+) permission check on page load
✅ CSRF protection via Next.js
✅ Rate limiting on API endpoints (server-side)
✅ Audit logging for modifications (server-side)
✅ Dry-run mode default for imports
✅ Confirmation dialogs for destructive operations
✅ Sensitive data protection (never log full records with secrets)

---

## Performance Optimizations

- ✅ Memoized handler functions with useCallback
- ✅ Optimized re-renders with proper state separation
- ✅ Pagination to prevent loading thousands of records
- ✅ Lazy loading of modals
- ✅ Efficient API calls with request batching
- ✅ Cached entity type list

---

## Testing Coverage

### Unit Tests
- Handler function logic
- Hook state management
- Component rendering with various props
- API client request formatting

### Integration Tests
- Tab navigation flow
- Form submission and validation
- API error handling and retries
- Modal open/close behavior

### E2E Tests
- Complete user workflow
- Permission validation
- File upload/download
- Multi-step operations (filter → sort → paginate)

---

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Dependencies

- React 18+
- Next.js 14+ (App Router)
- TypeScript 5+
- Existing project components:
  - `LoadingIndicator`
  - `LoadingSkeleton`
  - `ErrorState`
  - `AccessDenied`
  - `ErrorBoundary`

---

## Implementation Checklist

- [ ] Create `/frontends/nextjs/src/app/admin/database/page.tsx`
- [ ] Create 4 component files in `/frontends/nextjs/src/components/admin/database/`
- [ ] Create 4 hook files in `/frontends/nextjs/src/hooks/admin/database/`
- [ ] Create API client at `/frontends/nextjs/src/lib/api/admin-database-client.ts`
- [ ] Create permission checker at `/frontends/nextjs/src/lib/auth/check-admin-permission.ts`
- [ ] Implement API endpoints (Subagent 3)
- [ ] Add route to database_manager package seed data
- [ ] Write unit tests for all hooks and handlers
- [ ] Write integration tests for tab flows
- [ ] Write E2E tests for complete workflows
- [ ] Add permission checks to middleware
- [ ] Document API contracts
- [ ] Add to admin navigation menu

---

## Full Implementation Specification

See `ADMIN_DATABASE_PAGE_SPEC.md` for complete code implementations including:
- Full page component (380+ lines)
- All tab components with detailed rendering logic
- Modal components with edit/view functionality
- 4 custom hooks with complete state management
- Type-safe API client with all endpoints
- Permission checking utilities
- Error handling patterns
- Loading state patterns
- Integration examples

---

## Next Steps

1. **Subagent 3**: Implement API endpoints at `/api/admin/database/*`
2. **Subagent 4**: Implement database_manager package JSON components
3. **Subagent 6**: Implement page route and components
4. **Integration**: Connect components and test end-to-end
5. **Documentation**: Add to admin guide and API docs

---

**Document Generated**: Phase 3 - Database Management Page Design
**Total Implementation Size**: ~2,000 lines of TypeScript
**Estimated Development Time**: 8-12 hours (4-6 hours with components pre-built)
**Test Coverage Target**: 85%+
