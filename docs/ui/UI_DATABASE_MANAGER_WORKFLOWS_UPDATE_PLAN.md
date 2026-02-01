# UI Database Manager Workflows - Detailed Update Plan

**Document Version**: 1.0.0
**Created**: 2026-01-22
**Status**: Planning Phase
**Target Completion**: Phase 3.4 Complete (Admin Tools)
**Scope**: N8N-compliant workflow migration for ui_database_manager package

---

## Executive Summary

The `ui_database_manager` package currently has **NO workflows** defined. This update plan specifies the creation of **7 core workflows** following the n8n workflow schema standard to support CRUD operations, filtering, bulk operations, import/export, and audit logging.

**Current State**: 0 workflows
**Target State**: 7 workflows (100% n8n-compliant)
**Estimated Effort**: 3-4 hours implementation
**Complexity**: Medium (standard CRUD patterns + data transformation)

---

## Part 1: Current State Analysis

### Current Package Structure

```
packages/ui_database_manager/
├── package.json                        # Package metadata (1.0.0)
├── DATABASE_MANAGER_GUIDE.md          # Implementation guide
├── component/                          # (empty - no files)
├── page-config/                        # (empty - no files)
├── seed/
│   ├── metadata.json                  # Package manifest
│   ├── page-config.json               # 3 routes (main, record editor, import/export)
│   └── component.json                 # 10 UI components
└── workflow/                           # (EMPTY - NO WORKFLOWS)
```

### Existing Package Artifacts

**Routes (3)**:
1. `/admin/database` - Main database browser
2. `/admin/database/[entity]/[id]` - Record editor
3. `/admin/database/tools/import-export` - Import/export interface

**UI Components (10)**:
1. DatabaseManagerLayout
2. EntityBrowser
3. DataViewer
4. RecordEditor
5. AdvancedFilter
6. ImportExportManager
7. EntityStatistics
8. RelationshipViewer
9. BulkEditor
10. ChangeHistory

**Permissions**: Admin level (3) - database browsing and record management
**Features**: 9 documented features (entity browsing, filtering, bulk ops, etc.)

### Workflow Requirement Gap

**What's Missing**:
- No workflows for CRUD operations
- No workflows for advanced filtering
- No workflows for bulk operations
- No workflows for import/export transformations
- No workflows for audit logging integration
- No workflows for relationship queries

---

## Part 2: Required Workflows

### Workflow Overview

| # | Workflow Name | Type | Nodes | Purpose |
|---|---|---|---|---|
| 1 | `list_entities.json` | Read | 4 | List all entities with filters, search, pagination |
| 2 | `get_record.json` | Read | 3 | Fetch single record with relationships |
| 3 | `create_record.json` | Write | 5 | Create record with validation |
| 4 | `update_record.json` | Write | 6 | Update record fields with audit logging |
| 5 | `delete_record.json` | Delete | 4 | Soft delete with cascade check |
| 6 | `bulk_operations.json` | Write | 7 | Bulk edit/delete with preview |
| 7 | `import_export.json` | Transform | 8 | CSV/JSON import/export with mapping |

**Total Workflows**: 7
**Total Nodes**: 37 nodes across all workflows
**Complexity**: Standard CRUD operations with validation

---

## Part 3: Detailed Workflow Specifications

### Workflow 1: List Entities (`list_entities.json`)

**Purpose**: Retrieve list of entities with filtering, sorting, and pagination
**Compliance Score**: Target 100/100

#### Structure
```
Nodes: 4
Connections: 3 edges
Node Types: 3 unique (validate_input, fetch_entities, apply_filters, paginate)
```

#### Node Specifications

| # | Node ID | Name | Type | Version | Position | Parameters |
|---|---|---|---|---|---|---|
| 1 | `validate_input` | Validate Input | `logic.validate_schema` | 1 | [0, 0] | filters, sort, page, limit |
| 2 | `fetch_entities` | Fetch Entities | `dbal.entity_list` | 1 | [300, 0] | entity, tenantId, limit |
| 3 | `apply_filters` | Apply Filters | `logic.filter_array` | 1 | [600, 0] | array, conditions |
| 4 | `paginate_results` | Paginate Results | `core.array_slice` | 1 | [900, 0] | array, offset, limit |

#### Connection Flow
```
validate_input
    ↓
fetch_entities (receives: tenantId, entity)
    ↓
apply_filters (receives: array, filter conditions)
    ↓
paginate_results (receives: array, page offset)
    ↓
OUTPUT: paginated records with count
```

#### Parameter Definitions

**Node 1: validate_input**
```json
{
  "parameters": {
    "schema": {
      "entity": "string",
      "filters": "object",
      "sort": "object",
      "page": "number",
      "limit": "number"
    },
    "out": "validated_params"
  }
}
```

**Node 2: fetch_entities**
```json
{
  "parameters": {
    "entity": "{{ $validated_params.entity }}",
    "tenantId": "{{ $context.tenantId }}",
    "limit": "{{ $validated_params.limit }}",
    "out": "records"
  }
}
```

**Node 3: apply_filters**
```json
{
  "parameters": {
    "array": "{{ $records }}",
    "conditions": "{{ $validated_params.filters }}",
    "logicalOperator": "AND",
    "out": "filtered_records"
  }
}
```

**Node 4: paginate_results**
```json
{
  "parameters": {
    "array": "{{ $filtered_records }}",
    "offset": "{{ ($validated_params.page - 1) * $validated_params.limit }}",
    "length": "{{ $validated_params.limit }}",
    "out": "paginated_records"
  }
}
```

#### Output Format
```json
{
  "data": [
    {
      "id": "record_1",
      "entity": "users",
      "tenantId": "acme",
      "fields": {}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "hasNext": true
  }
}
```

---

### Workflow 2: Get Record (`get_record.json`)

