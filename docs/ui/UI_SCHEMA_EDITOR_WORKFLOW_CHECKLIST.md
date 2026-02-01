# UI Schema Editor Workflows: Implementation Checklist

**Document**: Companion to UI_SCHEMA_EDITOR_WORKFLOW_UPDATE_PLAN.md
**Date**: 2026-01-22
**Status**: Ready for Implementation
**Workflows to Create**: 4
**Target Compliance**: 100/100

---

## Quick Reference: What Needs to Be Created

| File | Location | Status | Nodes | Priority |
|------|----------|--------|-------|----------|
| `editor-init.json` | `/packages/ui_schema_editor/workflow/` | ❌ MISSING | 6 | HIGH |
| `validate-schema.json` | `/packages/ui_schema_editor/workflow/` | ❌ MISSING | 4 | HIGH |
| `save-schema.json` | `/packages/ui_schema_editor/workflow/` | ❌ MISSING | 7 | HIGH |
| `load-schema.json` | `/packages/ui_schema_editor/workflow/` | ❌ MISSING | 5 | HIGH |

---

## Pre-Implementation Checklist

### Understanding & Context
- [ ] Read `UI_SCHEMA_EDITOR_WORKFLOW_UPDATE_PLAN.md` completely
- [ ] Review `/packages/ui_schema_editor/SCHEMA_EDITOR_GUIDE.md`
- [ ] Review `/docs/UI_SCHEMA_EDITOR_N8N_COMPLIANCE_REPORT.md`
- [ ] Review `/docs/N8N_COMPLIANCE_AUDIT.md` (general compliance)
- [ ] Understand the 7 UI components in `seed/component.json`

### Reference Materials
- [ ] Study existing n8n workflows in `/packagerepo/backend/workflows/`
  - [ ] `auth_login.json` (conditional logic example)
  - [ ] `download_artifact.json` (error handling example)
  - [ ] `server.json` (multi-node coordination)
- [ ] Review n8n schema format in `/schemas/n8n-workflow.schema.json` (if exists)
- [ ] Understand DBAL plugin types available in plugin registry

### Environment Setup
- [ ] Verify workflow directory exists: `/packages/ui_schema_editor/workflow/`
  - If not exists: `mkdir -p /packages/ui_schema_editor/workflow/`
- [ ] Verify build tools available: `npm run validate:workflows` (if command exists)
- [ ] Check git status is clean for baseline

### Knowledge Areas
- [ ] Understand n8n connection format (node NAMES, not IDs)
- [ ] Know the difference between `main` and `error` output types
- [ ] Understand conditional branching (if output index 0 = false, index 1 = true)
- [ ] Know multi-tenant filtering pattern (`tenantId` in all queries)
- [ ] Know role verification pattern (auth checks before sensitive operations)

---

## Workflow 1: `editor-init.json`

### Creation Checklist

**File**: `/packages/ui_schema_editor/workflow/editor-init.json`

#### Structure Validation
- [ ] Root object has these properties:
  - [ ] `name`: "Initialize Schema Editor"
  - [ ] `id`: "wf_editor_init"
  - [ ] `version`: "1.0.0"
  - [ ] `tenantId`: "{{ $request.tenantId }}" (template)
  - [ ] `active`: true
  - [ ] `nodes`: array with 6 items
  - [ ] `connections`: object (not empty)
  - [ ] `settings`: object with timezone, executionTimeout
  - [ ] `staticData`: {} (empty)
  - [ ] `meta`: object with description, tags

#### Node Validation (6 nodes)
- [ ] **Node 1: Trigger: Page Load**
  - [ ] `id`: "trigger_page_load"
  - [ ] `name`: "Trigger: Page Load"
  - [ ] `type`: "core.http_trigger"
  - [ ] `typeVersion`: 1
  - [ ] `position`: [0, 100]
  - [ ] `parameters`: has `method` and `path`

