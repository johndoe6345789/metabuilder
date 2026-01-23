# Workflow Inventory & Structure

**Date**: 2026-01-22
**Scope**: All workflows across MetaBuilder project
**Purpose**: Complete inventory of workflows, locations, and status

---

## Executive Summary

| Metric | Count | Status |
|--------|-------|--------|
| **Total Workflows** | 6 | Existing |
| **Planned Workflows** | 5 | Pending Creation |
| **Compliant Workflows** | 0 | 🔴 UPGRADE NEEDED |
| **Packages with Workflows** | 2 | Low adoption |
| **Compliance Rate** | 0% | 🔴 CRITICAL |

---

## Part 1: Existing Workflows

### PackageRepo Backend Workflows (6 total)

**Location**: `/packagerepo/backend/workflows/`

| # | Filename | Workflow ID | Name | Nodes | Status | Compliance |
|---|----------|------------|------|-------|--------|-----------|
| 1 | `server.json` | *missing* | Package Repository Server | 7 | ✅ Exists | 🔴 50% |
| 2 | `auth_login.json` | *missing* | Authenticate User | 8 | ✅ Exists | 🔴 50% |
| 3 | `download_artifact.json` | *missing* | Download Artifact | 8 | ✅ Exists | 🔴 50% |
| 4 | `publish_artifact.json` | *missing* | Publish Artifact | 11 | ✅ Exists | 🔴 50% |
| 5 | `resolve_latest.json` | *missing* | Resolve Latest Version | ? | ✅ Exists | 🔴 50% |
| 6 | `list_versions.json` | *missing* | List Versions | ? | ✅ Exists | 🔴 50% |

**Current Compliance Issues**:
- ❌ Missing required `id` field
- ❌ Missing `version` field
- ❌ Missing `tenantId` field
- ❌ Missing timestamps (createdAt, updatedAt)
- ❌ Missing `description` field
- ❌ Missing `credentials` array
- ❌ Missing `triggers` array
- ❌ Missing `variables` object
- ✅ Has `nodes`, `connections`, `settings`

---

## Part 2: Planned Workflows

### UI Workflow Editor Package (5 planned)

**Location**: `/packages/ui_workflow_editor/workflow/`

| # | Planned ID | Name | Purpose | Nodes | Priority |
|---|-----------|------|---------|-------|----------|
| 1 | `workflow_ui_workflow_editor_initialize` | Initialize Editor Canvas | Setup blank or template canvas | 4 | HIGH |
| 2 | `workflow_ui_workflow_editor_save` | Save Workflow Definition | Validate and persist workflow | 6 | HIGH |
| 3 | `workflow_ui_workflow_editor_load` | Load Workflow Definition | Retrieve workflow from DB | 5 | HIGH |
| 4 | `workflow_ui_workflow_editor_execute` | Execute Workflow | Run workflow and track execution | 7 | MEDIUM |
| 5 | `workflow_ui_workflow_editor_list` | List Workflows | Query and filter workflows | 5 | MEDIUM |

**Expected Compliance**: 100% upon creation

---

## Part 3: Current Directory Structure

### PackageRepo Backend

```
packagerepo/backend/workflows/
├── server.json                 # Flask app bootstrap
├── auth_login.json             # User authentication
├── download_artifact.json       # Artifact download
├── publish_artifact.json        # Artifact publishing
├── resolve_latest.json          # Version resolution
└── list_versions.json           # Version listing

Total: 6 workflow files
Status: Functional but non-compliant
```

### UI Workflow Editor Package

```
packages/ui_workflow_editor/
├── component/                  # (empty)
├── page-config/                # (empty)
├── seed/
│   ├── component.json          # 10 UI components
│   ├── metadata.json           # Package manifest
│   └── page-config.json        # 3 routes
├── workflow/                   # EMPTY - NEEDS 5 WORKFLOWS
├── package.json                # Package metadata
└── WORKFLOW_EDITOR_GUIDE.md    # Implementation guide

Total: 0 workflow files
Status: Not yet implemented
```

---

## Part 4: Workflow Adoption by Package

### Packages WITH Workflows

```
1. packagerepo/backend/
   - 6 workflows (server, auth, artifact management, versioning)
   - Status: Functional, needs upgrade

2. ui_workflow_editor/
   - 0 workflows (planned: 5)
   - Status: Pending creation
```

