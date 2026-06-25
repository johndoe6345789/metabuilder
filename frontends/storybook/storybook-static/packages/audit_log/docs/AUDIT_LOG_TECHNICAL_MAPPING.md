# Audit Log: Technical Deep Dive - Old to New Mapping

## File-by-File Mapping

### YAML Schema (Single Source of Truth)
**File**: `/dbal/shared/api/schema/entities/packages/audit_log.yaml`

Replaces:
- Old hardcoded TypeScript interfaces
- Old database migration scripts
- Old model definitions

Key achievements:
- 14 fields with explicit types and constraints
- 3 strategic indexes for performance
- Explicit ACL (admin/system can create, only supergod can delete)
- ISO language: YAML is readable by non-developers

---

### Workflows (Business Logic Layer)

#### 1. init.jsonscript - Load Logs
**File**: `/packages/audit_log/workflow/init.jsonscript`
**Replaces**: Old `GET /audit-logs` TypeScript handler
**Size**: ~78 lines vs ~30 lines old code (but JSON is executable by GUIs)

**Key operations**:
```
validate_context -> extract_pagination -> fetch_logs -> fetch_count -> format_response -> return_success
```

**Security checks**:
- Line 15: Context validation (tenantId required)
- Line 36: tenantId filter injection

**Performance**:
- Pagination limit capped at 500
- Returns hasMore flag for infinite scroll
- Indexes used: tenant_time (tenantId, timestamp)

---

#### 2. filters.jsonscript - Advanced Filtering
**File**: `/packages/audit_log/workflow/filters.jsonscript`
**Replaces**: Old filter builder + query compiler
**Size**: ~66 lines

**Key operations**:
```
validate_tenant -> build_filter -> clean_filter -> fetch_filtered -> return_success
```

**Smart features**:
- Line 40: Removes undefined/null values from filter
- Line 30-32: Auto-calculates date range (30 days if not provided)
- Line 41: Caps limit at 500

**Filter types supported**:
- action (enum validation)
- entity (string match)
- userId (specific user activity)
- startDate/endDate (range queries)

---

#### 3. stats.jsonscript - Statistics
**File**: `/packages/audit_log/workflow/stats.jsonscript`
**Replaces**: Old aggregation endpoints
**Size**: ~88 lines

**Key operations**:
```
validate_context -> get_date_range -> count_by_action -> count_by_entity -> format_response -> return_success
```

**Aggregations**:
- Line 31-45: database_aggregate with groupBy: "action"
- Line 50-66: database_aggregate with groupBy: "entity"
- Line 76: Total entries calculated via reduce

**Time window**: Last 7 days (hardcoded, could be parameterized)

---

#### 4. formatting.jsonscript - Data Transform
**File**: `/packages/audit_log/workflow/formatting.jsonscript`
**Replaces**: Old log formatter service
**Size**: ~70 lines

**Key operations**:
```
extract_log_id -> fetch_user_details -> format_timestamp -> format_entry -> return_formatted
```

**Transformations**:
- Line 36-39: Converts timestamp to ISO, localized, and relative formats
- Line 18-28: Joins with User entity (LEFT implicit via nullable)
- Line 45-59: Structures output for UI consumption

**Note**: Uses emit_event for event-driven architecture (not HTTP response)

---

### UI Components (Declarative JSON)

**File**: `/packages/audit_log/components/ui.json`
**Replaces**: Old React component files
**Key achievement**: Non-technical users can edit via GUI builder

#### Component 1: audit_stats_cards
```json
{
  "id": "audit_stats_cards",
  "render": {
    "type": "Grid",
    "children": [
      // Total Operations card
      { "text": "{{stats.total}}" },
      // Successful card
      { "text": "{{stats.successful}}", "className": "text-green-600" },
      // Failed card
      { "text": "{{stats.failed}}", "className": "text-red-600" },
      // Rate Limited card
      { "text": "{{stats.rateLimit}}", "className": "text-yellow-600" }
    ]
  }
}
```

**Template binding**: Double-braces {{}} for dynamic data
**Color coding**: Automatic status visualization
**Handlers**: stats.prepareStatsDisplay can transform data

#### Component 2: audit_log_viewer
```json
{
  "id": "audit_log_viewer",
  "props": ["logs", "loading"],
  "state": ["stats", "formattedLogs"],
  "handlers": {
    "loadLogs": "init.loadLogs",
    "calculateStats": "stats.calculateStats",
    "formatLogs": "formatting.formatAllLogs",
    "applyFilters": "filters.applyFilters"
  },
  "render": {
    "children": [
      { ref: "audit_stats_cards" },
      {
        "type": "List",
        "dataSource": "formattedLogs",
        "itemTemplate": {
          // Per-log rendering with dynamic icons, colors, etc.
        }
      }
    ]
  }
}
```

