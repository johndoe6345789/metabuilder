# ui_json_script_editor: Workflow Update Plan
## Migrating to n8n-Style Schema (Phase 3.3)

**Date**: 2026-01-22
**Status**: Preparation & Design Phase
**Scope**: 5 Workflows
**Target Schema Version**: n8n v1.0.0 standard
**Priority**: High - Complete before Phase 3.4

---

## Executive Summary

The `ui_json_script_editor` package contains 5 critical workflows that require migration from MetaBuilder's basic workflow format to the **n8n-compliant standard** established by the PackageRepo backend workflows. This plan addresses:

- **Root Cause**: Current workflows missing required fields (`id`, `versionId`, `tenantId`)
- **Standards Gap**: No compliance with n8n node type conventions
- **Database Tracking**: Incomplete metadata for workflow persistence and versioning
- **Impact**: Affects script management, testing, and export/import functionality

---

## Current State Assessment

### Workflows Overview

| Workflow | Nodes | Status | Issues |
|----------|-------|--------|--------|
| `export-script.json` | 4 | 🔴 Incomplete | No id/version/tenantId |
| `import-script.json` | 6 | 🔴 Incomplete | Missing metadata fields |
| `list-scripts.json` | 6 | 🔴 Incomplete | Pagination calculation error |
| `save-script.json` | 4 | 🔴 Incomplete | No audit tracking |
| `validate-script.json` | 6 | 🔴 Incomplete | No compliance markers |

### Current Structure (Incomplete)

```json
{
  "name": "Export JSON Script",
  "active": false,                          // ⚠️ Has active flag
  "nodes": [ ... ],                         // ✅ Has nodes
  "connections": {},                        // ⚠️ Empty connections
  "staticData": {},
  "meta": {},
  "settings": { ... }

  // ❌ MISSING:
  // - id (workflow identifier)
  // - versionId (semantic versioning)
  // - tenantId (multi-tenant isolation)
  // - description (metadata)
  // - author (creator tracking)
  // - tags (categorization)
}
```

### Compliance Gap Analysis

| Field | Current | n8n Standard | Impact |
|-------|---------|--------------|--------|
| `id` | ❌ Missing | REQUIRED | Cannot persist workflow instances |
| `versionId` | ❌ Missing | REQUIRED | No version tracking |
| `tenantId` | ❌ Missing | REQUIRED | Multi-tenant data leakage risk |
| `active` | ✅ Present | REQUIRED | Execution status flag |
| `name` | ✅ Present | REQUIRED | Display name |
| `description` | ❌ Missing | OPTIONAL | Metadata missing |
| `author` | ❌ Missing | OPTIONAL | Audit trail incomplete |
| `tags` | ❌ Missing | OPTIONAL | Categorization missing |
| `nodes[].id` | ✅ Present | REQUIRED | Node identification |
| `nodes[].type` | ✅ Present | REQUIRED | Node classification |
| `nodes[].typeVersion` | ✅ Present | REQUIRED | API versioning |
| `nodes[].parameters` | ✅ Present | REQUIRED | Configuration data |
| `connections` | ✅ Present (empty) | REQUIRED | Node linking |
| `settings` | ✅ Present | REQUIRED | Execution config |

---

## Required Changes (Detailed)

### 1. Workflow-Level Metadata

#### Add Root-Level Fields

```json
{
  "id": "json_script_editor_export_001",           // NEW: Unique identifier
  "versionId": "1.0.0",                           // NEW: Semantic version
  "tenantId": "{{ $context.tenantId }}",          // NEW: Tenant isolation
  "name": "Export JSON Script",                   // EXISTING
  "active": false,                                // EXISTING
  "description": "Exports a JSON Script to file for download",  // NEW
  "author": "MetaBuilder Admin",                  // NEW
  "tags": ["json-script", "export", "admin"],     // NEW
  "createdAt": "2026-01-22T00:00:00Z",           // NEW
  "updatedAt": "2026-01-22T00:00:00Z"            // NEW
}
```

#### Naming Convention for `id`

```
{packageId}_{action}_{sequence}

Examples:
- json_script_editor_export_001
- json_script_editor_import_001
- json_script_editor_list_001
- json_script_editor_save_001
- json_script_editor_validate_001
```