- [ ] **Node 2: Verify Supergod Permission**
  - [ ] `id`: "auth_verify"
  - [ ] `name`: "Verify Supergod Permission"
  - [ ] `type`: "auth.verify_role"
  - [ ] `typeVersion`: 1
  - [ ] `position`: [300, 100]
  - [ ] `parameters`: has `requiredRole` = "supergod"

- [ ] **Node 3: Check Authorization**
  - [ ] `id`: "check_auth"
  - [ ] `name`: "Check Authorization"
  - [ ] `type`: "logic.if"
  - [ ] `typeVersion`: 1
  - [ ] `position`: [600, 100]
  - [ ] `parameters`: has `condition`, `then`, `else`

- [ ] **Node 4: Load All Entities**
  - [ ] `id`: "load_entities"
  - [ ] `name`: "Load All Entities"
  - [ ] `type`: "dbal.entity_list"
  - [ ] `typeVersion`: 1
  - [ ] `position`: [900, 100]
  - [ ] `parameters`: has `entityType`, `filter`, `out`

- [ ] **Node 5: Enrich Entity Metadata**
  - [ ] `id`: "enrich_metadata"
  - [ ] `name`: "Enrich Entity Metadata"
  - [ ] `type`: "transform.map_fields"
  - [ ] `typeVersion`: 1
  - [ ] `position`: [1200, 100]
  - [ ] `parameters`: has mappings array

- [ ] **Node 6: Respond Success**
  - [ ] `id`: "respond_success"
  - [ ] `name`: "Respond Success"
  - [ ] `type`: "http.respond"
  - [ ] `typeVersion`: 1
  - [ ] `position`: [1500, 100]
  - [ ] `parameters`: has `status`: 200, `body` object

- [ ] **Node 7: Error: Unauthorized** (error handler)
  - [ ] `id`: "error_unauthorized"
  - [ ] `name`: "Error: Unauthorized"
  - [ ] `type`: "http.respond_error"
  - [ ] `typeVersion`: 1
  - [ ] `position`: [600, 400]
  - [ ] `parameters`: has `status`: 403, `message`

#### Connection Validation
- [ ] `connections` object has 5 source nodes:
  - [ ] "Trigger: Page Load" → "Verify Supergod Permission"
  - [ ] "Verify Supergod Permission" → "Check Authorization"
  - [ ] "Check Authorization" (0) → "Error: Unauthorized"
  - [ ] "Check Authorization" (1) → "Load All Entities"
  - [ ] "Load All Entities" → "Enrich Entity Metadata"
  - [ ] "Enrich Entity Metadata" → "Respond Success"

- [ ] Each connection entry format:
  ```json
  "NodeName": {
    "main": {
      "0": [
        {
          "node": "TargetNodeName",
          "type": "main",
          "index": 0
        }
      ]
    }
  }
  ```

#### Data Flow Validation
- [ ] Variable references use `$` prefix:
  - [ ] `$request.user`
  - [ ] `$request.tenantId`
  - [ ] `$auth_verify`
  - [ ] `$entities`
  - [ ] `$enrichedEntities`

- [ ] No `[object Object]` strings anywhere
- [ ] No empty parameters
- [ ] All position coordinates valid [x, y] pairs

#### Security Validation
- [ ] Role check (supergod) before database access ✅
- [ ] Unauthorized error response defined ✅
- [ ] tenantId filter in query ✅
- [ ] No credentials exposed ✅

---

## Workflow 2: `validate-schema.json`

### Creation Checklist

**File**: `/packages/ui_schema_editor/workflow/validate-schema.json`

#### Structure Validation
- [ ] Root properties:
  - [ ] `name`: "Validate Schema"
  - [ ] `id`: "wf_validate_schema"
  - [ ] `version`: "1.0.0"
  - [ ] `tenantId`: "{{ $request.tenantId }}"
  - [ ] `active`: true
  - [ ] `nodes`: array with 4 items
  - [ ] `connections`: object (not empty)
  - [ ] `settings`: proper configuration
  - [ ] `staticData`: {}
  - [ ] `meta`: with description