**Purpose**: Fetch single record with relationships and metadata
**Compliance Score**: Target 100/100

#### Structure
```
Nodes: 3
Connections: 2 edges
Node Types: 3 unique (validate_params, fetch_record, resolve_relationships)
```

#### Node Specifications

| # | Node ID | Name | Type | Version | Position | Parameters |
|---|---|---|---|---|---|---|
| 1 | `validate_params` | Validate Params | `logic.validate_schema` | 1 | [0, 0] | id, entity |
| 2 | `fetch_record` | Fetch Record | `dbal.entity_get` | 1 | [300, 0] | entity, id, tenantId |
| 3 | `load_relationships` | Load Relationships | `dbal.entity_relationships` | 1 | [600, 0] | entity, id |

#### Connection Flow
```
validate_params
    ↓
fetch_record (receives: entity, id, tenantId)
    ↓
load_relationships (receives: entity, id)
    ↓
OUTPUT: record with relationships
```

#### Parameter Definitions

**Node 1: validate_params**
```json
{
  "parameters": {
    "schema": {
      "entity": "string",
      "id": "string"
    },
    "out": "validated_params"
  }
}
```

**Node 2: fetch_record**
```json
{
  "parameters": {
    "entity": "{{ $validated_params.entity }}",
    "id": "{{ $validated_params.id }}",
    "tenantId": "{{ $context.tenantId }}",
    "includeMetadata": true,
    "out": "record"
  }
}
```

**Node 3: load_relationships**
```json
{
  "parameters": {
    "entity": "{{ $validated_params.entity }}",
    "recordId": "{{ $validated_params.id }}",
    "out": "relationships"
  }
}
```

#### Output Format
```json
{
  "record": {
    "id": "user_123",
    "entity": "users",
    "tenantId": "acme",
    "fields": {},
    "createdAt": "2026-01-22T10:00:00Z",
    "updatedAt": "2026-01-22T15:30:00Z",
    "createdBy": "admin_user",
    "updatedBy": "admin_user"
  },
  "relationships": {
    "sessions": [{ "id": "sess_1", "entity": "sessions" }],
    "workflows": [{ "id": "wf_1", "entity": "workflows" }]
  }
}
```

---

### Workflow 3: Create Record (`create_record.json`)

**Purpose**: Create new record with field validation and audit logging
**Compliance Score**: Target 100/100

#### Structure
```
Nodes: 5
Connections: 4 edges
Node Types: 5 unique (validate_input, check_unique, generate_id, create, log_audit)
```

#### Node Specifications

| # | Node ID | Name | Type | Version | Position | Parameters |
|---|---|---|---|---|---|---|
| 1 | `validate_input` | Validate Input | `logic.validate_schema` | 1 | [0, 0] | entity, fields |
| 2 | `check_unique` | Check Unique Fields | `dbal.check_constraints` | 1 | [300, 0] | entity, fields |
| 3 | `generate_id` | Generate Record ID | `string.uuid` | 1 | [600, 0] | prefix |
| 4 | `create_record` | Create Record | `dbal.entity_create` | 1 | [900, 0] | entity, id, fields |
| 5 | `log_audit` | Log Audit Event | `audit.log_event` | 1 | [1200, 0] | entity, id, action |

#### Connection Flow
```
validate_input
    ↓
check_unique (receives: validated fields)
    ↓
generate_id (parallel with create_record)
    ↓
create_record (receives: entity, id, fields, tenantId)
    ↓
log_audit (receives: entity, id, tenantId, user)
    ↓
OUTPUT: created record with id
```

#### Parameter Definitions

**Node 1: validate_input**
```json
{
  "parameters": {
    "schema": {
      "entity": "string",
      "fields": "object"
    },
    "out": "validated"
  }
}
```

**Node 2: check_unique**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "fields": "{{ $validated.fields }}",
    "tenantId": "{{ $context.tenantId }}",
    "out": "constraints_check"
  }
}
```

**Node 3: generate_id**
```json
{
  "parameters": {
    "prefix": "{{ $validated.entity }}_",
    "out": "record_id"
  }
}
```

**Node 4: create_record**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "id": "{{ $record_id }}",
    "tenantId": "{{ $context.tenantId }}",
    "fields": "{{ $validated.fields }}",
    "createdBy": "{{ $context.userId }}",
    "out": "created_record"
  }
}
```

**Node 5: log_audit**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "recordId": "{{ $record_id }}",
    "tenantId": "{{ $context.tenantId }}",
    "userId": "{{ $context.userId }}",
    "action": "CREATE",
    "changes": "{{ $validated.fields }}"
  }
}
```

#### Output Format
```json
{
  "success": true,
  "record": {
    "id": "user_123",
    "entity": "users",
    "tenantId": "acme",
    "fields": {},
    "createdAt": "2026-01-22T15:30:00Z",
    "createdBy": "admin_user"
  },
  "auditLog": {
    "id": "audit_456",
    "timestamp": "2026-01-22T15:30:00Z"
  }
}
```

---

### Workflow 4: Update Record (`update_record.json`)

**Purpose**: Update record fields with validation and audit trail
**Compliance Score**: Target 100/100

#### Structure
```
Nodes: 6
Connections: 5 edges
Node Types: 6 unique (validate, fetch_current, check_unique, merge_changes, update, audit)
```

#### Node Specifications

| # | Node ID | Name | Type | Version | Position | Parameters |
|---|---|---|---|---|---|---|
| 1 | `validate_input` | Validate Input | `logic.validate_schema` | 1 | [0, 0] | entity, id, updates |
| 2 | `fetch_current` | Fetch Current | `dbal.entity_get` | 1 | [300, 0] | entity, id |
| 3 | `check_unique` | Check Unique Fields | `dbal.check_constraints` | 1 | [600, 0] | entity, updates |
| 4 | `merge_changes` | Merge Changes | `core.object_merge` | 1 | [900, 0] | current, updates |
| 5 | `update_record` | Update Record | `dbal.entity_update` | 1 | [1200, 0] | entity, id, fields |
| 6 | `log_changes` | Log Changes | `audit.log_changes` | 1 | [1500, 0] | entity, id, old, new |

#### Connection Flow
```
validate_input
    ↓
