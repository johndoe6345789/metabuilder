# UI Database Manager Workflows - Quick Reference Guide

**Status**: Implementation Ready
**Date**: 2026-01-22
**Related Document**: `UI_DATABASE_MANAGER_WORKFLOWS_UPDATE_PLAN.md` (1,836 lines - comprehensive spec)

---

## At a Glance

| Metric | Value |
|--------|-------|
| Current Workflows | 0 |
| Target Workflows | 7 |
| Total Nodes | 37 |
| Total Connections | 30 |
| Implementation Time | 3-4 hours |
| Target Compliance | 95-100/100 |
| Files to Create | 7 JSON files |
| Files to Update | 1 package.json |

---

## The 7 Workflows

### 1. list_entities.json
**Type**: Read | **Nodes**: 4 | **Complexity**: Medium
- Validate input (entity, filters, sort, page, limit)
- Fetch from DBAL
- Apply filters (AND/OR logic)
- Paginate results (offset/limit)

**Key Pattern**: Linear sequential flow (4 nodes in a row)

### 2. get_record.json
**Type**: Read | **Nodes**: 3 | **Complexity**: Low
- Validate input (entity, id)
- Fetch single record
- Load relationships

**Key Pattern**: Simple lookup with join

### 3. create_record.json
**Type**: Write | **Nodes**: 5 | **Complexity**: Medium
- Validate input
- Check unique constraints
- Generate ID (UUID)
- Create record in DBAL
- Log audit event

**Key Pattern**: Validation → Constraints → Execute → Audit

### 4. update_record.json
**Type**: Write | **Nodes**: 6 | **Complexity**: High
- Validate input
- Fetch current record
- Check unique constraints
- Merge changes (old + new)
- Update record
- Log all changes

**Key Pattern**: Fetch → Validate → Merge → Execute → Audit

### 5. delete_record.json
**Type**: Delete | **Nodes**: 4 | **Complexity**: Low
- Validate input
- Check cascade rules (no blocked dependencies)
- Soft delete record
- Log deletion

**Key Pattern**: Safety checks → Execute → Audit

### 6. bulk_operations.json
**Type**: Write | **Nodes**: 7 | **Complexity**: High
- Validate input
- Fetch all target records
- Generate preview (show changes)
- Confirm safe (max 1000 records)
- Execute bulk operation
- Log bulk action (single audit for all)
- Respond with result

**Key Pattern**: Preview → Safety check → Execute → Bulk audit

### 7. import_export.json
**Type**: Transform | **Nodes**: 8 | **Complexity**: High
- Validate input (operation: import|export, format)
- Detect format (CSV, JSON, Excel, YAML)
- Parse file (if import)
- Map fields (transform import data)
- Validate data (entity schema validation)
- Process import (bulk insert) OR process export (serialize)
- Respond with result/file

**Key Pattern**: Format detection → Parsing → Mapping → Validation → Execution

---

## N8N Schema Essentials

### Every Workflow MUST Have

```json
{
  "id": "wf_list_entities",           // Unique identifier
  "name": "List Entities",            // Human readable
  "active": true,                     // Execution enabled
  "version": "1.0.0",                 // Semantic versioning
  "versionId": "v1.0.0",              // Optimistic lock
  "nodes": [],                        // At least 1 node
  "connections": {}                   // N8N adjacency format
}
```

### Every Node MUST Have

```json
{
  "id": "validate_input",             // Unique, snake_case
  "name": "Validate Input",           // Human readable
  "type": "logic.validate_schema",    // domain.nodeType
  "typeVersion": 1,                   // Version (≥1)
  "position": [0, 0],                 // [x, y] canvas coords
  "parameters": {}                    // Node-specific params
}
```

### Connection Format (N8N Adjacency)

```json
{
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
    }
  }
}
```

**Key**: `NodeName → "main" → [ [node: ..., type: ..., index: 0] ]`

---

## Common Patterns

### 1. Input Validation Pattern

Every workflow starts with:

```json
{
  "id": "validate_input",
  "name": "Validate Input",
  "type": "logic.validate_schema",
  "typeVersion": 1,
  "position": [0, 0],
  "parameters": {
    "schema": {
      "entity": "string",
      "filters": "object"
    },
    "out": "validated_params"
  }
}
```

### 2. Multi-Tenant Safety Pattern

EVERY DBAL call includes tenantId:

