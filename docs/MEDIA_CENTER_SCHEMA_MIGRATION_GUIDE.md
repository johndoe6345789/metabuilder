# Media Center Workflow Schema Migration Guide

**Quick Reference for Transforming Legacy Workflows to n8n Compliance**

---

## At-a-Glance Comparison

### Current (Legacy) vs. Updated (Compliant)

| Aspect | Current | Updated | Impact |
|--------|---------|---------|--------|
| **Root ID** | None | `wf_extract_image_metadata_v1` | Versioning, audit trail |
| **Version** | None | `1.0.0` | Semantic versioning |
| **Multi-tenant Entry** | Implicit | Explicit node | Safety guarantee |
| **Node Count** | 7 | 9 | +2 safety nodes |
| **Per-Node Fields** | 4 | 6+ | Better documentation |
| **Connections** | `{}` | Explicit mapping | Enables visualization |
| **Settings Fields** | 5 | 11+ | Configuration depth |
| **Max Timeout** | 3600s | 30-600s | Tuned per workflow |

---

## Root Schema Template

### Old Structure (Minimal)
```json
{
  "name": "Extract Image Metadata",
  "active": false,
  "nodes": [...],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": { ... }
}
```

### New Structure (Complete)
```json
{
  "id": "wf_extract_image_metadata_v1",
  "versionId": "1.0.0",
  "name": "Extract Image Metadata",
  "description": "Extract and store metadata from image files...",
  "tenantId": null,
  "active": false,
  "deployedAt": null,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": ["media", "image", "metadata"],
  "nodes": [...],
  "connections": { ... },
  "staticData": {},
  "meta": { ... },
  "settings": { ... }
}
```

### Field Definitions

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `id` | string | Unique workflow identifier | `wf_extract_image_metadata_v1` |
| `versionId` | string | Semantic version | `1.0.0` |
| `name` | string | Display name | `Extract Image Metadata` |
| `description` | string | Purpose & behavior | `Extract and store metadata...` |
| `tenantId` | null/string | Multi-tenant scope (null at definition) | `null` |
| `active` | boolean | Lifecycle status | `false` |
| `deployedAt` | null/ISO8601 | Last deployment timestamp | `null` or timestamp |
| `createdAt` | ISO8601 | Creation timestamp | `2026-01-22T00:00:00Z` |
| `updatedAt` | ISO8601 | Last update timestamp | `2026-01-22T00:00:00Z` |
| `tags` | string[] | Categorization | `["media", "image", "metadata"]` |

---

## Node Structure Transformation

### Old Node Structure (Minimal)
```json
{
  "id": "validate_context",
  "name": "Validate Context",
  "type": "metabuilder.validate",
  "typeVersion": 1,
  "position": [100, 100],
  "parameters": { ... }
}
```

### New Node Structure (Complete)
```json
{
  "id": "validate_context",
  "name": "Validate Context",
  "type": "metabuilder.validate",
  "typeVersion": 1,
  "position": [100, 100],
  "disabled": false,
  "notes": "Validate that tenantId is present in execution context",
  "continueOnFail": false,
  "parameters": { ... }
}
```

### Added Node Fields

| Field | Type | Purpose | When to Use |
|-------|------|---------|------------|
| `disabled` | boolean | Disable node without deletion | Testing, gradual rollout |
| `notes` | string | Self-documenting purpose | Always |
| `continueOnFail` | boolean | Continue on node error | true for non-critical steps |

### continueOnFail Decision Tree

```
Is this a critical safety check?
  ├─ YES (validation, auth, DB read)
  │   └─ continueOnFail: false
  └─ NO (logging, event emission)
      └─ continueOnFail: true
```

---

## Multi-Tenant Validation Node Template

### Why Required
- Mandatory entry point validation
- Prevents accidental cross-tenant data leakage
- Matches MULTI_TENANT_AUDIT.md requirements