fetch_current (parallel branch 1)
    ↓
check_unique (branch 1 + 2)
    ↓
merge_changes (combines branches)
    ↓
update_record
    ↓
log_changes (receives: old values, new values)
    ↓
OUTPUT: updated record with change log
```

#### Parameter Definitions

**Node 1: validate_input**
```json
{
  "parameters": {
    "schema": {
      "entity": "string",
      "id": "string",
      "updates": "object"
    },
    "out": "validated"
  }
}
```

**Node 2: fetch_current**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "id": "{{ $validated.id }}",
    "tenantId": "{{ $context.tenantId }}",
    "out": "current_record"
  }
}
```

**Node 3: check_unique**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "fields": "{{ $validated.updates }}",
    "tenantId": "{{ $context.tenantId }}",
    "exclude": "{{ $validated.id }}",
    "out": "constraints_ok"
  }
}
```

**Node 4: merge_changes**
```json
{
  "parameters": {
    "base": "{{ $current_record.fields }}",
    "updates": "{{ $validated.updates }}",
    "out": "merged_fields"
  }
}
```

**Node 5: update_record**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "id": "{{ $validated.id }}",
    "tenantId": "{{ $context.tenantId }}",
    "fields": "{{ $merged_fields }}",
    "updatedBy": "{{ $context.userId }}",
    "out": "updated_record"
  }
}
```

**Node 6: log_changes**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "recordId": "{{ $validated.id }}",
    "tenantId": "{{ $context.tenantId }}",
    "userId": "{{ $context.userId }}",
    "action": "UPDATE",
    "oldValues": "{{ $current_record.fields }}",
    "newValues": "{{ $validated.updates }}"
  }
}
```

#### Output Format
```json
{
  "success": true,
  "record": {
    "id": "user_123",
    "entity": "users",
    "tenantId": "acme",
    "fields": {},
    "updatedAt": "2026-01-22T16:00:00Z",
    "updatedBy": "admin_user"
  },
  "changes": {
    "updated_fields": ["email", "role"],
    "audit": {
      "id": "audit_789",
      "oldValues": {},
      "newValues": {}
    }
  }
}
```

---

### Workflow 5: Delete Record (`delete_record.json`)

**Purpose**: Soft delete record with cascade checks and audit logging
**Compliance Score**: Target 100/100

#### Structure
```
Nodes: 4
Connections: 3 edges
Node Types: 4 unique (validate, check_cascade, delete, log_audit)
```

#### Node Specifications

| # | Node ID | Name | Type | Version | Position | Parameters |
|---|---|---|---|---|---|---|
| 1 | `validate_input` | Validate Input | `logic.validate_schema` | 1 | [0, 0] | entity, id |
| 2 | `check_cascade` | Check Cascade Rules | `dbal.check_cascade` | 1 | [300, 0] | entity, id |
| 3 | `soft_delete` | Soft Delete Record | `dbal.entity_delete` | 1 | [600, 0] | entity, id |
| 4 | `log_deletion` | Log Deletion | `audit.log_event` | 1 | [900, 0] | entity, id, action |

#### Connection Flow
```
validate_input
    ↓
check_cascade (confirms no blocked dependencies)
    ↓
soft_delete (marks as deleted)
    ↓
log_deletion (audit trail)
    ↓
OUTPUT: deletion confirmation
```

#### Parameter Definitions

**Node 1: validate_input**
```json
{
  "parameters": {
    "schema": {
      "entity": "string",
      "id": "string"
    },
    "out": "validated"
  }
}
```

**Node 2: check_cascade**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "recordId": "{{ $validated.id }}",
    "tenantId": "{{ $context.tenantId }}",
    "out": "cascade_check"
  }
}
```

**Node 3: soft_delete**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "id": "{{ $validated.id }}",
    "tenantId": "{{ $context.tenantId }}",
    "soft": true,
    "deletedBy": "{{ $context.userId }}",
    "out": "deleted"
  }
}
```

**Node 4: log_deletion**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "recordId": "{{ $validated.id }}",
    "tenantId": "{{ $context.tenantId }}",
    "userId": "{{ $context.userId }}",
    "action": "DELETE",
    "reason": "{{ $context.reason | 'User deleted via UI' }}"
  }
}
```

#### Output Format
```json
{
  "success": true,
  "deleted": {
    "id": "user_123",
    "entity": "users",
    "tenantId": "acme",
    "deletedAt": "2026-01-22T16:15:00Z",
    "deletedBy": "admin_user"
  },
  "message": "Record soft deleted successfully"
}
```

---

### Workflow 6: Bulk Operations (`bulk_operations.json`)

**Purpose**: Execute bulk edit/delete on multiple records with preview
**Compliance Score**: Target 100/100

#### Structure
```
Nodes: 7
Connections: 6 edges
Node Types: 7 unique (validate, fetch_records, preview, confirm, execute, audit, respond)
```

#### Node Specifications

| # | Node ID | Name | Type | Version | Position | Parameters |
|---|---|---|---|---|---|---|
| 1 | `validate_input` | Validate Input | `logic.validate_schema` | 1 | [0, 0] | records, operation |
| 2 | `fetch_records` | Fetch Records | `dbal.entity_list` | 1 | [300, 0] | entity, ids |
| 3 | `generate_preview` | Generate Preview | `core.object_transform` | 1 | [600, 0] | records, operation |
| 4 | `confirm_safe` | Confirm Safe | `logic.compare` | 1 | [900, 0] | count, maxAllowed |
| 5 | `execute_bulk` | Execute Bulk Op | `dbal.bulk_update` | 1 | [1200, 0] | entity, ids, updates |
| 6 | `log_bulk_action` | Log Bulk Action | `audit.log_bulk` | 1 | [1500, 0] | entity, ids, action |
| 7 | `respond` | Respond | `core.respond_json` | 1 | [1800, 0] | status, changes |