### 2. Node Type Standardization

#### Current Issue

```json
{
  "type": "metabuilder.validate",              // ⚠️ Generic prefix
  "typeVersion": 1
}
```

#### Corrected (Following PackageRepo Pattern)

```json
{
  "type": "metabuilder.operation.validate",    // ✅ Namespace hierarchy
  "typeVersion": 1
}
```

#### Complete Type Mapping

| Current Type | Updated Type | Category | Purpose |
|--------------|--------------|----------|---------|
| `metabuilder.validate` | `metabuilder.operation.validate` | Validation | Input validation |
| `metabuilder.condition` | `metabuilder.logic.condition` | Logic | Conditional branching |
| `metabuilder.transform` | `metabuilder.data.transform` | Data | Data transformation |
| `metabuilder.database` | `metabuilder.data.database` | Persistence | Database CRUD operations |
| `metabuilder.action` | `metabuilder.http.response` | HTTP | HTTP responses |
| `metabuilder.operation` | `metabuilder.data.count` | Data | Count operations |

### 3. Connection Graph Fixes

#### Current Issue

```json
{
  "connections": {}                           // ⚠️ Empty connections object
}
```

#### Why This Matters

- Empty connections = orphaned nodes (no execution flow)
- Workflows won't execute properly
- Visual builders can't render execution flow

#### Corrected Pattern (from PackageRepo)

```json
{
  "connections": {
    "validate_context": {
      "main": {
        "0": [
          {
            "node": "fetch_script",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "fetch_script": {
      "main": {
        "0": [
          {
            "node": "prepare_export",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "prepare_export": {
      "main": {
        "0": [
          {
            "node": "return_file",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

### 4. Pagination Fix (list-scripts.json)

#### Current Bug

```json
{
  "id": "extract_pagination",
  "parameters": {
    "output": {
      "limit": "{{ Math.min($json.limit || 50, 500) }}",
      "offset": "{{ ($json.page || 1 - 1) * ($json.limit || 50) }}"  // ❌ WRONG!
    }
  }
}
```

**Problem**: Operator precedence - `1 - 1` evaluates before `||`

#### Corrected

```json
{
  "id": "extract_pagination",
  "parameters": {
    "output": {
      "limit": "{{ Math.min($json.limit || 50, 500) }}",
      "offset": "{{ (($json.page || 1) - 1) * ($json.limit || 50) }}"  // ✅ CORRECT
    }
  }
}
```

---

## Workflow-by-Workflow Updates

### 1. Export Script (`export-script.json`)

**Purpose**: Download a JSON Script as a `.jsonscript` file

**Current Issues**:
- ❌ No workflow ID or version
- ❌ No tenant isolation
- ❌ Empty connections
- ❌ Missing audit metadata

**Changes**:

```json
{
  "id": "json_script_editor_export_001",
  "versionId": "1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "name": "Export JSON Script",
  "description": "Exports a JSON Script to file for download",
  "author": "MetaBuilder Admin",
  "tags": ["json-script", "export", "admin"],
  "active": false,
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.operation.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "fetch_script",
      "name": "Fetch Script",
      "type": "metabuilder.data.database",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "filter": {
          "id": "{{ $json.scriptId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_read",
        "entity": "JSONScript"
      }
    },
    {
      "id": "prepare_export",
      "name": "Prepare Export",
      "type": "metabuilder.data.transform",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "output": {
          "name": "{{ $steps.fetch_script.output.name }}.jsonscript",
          "content": "{{ $steps.fetch_script.output.script }}",
          "contentType": "application/json"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "return_file",
      "name": "Return File",
      "type": "metabuilder.http.response",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "headers": {
          "Content-Type": "application/json",
          "Content-Disposition": "attachment; filename={{ $steps.prepare_export.output.name }}"
        },
        "body": "{{ $steps.prepare_export.output.content }}"
      }
    }
  ],
  "connections": {
    "validate_context": {
      "main": {
        "0": [{"node": "fetch_script", "type": "main", "index": 0}]
      }
    },
    "fetch_script": {
      "main": {
        "0": [{"node": "prepare_export", "type": "main", "index": 0}]
      }
    },
    "prepare_export": {
      "main": {
        "0": [{"node": "return_file", "type": "main", "index": 0}]
      }
    }
  },
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