### Template
```json
{
  "id": "validate_tenant",
  "name": "Validate Tenant",
  "type": "metabuilder.validate",
  "typeVersion": 1,
  "position": [50, 100],
  "disabled": false,
  "notes": "Entry point: validate tenantId is present and valid UUID",
  "continueOnFail": false,
  "parameters": {
    "input": "{{ $context.tenantId }}",
    "operation": "validate",
    "rules": {
      "tenantId": "required|string|uuid"
    }
  }
}
```

### Position Guidelines
- **First node**: Always at [50, 100]
- **Subsequent nodes**: Shift right by 300-350px

### Connection
```json
"validate_tenant": {
  "main": [[{ "node": "next_node_id", "type": "main", "index": 0 }]]
}
```

---

## Database Operation Pattern

### Multi-Tenant Filter Pattern

```json
{
  "id": "fetch_asset",
  "name": "Fetch Asset",
  "type": "metabuilder.database",
  "typeVersion": 1,
  "position": [700, 100],
  "parameters": {
    "entity": "MediaAsset",
    "operation": "database_read",
    "filter": {
      "id": "{{ $json.assetId }}",
      "tenantId": "{{ $context.tenantId }}"
    }
  }
}
```

### Critical Rule
**ALWAYS filter by tenantId on EVERY database operation**

```
✅ Correct:
{
  "filter": {
    "id": "{{ $json.id }}",
    "tenantId": "{{ $context.tenantId }}"
  }
}

❌ Wrong:
{
  "filter": {
    "id": "{{ $json.id }}"
  }
}
```

---

## Authorization Check Pattern

### Implementation Template
```json
{
  "id": "check_authorization",
  "name": "Check Authorization",
  "type": "metabuilder.condition",
  "typeVersion": 1,
  "position": [1000, 100],
  "parameters": {
    "condition": "{{ ($steps.fetch_asset.output !== null) && ($steps.fetch_asset.output.uploadedBy === $context.user.id || $context.user.level >= 3) }}",
    "operation": "condition",
    "then": "proceed_to_deletion",
    "else": "error_unauthorized"
  }
}
```

### Authorization Decision Logic
```
Is asset found?
  ├─ NO → 404 Not Found
  └─ YES
    └─ Is user owner OR admin (level >= 3)?
      ├─ YES → Proceed
      └─ NO → 403 Forbidden
```

---

## Connections Transformation

### Old Format (Implicit)
```json
{
  "connections": {}
}
```

### New Format (Explicit)
```json
{
  "connections": {
    "validate_tenant": {
      "main": [[{ "node": "validate_input", "type": "main", "index": 0 }]]
    },
    "validate_input": {
      "main": [[{ "node": "fetch_asset", "type": "main", "index": 0 }]]
    },
    "fetch_asset": {
      "main": [[{ "node": "check_asset_exists", "type": "main", "index": 0 }]]
    },
    "check_asset_exists": {
      "main": [
        [{ "node": "extract_info", "type": "main", "index": 0 }],
        [{ "node": "error_not_found", "type": "main", "index": 0 }]
      ]
    }
  }
}
```

### Structure Explanation

```
connections: {
  [sourceNodeId]: {
    main: [
      [
        { node: "[targetNodeId]", type: "main", index: 0 }
      ]
    ]
  }
}
```

### Rules
- Source node id → outputs → connections
- `main` = standard output
- Array of arrays: outer = parallel paths, inner = sequential
- `index: 0` = first output stream from source

---

## Settings Transformation