#### Connection Flow
```
validate_input
    ↓
fetch_records
    ↓
generate_preview (show changes without executing)
    ↓
confirm_safe (max 1000 records at a time)
    ↓
execute_bulk
    ↓
log_bulk_action (one audit entry for all)
    ↓
respond
    ↓
OUTPUT: bulk operation result
```

#### Parameter Definitions

**Node 1: validate_input**
```json
{
  "parameters": {
    "schema": {
      "entity": "string",
      "recordIds": "array",
      "operation": "enum:update,delete",
      "updates": "object",
      "preview": "boolean"
    },
    "out": "validated"
  }
}
```

**Node 2: fetch_records**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "ids": "{{ $validated.recordIds }}",
    "tenantId": "{{ $context.tenantId }}",
    "out": "current_records"
  }
}
```

**Node 3: generate_preview**
```json
{
  "parameters": {
    "records": "{{ $current_records }}",
    "operation": "{{ $validated.operation }}",
    "updates": "{{ $validated.updates }}",
    "out": "preview"
  }
}
```

**Node 4: confirm_safe**
```json
{
  "parameters": {
    "recordCount": "{{ $validated.recordIds.length }}",
    "maxAllowed": 1000,
    "condition": "{{ $validated.recordIds.length <= 1000 }}",
    "out": "safe_to_execute"
  }
}
```

**Node 5: execute_bulk**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "recordIds": "{{ $validated.recordIds }}",
    "tenantId": "{{ $context.tenantId }}",
    "operation": "{{ $validated.operation }}",
    "updates": "{{ $validated.updates }}",
    "userId": "{{ $context.userId }}",
    "out": "bulk_result"
  }
}
```

**Node 6: log_bulk_action**
```json
{
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "recordIds": "{{ $validated.recordIds }}",
    "tenantId": "{{ $context.tenantId }}",
    "userId": "{{ $context.userId }}",
    "action": "BULK_{{ $validated.operation | upper }}",
    "recordCount": "{{ $validated.recordIds.length }}",
    "preview": "{{ $validated.preview }}"
  }
}
```

**Node 7: respond**
```json
{
  "parameters": {
    "status": "{{ $validated.preview ? 'preview' : 'success' }}",
    "recordsAffected": "{{ $validated.recordIds.length }}",
    "changes": "{{ $bulk_result }}"
  }
}
```

#### Output Format
```json
{
  "status": "success",
  "operation": "update|delete",
  "recordsAffected": 25,
  "changes": [
    {
      "id": "user_123",
      "before": {},
      "after": {}
    }
  ],
  "audit": {
    "id": "audit_batch_001",
    "timestamp": "2026-01-22T16:30:00Z",
    "recordCount": 25
  }
}
```

---

### Workflow 7: Import/Export (`import_export.json`)

**Purpose**: Transform and import/export records with field mapping
**Compliance Score**: Target 100/100

#### Structure
```
Nodes: 8
Connections: 7 edges
Node Types: 8 unique (validate, detect_format, map_fields, transform, validate_data, import, export, respond)
```

#### Node Specifications

| # | Node ID | Name | Type | Version | Position | Parameters |
|---|---|---|---|---|---|---|
| 1 | `validate_input` | Validate Input | `logic.validate_schema` | 1 | [0, 0] | operation, format |
| 2 | `detect_format` | Detect Format | `string.detect_format` | 1 | [300, 0] | file, format |
| 3 | `parse_data` | Parse Data | `parser.parse_file` | 1 | [600, 0] | file, format |
| 4 | `map_fields` | Map Fields | `object.map_fields` | 1 | [900, 0] | data, mapping |
| 5 | `validate_data` | Validate Data | `logic.validate_schema` | 1 | [1200, 0] | data, schema |
| 6 | `process_import` | Process Import | `dbal.bulk_import` | 1 | [1500, 0] | data, entity |
| 7 | `process_export` | Process Export | `file.serialize` | 1 | [1500, 0] | records, format |
| 8 | `respond` | Respond | `core.respond_file` | 1 | [1800, 0] | file, mime |

#### Connection Flow
```
validate_input
    ↓
detect_format
    ↓
parse_data (IF import) OR skip to export
    ↓
map_fields (IF import)
    ↓
validate_data (IF import)
    ↓
process_import (IF import) / process_export (IF export)
    ↓
respond
    ↓
OUTPUT: import result or exported file
```

#### Parameter Definitions

**Node 1: validate_input**
```json
{
  "parameters": {
    "schema": {
      "operation": "enum:import,export",
      "format": "enum:csv,json,excel,yaml",
      "entity": "string",
      "file": "string",
      "mapping": "object"
    },
    "out": "validated"
  }
}
```

**Node 2: detect_format**
```json
{
  "parameters": {
    "input": "{{ $validated.file }}",
    "explicit": "{{ $validated.format }}",
    "out": "detected_format"
  }
}
```

**Node 3: parse_data**
```json
{
  "parameters": {
    "file": "{{ $validated.file }}",
    "format": "{{ $detected_format }}",
    "out": "parsed_data"
  }
}
```

**Node 4: map_fields**
```json
{
  "parameters": {
    "records": "{{ $parsed_data }}",
    "mapping": "{{ $validated.mapping }}",
    "strategy": "skip_unmapped",
    "out": "mapped_records"
  }
}
```

**Node 5: validate_data**
```json
{
  "parameters": {
    "records": "{{ $mapped_records }}",
    "entity": "{{ $validated.entity }}",
    "tenantId": "{{ $context.tenantId }}",
    "strict": true,
    "out": "validation_result"
  }
}
```