#### Node Validation (4 nodes)
- [ ] **Node 1: Trigger: Validate Request**
  - [ ] `id`: "trigger_validate"
  - [ ] `type`: "core.http_trigger"
  - [ ] `position`: [0, 100]
  - [ ] Method: POST

- [ ] **Node 2: Parse Input Schema**
  - [ ] `id`: "parse_input"
  - [ ] `type`: "transform.parse_json"
  - [ ] `position`: [300, 100]
  - [ ] Parameters: `input`, `out`

- [ ] **Node 3: Validate Against JSON Schema**
  - [ ] `id`: "validate_against_schema"
  - [ ] `type`: "validation.schema_validate"
  - [ ] `position`: [600, 100]
  - [ ] Has embedded JSON schema definition
  - [ ] Schema validates: entity name, fields array, relationships

- [ ] **Node 4: Check Validation Result**
  - [ ] `id`: "check_valid"
  - [ ] `type`: "logic.if"
  - [ ] `position`: [900, 100]
  - [ ] Conditional outputs (valid/invalid)

- [ ] **Node 5: Respond: Valid**
  - [ ] `id`: "respond_valid"
  - [ ] `type`: "http.respond"
  - [ ] `position`: [1200, 0]
  - [ ] Status: 200

- [ ] **Node 6: Respond: Invalid**
  - [ ] `id`: "respond_invalid"
  - [ ] `type`: "http.respond_error"
  - [ ] `position`: [1200, 200]
  - [ ] Status: 400

#### Connection Validation
- [ ] 4 connections defined:
  - [ ] Trigger → Parse Input
  - [ ] Parse Input → Validate
  - [ ] Validate → Check Result
  - [ ] Check Result (0) → Respond Invalid
  - [ ] Check Result (1) → Respond Valid

#### Schema Validation
- [ ] Embedded JSON schema validates:
  - [ ] `entity`: string, minLength 1, pattern `^[a-zA-Z_][a-zA-Z0-9_]*$`
  - [ ] `fields`: array of objects with name and type
  - [ ] `type`: enum of 13 field types
  - [ ] `relationships`: array with type/from/to
  - [ ] Relationship type: "one-to-one", "one-to-many", "many-to-many"

---

## Workflow 3: `save-schema.json`

### Creation Checklist

**File**: `/packages/ui_schema_editor/workflow/save-schema.json`

#### Structure Validation
- [ ] Root properties:
  - [ ] `name`: "Save Schema"
  - [ ] `id`: "wf_save_schema"
  - [ ] `version`: "1.0.0"
  - [ ] `tenantId`: "{{ $request.tenantId }}"
  - [ ] `active`: true
  - [ ] `nodes`: array with 7 items
  - [ ] `connections`: object (not empty)

#### Node Validation (7 nodes)
- [ ] **Node 1: Trigger: Save Request**
  - [ ] `id`: "trigger_save"
  - [ ] `type`: "core.http_trigger"
  - [ ] `position`: [0, 100]
  - [ ] Method: POST

- [ ] **Node 2: Verify Supergod**
  - [ ] `id`: "auth_verify"
  - [ ] `type`: "auth.verify_role"
  - [ ] `position`: [300, 100]
  - [ ] `requiredRole`: "supergod"

- [ ] **Node 3: Check Permission**
  - [ ] `id`: "check_auth"
  - [ ] `type`: "logic.if"
  - [ ] `position`: [600, 100]
  - [ ] Branches to error or success

- [ ] **Node 4: Parse Schema Data**
  - [ ] `id`: "parse_schema"
  - [ ] `type`: "transform.parse_json"
  - [ ] `position`: [900, 100]