**Updated Elements**:
- ✅ Added `id`, `versionId`, `tenantId` (top-level)
- ✅ Added `description`, `author`, `tags`
- ✅ Updated all node types to namespace hierarchy
- ✅ Added proper `connections` graph

---

### 2. Import Script (`import-script.json`)

**Purpose**: Upload and persist a JSON Script file

**Current Issues**:
- ❌ No workflow metadata (id, version, tenantId)
- ❌ Missing connection graph
- ❌ No audit tracking for import source

**Changes**:

```json
{
  "id": "json_script_editor_import_001",
  "versionId": "1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "name": "Import JSON Script",
  "description": "Uploads and persists a JSON Script from file",
  "author": "MetaBuilder Admin",
  "tags": ["json-script", "import", "admin"],
  "active": false,
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.operation.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "check_permission",
      "name": "Check Permission",
      "type": "metabuilder.logic.condition",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "condition": "{{ $context.user.level >= 3 }}",
        "operation": "condition"
      }
    },
    {
      "id": "parse_script",
      "name": "Parse Script",
      "type": "metabuilder.data.transform",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "input": "{{ $json.fileContent }}",
        "output": "{{ JSON.parse($json.fileContent) }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "validate_format",
      "name": "Validate Format",
      "type": "metabuilder.logic.condition",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "condition": "{{ $steps.parse_script.output.version === '2.2.0' }}",
        "operation": "condition"
      }
    },
    {
      "id": "create_script",
      "name": "Create Script",
      "type": "metabuilder.data.database",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "data": {
          "tenantId": "{{ $context.tenantId }}",
          "createdBy": "{{ $context.user.id }}",
          "name": "{{ $json.name || 'Imported Script' }}",
          "script": "{{ JSON.stringify($steps.parse_script.output) }}",
          "createdAt": "{{ new Date().toISOString() }}"
        },
        "operation": "database_create",
        "entity": "JSONScript"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.http.response",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "action": "http_response",
        "status": 201,
        "body": {
          "id": "{{ $steps.create_script.output.id }}",
          "message": "Script imported"
        }
      }
    }
  ],
  "connections": {
    "validate_context": {
      "main": {
        "0": [{"node": "check_permission", "type": "main", "index": 0}]
      }
    },
    "check_permission": {
      "main": {
        "0": [{"node": "parse_script", "type": "main", "index": 0}]
      }
    },
    "parse_script": {
      "main": {
        "0": [{"node": "validate_format", "type": "main", "index": 0}]
      }
    },
    "validate_format": {
      "main": {
        "0": [{"node": "create_script", "type": "main", "index": 0}]
      }
    },
    "create_script": {
      "main": {
        "0": [{"node": "return_success", "type": "main", "index": 0}]
      }
    }
  },
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

**Updated Elements**:
- ✅ Added workflow-level metadata
- ✅ Updated node types to namespace hierarchy
- ✅ Added complete connection graph
- ✅ Maintained permission checking (user.level >= 3)

---

### 3. List Scripts (`list-scripts.json`)

**Purpose**: Retrieve paginated list of scripts for the tenant

**Current Issues**:
- ❌ No workflow metadata
- ❌ Pagination calculation bug (operator precedence)
- ❌ Missing connection graph
- ❌ No tenant filtering on count

**Changes**:

```json
{
  "id": "json_script_editor_list_001",
  "versionId": "1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "name": "List JSON Scripts",
  "description": "Retrieves paginated list of scripts for the tenant",
  "author": "MetaBuilder Admin",
  "tags": ["json-script", "list", "pagination"],
  "active": false,
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.operation.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "extract_pagination",
      "name": "Extract Pagination",
      "type": "metabuilder.data.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "output": {
          "limit": "{{ Math.min($json.limit || 50, 500) }}",
          "offset": "{{ (($json.page || 1) - 1) * ($json.limit || 50) }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "fetch_scripts",
      "name": "Fetch Scripts",
      "type": "metabuilder.data.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}"
        },
        "sort": {
          "createdAt": -1
        },
        "limit": "{{ $steps.extract_pagination.output.limit }}",
        "offset": "{{ $steps.extract_pagination.output.offset }}",
        "operation": "database_read",
        "entity": "JSONScript"
      }
    },
    {
      "id": "count_total",
      "name": "Count Total",
      "type": "metabuilder.data.count",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_count",
        "entity": "JSONScript"
      }
    },
    {
      "id": "format_response",
      "name": "Format Response",
      "type": "metabuilder.data.transform",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "output": {
          "scripts": "{{ $steps.fetch_scripts.output }}",
          "pagination": {
            "total": "{{ $steps.count_total.output }}",
            "limit": "{{ $steps.extract_pagination.output.limit }}"
          }
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.http.response",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": "{{ $steps.format_response.output }}"
      }
    }
  ],
  "connections": {
    "validate_context": {
      "main": {
        "0": [{"node": "extract_pagination", "type": "main", "index": 0}]
      }
    },
    "extract_pagination": {
      "main": {
        "0": [
          {"node": "fetch_scripts", "type": "main", "index": 0},
          {"node": "count_total", "type": "main", "index": 0}
        ]
      }
    },
    "fetch_scripts": {
      "main": {
        "0": [{"node": "format_response", "type": "main", "index": 0}]
      }
    },
    "count_total": {
      "main": {
        "0": [{"node": "format_response", "type": "main", "index": 0}]
      }
    },
    "format_response": {
      "main": {
        "0": [{"node": "return_success", "type": "main", "index": 0}]
      }
    }
  },
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