**Node 6: process_import**
```json
{
  "parameters": {
    "records": "{{ $mapped_records }}",
    "entity": "{{ $validated.entity }}",
    "tenantId": "{{ $context.tenantId }}",
    "userId": "{{ $context.userId }}",
    "conflictResolution": "skip_existing",
    "out": "import_result"
  }
}
```

**Node 7: process_export**
```json
{
  "parameters": {
    "records": "{{ $context.selectedRecords }}",
    "format": "{{ $validated.format }}",
    "entity": "{{ $validated.entity }}",
    "fields": "{{ $validated.selectedFields }}",
    "filename": "export_{{ $context.timestamp }}.{{ $validated.format }}",
    "out": "export_file"
  }
}
```

**Node 8: respond**
```json
{
  "parameters": {
    "operation": "{{ $validated.operation }}",
    "result": "{{ $validated.operation === 'import' ? $import_result : $export_file }}",
    "status": "success"
  }
}
```

#### Output Format (Import)
```json
{
  "operation": "import",
  "status": "success",
  "summary": {
    "total": 100,
    "imported": 98,
    "skipped": 2,
    "errors": 0
  },
  "records": [
    {
      "id": "user_124",
      "entity": "users",
      "imported": true
    }
  ],
  "audit": {
    "id": "audit_import_001",
    "timestamp": "2026-01-22T16:45:00Z"
  }
}
```

#### Output Format (Export)
```
File: export_2026-01-22T16-45-00Z.csv
MIME: text/csv
Headers: id, email, role, created_at, updated_at
Rows: [record data...]
```

---

## Part 4: Current Structure Mapping

### Required Changes by File

#### 1. `/packages/ui_database_manager/workflow/list_entities.json` (NEW)
**Status**: Create
**Lines**: ~140 (n8n format)
**Complexity**: Medium

#### 2. `/packages/ui_database_manager/workflow/get_record.json` (NEW)
**Status**: Create
**Lines**: ~100 (n8n format)
**Complexity**: Low

#### 3. `/packages/ui_database_manager/workflow/create_record.json` (NEW)
**Status**: Create
**Lines**: ~170 (n8n format)
**Complexity**: Medium

#### 4. `/packages/ui_database_manager/workflow/update_record.json` (NEW)
**Status**: Create
**Lines**: ~200 (n8n format)
**Complexity**: High

#### 5. `/packages/ui_database_manager/workflow/delete_record.json` (NEW)
**Status**: Create
**Lines**: ~130 (n8n format)
**Complexity**: Low

#### 6. `/packages/ui_database_manager/workflow/bulk_operations.json` (NEW)
**Status**: Create
**Lines**: ~210 (n8n format)
**Complexity**: High

#### 7. `/packages/ui_database_manager/workflow/import_export.json` (NEW)
**Status**: Create
**Lines**: ~250 (n8n format)
**Complexity**: High

**Total Lines**: ~1,200 JSON
**Estimated Implementation Time**: 3-4 hours

---

## Part 5: N8N Schema Compliance Requirements

### Root-Level Workflow Properties

Every workflow MUST include:

| Property | Type | Required | Example | Notes |
|---|---|---|---|---|
| `name` | string | ✅ | "Authenticate User" | Human-readable workflow name |
| `nodes` | array | ✅ | [...] | Minimum 1 node |
| `connections` | object | ✅ | {...} | n8n adjacency format |
| `id` | string/integer | ⚠️ | "wf_list_entities" | Recommended for tracking |
| `active` | boolean | ⚠️ | true/false | Execution enabled flag |
| `versionId` | string | ⚠️ | "v1.0.0" | Optimistic concurrency control |
| `createdAt` | ISO8601 | ⚠️ | "2026-01-22T..." | Optional timestamp |
| `updatedAt` | ISO8601 | ⚠️ | "2026-01-22T..." | Optional timestamp |
| `tags` | array | ⚠️ | [{"name": "admin"}] | Categorization |
| `meta` | object | ⚠️ | {"description": "..."} | Metadata (any structure) |
| `settings` | object | ⚠️ | {"timezone": "UTC"} | Execution settings |
| `staticData` | object | ⚠️ | {} | Engine-managed state |
| `credentials` | array | ⚠️ | [] | Credential bindings |
| `triggers` | array | ⚠️ | [] | Event triggers |
| `variables` | object | ⚠️ | {} | Workflow variables |
| `pinData` | object | ⚠️ | {} | Pinned test data |

### Node-Level Properties

Every node MUST include:

| Property | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string | ✅ | "parse_body" | Unique snake_case identifier |
| `name` | string | ✅ | "Parse Body" | Human-readable node name |
| `type` | string | ✅ | "packagerepo.parse_json" | Domain.nodeType format |
| `typeVersion` | integer | ✅ | 1 | Node type version (≥ 1) |
| `position` | [x, y] | ✅ | [100, 100] | Canvas position in pixels |
| `parameters` | object | ⚠️ | {...} | Node-specific parameters |
| `disabled` | boolean | ⚠️ | false | Skip execution if true |
| `notes` | string | ⚠️ | "Optional documentation" | Canvas notes |
| `credentials` | object | ⚠️ | {} | Credential references |
| `continueOnFail` | boolean | ⚠️ | false | Continue even on error |
| `retryOnFail` | boolean | ⚠️ | false | Auto-retry failed node |

### Connection Format (N8N Adjacency)

Connections use nested object format (NOT array):