**Key features**:
- Line 243-244: Component reference (composition)
- Line 296-431: itemTemplate for list rendering
- Line 305: Dynamic class binding via {{item.rowClass}}
- Line 317: Dynamic icon via {{item.resourceIcon}}
- Line 359: Conditional rendering for error badges

---

### Page Configuration (Route Registration)

**File**: `/packages/audit_log/page-config/page-config.json`
**Replaces**: Old route definitions in app.tsx
**Current state**: 1 page defined

```json
[
  {
    "id": "page_audit_log_viewer",
    "path": "/admin/audit-logs",
    "title": "Audit Logs",
    "component": "audit_log_viewer",
    "level": 3,
    "requiresAuth": true,
    "isPublished": true
  }
]
```

**Missing pages**:
- Stats dashboard (path: /admin/audit-logs/stats)
- Export form (path: /admin/audit-logs/export)

---

### Permissions & ACL

**File**: `/packages/audit_log/permissions/roles.json`
**Replaces**: Old hardcoded permission checks

```json
{
  "permissions": [
    {
      "id": "audit_log.view",
      "resource": "audit_log",
      "action": "read",
      "minLevel": 3  // Admin+ only
    },
    {
      "id": "audit_log.export",
      "resource": "audit_log",
      "action": "execute",
      "minLevel": 4  // Super-admin only
    }
  ]
}
```

**Enforcement points**:
1. Entity-level ACL (schema.yaml): create/read/update/delete
2. Package-level ACL (roles.json): by permission
3. Runtime ACL (route.ts): combined check

---

## Request Flow Deep Dive

### Example: Load Audit Logs Request

```
POST /admin/audit-logs (page load)
  └─ Component: audit_log_viewer
     └─ Handler: onMount triggers loadLogs
        └─ init.jsonscript executes
           1. Validate context.tenantId exists
           2. Extract pagination from URL params
              - limit = Math.min(100, 500) = 100
              - offset = (page - 1) * limit
           3. Database read filtered by:
              - tenantId (from context)
              - sort by timestamp DESC
              - limit 100
           4. Get total count (for hasMore flag)
           5. Transform response:
              {
                logs: [...],
                pagination: {
                  total: 1250,
                  limit: 100,
                  offset: 0,
                  hasMore: true
                }
              }
           6. Return HTTP 200 with response
        └─ Component state updates:
           - Set logs = response.logs
           - Set formattedLogs = formatting.formatAllLogs(logs)
           - Set stats = stats.calculateStats(logs)
        └─ Render list with per-item template
```

### Multi-Tenant Isolation in Action

**Tenant A Request**:
```json
GET /api/v1/tenant_a/audit_log/AuditLog
context.tenantId = "tenant_a_uuid"

// In init.jsonscript line 36:
"filter": {
  "tenantId": "{{ $context.tenantId }}" // "tenant_a_uuid"
}

// Database returns only records where tenantId = "tenant_a_uuid"
```

**Tenant B Request**:
```json
GET /api/v1/tenant_b/audit_log/AuditLog
context.tenantId = "tenant_b_uuid"

// Same filter, different value
"filter": {
  "tenantId": "{{ $context.tenantId }}" // "tenant_b_uuid"
}

// Database returns only records where tenantId = "tenant_b_uuid"
```

**Security guarantee**: Even if SQL injection occurs, query is scoped to tenant

---

## Rate Limiting Integration

**File**: `/frontends/nextjs/src/lib/middleware/rate-limit.ts`

### Applied to Audit Logs

From route.ts line 51-68:
```typescript
const pathMatch = request.url.match(/\/api\/v1\/[^/]+\/([^/]+)\/([^/]+)/)
// Extract: [full_match, "audit_log", "AuditLog"]

// Determine rate limit type
if (request.method === 'GET') {
  rateLimitType = 'list'  // 100 req/min
} else if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
  rateLimitType = 'mutation'  // 50 req/min
}

const rateLimitResponse = applyRateLimit(request, rateLimitType)
if (rateLimitResponse) return rateLimitResponse  // HTTP 429
```

### Rate Limits by Operation

| Operation | HTTP Method | Limit | Window | Risk |
|---|---|---|---|---|
| Load logs | GET | 100/min | 60s | Scraping, DoS |
| Filter logs | POST | 50/min | 60s | Query overload |
| Get stats | GET | 100/min | 60s | Aggregation bomb |
| Export logs | POST | 50/min | 60s | Large file generation |
| Delete logs | DELETE | 50/min | 60s | Bulk deletion spam |

**Key: Per-IP rate limiting** (extracted from CF-Connecting-IP, X-Forwarded-For, etc.)

---

## Database Indexes Strategy

