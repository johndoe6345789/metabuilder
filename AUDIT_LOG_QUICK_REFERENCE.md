# Audit Log: Quick Reference & File Locations

## File Structure at a Glance

```
/packages/audit_log/
├── components/
│   └── ui.json                    # 2 components (AuditStatsCard, AuditLogViewer)
├── workflow/
│   ├── init.jsonscript            # Load paginated logs
│   ├── filters.jsonscript         # Apply advanced filters
│   ├── stats.jsonscript           # Calculate 7-day statistics
│   └── formatting.jsonscript      # Format logs for display
├── page-config/
│   └── page-config.json           # 1 page, 2 missing
├── permissions/
│   └── roles.json                 # 4 permissions (view, stats, filter, export)
├── package.json                   # Metadata (minLevel: 3)
└── entities/
    └── schema.json                # Entity definition mirror

/dbal/shared/api/schema/entities/packages/
└── audit_log.yaml                 # YAML source of truth (14 fields, 3 indexes)

/frontends/nextjs/src/app/api/v1/[...slug]/
└── route.ts                       # Generic handler for all endpoints
```

---

## API Endpoints

### GET /api/v1/{tenant}/audit_log/AuditLog
**Purpose**: List audit logs with pagination
**Handler**: init.jsonscript
**Rate Limit**: 100 req/min (list)
**Auth**: minLevel 3
**Example**:
```bash
curl -H "Cookie: mb_session=..." \
  "http://localhost:3000/api/v1/acme/audit_log/AuditLog?limit=50&page=1"
```

### POST /api/v1/{tenant}/audit_log/AuditLog/filter
**Purpose**: Apply complex filters
**Handler**: filters.jsonscript
**Rate Limit**: 50 req/min (mutation)
**Auth**: minLevel 3
**Payload**:
```json
{
  "action": "create",
  "entity": "User",
  "userId": "uuid-here",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### GET /api/v1/{tenant}/audit_log/AuditLog/stats
**Purpose**: Get 7-day statistics
**Handler**: stats.jsonscript
**Rate Limit**: 100 req/min (list)
**Auth**: minLevel 3
**Response**:
```json
{
  "dateRange": { "startDate": "...", "endDate": "..." },
  "actionStatistics": [{"action": "create", "count": 42}],
  "entityStatistics": [{"entity": "User", "count": 85}],
  "totalEntries": 250
}
```

---

## Data Model (14 Fields)

| Field | Type | Required | Indexed | Purpose |
|---|---|---|---|---|
| id | CUID | Yes | No | Primary key |
| tenantId | UUID | Yes | Yes | Multi-tenant scope |
| userId | UUID | No | Yes | Who performed action |
| username | String | No | No | Username snapshot |
| action | Enum | Yes | Yes | Type: create/update/delete/login/logout/access/execute/export/import |
| entity | String | Yes | No | Resource type (User, Workflow, Page, etc.) |
| entityId | String | No | No | Specific resource ID |
| oldValue | JSON | No | No | State before change |
| newValue | JSON | No | No | State after change |
| ipAddress | String | No | No | Client IP (IPv4/IPv6) |
| userAgent | String | No | No | Browser/device info |
| details | JSON | No | No | Additional context |
| timestamp | BigInt | Yes | Yes | Unix ms (for sorting) |

---

## Permissions

| Permission | minLevel | Purpose |
|---|---|---|
| audit_log.view | 3 | View audit logs |
| audit_log.stats | 3 | View statistics |
| audit_log.filter | 3 | Use advanced filters |
| audit_log.export | 4 | Export logs to CSV/JSON |

---

## Component Props

### AuditLogViewer (Main)
**Props**: `logs`, `loading`
**State**: `stats`, `formattedLogs`
**Handlers**: `loadLogs`, `calculateStats`, `formatLogs`, `applyFilters`

### AuditStatsCard (Sub)
**Props**: `stats` (object with total, successful, failed, rateLimit)
**Display**: 4-column grid with color-coded cards

---

## Security Features

### Multi-Tenant Isolation
Every workflow validates `context.tenantId` and injects it into filters:
```json
"filter": { "tenantId": "{{ $context.tenantId }}" }
```

### Rate Limiting (Per-IP)
- Lists: 100 req/min
- Mutations: 50 req/min
- Extracted from CF-Connecting-IP or X-Forwarded-For

### Input Validation
- Pagination limit capped at 500
- Date range defaults to 30 days if not provided
- All filters cleaned of null/undefined values

### ACL Enforcement
- Package-level: minLevel checks
- Entity-level: YAML ACL (admin/system can create)

---

## Workflows Executed by Components

| Workflow | File | Trigger |
|---|---|---|
| Load logs | init.jsonscript | Component onMount or user clicks Refresh |
| Calculate stats | stats.jsonscript | After logs loaded |
| Format logs | formatting.jsonscript | After load, transforms for UI |
| Apply filters | filters.jsonscript | User submits filter form |

---

## Database Indexes (Performance)

```sql
-- Index 1: Most common operation (list logs by tenant)
CREATE INDEX tenant_time ON AuditLog(tenantId, timestamp DESC)