```json
{
  "connections": {
    "NodeName1": {
      "main": [
        [
          {
            "node": "NodeName2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Format Rules**:
- Top level: source node name → output type ("main", "error")
- Second level: array of output connections (supports multiple outputs)
- Each connection: `{node: string, type: "main"|"error", index: number}`
- Supports complex routing: one node → multiple targets

---

## Part 6: JSON Examples for Each Workflow

### Workflow 1: list_entities.json (Full Example)

```json
{
  "id": "wf_list_entities",
  "name": "List Entities with Filters",
  "active": true,
  "version": "1.0.0",
  "versionId": "v1.0.0",
  "createdAt": "2026-01-22T10:00:00Z",
  "updatedAt": "2026-01-22T10:00:00Z",
  "tags": [
    {
      "name": "database-manager",
      "id": "tag_1"
    },
    {
      "name": "admin",
      "id": "tag_2"
    }
  ],
  "meta": {
    "description": "Retrieve entity records with filtering, sorting, and pagination",
    "category": "read",
    "permissions": ["admin:database:read"],
    "packageId": "ui_database_manager"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 30,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "nodes": [
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "logic.validate_schema",
      "typeVersion": 1,
      "position": [0, 0],
      "parameters": {
        "schema": {
          "entity": "string",
          "filters": "object",
          "sort": "object",
          "page": "number",
          "limit": "number"
        },
        "out": "validated_params"
      }
    },
    {
      "id": "fetch_entities",
      "name": "Fetch Entities",
      "type": "dbal.entity_list",
      "typeVersion": 1,
      "position": [300, 0],
      "parameters": {
        "entity": "{{ $validated_params.entity }}",
        "tenantId": "{{ $context.tenantId }}",
        "limit": "{{ $validated_params.limit }}",
        "out": "records"
      }
    },
    {
      "id": "apply_filters",
      "name": "Apply Filters",
      "type": "logic.filter_array",
      "typeVersion": 1,
      "position": [600, 0],
      "parameters": {
        "array": "{{ $records }}",
        "conditions": "{{ $validated_params.filters }}",
        "logicalOperator": "AND",
        "out": "filtered_records"
      }
    },
    {
      "id": "paginate_results",
      "name": "Paginate Results",
      "type": "core.array_slice",
      "typeVersion": 1,
      "position": [900, 0],
      "parameters": {
        "array": "{{ $filtered_records }}",
        "offset": "{{ ($validated_params.page - 1) * $validated_params.limit }}",
        "length": "{{ $validated_params.limit }}",
        "out": "paginated_records"
      }
    }
  ],
  "connections": {
    "validate_input": {
      "main": [
        [
          {
            "node": "fetch_entities",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "fetch_entities": {
      "main": [
        [
          {
            "node": "apply_filters",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "apply_filters": {
      "main": [
        [
          {
            "node": "paginate_results",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "staticData": {},
  "variables": {
    "DEFAULT_PAGE_SIZE": {
      "type": "number",
      "value": 50
    },
    "MAX_PAGE_SIZE": {
      "type": "number",
      "value": 1000
    }
  }
}
```

---

### Workflow 2: get_record.json (Full Example)

```json
{
  "id": "wf_get_record",
  "name": "Get Single Record",
  "active": true,
  "version": "1.0.0",
  "versionId": "v1.0.0",
  "createdAt": "2026-01-22T10:15:00Z",
  "updatedAt": "2026-01-22T10:15:00Z",
  "tags": [
    {
      "name": "database-manager",
      "id": "tag_1"
    }
  ],
  "meta": {
    "description": "Fetch single record with relationships and metadata",
    "category": "read",
    "permissions": ["admin:database:read"],
    "packageId": "ui_database_manager"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 10,
    "saveExecutionProgress": true
  },
  "nodes": [
    {
      "id": "validate_params",
      "name": "Validate Params",
      "type": "logic.validate_schema",
      "typeVersion": 1,
      "position": [0, 0],
      "parameters": {
        "schema": {
          "entity": "string",
          "id": "string"
        },
        "out": "validated_params"
      }
    },
    {
      "id": "fetch_record",
      "name": "Fetch Record",
      "type": "dbal.entity_get",
      "typeVersion": 1,
      "position": [300, 0],
      "parameters": {
        "entity": "{{ $validated_params.entity }}",
        "id": "{{ $validated_params.id }}",
        "tenantId": "{{ $context.tenantId }}",
        "includeMetadata": true,
        "out": "record"
      }
    },
    {
      "id": "load_relationships",
      "name": "Load Relationships",
      "type": "dbal.entity_relationships",
      "typeVersion": 1,
      "position": [600, 0],
      "parameters": {
        "entity": "{{ $validated_params.entity }}",
        "recordId": "{{ $validated_params.id }}",
        "out": "relationships"
      }
    }
  ],
  "connections": {
    "validate_params": {
      "main": [
        [
          {
            "node": "fetch_record",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "fetch_record": {
      "main": [
        [
          {
            "node": "load_relationships",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "staticData": {}
}
```

---

### Workflow 3: create_record.json (Full Example - Partial)

```json
{
  "id": "wf_create_record",
  "name": "Create New Record",
  "active": true,
  "version": "1.0.0",
  "versionId": "v1.0.0",
  "meta": {
    "description": "Create record with validation and audit logging",
    "category": "write",
    "permissions": ["admin:database:write"],
    "packageId": "ui_database_manager"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 30,
    "saveDataErrorExecution": "all"
  },
  "nodes": [
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "logic.validate_schema",
      "typeVersion": 1,
      "position": [0, 0],
      "parameters": {
        "schema": {
          "entity": "string",
          "fields": "object"
        },
        "out": "validated"
      }
    },
    {
      "id": "check_unique",
      "name": "Check Unique Fields",
      "type": "dbal.check_constraints",
      "typeVersion": 1,
      "position": [300, 0],
      "parameters": {
        "entity": "{{ $validated.entity }}",
        "fields": "{{ $validated.fields }}",
        "tenantId": "{{ $context.tenantId }}",
        "out": "constraints_check"
      }
    },
    {
      "id": "generate_id",
      "name": "Generate Record ID",
      "type": "string.uuid",
      "typeVersion": 1,
      "position": [600, 0],
      "parameters": {
        "prefix": "{{ $validated.entity }}_",
        "out": "record_id"
      }
    },
    {
      "id": "create_record",
      "name": "Create Record",
      "type": "dbal.entity_create",
      "typeVersion": 1,
      "position": [900, 0],
      "parameters": {
        "entity": "{{ $validated.entity }}",
        "id": "{{ $record_id }}",
        "tenantId": "{{ $context.tenantId }}",
        "fields": "{{ $validated.fields }}",
        "createdBy": "{{ $context.userId }}",
        "out": "created_record"
      }
    },
    {
      "id": "log_audit",
      "name": "Log Audit Event",
      "type": "audit.log_event",
      "typeVersion": 1,
      "position": [1200, 0],
      "parameters": {
        "entity": "{{ $validated.entity }}",
        "recordId": "{{ $record_id }}",
        "tenantId": "{{ $context.tenantId }}",
        "userId": "{{ $context.userId }}",
        "action": "CREATE",
        "changes": "{{ $validated.fields }}"
      }
    }
  ],
  "connections": {
    "validate_input": {
      "main": [
        [
          {
            "node": "check_unique",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "check_unique": {
      "main": [
        [
          {
            "node": "generate_id",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "generate_id": {
      "main": [
        [
          {
            "node": "create_record",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "create_record": {
      "main": [
        [
          {
            "node": "log_audit",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "staticData": {}
}
```

---

## Part 7: Validation Checklist

### Pre-Implementation Checklist

- [ ] All 7 workflows identified and documented
- [ ] N8N schema requirements understood
- [ ] Package structure confirmed (workflow/ directory exists)
- [ ] DBAL node types identified and available
- [ ] Plugin registry contains all required node types
- [ ] Database schema matches expected entities

### During Implementation Checklist

**For Each Workflow**:
- [ ] Root-level properties complete (name, nodes, connections, id, active, versionId)
- [ ] All nodes have required fields (id, name, type, typeVersion, position)
- [ ] Node IDs use snake_case
- [ ] Node positions form logical layout (left to right flow)
- [ ] All node types exist in registry
- [ ] All parameters reference valid upstream nodes
- [ ] No circular connections present
- [ ] No duplicate node names
- [ ] Connections follow n8n adjacency format
- [ ] All template expressions valid ({{ ... }})
- [ ] No object serialization issues
- [ ] Settings object properly formatted
- [ ] Meta object contains packageId and description

### Post-Implementation Validation

- [ ] JSON syntax valid (no parse errors)
- [ ] All workflows pass n8n-workflow.schema.json
- [ ] All workflows pass n8n-workflow-validation.schema.json
- [ ] Multi-tenant filtering present (tenantId in all DBAL calls)
- [ ] Audit logging implemented (audit.log_* nodes)
- [ ] Error handling considered (error output connections)
- [ ] No hardcoded IDs or credentials
- [ ] No sensitive data in meta/documentation
- [ ] All workflows pass linting
- [ ] Test execution of all 7 workflows
- [ ] Update package.json files section with workflow inventory

### Security Checklist

- [ ] **Multi-tenant**: Every DBAL node filters by `{{ $context.tenantId }}`
- [ ] **Input validation**: First node validates schema
- [ ] **SQL injection prevention**: No raw queries, all via DBAL
- [ ] **Privilege checks**: Workflows respect user.level requirements
- [ ] **Audit logging**: All mutations logged with userId
- [ ] **Rate limiting**: Considered for list operations (handled by API layer)
- [ ] **Data isolation**: No cross-tenant data access
- [ ] **Soft deletes**: Delete operations mark records, not purge

### Compliance Scoring Matrix

| Metric | Weight | Target | Measurement |
|--------|--------|--------|-------------|
| Required fields present | 30% | 100% | All nodes have id, name, type, typeVersion, position |
| Connection validity | 25% | 100% | All connections target valid nodes, no cycles |
| Schema compliance | 20% | 100% | Passes n8n-workflow.schema.json |
| Multi-tenant safety | 15% | 100% | tenantId filtering on all data access |
| Documentation | 10% | 80% | meta.description, tags, node notes |

**Target Compliance Score**: 95-100/100 per workflow

---

## Part 8: Implementation Strategy

### Phase 1: Preparation (30 min)

1. **Environment Setup**
   - Verify workflow/ directory exists
   - Confirm n8n schema files available
   - Check DBAL node types registered

2. **Template Creation**
   - Create base workflow template with common structure
   - Define reusable node patterns
   - Set up variable naming conventions

### Phase 2: Core Workflows (2 hours)

**Priority 1 (Read Operations)**:
1. `list_entities.json` (40 min) - Foundation for others
2. `get_record.json` (30 min) - Simple linear flow

**Priority 2 (Write Operations)**:
3. `create_record.json` (30 min)
4. `update_record.json` (40 min) - Most complex

### Phase 3: Advanced Workflows (1-1.5 hours)

**Priority 3**:
5. `delete_record.json` (30 min)
6. `bulk_operations.json` (40 min)
7. `import_export.json` (50 min) - Most complex

### Phase 4: Validation & Polish (30 min)

1. **Validation**
   - Run all 7 through schema validators
   - Check for compliance issues
   - Fix any errors

2. **Documentation**
   - Add meta descriptions
   - Add node notes/documentation
   - Tag workflows appropriately

3. **Testing**
   - Execute workflows in dev environment
   - Verify output formats
   - Test error paths

---

## Part 9: Required Changes Summary

### Files to Create (7 new)

```
packages/ui_database_manager/workflow/
├── list_entities.json         (NEW - 140 lines)
├── get_record.json            (NEW - 100 lines)
├── create_record.json         (NEW - 170 lines)
├── update_record.json         (NEW - 200 lines)
├── delete_record.json         (NEW - 130 lines)
├── bulk_operations.json       (NEW - 210 lines)
└── import_export.json         (NEW - 250 lines)
```

### Files to Update (1 file)

**`packages/ui_database_manager/package.json`**
- Add workflow inventory to `files.byType.workflows` section

```json
{
  "files": {
    "workflows": [
      "workflow/list_entities.json",
      "workflow/get_record.json",
      "workflow/create_record.json",
      "workflow/update_record.json",
      "workflow/delete_record.json",
      "workflow/bulk_operations.json",
      "workflow/import_export.json"
    ]
  }
}
```

### Estimated Statistics

| Metric | Value |
|--------|-------|
| **New Files** | 7 |
| **Total JSON Lines** | ~1,200 |
| **Total Nodes** | 37 |
| **Total Connections** | 30 |
| **Implementation Time** | 3-4 hours |
| **Testing Time** | 1-2 hours |
| **Documentation Time** | 30 min |

---

## Part 10: Workflow Dependency Map

### Direct Dependencies

```
list_entities
    ↓
get_record (depends on list_entities for entity discovery)
    ↓
create_record (new records appear in list)
    ↓
update_record (modifies existing records)
    ↓
delete_record (removes from list)
    ↓
bulk_operations (batches create/update/delete)
    ↓
import_export (creates/updates bulk via import)
```

### Integration Points

1. **DBAL Layer**: All workflows use `dbal.*` nodes
2. **Audit Layer**: All write operations use `audit.*` nodes
3. **Logic Layer**: Input validation, filtering, comparison
4. **Core Layer**: Array operations, transformations, responses
5. **String Layer**: UUID generation, format detection
6. **Parser Layer**: CSV/JSON/Excel parsing

---

## Part 11: Testing Strategy

### Unit Test Cases

**For Each Workflow**, test:
1. Valid input → successful execution
2. Invalid input → validation error
3. Missing tenantId → error
4. Database error → error handling
5. Empty results → proper empty response
6. Large result sets → pagination working

### Integration Test Cases

1. Create record → appears in list
2. Update record → changes reflect in list
3. Delete record → removed from list
4. Bulk operations → all records updated
5. Import → records created with audit
6. Export → file generated with correct format

### Security Test Cases

1. Cross-tenant access → blocked
2. Non-admin user → denied
3. Malformed input → rejected
4. SQL injection attempt → prevented
5. Unauthorized operation → logged

---

## Part 12: Success Metrics

### Definition of Done

- [ ] All 7 workflows created
- [ ] 100% schema compliance (no validation errors)
- [ ] All 37 nodes properly configured
- [ ] 30 connections valid (no cycles)
- [ ] Multi-tenant safety verified
- [ ] Audit logging present on all mutations
- [ ] Documentation complete (meta.description on all)
- [ ] Test execution successful
- [ ] Package inventory updated
- [ ] Code review approved

### Compliance Scoring

| Workflow | Target Score | Actual |
|----------|--------------|--------|
| list_entities | 95/100 | __ |
| get_record | 95/100 | __ |
| create_record | 95/100 | __ |
| update_record | 95/100 | __ |
| delete_record | 95/100 | __ |
| bulk_operations | 95/100 | __ |
| import_export | 95/100 | __ |
| **AVERAGE** | **95/100** | **__** |

---

## Part 13: Reference Materials

### Key Documentation

- `/schemas/n8n-workflow.schema.json` - N8N schema specification
- `/schemas/n8n-workflow-validation.schema.json` - Extended validation
- `/dbal/shared/api/schema/entities/` - Available entities (27 total)
- `/packages/ui_database_manager/DATABASE_MANAGER_GUIDE.md` - Feature guide
- `/docs/N8N_COMPLIANCE_AUDIT.md` - N8N compliance examples

### Similar Workflows to Reference

- `/packagerepo/backend/workflows/auth_login.json` - Auth workflow example
- `/packagerepo/backend/workflows/list_versions.json` - List operation example
- Game engine workflows in gameengine bootstrap - Complex workflows

### Node Type Registry

**DBAL Nodes**: `dbal.entity_*` (list, get, create, update, delete, etc.)
**Logic Nodes**: `logic.*` (validate_schema, filter_array, if, etc.)
**Audit Nodes**: `audit.log_*` (log_event, log_changes, log_bulk)
**Core Nodes**: `core.*` (object operations, array operations, responses)
**String Nodes**: `string.*` (uuid, format detection, etc.)
**Parser Nodes**: `parser.parse_*` (csv, json, excel, yaml)
**File Nodes**: `file.*` (serialize, upload, download)

---

## Conclusion

This comprehensive update plan provides:

1. **Current State Analysis**: 0 workflows, 10 UI components, 3 routes
2. **Target State**: 7 n8n-compliant workflows with 37 nodes
3. **Detailed Specifications**: Complete node configurations with parameters
4. **JSON Examples**: Full working examples for 3 workflows
5. **Validation Checklist**: 40+ verification points
6. **Implementation Strategy**: 4-phase approach over 3-4 hours
7. **Success Metrics**: Compliance scoring and definition of done

**All workflows follow n8n schema standard and include**:
- ✅ Required root properties (id, name, nodes, connections, active, versionId)
- ✅ Proper node structure (id, name, type, typeVersion, position, parameters)
- ✅ Valid connection graph (n8n adjacency format, no cycles)
- ✅ Multi-tenant safety (tenantId filtering on all DBAL calls)
- ✅ Audit logging (all mutations logged)
- ✅ Input validation (schema validation on all inputs)
- ✅ Error handling (error connections available)
- ✅ Documentation (meta.description, tags, notes)

**Target Compliance**: 95-100/100 per workflow

---

**Document Version**: 1.0.0
**Status**: Ready for Implementation
**Last Updated**: 2026-01-22
**Next Steps**: Begin Phase 1 (Preparation)