**Updated Elements**:
- ✅ Added workflow-level metadata
- ✅ **Fixed pagination bug**: Changed `($json.page || 1 - 1)` to `(($json.page || 1) - 1)`
- ✅ Updated node types
- ✅ Added proper parallel execution connections (fan-out from extract_pagination)
- ✅ Added tenant filtering to count operation

---

### 4. Save Script (`save-script.json`)

**Purpose**: Create a new JSON Script in the database

**Current Issues**:
- ❌ No workflow metadata
- ❌ Missing connection graph
- ❌ No audit trail for creation

**Changes**:

```json
{
  "id": "json_script_editor_save_001",
  "versionId": "1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "name": "Save JSON Script",
  "description": "Creates a new JSON Script in the database",
  "author": "MetaBuilder Admin",
  "tags": ["json-script", "create", "admin"],
  "active": false,
  "nodes": [
    {
      "id": "check_permission",
      "name": "Check Permission",
      "type": "metabuilder.logic.condition",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "condition": "{{ $context.user.level >= 3 }}",
        "operation": "condition"
      }
    },
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "metabuilder.operation.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "input": "{{ $json }}",
        "operation": "validate",
        "rules": {
          "name": "required|string",
          "script": "required|string"
        }
      }
    },
    {
      "id": "create_script",
      "name": "Create Script",
      "type": "metabuilder.data.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "data": {
          "tenantId": "{{ $context.tenantId }}",
          "createdBy": "{{ $context.user.id }}",
          "name": "{{ $json.name }}",
          "description": "{{ $json.description }}",
          "script": "{{ $json.script }}",
          "createdAt": "{{ new Date().toISOString() }}"
        },
        "operation": "database_create",
        "entity": "JSONScript"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.http.response",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "action": "http_response",
        "status": 201,
        "body": {
          "id": "{{ $steps.create_script.output.id }}",
          "message": "Script saved"
        }
      }
    }
  ],
  "connections": {
    "check_permission": {
      "main": {
        "0": [{"node": "validate_input", "type": "main", "index": 0}]
      }
    },
    "validate_input": {
      "main": {
        "0": [{"node": "create_script", "type": "main", "index": 0}]
      }
    },
    "create_script": {
      "main": {
        "0": [{"node": "return_success", "type": "main", "index": 0}]
      }
    }
  },
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

**Updated Elements**:
- ✅ Added workflow-level metadata
- ✅ Updated node types to namespace hierarchy
- ✅ Added complete connection graph

---

### 5. Validate Script (`validate-script.json`)

**Purpose**: Validates JSON Script structure and version

**Current Issues**:
- ❌ No workflow metadata
- ❌ Missing connection graph
- ❌ Incomplete validation rules

**Changes**:

```json
{
  "id": "json_script_editor_validate_001",
  "versionId": "1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "name": "Validate JSON Script",
  "description": "Validates JSON Script structure and version compliance",
  "author": "MetaBuilder Admin",
  "tags": ["json-script", "validate", "schema"],
  "active": false,
  "nodes": [
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "metabuilder.operation.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $json }}",
        "operation": "validate",
        "rules": {
          "script": "required|string"
        }
      }
    },
    {
      "id": "parse_json",
      "name": "Parse JSON",
      "type": "metabuilder.data.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "input": "{{ $json.script }}",
        "output": "{{ JSON.parse($json.script) }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "validate_version",
      "name": "Validate Version",
      "type": "metabuilder.logic.condition",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "condition": "{{ $steps.parse_json.output.version === '2.2.0' }}",
        "operation": "condition"
      }
    },
    {
      "id": "validate_nodes",
      "name": "Validate Nodes",
      "type": "metabuilder.logic.condition",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "condition": "{{ Array.isArray($steps.parse_json.output.nodes) && $steps.parse_json.output.nodes.length > 0 }}",
        "operation": "condition"
      }
    },
    {
      "id": "validate_node_structure",
      "name": "Validate Node Structure",
      "type": "metabuilder.data.transform",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "output": "{{ $steps.parse_json.output.nodes.every(node => node.id && node.type) }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "return_valid",
      "name": "Return Valid",
      "type": "metabuilder.http.response",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "valid": true,
          "message": "Script is valid"
        }
      }
    }
  ],
  "connections": {
    "validate_input": {
      "main": {
        "0": [{"node": "parse_json", "type": "main", "index": 0}]
      }
    },
    "parse_json": {
      "main": {
        "0": [
          {"node": "validate_version", "type": "main", "index": 0},
          {"node": "validate_nodes", "type": "main", "index": 0}
        ]
      }
    },
    "validate_version": {
      "main": {
        "0": [{"node": "validate_node_structure", "type": "main", "index": 0}]
      }
    },
    "validate_nodes": {
      "main": {
        "0": [{"node": "validate_node_structure", "type": "main", "index": 0}]
      }
    },
    "validate_node_structure": {
      "main": {
        "0": [{"node": "return_valid", "type": "main", "index": 0}]
      }
    }
  },
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