- [ ] **Node 5: Save to Database**
  - [ ] `id`: "save_to_db"
  - [ ] `type`: "dbal.entity_create"
  - [ ] `position`: [1200, 100]
  - [ ] Entity: "SchemaDefinition"
  - [ ] Data includes: tenantId, entity, definition, createdBy, createdAt

- [ ] **Node 6: Trigger Code Generation**
  - [ ] `id`: "trigger_codegen"
  - [ ] `type`: "workflow.execute"
  - [ ] `position`: [1500, 100]
  - [ ] Workflow: "codegen_prisma_schema"

- [ ] **Node 7: Respond Success**
  - [ ] `id`: "respond_success"
  - [ ] `type`: "http.respond"
  - [ ] `position`: [1800, 100]
  - [ ] Status: 201
  - [ ] Returns entity ID

- [ ] **Node 8: Error: Forbidden**
  - [ ] `id`: "error_forbidden"
  - [ ] `type`: "http.respond_error"
  - [ ] `position`: [600, 400]
  - [ ] Status: 403

#### Data Flow Validation
- [ ] Proper variable threading:
  - [ ] `$request.user` → auth check
  - [ ] `$request.body` → parse
  - [ ] `$schema` → validation and save
  - [ ] `$request.tenantId` → filter
  - [ ] `$request.user.id` → audit trail

#### Audit Trail
- [ ] `createdBy`: Set to `$request.user.id`
- [ ] `createdAt`: Set to current ISO timestamp
- [ ] `tenantId`: Set to `$request.tenantId`

#### Connection Validation
- [ ] 6 sequential connections
- [ ] Proper branching on authorization check
- [ ] Final response after codegen trigger

---

## Workflow 4: `load-schema.json`

### Creation Checklist

**File**: `/packages/ui_schema_editor/workflow/load-schema.json`

#### Structure Validation
- [ ] Root properties:
  - [ ] `name`: "Load Schema"
  - [ ] `id`: "wf_load_schema"
  - [ ] `version`: "1.0.0"
  - [ ] `tenantId`: "{{ $request.tenantId }}"
  - [ ] `active`: true
  - [ ] `nodes`: array with 5 items
  - [ ] `connections`: object (not empty)

#### Node Validation (5 nodes)
- [ ] **Node 1: Trigger: Load Request**
  - [ ] `id`: "trigger_load"
  - [ ] `type`: "core.http_trigger"
  - [ ] `position`: [0, 100]
  - [ ] Method: GET
  - [ ] Path: `/schema-editor/load/:entityId`

- [ ] **Node 2: Verify Supergod**
  - [ ] `id`: "auth_verify"
  - [ ] `type`: "auth.verify_role"
  - [ ] `position`: [300, 100]
  - [ ] `requiredRole`: "supergod"

- [ ] **Node 3: Check Permission**
  - [ ] `id`: "check_auth"
  - [ ] `type`: "logic.if"
  - [ ] `position`: [600, 100]

- [ ] **Node 4: Fetch Entity Definition**
  - [ ] `id`: "fetch_entity"
  - [ ] `type`: "dbal.entity_get"
  - [ ] `position`: [900, 100]
  - [ ] Entity: "SchemaDefinition"
  - [ ] Filter by tenantId

- [ ] **Node 5: Check Entity Found**
  - [ ] `id`: "check_found"
  - [ ] `type`: "logic.if"
  - [ ] `position`: [1200, 100]

- [ ] **Node 6: Respond Success**
  - [ ] `id`: "respond_found"
  - [ ] `type`: "http.respond"
  - [ ] `position`: [1500, 0]
  - [ ] Status: 200

- [ ] **Node 7: Error: Forbidden**
  - [ ] `id`: "error_forbidden"
  - [ ] `type`: "http.respond_error"
  - [ ] `position`: [600, 400]
  - [ ] Status: 403