-- Index 2: Find all changes to specific resource
CREATE INDEX entity_lookup ON AuditLog(entity, entityId)

-- Index 3: User activity tracking
CREATE INDEX tenant_user ON AuditLog(tenantId, userId)
```

---

## Current Implementation Status

### Implemented
- 14-field YAML schema
- 4 JSON Script workflows
- 2 UI components
- 1 page route (/admin/audit-logs)
- 4 permissions
- Multi-tenant filtering
- Rate limiting
- Full ACL system

### Missing (High Priority)
- Export workflow
- LogFilters component
- LogDetailModal component
- Stats dashboard page
- Export form page

### Missing (Medium Priority)
- Search workflow
- LogTable component (table view)
- Get single entry workflow
- Retention policy (cleanup old logs)

### Known Issues
- N+1 query problem: formatting.jsonscript fetches user for each log
- Stats time window hardcoded to 7 days
- No pagination on filter results

---

## How to Add Missing Export Feature

1. **Create workflow**: `/packages/audit_log/workflow/export.jsonscript`
   - Validate minLevel 4 permission
   - Fetch data with tenant filter
   - Format as CSV/JSON
   - Return file response

2. **Add route**: Update `/packages/audit_log/page-config/page-config.json`
   - New entry: path "/admin/audit-logs/export"
   - Component: "audit_export_form"

3. **Add component**: Add to `/packages/audit_log/components/ui.json`
   - Form with date range picker
   - Format selector (CSV/JSON)
   - Export button

---

## URL Patterns

**Standard CRUD**:
```
GET    /api/v1/{tenant}/{package}/{entity}              # List
GET    /api/v1/{tenant}/{package}/{entity}/{id}         # Read
POST   /api/v1/{tenant}/{package}/{entity}              # Create
PUT    /api/v1/{tenant}/{package}/{entity}/{id}         # Update
DELETE /api/v1/{tenant}/{package}/{entity}/{id}         # Delete
```

**Audit Log Custom Actions**:
```
GET    /api/v1/acme/audit_log/AuditLog/stats            # action: stats
POST   /api/v1/acme/audit_log/AuditLog/filter           # action: filter
POST   /api/v1/acme/audit_log/AuditLog/export           # action: export (missing)
GET    /api/v1/acme/audit_log/AuditLog/search           # action: search (missing)
GET    /api/v1/acme/audit_log/AuditLog/{id}             # action: get (missing)
```

---

## Rate Limit Error Response

**Status**: 429 Too Many Requests
**Body**:
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

**Header**: `Retry-After: 60` (seconds)

---

## Testing Checklist

- [ ] Multi-tenant: Verify logs never cross tenant boundaries
- [ ] Auth: Try accessing as level-2 user (should fail)
- [ ] Rate limit: Hit endpoint 101 times in 60s (should get 429)
- [ ] Input validation: Try limit=1000 (should cap to 500)
- [ ] Export: Verify CSV has correct format and tenant scope
- [ ] Search: Verify fuzzy matching works
- [ ] Performance: Load 10K logs, measure query time

---

## Key Files to Know

| File | Purpose | Lines |
|---|---|---|
| `/dbal/shared/api/schema/entities/packages/audit_log.yaml` | Entity definition | 99 |
| `/packages/audit_log/components/ui.json` | UI components | 447 |
| `/packages/audit_log/workflow/init.jsonscript` | Load logs | 88 |
| `/packages/audit_log/workflow/filters.jsonscript` | Advanced filter | 66 |
| `/packages/audit_log/workflow/stats.jsonscript` | Statistics | 88 |
| `/packages/audit_log/workflow/formatting.jsonscript` | Transform logs | 70 |
| `/packages/audit_log/page-config/page-config.json` | Pages | 14 |
| `/packages/audit_log/permissions/roles.json` | ACL | 53 |
| `/frontends/nextjs/src/app/api/v1/[...slug]/route.ts` | API handler | 231 |
| `/frontends/nextjs/src/lib/middleware/rate-limit.ts` | Rate limiter | 316 |