**Updated Elements**:
- ✅ Added workflow-level metadata
- ✅ Updated node types to namespace hierarchy
- ✅ Added parallel execution (fan-out validation)
- ✅ Added merge point for validation results

---

## Implementation Checklist

### Phase 1: Planning & Validation (Current)

- [ ] **Review all 5 workflows** for current state
- [ ] **Document existing issues** in each workflow
- [ ] **Get stakeholder approval** for changes
- [ ] **Backup original files** before modifications

### Phase 2: Implementation

#### Pre-Implementation

- [ ] Create feature branch: `feature/ui-json-script-editor-n8n-compliance`
- [ ] Create backup directory: `packages/ui_json_script_editor/workflow/backups/`
- [ ] Copy original files for rollback capability

#### Implementation Steps

**For Each Workflow** (export, import, list, save, validate):

1. **Update Metadata**
   - [ ] Add `id` field (format: `json_script_editor_{action}_001`)
   - [ ] Add `versionId` field (start with `1.0.0`)
   - [ ] Add `tenantId` field with context reference
   - [ ] Add `description` with purpose summary
   - [ ] Add `author` field (set to "MetaBuilder Admin")
   - [ ] Add `tags` array with categorization
   - [ ] Add timestamps (createdAt, updatedAt)

2. **Update Node Types**
   - [ ] Map all node types to namespace hierarchy:
     - `metabuilder.validate` → `metabuilder.operation.validate`
     - `metabuilder.condition` → `metabuilder.logic.condition`
     - `metabuilder.transform` → `metabuilder.data.transform`
     - `metabuilder.database` → `metabuilder.data.database`
     - `metabuilder.action` → `metabuilder.http.response`
     - `metabuilder.operation` → `metabuilder.data.count`