- [ ] **Node 8: Error: Not Found**
  - [ ] `id`: "error_not_found"
  - [ ] `type`: "http.respond_error"
  - [ ] `position`: [1500, 300]
  - [ ] Status: 404

#### Query Parameters
- [ ] Entity ID from: `$request.params.entityId`
- [ ] Tenant filter: `tenantId: $request.tenantId`

#### Connection Validation
- [ ] Proper branching on auth
- [ ] Proper branching on entity found/not found
- [ ] All error paths connect to error responses

---

## Post-Creation Validation

### JSON Format Validation
- [ ] No syntax errors in any file:
  ```bash
  node -e "JSON.parse(require('fs').readFileSync('/packages/ui_schema_editor/workflow/editor-init.json'))"
  ```
  (Repeat for all 4 files)

- [ ] All files can be parsed successfully
- [ ] No trailing commas
- [ ] All strings properly quoted
- [ ] All arrays properly closed

### N8N Schema Compliance

For each workflow file, check:

#### Root Level
- [ ] ✅ `name` is non-empty string
- [ ] ✅ `id` is non-empty string and unique
- [ ] ✅ `version` is semver format
- [ ] ✅ `tenantId` follows template or string format
- [ ] ✅ `active` is boolean
- [ ] ✅ `nodes` is non-empty array
- [ ] ✅ `connections` is object (can be empty for single nodes)
- [ ] ✅ `settings` has `timezone` and `executionTimeout`
- [ ] ✅ `staticData` is object
- [ ] ✅ `meta` is object with description

#### Nodes
- [ ] ✅ Each node has: id, name, type, typeVersion, position
- [ ] ✅ All node IDs are unique
- [ ] ✅ All node names are unique
- [ ] ✅ All positions are [x, y] arrays with numbers
- [ ] ✅ No `[object Object]` in any field
- [ ] ✅ Parameters object exists (at least empty {})

#### Connections
- [ ] ✅ All source nodes referenced in connections exist
- [ ] ✅ All target nodes referenced in connections exist
- [ ] ✅ No circular references (basic DAG check)
- [ ] ✅ All connection entries follow format:
  ```json
  "SourceNodeName": {
    "main": {
      "0": [{ "node": "TargetName", "type": "main", "index": 0 }]
    }
  }
  ```

### Multi-Tenant Safety
- [ ] ✅ All DBAL queries include `tenantId` filter
- [ ] ✅ `tenantId` comes from `$request.tenantId`
- [ ] ✅ No cross-tenant data leaks
- [ ] ✅ Response bodies don't expose other tenants' data
- [ ] ✅ Error messages don't reveal sensitive info

### Security Checks
- [ ] ✅ Authorization checks before sensitive operations
- [ ] ✅ Supergod role verification present (all 4 workflows)
- [ ] ✅ Unauthorized error responses (403) defined
- [ ] ✅ Not found error responses (404) defined where needed
- [ ] ✅ No credentials in parameters
- [ ] ✅ No passwords in responses
- [ ] ✅ Input validation before database operations

### Consistency Checks
- [ ] ✅ Consistent node naming conventions (camelCase for IDs, Title Case for names)
- [ ] ✅ Consistent position layout (horizontal 300px spacing)
- [ ] ✅ All workflows use consistent error handling patterns
- [ ] ✅ All workflows have `meta` with description and tags
- [ ] ✅ All workflows have matching `tenantId` template

---

## Integration Testing Checklist

### Unit Tests (Per Workflow)
- [ ] **editor-init.json**
  - [ ] Test: Unauthorized access rejected (403)
  - [ ] Test: Authorized access returns entity list
  - [ ] Test: Empty entity list handled
  - [ ] Test: Metadata enrichment works

- [ ] **validate-schema.json**
  - [ ] Test: Valid schema passes
  - [ ] Test: Invalid entity name rejected
  - [ ] Test: Missing fields rejected
  - [ ] Test: Invalid field type rejected
  - [ ] Test: Missing required properties rejected

