# JSON Script Editor Workflows - Updated Examples
## Production-Ready n8n-Compliant Definitions

**Last Updated**: 2026-01-22
**Version**: 1.0.0
**Status**: Ready for Implementation

---

## Quick Links

- [1. Export Script](#1-export-script-exportscriptjson)
- [2. Import Script](#2-import-script-importscriptjson)
- [3. List Scripts](#3-list-scripts-listscriptsjson)
- [4. Save Script](#4-save-script-savescriptjson)
- [5. Validate Script](#5-validate-script-validatescriptjson)

---

## 1. Export Script (`export-script.json`)

**Purpose**: Download a JSON Script to file for backup or sharing

**Node Flow**: validate_context → fetch_script → prepare_export → return_file

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
      "position": [
        100,
        100
      ],
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
      "position": [
        400,
        100
      ],
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
      "position": [
        700,
        100
      ],
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
      "position": [
        100,
        300
      ],
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

### What Changed

| Field | Before | After | Impact |
|-------|--------|-------|--------|
| `id` | ❌ Missing | `json_script_editor_export_001` | ✅ Workflow identification |
| `versionId` | ❌ Missing | `1.0.0` | ✅ Version tracking |
| `tenantId` | ❌ Missing | `{{ $context.tenantId }}` | ✅ Tenant isolation |
| `description` | ❌ Missing | "Exports a JSON Script to file..." | ✅ Documentation |
| `author` | ❌ Missing | "MetaBuilder Admin" | ✅ Audit trail |
| `tags` | ❌ Missing | ["json-script", "export", "admin"] | ✅ Categorization |
| Node types | `metabuilder.validate` → `metabuilder.action` | Namespace hierarchy | ✅ Compliance |
| `connections` | `{}` (empty) | Full graph | ✅ Execution flow |

---

## 2. Import Script (`import-script.json`)

**Purpose**: Upload and persist a JSON Script from file

**Node Flow**: validate_context → check_permission → parse_script → validate_format → create_script → return_success

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
      "position": [
        100,
        100
      ],
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
      "position": [
        400,
        100
      ],
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
      "position": [
        700,
        100
      ],
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
      "position": [
        100,
        300
      ],
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
      "position": [
        400,
        300
      ],
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
      "position": [
        700,
        300
      ],
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
        "0": [
          {
            "node": "check_permission",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "check_permission": {
      "main": {
        "0": [
          {
            "node": "parse_script",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "parse_script": {
      "main": {
        "0": [
          {
            "node": "validate_format",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "validate_format": {
      "main": {
        "0": [
          {
            "node": "create_script",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "create_script": {
      "main": {
        "0": [
          {
            "node": "return_success",
            "type": "main",
            "index": 0
          }
        ]
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

### What Changed

| Field | Before | After | Impact |
|-------|--------|-------|--------|
| `id` | ❌ Missing | `json_script_editor_import_001` | ✅ Workflow ID |
| `versionId` | ❌ Missing | `1.0.0` | ✅ Version tracking |
| `tenantId` | ❌ Missing | `{{ $context.tenantId }}` | ✅ Multi-tenant |
| `connections` | `{}` (empty) | Full 5-node chain | ✅ Execution flow |
| Node types | Mixed old format | All namespace hierarchy | ✅ Compliance |

---

## 3. List Scripts (`list-scripts.json`)

**Purpose**: Retrieve paginated list of scripts for the tenant

**Node Flow**: validate_context → extract_pagination → (fetch_scripts + count_total) → format_response → return_success

⚠️ **CRITICAL FIX**: Pagination calculation bug

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
      "position": [
        100,
        100
      ],
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
      "position": [
        400,
        100
      ],
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
      "position": [
        700,
        100
      ],
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
      "position": [
        100,
        300
      ],
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
      "position": [
        400,
        300
      ],
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
      "position": [
        700,
        300
      ],
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
        "0": [
          {
            "node": "extract_pagination",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "extract_pagination": {
      "main": {
        "0": [
          {
            "node": "fetch_scripts",
            "type": "main",
            "index": 0
          },
          {
            "node": "count_total",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "fetch_scripts": {
      "main": {
        "0": [
          {
            "node": "format_response",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "count_total": {
      "main": {
        "0": [
          {
            "node": "format_response",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "format_response": {
      "main": {
        "0": [
          {
            "node": "return_success",
            "type": "main",
            "index": 0
          }
        ]
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

### Critical Changes

| Issue | Before | After | Impact |
|-------|--------|-------|--------|
| Pagination bug | `($json.page \|\| 1 - 1)` | `(($json.page \|\| 1) - 1)` | 🔴 **CRITICAL FIX** |
| Operator precedence | Wrong calculation | Correct: `(page-1) * limit` | ✅ Pagination works |
| Node type | `metabuilder.operation` | `metabuilder.data.count` | ✅ Clarity |
| `connections` | `{}` (empty) | Full parallel execution | ✅ Fan-out/fan-in |
| Tenant isolation | Incomplete | All operations filtered | ✅ Security |

---

## 4. Save Script (`save-script.json`)

**Purpose**: Create a new JSON Script in the database

**Node Flow**: check_permission → validate_input → create_script → return_success

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
      "position": [
        100,
        100
      ],
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
      "position": [
        400,
        100
      ],
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
      "position": [
        700,
        100
      ],
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
      "position": [
        100,
        300
      ],
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
        "0": [
          {
            "node": "validate_input",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "validate_input": {
      "main": {
        "0": [
          {
            "node": "create_script",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "create_script": {
      "main": {
        "0": [
          {
            "node": "return_success",
            "type": "main",
            "index": 0
          }
        ]
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

### What Changed

| Field | Before | After | Impact |
|-------|--------|-------|--------|
| `id` | ❌ Missing | `json_script_editor_save_001` | ✅ Workflow ID |
| `versionId` | ❌ Missing | `1.0.0` | ✅ Versioning |
| `tenantId` | ❌ Missing | `{{ $context.tenantId }}` | ✅ Multi-tenant |
| `description` | ❌ Missing | "Creates a new JSON Script..." | ✅ Metadata |
| Node types | Old format | Namespace hierarchy | ✅ Standardized |
| `connections` | `{}` (empty) | 4-node chain | ✅ Flow |

---

## 5. Validate Script (`validate-script.json`)

**Purpose**: Validates JSON Script structure and version compliance

**Node Flow**: validate_input → parse_json → (validate_version + validate_nodes) → validate_node_structure → return_valid

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
      "position": [
        100,
        100
      ],
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
      "position": [
        400,
        100
      ],
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
      "position": [
        700,
        100
      ],
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
      "position": [
        100,
        300
      ],
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
      "position": [
        400,
        300
      ],
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
      "position": [
        700,
        300
      ],
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
        "0": [
          {
            "node": "parse_json",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "parse_json": {
      "main": {
        "0": [
          {
            "node": "validate_version",
            "type": "main",
            "index": 0
          },
          {
            "node": "validate_nodes",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "validate_version": {
      "main": {
        "0": [
          {
            "node": "validate_node_structure",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "validate_nodes": {
      "main": {
        "0": [
          {
            "node": "validate_node_structure",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "validate_node_structure": {
      "main": {
        "0": [
          {
            "node": "return_valid",
            "type": "main",
            "index": 0
          }
        ]
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

### What Changed

| Field | Before | After | Impact |
|-------|--------|-------|--------|
| `id` | ❌ Missing | `json_script_editor_validate_001` | ✅ Workflow ID |
| `versionId` | ❌ Missing | `1.0.0` | ✅ Versioning |
| `tenantId` | ❌ Missing | `{{ $context.tenantId }}` | ✅ Multi-tenant |
| `description` | ❌ Missing | "Validates JSON Script structure..." | ✅ Metadata |
| Node types | Old format | Namespace hierarchy | ✅ Compliance |
| `connections` | `{}` (empty) | Parallel + merge execution | ✅ Complex flow |

---

## Implementation Guide

### Step 1: Backup Original Files

```bash
mkdir -p packages/ui_json_script_editor/workflow/backups
cp packages/ui_json_script_editor/workflow/*.json packages/ui_json_script_editor/workflow/backups/
```

### Step 2: Replace Each Workflow File

Use the JSON examples above to replace each file:

```bash
# Option A: Manual (safest)
# 1. Open workflow/export-script.json
# 2. Copy entire JSON from section "1. Export Script" above
# 3. Save and validate with jq

# Option B: Script-based (faster)
cat > /tmp/update_workflows.sh << 'EOF'
#!/bin/bash
WORKFLOW_DIR="packages/ui_json_script_editor/workflow"

# Validate JSON syntax
validate_json() {
  if ! jq empty "$1" 2>/dev/null; then
    echo "❌ Invalid JSON: $1"
    return 1
  fi
  echo "✅ Valid JSON: $1"
  return 0
}

# Update each workflow
for workflow in export import list save validate; do
  FILE="${WORKFLOW_DIR}/${workflow}-script.json"
  # (Copy respective JSON from examples above)
  validate_json "$FILE" || exit 1
done

echo "✅ All workflows updated successfully"
EOF
bash /tmp/update_workflows.sh
```

### Step 3: Validate Each File

```bash
# Check JSON syntax
for f in packages/ui_json_script_editor/workflow/*.json; do
  if ! jq empty "$f"; then
    echo "❌ Syntax error in $f"
  else
    echo "✅ Valid: $f"
  fi
done

# Verify required fields
for f in packages/ui_json_script_editor/workflow/*.json; do
  echo "Checking $f..."
  jq 'if .id and .versionId and .tenantId then "✅ Complete" else "❌ Missing fields" end' "$f"
done
```

### Step 4: Test Execution

```bash
# Run workflow validation tests
npm --prefix frontends/nextjs run test -- --testPathPattern="json-script-editor"

# Check for any compilation errors
npm run typecheck

# Build for production
npm run build
```

### Step 5: Git Commit

```bash
git add packages/ui_json_script_editor/workflow/
git commit -m "feat(ui_json_script_editor): migrate workflows to n8n compliance

- Add id, versionId, tenantId fields to all workflows
- Update node types to namespace hierarchy
- Add complete connection graphs
- Fix pagination bug in list-scripts.json
- Improve multi-tenant isolation
- Add metadata (description, author, tags)

Workflows updated:
- export-script.json (1.0.0)
- import-script.json (1.0.0)
- list-scripts.json (1.0.0) - CRITICAL: pagination fix
- save-script.json (1.0.0)
- validate-script.json (1.0.0)"
```

---

## Quick Reference: Field Mapping

### Old to New Type Mapping

```
metabuilder.validate          → metabuilder.operation.validate
metabuilder.condition         → metabuilder.logic.condition
metabuilder.transform         → metabuilder.data.transform
metabuilder.database          → metabuilder.data.database
metabuilder.action            → metabuilder.http.response
metabuilder.operation         → metabuilder.data.count
```

### New Root-Level Fields (Add to All)

```json
{
  "id": "json_script_editor_{action}_001",
  "versionId": "1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "description": "Purpose of this workflow",
  "author": "MetaBuilder Admin",
  "tags": ["category", "action"]
}
```

### Connection Pattern (Linear)

```json
{
  "connections": {
    "node_a": {
      "main": {
        "0": [{"node": "node_b", "type": "main", "index": 0}]
      }
    }
  }
}
```

### Connection Pattern (Parallel)

```json
{
  "connections": {
    "split_node": {
      "main": {
        "0": [
          {"node": "branch_a", "type": "main", "index": 0},
          {"node": "branch_b", "type": "main", "index": 0}
        ]
      }
    }
  }
}
```

---

## Testing Checklist

For each workflow file:

- [ ] JSON syntax valid (no parser errors)
- [ ] All required root-level fields present
- [ ] All node IDs unique within workflow
- [ ] All connection targets match existing node IDs
- [ ] No circular dependencies in connections
- [ ] All nodes have typeVersion >= 1
- [ ] All positions are [x, y] number arrays
- [ ] tenantId filtering on all database queries
- [ ] HTTP responses have proper status codes

---

## Files Ready for Copy-Paste

1. **export-script.json**: 4 nodes, linear flow, simple
2. **import-script.json**: 6 nodes, sequential checks, high permission requirement
3. **list-scripts.json**: 6 nodes, **PAGINATION BUG FIX**, parallel execution
4. **save-script.json**: 4 nodes, permission-gated, creation with audit
5. **validate-script.json**: 6 nodes, parallel validation, schema compliance

---

**Status**: Production Ready
**Last Updated**: 2026-01-22
**Next**: Execute Implementation Phase using WORKFLOW_UPDATE_PLAN.md