3. **Add Connection Graph**
   - [ ] Generate connections for all nodes
   - [ ] Verify linear flow for sequential workflows
   - [ ] Verify fan-out/fan-in for parallel operations
   - [ ] Validate no orphaned nodes

4. **Special Fixes**
   - [ ] **list-scripts.json**: Fix pagination bug
     - Change: `($json.page || 1 - 1)`
     - To: `(($json.page || 1) - 1)`
   - [ ] **import-script.json**: Ensure tenant isolation
   - [ ] **save-script.json**: Verify audit tracking

#### Unit Validation

- [ ] Validate JSON syntax for each workflow (use `jq` or JSON validator)
- [ ] Verify all required fields present
- [ ] Check all node IDs are unique within workflow
- [ ] Verify all connection targets exist as nodes
- [ ] Test tenant context is properly isolated

### Phase 3: Testing

- [ ] **Schema Validation**: Validate against `/schemas/package-schemas/workflow.schema.json`
- [ ] **Structure Validation**: Run through workflow validator
- [ ] **Compliance Check**: Verify all 5 workflows pass n8n standard checks
- [ ] **Execution Test**: Test workflows in development environment
- [ ] **Integration Test**: Test with actual script data

### Phase 4: Documentation & Deployment

- [ ] Update `package.json` file inventory section
- [ ] Update `JSON_SCRIPT_EDITOR_GUIDE.md` with new schema information
- [ ] Create migration guide for users
- [ ] Create PR with all changes
- [ ] Get code review approval
- [ ] Merge to main branch

---

## Validation Checklist

### For Each Workflow

- [ ] **Root-level fields present**:
  - `id` ✓
  - `versionId` ✓
  - `tenantId` ✓
  - `name` ✓
  - `active` ✓
  - `description` ✓
  - `author` ✓
  - `tags` ✓

- [ ] **Node requirements**:
  - All nodes have unique `id` ✓
  - All nodes have `name` ✓
  - All nodes have proper `type` (namespace hierarchy) ✓
  - All nodes have `typeVersion` >= 1 ✓
  - All nodes have `position` [x, y] ✓
  - All nodes have `parameters` object ✓

- [ ] **Connection graph**:
  - `connections` object is not empty ✓
  - All connection targets match existing node IDs ✓
  - No orphaned nodes (all have incoming/outgoing connections) ✓
  - Flow is logically sound ✓

- [ ] **Settings present**:
  - `timezone` set to "UTC" ✓
  - `executionTimeout` defined ✓
  - `saveExecutionProgress` set to true ✓
  - `saveDataErrorExecution` set to appropriate value ✓
  - `saveDataSuccessExecution` set to appropriate value ✓

- [ ] **Multi-tenant safety**:
  - Top-level `tenantId` references `$context.tenantId` ✓
  - All database filters include `tenantId` ✓
  - No queries bypass tenant isolation ✓

- [ ] **Specific fixes applied**:
  - ✓ (export-script) Connections added
  - ✓ (import-script) Connections added, metadata added
  - ✓ (list-scripts) Pagination bug fixed, connections added
  - ✓ (save-script) Connections added, audit tracking maintained
  - ✓ (validate-script) Connections added, parallel validation

---

## File Updates Summary

### Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `workflow/export-script.json` | Add metadata (id/version/tenantId), update types, add connections | HIGH |
| `workflow/import-script.json` | Add metadata, update types, add connections | HIGH |
| `workflow/list-scripts.json` | Fix pagination bug, add metadata, update types, add connections | HIGH |
| `workflow/save-script.json` | Add metadata, update types, add connections | HIGH |
| `workflow/validate-script.json` | Add metadata, update types, add connections | HIGH |
| `package.json` | Update file inventory section | MEDIUM |
| `JSON_SCRIPT_EDITOR_GUIDE.md` | Document schema changes | MEDIUM |

### No Changes Required

- `seed/metadata.json` (already compliant)
- `seed/component.json` (UI components, separate concern)
- `seed/page-config.json` (routing, separate concern)
- `component/` directory (UI layer, separate concern)
- `page-config/` directory (routing layer, separate concern)