### Packages WITHOUT Workflows (60+ packages)

All other packages lack workflows:
- `admin`, `admin_dialog`, `api_tests`
- `audit_log`, `code_editor`, `codegen_studio`
- `component_editor`, `dashboard`, `data_table`
- `database_manager`, `dbal_core`, `dbal_demo`
- `form_builder`, `forum_forge`, `github_tools`
- `irc_webchat`, `json_script_example`, `media_center`
- `notification_center`, `package_manager`, `role_editor`
- `schema_editor`, `stream_cast`, `ui_auth`
- `ui_database_manager`, `ui_dialogs`, `ui_footer`
- `ui_header`, `ui_home`, `ui_login`
- `ui_pages`, `workflow_editor`, `... and 40+ more`

**Workflow Adoption Rate**: ~3% (2 out of 62+ packages)

---

## Part 5: Schema Files

### YAML Entity Definition (Source of Truth)

**File**: `/dbal/shared/api/schema/entities/core/workflow.yaml`

```yaml
entity: Workflow
version: "1.0"
fields:
  - id (UUID, primary key)
  - tenantId (UUID, nullable)
  - name (string, max 255)
  - description (text, optional)
  - nodes (string, JSON)
  - edges (string, JSON)
  - enabled (boolean, default: true)
  - version (integer, default: 1)
  - createdAt (bigint, nullable)
  - updatedAt (bigint, nullable)
  - createdBy (UUID, foreign key to User)
indexes:
  - tenantId
  - enabled
acl:
  create: [god, supergod]
  read: [admin, god, supergod]
  update: [god, supergod]
  delete: [god, supergod]
```

### N8N Workflow Schema

**File**: `/schemas/n8n-workflow.schema.json`

```json
{
  "type": "object",
  "required": ["name", "nodes", "connections"],
  "properties": {
    "id": "string or integer",
    "name": "string (minLength: 1)",
    "active": "boolean (default: false)",
    "versionId": "string",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime",
    "tags": "array of {id, name}",
    "meta": "object",
    "settings": "workflowSettings",
    "pinData": "object",
    "nodes": "array (minItems: 1)",
    "connections": "object",
    "staticData": "object",
    "credentials": "array",
    "triggers": "array",
    "variables": "object"
  }
}
```

### Package-Specific Workflow Schema