### Old Settings (Minimal)
```json
{
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### New Settings (Complete)
```json
{
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 300,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "errorHandler": "log_and_fail",
    "retryPolicy": {
      "maxAttempts": 1,
      "backoffMs": 0
    },
    "dataRetention": {
      "daysToKeep": 7,
      "minSizeKb": 100
    },
    "variables": {
      "MAX_FILE_SIZE": "5GB",
      "SUPPORTED_FORMATS": ["jpeg", "png", "gif", "webp"],
      "TIMEOUT_MS": 300000
    }
  }
}
```

### Timeout Tuning by Workflow Type

| Workflow Type | Timeout | Rationale |
|---------------|---------|-----------|
| Extract Image | 300s | Image processing (1-10s typical) |
| Extract Video | 600s | FFmpeg can be slow (10-120s typical) |
| List Media | 30s | Database query (100-500ms typical) |
| Delete Media | 120s | File I/O operations (1-5s typical) |

### Retry Policy

**Standard for all workflows**:
```json
{
  "retryPolicy": {
    "maxAttempts": 1,
    "backoffMs": 0
  }
}
```

Reason: Media operations are idempotent after first execution; retrying could cause issues.

### Data Retention

**By workflow type**:

| Type | Days | Min Size | Reason |
|------|------|----------|--------|
| Extract Image | 7 | 100 KB | Audit trail for metadata |
| Extract Video | 7 | 500 KB | Audit trail for FFmpeg output |
| List Media | 1 | 10 KB | High-volume query logs |
| Delete Media | 90 | 1 KB | Compliance audit trail |

---

## Meta Object Pattern

### Image/Video Extraction
```json
{
  "meta": {
    "category": "media",
    "author": "MetaBuilder",
    "source": "media_center",
    "supportedFormats": ["jpeg", "png", "gif", "webp"],
    "maxFileSize": "5GB",
    "performanceClass": "standard"
  }
}
```

### List Media
```json
{
  "meta": {
    "category": "media",
    "author": "MetaBuilder",
    "source": "media_center",
    "performanceClass": "fast",
    "rateLimit": "100 requests/min"
  }
}
```

### Delete Media
```json
{
  "meta": {
    "category": "media",
    "author": "MetaBuilder",
    "source": "media_center",
    "destructive": true,
    "auditRequired": true,
    "performanceClass": "medium"
  }
}
```

---

## ID Naming Convention

### Format
```
wf_[workflow_name]_v[major_version]
```

### Examples
- `wf_extract_image_metadata_v1`
- `wf_extract_video_metadata_v1`
- `wf_list_user_media_v1`
- `wf_delete_media_v1`

### Version Bumping
- v1 → v2: Major workflow restructuring
- 1.0.0 → 1.1.0: New features (minor)
- 1.0.0 → 1.0.1: Bug fixes (patch)

---

## Tags Convention

### Standard Tags by Category
```
Extract: ["media", "image", "metadata", "extraction"]
Extract: ["media", "video", "metadata", "extraction", "ffmpeg"]
List: ["media", "list", "pagination", "query"]
Delete: ["media", "delete", "destructive", "authorization"]
```

### Tag Benefits
- Filtering in UI
- Categorization for analytics
- Audit trail filtering
- Performance tracking

---

## Parameter Expression Patterns

### Tenant Context
```
{{ $context.tenantId }}
```

### User Context
```
{{ $context.user.id }}
{{ $context.user.level }}
```

### Request Data
```
{{ $json.assetId }}
{{ $json.page }}
```

### Step Output
```
{{ $steps.fetch_asset.output }}
{{ $steps.extract_info.output.width }}
```

### Conditionals
```
{{ $steps.fetch_asset.output !== null ? "found" : "not_found" }}
{{ $context.user.level >= 3 ? "admin" : "user" }}
```

### Array Operations
```
{{ Object.entries($steps.build_filter.output).reduce((acc, [key, value]) => {
  if (value !== null && value !== undefined) acc[key] = value;
  return acc;
}, {}) }}
```

---

## Validation Checklist (Quick)

### Per Workflow
- [ ] Root `id` matches naming convention
- [ ] `versionId` is semantic (`X.Y.Z`)
- [ ] First node validates `tenantId`
- [ ] All database operations filter by `tenantId`
- [ ] Authorization checks before destructive ops
- [ ] `executionTimeout` tuned for operation type
- [ ] All connections explicit (no empty `{}`)
- [ ] All node types registered in executor
- [ ] No circular connections
- [ ] Meta fields complete
- [ ] Settings.variables document configuration

### Global
- [ ] All 4 workflows follow same patterns
- [ ] Consistent naming conventions
- [ ] Consistent error handling
- [ ] Consistent multi-tenant filtering
- [ ] Build passes: `npm run build`
- [ ] Schema validation passes

---

## Common Mistakes & Fixes

### Mistake 1: Missing Tenant Validation

**Before**:
```json
{
  "nodes": [
    { "id": "validate_input", "type": "metabuilder.validate", ... }
  ]
}
```

**After**:
```json
{
  "nodes": [
    { "id": "validate_tenant", "type": "metabuilder.validate", ... },
    { "id": "validate_input", "type": "metabuilder.validate", ... }
  ]
}
```

### Mistake 2: Database Query Without tenantId Filter

**Before**:
```json
{
  "filter": {
    "id": "{{ $json.id }}"
  }
}
```

**After**:
```json
{
  "filter": {
    "id": "{{ $json.id }}",
    "tenantId": "{{ $context.tenantId }}"
  }
}
```

### Mistake 3: Empty Connections Object

**Before**:
```json
{
  "connections": {}
}
```

**After**:
```json
{
  "connections": {
    "validate_tenant": {
      "main": [[{ "node": "validate_input", "type": "main", "index": 0 }]]
    },
    ...
  }
}
```

### Mistake 4: Generic timeout for all workflows

**Before**:
```json
{
  "settings": {
    "executionTimeout": 3600
  }
}
```

**After**:
```json
{
  "settings": {
    "executionTimeout": 300  // Image: 5 min
    "executionTimeout": 600  // Video: 10 min
    "executionTimeout": 30   // List: 30 sec
    "executionTimeout": 120  // Delete: 2 min
  }
}
```

---

## Testing Transformation

### Pre-Migration Test
```bash
npm run validate:workflows -- /packages/media_center/workflow/*.json
```

Expected: All validations fail (missing fields)

### Post-Migration Test
```bash
npm run validate:workflows -- /packages/media_center/workflow/*.json
```

Expected: All validations pass

### Multi-Tenant Audit
```bash
npm run audit:multi-tenant -- /packages/media_center/workflow/*.json
```

Expected:
- Entry point validates tenantId
- All DB queries filter by tenantId
- No cross-tenant data possible

---

## Scripts & Automation

### Validate Single Workflow
```bash
jq . /packages/media_center/workflow/extract-image-metadata.json
```

### Validate All Workflows
```bash
for file in /packages/media_center/workflow/*.json; do
  echo "Validating: $file"
  jq . "$file" > /dev/null || echo "ERROR: Invalid JSON in $file"
done
```

### Check for Missing Fields
```bash
jq -r '.id' /packages/media_center/workflow/*.json
```

Should output: `wf_extract_image_metadata_v1`, `wf_extract_video_metadata_v1`, etc.

---

## Migration Workflow (One Workflow Example)

### Step 1: Copy Template
```bash
cp /packages/media_center/workflow/extract-image-metadata.json \
   /packages/media_center/workflow/extract-image-metadata.json.backup
```

### Step 2: Add Root Fields
Edit JSON to add: `id`, `versionId`, `description`, `tenantId`, `deployedAt`, timestamps, `tags`, enhance `meta`, expand `settings`

### Step 3: Add Tenant Validation Node
Insert new node at start, shift positions

### Step 4: Update All Node Fields
Add `disabled`, `notes`, `continueOnFail` to each node

### Step 5: Add Explicit Connections
Replace `{}` with full node adjacency map

### Step 6: Validate
```bash
npm run validate:workflows -- extract-image-metadata.json
npm run audit:multi-tenant -- extract-image-metadata.json
```

### Step 7: Test
```bash
npm run test:workflow -- extract-image-metadata.json
```

### Step 8: Review
```bash
git diff /packages/media_center/workflow/extract-image-metadata.json
```

---

**Status**: Ready to Apply
**Estimated Time per Workflow**: 30-45 minutes
**Total Time for 4 Workflows**: 2-3 hours initial, plus 1-2 hours testing