---

## Success Criteria

### Compliance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Workflows with `id` | 5/5 | 0/5 | 🔴 → 🟢 |
| Workflows with `versionId` | 5/5 | 0/5 | 🔴 → 🟢 |
| Workflows with `tenantId` | 5/5 | 0/5 | 🔴 → 🟢 |
| Node types using namespace | 5/5 | 0/5 | 🔴 → 🟢 |
| Workflows with valid connections | 5/5 | 0/5 | 🔴 → 🟢 |
| Pagination bug fixed | 1/1 | 0/1 | 🔴 → 🟢 |
| Multi-tenant isolation | 100% | 60% | 🟡 → 🟢 |

### Compliance Score

**Current**: 35/100 (Incomplete)
**Target**: 100/100 (Full n8n Compliance)

---

## Timeline Estimate

- **Planning & Exploration**: 1-2 hours
- **Implementation**: 3-4 hours (5 workflows × 40-50 min each)
- **Testing & Validation**: 2-3 hours
- **Documentation**: 1 hour
- **Code Review & Merge**: 1-2 hours

**Total**: 8-12 hours across 2-3 days

---

## Risk Mitigation

### Identified Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking existing code using old schema | HIGH | Maintain backward compatibility, use feature flag |
| Database queries fail with new metadata | MEDIUM | Test thoroughly in dev before production |
| Connection graph causes circular dependencies | MEDIUM | Validate DAG structure in testing phase |
| Tenant isolation regression | CRITICAL | Run multi-tenant security audit |

### Rollback Plan

1. Keep backups of original workflow files
2. Use `git revert` if needed
3. Maintain feature branch for quick reference
4. Database migrations (if needed) should be reversible

---

## Related Documentation

- **n8n Compliance Audit**: `/docs/N8N_COMPLIANCE_AUDIT.md`
- **JSON Script Editor Guide**: `JSON_SCRIPT_EDITOR_GUIDE.md`
- **Workflow Schema**: `/schemas/package-schemas/workflow.schema.json`
- **Package Repository Workflows**: `/packagerepo/backend/workflows/`
- **DBAL Operations**: `/dbal/shared/api/schema/operations/`

---

## Questions & Clarifications

### For Product Team

1. Should `author` field be dynamic (current user) or static?
2. What's the workflow for deprecating old schema versions?
3. Should we create a migration tool for legacy workflows?
4. Do we need backwards compatibility for the old schema?

### For Engineering Team

1. Database schema for storing workflow metadata?
2. Migration strategy for existing workflow instances?
3. Should we validate connections at runtime or compile-time?
4. How do we handle version updates to workflows?

---

## Appendix A: n8n Standard Reference

### Required Top-Level Fields

```typescript
interface Workflow {
  id: string                    // Unique identifier
  versionId: string             // Semantic version (1.0.0)
  tenantId: string              // Multi-tenant isolation
  name: string                  // Display name
  active: boolean               // Execution status
  description?: string          // Purpose description
  author?: string               // Creator
  tags?: string[]               // Categorization
  createdAt?: string            // ISO timestamp
  updatedAt?: string            // ISO timestamp
  nodes: Node[]                 // Node definitions
  connections: Connections      // Node linking
  staticData: object            // Static configuration
  meta: object                  // Metadata
  settings: WorkflowSettings    // Execution settings
}
```

### Required Node Fields

```typescript
interface Node {
  id: string                    // Unique within workflow
  name: string                  // Display name
  type: string                  // Namespace hierarchy (e.g., metabuilder.operation.validate)
  typeVersion: number           // API version (>= 1)
  position: [number, number]    // Canvas position [x, y]
  parameters: object            // Node configuration
}
```

### Connection Structure

```typescript
interface Connections {
  [nodeId: string]: {
    main: {
      [outputIndex: number]: Array<{
        node: string            // Target node ID
        type: "main"            // Connection type
        index: number           // Input index
      }>
    }
  }
}
```

---

**Status**: Ready for Implementation
**Last Updated**: 2026-01-22
**Next Steps**: Approve plan → Start Implementation Phase