```json
"parameters": {
  "entity": "{{ $validated_params.entity }}",
  "tenantId": "{{ $context.tenantId }}",  // ← MANDATORY
  "limit": "{{ $validated_params.limit }}"
}
```

### 3. Audit Logging Pattern

Every write operation ends with:

```json
{
  "id": "log_audit",
  "type": "audit.log_event",
  "typeVersion": 1,
  "position": [1200, 0],
  "parameters": {
    "entity": "{{ $validated.entity }}",
    "recordId": "{{ $record_id }}",
    "tenantId": "{{ $context.tenantId }}",
    "userId": "{{ $context.userId }}",
    "action": "CREATE|UPDATE|DELETE",
    "changes": "{{ $data }}"
  }
}
```

### 4. Linear Sequential Flow

```
Node1 → Node2 → Node3 → Node4
```

Used in: list_entities, get_record

### 5. Branching Flow (Fetch + Validate)

```
validate_input
    ↓
fetch_current
    ↓
check_unique
    ↓
merge_changes
    ↓
execute
```

Used in: update_record

### 6. Parallel Fan-Out

```
validate_input
    ↓
execute_node
    ├→ log_audit_branch
    └→ respond_branch
```

Used in: bulk_operations (optional)

---

## Template Boilerplate

### Minimal Workflow (copy-paste ready)

```json
{
  "id": "wf_workflow_name",
  "name": "Workflow Title",
  "active": true,
  "version": "1.0.0",
  "versionId": "v1.0.0",
  "tags": [
    {
      "name": "database-manager",
      "id": "tag_1"
    }
  ],
  "meta": {
    "description": "What this workflow does",
    "category": "read|write|delete|transform",
    "permissions": ["admin:database:read|write"],
    "packageId": "ui_database_manager"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 30,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all"
  },
  "nodes": [
    {
      "id": "first_node",
      "name": "First Node",
      "type": "domain.nodeType",
      "typeVersion": 1,
      "position": [0, 0],
      "parameters": {}
    }
  ],
  "connections": {
    "first_node": {
      "main": [
        [
          {
            "node": "next_node",
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

## Node Type Quick Reference

### DBAL Operations

```
dbal.entity_list         - List records with filters
dbal.entity_get          - Get single record
dbal.entity_create       - Create new record
dbal.entity_update       - Update record
dbal.entity_delete       - Soft delete record
dbal.check_constraints   - Validate unique/foreign key
dbal.check_cascade       - Check delete dependencies
dbal.entity_relationships - Load related records
dbal.bulk_import         - Import bulk data
dbal.bulk_update         - Update multiple records
```

### Logic Operations

```
logic.validate_schema    - Validate input against schema
logic.filter_array       - Filter array with conditions
logic.if                 - Conditional branching
logic.compare            - Compare two values
```

### Audit Operations

```
audit.log_event          - Log single event (CREATE/UPDATE/DELETE)
audit.log_changes        - Log field-level changes
audit.log_bulk           - Log bulk operations
```

### Core Operations

```
core.array_slice         - Slice array (pagination)
core.array_filter        - Filter array items
core.object_merge        - Merge objects
core.object_transform    - Transform object
core.respond_json        - Respond with JSON
core.respond_file        - Respond with file
```

### String Operations

```
string.uuid              - Generate UUID
string.detect_format     - Detect file format
```

### Parser Operations

```
parser.parse_file        - Parse CSV/JSON/Excel
file.serialize           - Serialize to file format
```

---

## Implementation Checklist

### Pre-Start
- [ ] Read full update plan (1,836 lines)
- [ ] Understand all 7 workflows
- [ ] Review N8N schema examples
- [ ] Check DBAL node types available

### For Each Workflow
- [ ] Create JSON file in workflow/
- [ ] Add root properties (id, name, active, version, etc.)
- [ ] Create all nodes with proper IDs, types, positions
- [ ] Configure parameters for each node
- [ ] Create connections in N8N adjacency format
- [ ] Verify no circular connections
- [ ] Add meta, tags, settings
- [ ] Validate JSON syntax
- [ ] Test execution

### Final Steps
- [ ] All 7 workflows created
- [ ] Package.json updated with workflow inventory
- [ ] All workflows pass schema validation
- [ ] Multi-tenant safety verified (tenantId everywhere)
- [ ] Audit logging present (mutations logged)
- [ ] Code review approved

---

## Compliance Scoring Quick Guide

| Check | Points |
|-------|--------|
| Root properties present | 30 |
| All nodes have id, name, type, typeVersion, position | 25 |
| Connections valid (n8n format, no cycles) | 25 |
| Multi-tenant filtering (tenantId on all DBAL) | 15 |
| Audit logging (mutations logged) | 5 |
| **TOTAL** | **100** |

**Target**: 95-100/100 per workflow

---

## Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `"type": "entity_list"` | `"type": "dbal.entity_list"` |
| `"position": 0` | `"position": [0, 0]` |
| `"typeVersion": "1"` | `"typeVersion": 1` |
| Missing `tenantId` filter | `"tenantId": "{{ $context.tenantId }}"` |
| Hardcoded IDs | UUID generation or parameter |
| No audit logging | `audit.log_event` on all mutations |
| Connection array format | N8N adjacency format only |
| Duplicate node names | Use unique snake_case IDs |
| Missing schema validation | First node validates input |
| No error handling | Plan error paths |

---

## File Locations & Structure

### Where to Create Files

```
packages/ui_database_manager/
└── workflow/
    ├── list_entities.json           ← Create here
    ├── get_record.json              ← Create here
    ├── create_record.json           ← Create here
    ├── update_record.json           ← Create here
    ├── delete_record.json           ← Create here
    ├── bulk_operations.json         ← Create here
    └── import_export.json           ← Create here