- [ ] **save-schema.json**
  - [ ] Test: Unauthorized user rejected (403)
  - [ ] Test: Valid schema saved
  - [ ] Test: Duplicate entity name handled
  - [ ] Test: Code generation triggered
  - [ ] Test: Audit trail created

- [ ] **load-schema.json**
  - [ ] Test: Unauthorized access rejected (403)
  - [ ] Test: Existing entity loaded
  - [ ] Test: Non-existent entity returns 404
  - [ ] Test: Data includes all fields

### Integration Tests (Workflows Together)
- [ ] Full flow: init → validate → save → load
- [ ] Multi-user concurrent access
- [ ] Multi-tenant isolation verification
- [ ] Error recovery and retry paths

### Performance Tests
- [ ] Single workflow execution < 1 second
- [ ] All 4 workflows parallel execution < 5 seconds
- [ ] Large entity list (1000+ entities) handling

---

## Final Checklist

### Before Commit
- [ ] All 4 workflow files created
- [ ] All files pass JSON schema validation
- [ ] All files pass n8n compliance checks
- [ ] All multi-tenant checks pass
- [ ] All security checks pass
- [ ] All integration tests pass

### Before Push to Main
- [ ] Documentation updated (SCHEMA_EDITOR_GUIDE.md)
- [ ] Workflow diagrams added to documentation
- [ ] API endpoint documentation created
- [ ] Troubleshooting guide written
- [ ] Code review completed
- [ ] All checks still passing

### Before Deploying to Production
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Rollback plan documented
- [ ] Monitoring/alerting configured
- [ ] Stakeholder approval received

---

## Validation Commands

```bash
# 1. JSON validation
node -e "const fs = require('fs'); ['editor-init', 'validate-schema', 'save-schema', 'load-schema'].forEach(f => { const data = JSON.parse(fs.readFileSync('/packages/ui_schema_editor/workflow/${f}.json')); console.log('✅ ' + f + '.json is valid JSON'); });"

# 2. N8N schema validation (if script exists)
npm run validate:workflows

# 3. Type checking (if supported)
npm run typecheck:workflows

# 4. Linting (if script exists)
npm run lint:workflows

# 5. Integration tests
npm run test:workflows:integration

# 6. Full test suite
npm run test
```

---

## Quick Reference: Common Mistakes to Avoid

❌ **WRONG**:
```json
{
  "connections": {}  // Empty connections
}
```

✅ **CORRECT**:
```json
{
  "connections": {
    "NodeName": {
      "main": {
        "0": [{"node": "NextNode", "type": "main", "index": 0}]
      }
    }
  }
}
```

---

❌ **WRONG**:
```json
{
  "type": "logic.if",
  "parameters": {
    "then": "error_node",      // Parameter reference
    "else": "success_node"
  }
}
```

✅ **CORRECT**:
```json
{
  "connections": {
    "Conditional Node": {
      "main": {
        "0": [{"node": "Error Path", "type": "main", "index": 0}],
        "1": [{"node": "Success Path", "type": "main", "index": 0}]
      }
    }
  }
}
```

---

❌ **WRONG**:
```json
{
  "node": {"nodeId": "fetch_entity"},  // Should be string
  "type": "main"
}
```

✅ **CORRECT**:
```json
{
  "node": "Fetch Entity Definition",  // Node NAME, not ID
  "type": "main",
  "index": 0
}
```

---

❌ **WRONG**:
```json
{
  "entity": "SchemaDefinition",
  "filter": {
    // Missing tenantId!
  }
}
```

✅ **CORRECT**:
```json
{
  "entity": "SchemaDefinition",
  "filter": {
    "tenantId": "$request.tenantId"
  }
}
```

---

**Status**: 📋 READY - All workflows documented, checklist complete
**Estimated Time**: 4-6 hours for implementation
**Target Date**: Implementation immediate
**Last Updated**: 2026-01-22