**File**: `/schemas/package-schemas/workflow.schema.json`

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id", "name", "nodes", "edges", "enabled", "version", "active"],
    "properties": {
      "id": "string (pattern: ^workflow_)",
      "name": "string (1-255 chars)",
      "description": "string or null (max 500)",
      "nodes": "array of nodes",
      "edges": "array of connections",
      "enabled": "boolean (default: true)",
      "version": "integer (default: 1)",
      "tenantId": "string or null",
      "active": "boolean (default: false)",
      "tags": "array of strings",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  }
}
```

---

## Part 6: Node Types Available

### Current Node Types (by category)

#### Trigger Nodes
- `trigger.http` - HTTP endpoint
- `trigger.schedule` - Cron scheduling
- `trigger.database_event` - Database event listener
- `trigger.webhook` - Webhook receiver
- `trigger.api` - API call trigger
- `trigger.manual` - Manual execution
- `trigger.email` - Email trigger

#### Logic Nodes
- `logic.if` - Conditional branching
- `logic.switch` - Multi-way branching
- `logic.parallel` - Parallel execution
- `logic.sequential` - Sequential execution
- `logic.loop` - Loop iteration
- `logic.end` - Workflow termination
- `logic.error` - Error handler

#### Data Transformation Nodes
- `data.parse_json` - Parse JSON
- `data.stringify` - Convert to JSON string
- `data.map` - Array mapping
- `data.filter` - Array filtering
- `data.reduce` - Array reduction
- `data.unique` - Remove duplicates
- `data.sort` - Array sorting
- `data.merge` - Object merging

#### Database Nodes
- `database.query` - Query records
- `database.create` - Create record
- `database.update` - Update record
- `database.delete` - Delete record
- `database.create_batch` - Batch create
- `database.transaction` - Transaction wrapper

#### PackageRepo-Specific Nodes
- `packagerepo.parse_json` - JSON parsing
- `packagerepo.parse_path` - URL path parsing
- `packagerepo.auth_verify_jwt` - JWT verification
- `packagerepo.auth_generate_jwt` - JWT generation
- `packagerepo.auth_check_scopes` - Scope verification
- `packagerepo.auth_verify_password` - Password verification
- `packagerepo.blob_get` - Retrieve blob
- `packagerepo.blob_put` - Store blob
- `packagerepo.kv_get` - Key-value retrieval
- `packagerepo.kv_put` - Key-value storage
- `packagerepo.respond_json` - JSON response
- `packagerepo.respond_error` - Error response
- `packagerepo.respond_blob` - Blob response
- `packagerepo.normalize_entity` - Entity normalization
- `packagerepo.validate_entity` - Entity validation

#### UI Workflow Editor-Specific Nodes (planned)
- `ui_workflow_editor.load_template` - Template loading
- `ui_workflow_editor.prepare_canvas` - Canvas preparation
- `ui_workflow_editor.validate_workflow` - Schema validation
- `ui_workflow_editor.save_workflow_db` - DB persistence
- `ui_workflow_editor.load_workflow_db` - DB retrieval
- `ui_workflow_editor.execute_dag` - DAG execution
- `ui_workflow_editor.log_execution` - Execution logging
- `ui_workflow_editor.build_filter` - Query filter builder
- `ui_workflow_editor.list_workflows_db` - Workflow listing
- `ui_workflow_editor.format_list_response` - Response formatting

#### String/Utility Nodes
- `string.sha256` - SHA-256 hashing
- `string.concat` - String concatenation
- `string.split` - String splitting
- `string.replace` - String replacement
- `string.uppercase` - Convert to uppercase
- `string.lowercase` - Convert to lowercase
- `string.trim` - Trim whitespace

#### Notification Nodes
- `notification.create` - Create notification
- `notification.email` - Email notification
- `notification.slack` - Slack notification
- `notification.teams` - Microsoft Teams notification
- `notification.webhook` - Webhook notification

---

## Part 7: Node Structure by Category

### Trigger Node Structure

```json
{
  "id": "trigger_1",
  "name": "HTTP Trigger",
  "type": "trigger.http",
  "typeVersion": 1,
  "position": [100, 100],
  "parameters": {
    "method": "POST",
    "path": "/api/v1/webhook"
  }
}
```

### Logic Node Structure

```json
{
  "id": "conditional_1",
  "name": "Check Status",
  "type": "logic.if",
  "typeVersion": 1,
  "position": [400, 100],
  "parameters": {
    "condition": "{{ $data.status === 'active' }}",
    "then": "next_node_true",
    "else": "next_node_false"
  }
}
```

### Data Transformation Node Structure

```json
{
  "id": "transform_1",
  "name": "Map Data",
  "type": "data.map",
  "typeVersion": 1,
  "position": [700, 100],
  "parameters": {
    "input": "{{ $data.items }}",
    "mapping": "{{ { id: item.id, name: item.title } }}",
    "out": "mappedItems"
  }
}
```

### Database Node Structure

```json
{
  "id": "db_query_1",
  "name": "Query Users",
  "type": "database.query",
  "typeVersion": 1,
  "position": [100, 300],
  "parameters": {
    "entity": "User",
    "filter": "{{ { status: 'active', tenantId: $request.user.tenantId } }}",
    "limit": 100,
    "out": "users"
  }
}
```

### Response Node Structure

```json
{
  "id": "response_1",
  "name": "Success Response",
  "type": "packagerepo.respond_json",
  "typeVersion": 1,
  "position": [1000, 100],
  "parameters": {
    "body": {
      "ok": true,
      "data": "{{ $data }}"
    },
    "status": 200
  }
}
```

---

## Part 8: Workflow Metrics

### PackageRepo Workflows

| Workflow | Nodes | Connections | Triggers | Error Handlers | Compliance |
|----------|-------|-------------|----------|----------------|-----------|
| server | 7 | 6 | 0 | 0 | 50% |
| auth_login | 8 | 7 | 0 | 2 | 50% |
| download_artifact | 8 | 7 | 0 | 2 | 50% |
| publish_artifact | 11+ | 10+ | 0 | 3 | 50% |
| resolve_latest | ? | ? | 0 | ? | 50% |
| list_versions | ? | ? | 0 | ? | 50% |
| **Total** | **50+** | **40+** | **0** | **7** | **50%** |

### UI Workflow Editor (Planned)

| Workflow | Nodes | Connections | Triggers | Error Handlers | Est. Compliance |
|----------|-------|-------------|----------|----------------|-----------------|
| initialize | 4 | 3 | 1 | 0 | 100% |
| save | 6 | 5 | 1 | 1 | 100% |
| load | 5 | 4 | 1 | 1 | 100% |
| execute | 7 | 6 | 1 | 1 | 100% |
| list | 5 | 4 | 1 | 0 | 100% |
| **Total** | **27** | **22** | **5** | **3** | **100%** |

---

## Part 9: Migration Path

### Phase 1: Upgrade Existing (Week 2)
- Update all 6 PackageRepo workflows with missing required fields
- Add id, version, tenantId, timestamps, credentials, triggers, variables
- Validate against n8n schema
- Expected improvement: 50% → 100% compliance

### Phase 2: Create New (Week 3)
- Create 5 UI Workflow Editor workflows
- 100% compliance from creation
- Full documentation and examples
- Total workflows: 11 (6 + 5)

### Phase 3: Future Expansion (Months 2-3)
- Identify workflows needed in other packages
- Estimate: 10-20 additional workflows
- Target total: 20-30 workflows by Q2 2026

---

## Part 10: Quality Metrics

### Current State
| Metric | Value | Status |
|--------|-------|--------|
| Total Workflows | 6 | 🟡 Low |
| Average Node Count | 8 | 🟢 Good |
| Compliance Rate | 0% | 🔴 Critical |
| Documentation | 50% | 🟡 Partial |
| Error Handling | 40% | 🟡 Partial |
| Multi-Tenant Safety | 0% | 🔴 None |
| Execution Monitoring | 20% | 🟡 Minimal |

### Target State (Post-Update)
| Metric | Value | Status |
|--------|-------|--------|
| Total Workflows | 11 | 🟢 Healthy |
| Average Node Count | 7 | 🟢 Good |
| Compliance Rate | 100% | 🟢 Complete |
| Documentation | 100% | 🟢 Complete |
| Error Handling | 100% | 🟢 Complete |
| Multi-Tenant Safety | 100% | 🟢 Complete |
| Execution Monitoring | 100% | 🟢 Complete |

---

## Part 11: File Locations Reference

### Schema Files
- **YAML Entity**: `/dbal/shared/api/schema/entities/core/workflow.yaml`
- **N8N Schema**: `/schemas/n8n-workflow.schema.json`
- **N8N Validation**: `/schemas/n8n-workflow-validation.schema.json`
- **Package Schema**: `/schemas/package-schemas/workflow.schema.json`

### Workflow Files
- **PackageRepo**: `/packagerepo/backend/workflows/`
- **UI Workflow Editor**: `/packages/ui_workflow_editor/workflow/`

### Documentation
- **Update Plan**: `/docs/UI_WORKFLOW_EDITOR_UPDATE_PLAN.md`
- **Validation**: `/docs/WORKFLOW_VALIDATION_CHECKLIST.md`
- **Inventory**: `/docs/WORKFLOW_INVENTORY.md` (this file)
- **N8N Audit**: `/docs/N8N_COMPLIANCE_AUDIT.md`

### Package Documentation
- **UI Workflow Editor Guide**: `/packages/ui_workflow_editor/WORKFLOW_EDITOR_GUIDE.md`
- **Workflow Engine Guide**: `/workflow/WORKFLOW_GUIDE.md`

---

## Summary

**Current State**:
- 6 workflows exist (PackageRepo backend)
- 0 are fully n8n schema compliant
- Low adoption across packages (3%)
- Partial error handling and documentation

**Planned State**:
- 11 total workflows
- 100% n8n schema compliance
- Complete documentation
- Full multi-tenant safety
- Comprehensive error handling

**Timeline**:
- Week 2: Upgrade existing 6 workflows
- Week 3: Create 5 new workflows
- Week 4: Testing and QA
- Target: 100% completion by end of January 2026