```

### What to Update

**File**: `packages/ui_database_manager/package.json`

```json
{
  "files": {
    "directories": ["component", "page-config", "seed", "workflow"],
    "byType": {
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
}
```

---

## Validation Commands

```bash
# Validate against N8N schema
npm run validate:n8n docs/workflows/list_entities.json

# Validate against extended schema
npm run validate:n8n:extended docs/workflows/list_entities.json

# Lint JSON
npm run lint --fix docs/workflows/*.json

# Check for multi-tenant safety
grep -n "tenantId" workflow/*.json  # Should appear on every DBAL call
```

---

## Testing Checklist

### Unit Tests (per workflow)
- [ ] Valid input → success
- [ ] Invalid input → validation error
- [ ] Missing tenantId → error
- [ ] Database error → handled gracefully
- [ ] Empty results → proper response

### Integration Tests
- [ ] Create + List = record appears
- [ ] Update + Get = changes visible
- [ ] Delete + List = record gone
- [ ] Bulk create = multiple records
- [ ] Import = records created with audit
- [ ] Export = file generated correctly

### Security Tests
- [ ] Cross-tenant access blocked
- [ ] Unauthorized users denied
- [ ] SQL injection prevented
- [ ] All mutations audited
- [ ] No sensitive data in logs

---

## Reference Documents

- **Full Spec**: `/docs/UI_DATABASE_MANAGER_WORKFLOWS_UPDATE_PLAN.md` (1,836 lines)
- **N8N Schema**: `/schemas/n8n-workflow.schema.json`
- **N8N Validation**: `/schemas/n8n-workflow-validation.schema.json`
- **Example Workflow**: `/packagerepo/backend/workflows/auth_login.json`
- **DBAL Guide**: `/dbal/development/src/`
- **Feature Guide**: `/packages/ui_database_manager/DATABASE_MANAGER_GUIDE.md`

---

## Success Criteria

When all workflows are done:

```
✅ 7 workflows created (list, get, create, update, delete, bulk, import/export)
✅ 37 nodes properly configured
✅ 30 connections valid (n8n adjacency format)
✅ 100% schema compliance (no validation errors)
✅ All mutations audited (audit.log_* nodes)
✅ Multi-tenant safety verified (tenantId everywhere)
✅ No circular connections
✅ All nodes have proper metadata
✅ Code review approved
✅ Package.json inventory updated
```

**Estimated Time**: 3-4 hours implementation + 1-2 hours testing

---

**This Quick Reference** (this file) **points to**:
- **Full Specification** (1,836 lines): `UI_DATABASE_MANAGER_WORKFLOWS_UPDATE_PLAN.md`
- **Feature Implementation Guide**: `packages/ui_database_manager/DATABASE_MANAGER_GUIDE.md`
- **N8N Compliance Examples**: Various docs/ files with N8N_* naming

Start with this Quick Reference, then dive into the full update plan for detailed specifications.