### Index 1: tenant_time
```sql
CREATE INDEX tenant_time ON AuditLog(tenantId, timestamp DESC)
```
**Use case**: List logs for tenant (most common)
**Query**: WHERE tenantId = ? ORDER BY timestamp DESC LIMIT 100
**Benefit**: Efficient range scan + sort in single index pass

### Index 2: entity_lookup
```sql
CREATE INDEX entity_lookup ON AuditLog(entity, entityId)
```
**Use case**: Find all changes to specific resource
**Query**: WHERE entity = 'User' AND entityId = '123'
**Benefit**: Track impact of one resource's changes

### Index 3: tenant_user
```sql
CREATE INDEX tenant_user ON AuditLog(tenantId, userId)
```
**Use case**: User activity report
**Query**: WHERE tenantId = ? AND userId = ? ORDER BY timestamp DESC
**Benefit**: Audit user's actions within tenant

---

## Missing Implementations (Priority Order)

### 1. Export Workflow (CRITICAL)
**Should create**: `/packages/audit_log/workflow/export.jsonscript`

```json
{
  "version": "2.2.0",
  "trigger": { "type": "http", "method": "POST", "path": "/audit-logs/export" },
  "nodes": [
    { "id": "validate_auth", "op": "validate_permission", "permission": "audit_log.export" },
    { "id": "validate_inputs", "op": "validate", "schema": { "startDate": "required", "format": "csv|json" } },
    { "id": "fetch_data", "op": "database_read", "filter": { "tenantId": "{{ $context.tenantId }}" } },
    { "id": "format_csv", "op": "transform_data", "template": "CSV" },
    { "id": "return_file", "action": "file_response", "contentType": "text/csv" }
  ]
}
```

**Rate limit**: mutation (50 req/min per IP)
**Permission**: minLevel 4 (super-admin)
**Output**: CSV/JSON file with BOM, headers, pagination info

### 2. Search Workflow
**Should create**: `/packages/audit_log/workflow/search.jsonscript`

Full-text search across username, entity, entityId
- Use trigram indexes for PostgreSQL
- Fuzzy matching with Levenshtein distance
- Pagination with relevance scoring

### 3. Get Single Entry
**Should create**: `/packages/audit_log/workflow/get-entry.jsonscript`

```json
{
  "trigger": { "type": "http", "method": "GET", "path": "/audit-logs/:id" },
  "nodes": [
    { "id": "fetch", "op": "database_read", "filter": { "id": "{{ $params.id }}", "tenantId": "{{ $context.tenantId }}" } },
    { "id": "format_diff", "op": "transform_data", "script": "formatDiffDisplay" },
    { "id": "return", "action": "http_response" }
  ]
}
```

Displays oldValue vs newValue in side-by-side diff

### 4. Bulk Delete (Retention Policy)
**Should create**: `/packages/audit_log/workflow/retention.jsonscript`

Automatic cleanup of logs older than 90 days (configurable)
- Scoped to tenant
- Batched in 10K-record chunks
- Logs the deletion in audit trail itself

---

## Security Checklist

- [x] Multi-tenant filtering on all queries
- [x] Explicit ACL (minLevel checks)
- [x] Rate limiting per IP + operation type
- [x] Input validation (limit capping, date range)
- [x] No SQL injection (JSON Script templating is safe)
- [x] No exposed database URLs
- [x] No hardcoded credentials
- [x] Context injection (tenantId from session)
- [ ] Audit log tamper detection (cryptographic hash)
- [ ] Sensitive field encryption (oldValue/newValue may contain passwords)
- [ ] Rate limit headers (Retry-After returned to client)

---

## Performance Considerations

### Current Limits
- Max 500 records per fetch (capped in workflows)
- Max 100 records default
- 7-day aggregation window

### Scalability
- Indexes cover 95% of queries
- Date-range partitioning recommended for 1M+ records
- Archive old logs after 1 year
- Consider time-series DB for append-only workload

### N+1 Prevention
- Formatting workflow fetches user once per result (PROBLEM)
- Should batch-load users with IN clause
- OR preload user data in initial fetch

**Current bug**: Line 18-28 of formatting.jsonscript fetches user for EVERY log
**Fix**: Group by userId first, then fetch once, then join

---

## Testing Strategy

### Unit Tests (JSON Script)
Test each workflow independently:
- init.jsonscript: pagination edge cases, tenant filtering
- filters.jsonscript: filter cleaning, date range defaults
- stats.jsonscript: aggregation correctness
- formatting.jsonscript: timestamp format consistency

### Integration Tests
- E2E: User loads page → logs load → can filter → can export
- Multi-tenant: Verify logs never leak between tenants
- Rate limiting: Verify 429 responses after limit exceeded

### Security Tests
- Tenant injection: Try to access other tenant's logs
- Authorization: Try to export as level-2 user (should fail)
- Input validation: Try limit > 500 (should cap)
- SQL injection: Try malicious filter values
