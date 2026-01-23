# UI Schema Editor Workflows: Comprehensive Update Plan

**Date**: 2026-01-22
**Status**: PLANNING - Ready for Implementation
**Scope**: Create all required n8n workflows for ui_schema_editor package
**Total Workflows Required**: 4 workflows
**Target Compliance**: 100/100 (Full n8n schema compliance)

---

## Executive Summary

The `ui_schema_editor` package is a **visual database entity editor for Supergod users**. Currently, the `/packages/ui_schema_editor/workflow/` directory is **empty** with no defined workflows. This plan specifies the creation of 4 workflows that enable the schema editor's core functionality:

| # | Workflow | Purpose | Nodes | Complexity |
|---|----------|---------|-------|------------|
| 1 | `editor-init.json` | Initialize schema editor UI and load entities | 5-6 nodes | MEDIUM |
| 2 | `validate-schema.json` | Validate JSON schema structure before save | 4-5 nodes | LOW |
| 3 | `save-schema.json` | Persist entity definition to database | 6-7 nodes | MEDIUM |
| 4 | `load-schema.json` | Retrieve entity definition for editing | 5-6 nodes | LOW |

**Total Nodes**: ~21 nodes across 4 workflows
**Estimated Implementation Time**: 4-6 hours
**Validation Requirements**: All must pass n8n schema validation (100/100 compliance)

---

## Current State Analysis

### Directory Structure

```
/packages/ui_schema_editor/
├── package.json                    ✅ Present
├── SCHEMA_EDITOR_GUIDE.md          ✅ Present (7 components documented)
├── seed/
│   ├── metadata.json               ✅ Present
│   ├── page-config.json            ✅ Present
│   └── component.json              ✅ Present (7 UI components)
└── workflow/                       ❌ EMPTY - No workflows
    ├── editor-init.json            ❌ MISSING
    ├── validate-schema.json        ❌ MISSING
    ├── save-schema.json            ❌ MISSING
    └── load-schema.json            ❌ MISSING
```

### Existing Components (From `seed/component.json`)

The package defines 7 UI components that workflows must support:

1. **SchemaEditorLayout** - Main container layout
2. **EntityList** - Sidebar with entity list
3. **EntityBuilder** - Main form for creating/editing entities
4. **FieldEditor** - Individual field editor
5. **SchemaPreview** - Live JSON preview
6. **ConstraintEditor** - Field constraints/validation
7. **RelationshipMapper** - Entity relationships

### Compliance Gap

| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| **Workflow Count** | 0 | 4 | 4 missing |
| **N8N Schema Compliance** | N/A | 100/100 | Full compliance needed |
| **Required Fields** | - | name, nodes, connections, active, settings | All missing |
| **Node Properties** | - | id, name, type, typeVersion, position | All missing |
| **Connections** | - | Proper n8n adjacency format | All missing |

---

## N8N Workflow Schema Reference

### Root Workflow Structure

```typescript
interface Workflow {
  // REQUIRED
  name: string                    // Workflow display name
  nodes: Node[]                   // Array of workflow nodes
  connections: Connections        // Execution flow graph

  // RECOMMENDED
  id?: string                     // Unique workflow ID (UUID recommended)
  version?: string                // Workflow version (semver)
  tenantId?: string              // Multi-tenant scope
  active?: boolean               // Is workflow enabled (default: true)

  // OPTIONAL
  settings?: {
    timezone?: string            // UTC, America/New_York, etc.
    executionTimeout?: number    // Milliseconds (default: 3600000)
    saveExecutionProgress?: boolean
    saveDataErrorExecution?: "all" | "none"
    saveDataSuccessExecution?: "all" | "none"
  }
  staticData?: Record<string, any>
  meta?: Record<string, any>
}
```

### Node Structure

```typescript
interface Node {
  // REQUIRED
  id: string                      // snake_case unique ID
  name: string                    // Display name
  type: string                    // Plugin type (category.subcategory)
  typeVersion: number             // Plugin version (≥1)
  position: [number, number]      // Canvas coordinates [x, y]

  // OPTIONAL
  parameters?: Record<string, any>
  disabled?: boolean              // Hide from execution
  notes?: string                  // Documentation/help text
  notesInFlow?: boolean          // Show notes on canvas
  continueOnFail?: boolean        // Continue execution on error
  credentials?: Record<string, any>
}
```

### Connections Format

```typescript
interface Connections {
  [sourceNodeName: string]: {
    main: {
      [outputIndex: number]: Array<{
        node: string            // Target node NAME (not ID)
        type: "main" | "error"  // Output type
        index: number           // Input index
      }>
    }
  }
}

// EXAMPLE:
{
  "connections": {
    "Parse Body": {
      "main": {
        "0": [
          {
            "node": "Validate Fields",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Validate Fields": {
      "main": {
        "0": [
          { "node": "Error Invalid", "type": "main", "index": 0 }
        ],
        "1": [
          { "node": "Process Data", "type": "main", "index": 0 }
        ]
      }
    }
  }
}
```

---

## Workflow Specifications

### Workflow 1: `editor-init.json`

**Purpose**: Initialize schema editor UI and fetch all entities from database

**Trigger**: Manual (page load)
**Input**: None
**Output**:
- List of all entities
- Entity metadata (field count, relationships, etc.)
- UI component state

**Nodes** (6 total):

```json
{
  "name": "Initialize Schema Editor",
  "id": "wf_editor_init",
  "version": "1.0.0",
  "tenantId": "{{ $request.tenantId }}",
  "active": true,
  "nodes": [
    {
      "id": "trigger_page_load",
      "name": "Trigger: Page Load",
      "type": "core.http_trigger",
      "typeVersion": 1,
      "position": [0, 100],
      "parameters": {
        "method": "GET",
        "path": "/schema-editor/init"
      }
    },
    {
      "id": "auth_verify",
      "name": "Verify Supergod Permission",
      "type": "auth.verify_role",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "requiredRole": "supergod",
        "input": "$request.user"
      }
    },
    {
      "id": "check_auth",
      "name": "Check Authorization",
      "type": "logic.if",
      "typeVersion": 1,
      "position": [600, 100],
      "parameters": {
        "condition": "$auth_verify != null",
        "then": "load_entities",
        "else": "error_unauthorized"
      }
    },
    {
      "id": "load_entities",
      "name": "Load All Entities",
      "type": "dbal.entity_list",
      "typeVersion": 1,
      "position": [900, 100],
      "parameters": {
        "entityType": "*",
        "filter": {
          "tenantId": "$request.tenantId"
        },
        "out": "entities"
      }
    },
    {
      "id": "enrich_metadata",
      "name": "Enrich Entity Metadata",
      "type": "transform.map_fields",
      "typeVersion": 1,
      "position": [1200, 100],
      "parameters": {
        "input": "$entities",
        "mappings": [
          {
            "from": "id",
            "to": "id"
          },
          {
            "from": "fields.length",
            "to": "fieldCount"
          },
          {
            "from": "relationships.length",
            "to": "relationshipCount"
          }
        ],
        "out": "enrichedEntities"
      }
    },
    {
      "id": "respond_success",
      "name": "Respond Success",
      "type": "http.respond",
      "typeVersion": 1,
      "position": [1500, 100],
      "parameters": {
        "status": 200,
        "body": {
          "ok": true,
          "entities": "$enrichedEntities",
          "timestamp": "{{ new Date().toISOString() }}"
        }
      }
    },
    {
      "id": "error_unauthorized",
      "name": "Error: Unauthorized",
      "type": "http.respond_error",
      "typeVersion": 1,
      "position": [600, 400],
      "parameters": {
        "status": 403,
        "message": "Only Supergod users can access schema editor"
      }
    }
  ],
  "connections": {
    "Trigger: Page Load": {
      "main": {
        "0": [
          {
            "node": "Verify Supergod Permission",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Verify Supergod Permission": {
      "main": {
        "0": [
          {
            "node": "Check Authorization",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Check Authorization": {
      "main": {
        "0": [
          {
            "node": "Error: Unauthorized",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Load All Entities",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Load All Entities": {
      "main": {
        "0": [
          {
            "node": "Enrich Entity Metadata",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Enrich Entity Metadata": {
      "main": {
        "0": [
          {
            "node": "Respond Success",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600000,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "staticData": {},
  "meta": {
    "description": "Initialize schema editor with list of all entities",
    "tags": ["schema-editor", "admin", "initialization"],
    "created": "2026-01-22",
    "modified": "2026-01-22"
  }
}
```

---

### Workflow 2: `validate-schema.json`

**Purpose**: Validate JSON schema structure before saving to database

**Trigger**: Form submission
**Input**:
- Entity definition (JSON)
- Field definitions (array)
- Relationships (array)

**Output**:
- Validation result (pass/fail)
- Error messages (if any)

**Nodes** (4 total):

```json
{
  "name": "Validate Schema",
  "id": "wf_validate_schema",
  "version": "1.0.0",
  "tenantId": "{{ $request.tenantId }}",
  "active": true,
  "nodes": [
    {
      "id": "trigger_validate",
      "name": "Trigger: Validate Request",
      "type": "core.http_trigger",
      "typeVersion": 1,
      "position": [0, 100],
      "parameters": {
        "method": "POST",
        "path": "/schema-editor/validate"
      }
    },
    {
      "id": "parse_input",
      "name": "Parse Input Schema",
      "type": "transform.parse_json",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "input": "$request.body",
        "out": "schema"
      }
    },
    {
      "id": "validate_against_schema",
      "name": "Validate Against JSON Schema",
      "type": "validation.schema_validate",
      "typeVersion": 1,
      "position": [600, 100],
      "parameters": {
        "data": "$schema",
        "schema": {
          "type": "object",
          "required": ["entity", "fields"],
          "properties": {
            "entity": {
              "type": "string",
              "minLength": 1,
              "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
            },
            "fields": {
              "type": "array",
              "minItems": 1,
              "items": {
                "type": "object",
                "required": ["name", "type"],
                "properties": {
                  "name": { "type": "string" },
                  "type": {
                    "type": "string",
                    "enum": [
                      "String", "Number", "Boolean", "Date", "DateTime",
                      "Array", "Object", "UUID", "Email", "URL",
                      "JSON", "Text", "Enum"
                    ]
                  },
                  "constraints": { "type": "object" }
                }
              }
            },
            "relationships": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["type", "from", "to"],
                "properties": {
                  "type": {
                    "enum": ["one-to-one", "one-to-many", "many-to-many"]
                  },
                  "from": { "type": "string" },
                  "to": { "type": "string" }
                }
              }
            }
          }
        },
        "out": "validationResult"
      }
    },
    {
      "id": "check_valid",
      "name": "Check Validation Result",
      "type": "logic.if",
      "typeVersion": 1,
      "position": [900, 100],
      "parameters": {
        "condition": "$validationResult.valid === true",
        "then": "respond_valid",
        "else": "respond_invalid"
      }
    },
    {
      "id": "respond_valid",
      "name": "Respond: Valid",
      "type": "http.respond",
      "typeVersion": 1,
      "position": [1200, 0],
      "parameters": {
        "status": 200,
        "body": {
          "ok": true,
          "valid": true,
          "message": "Schema is valid"
        }
      }
    },
    {
      "id": "respond_invalid",
      "name": "Respond: Invalid",
      "type": "http.respond_error",
      "typeVersion": 1,
      "position": [1200, 200],
      "parameters": {
        "status": 400,
        "message": "Schema validation failed",
        "details": "$validationResult.errors"
      }
    }
  ],
  "connections": {
    "Trigger: Validate Request": {
      "main": {
        "0": [
          {
            "node": "Parse Input Schema",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Parse Input Schema": {
      "main": {
        "0": [
          {
            "node": "Validate Against JSON Schema",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Validate Against JSON Schema": {
      "main": {
        "0": [
          {
            "node": "Check Validation Result",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Check Validation Result": {
      "main": {
        "0": [
          {
            "node": "Respond: Invalid",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Respond: Valid",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600000,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "staticData": {},
  "meta": {
    "description": "Validate JSON schema structure against MetaBuilder entity schema",
    "tags": ["schema-editor", "validation"],
    "created": "2026-01-22"
  }
}
```

---

### Workflow 3: `save-schema.json`

**Purpose**: Persist entity definition to database and trigger code generation

**Trigger**: Save button click
**Input**:
- Entity definition (JSON)
- User ID (for audit trail)

**Output**:
- Success/failure status
- New entity ID
- Timestamp

**Nodes** (7 total):

```json
{
  "name": "Save Schema",
  "id": "wf_save_schema",
  "version": "1.0.0",
  "tenantId": "{{ $request.tenantId }}",
  "active": true,
  "nodes": [
    {
      "id": "trigger_save",
      "name": "Trigger: Save Request",
      "type": "core.http_trigger",
      "typeVersion": 1,
      "position": [0, 100],
      "parameters": {
        "method": "POST",
        "path": "/schema-editor/save"
      }
    },
    {
      "id": "auth_verify",
      "name": "Verify Supergod",
      "type": "auth.verify_role",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "requiredRole": "supergod",
        "input": "$request.user"
      }
    },
    {
      "id": "check_auth",
      "name": "Check Permission",
      "type": "logic.if",
      "typeVersion": 1,
      "position": [600, 100],
      "parameters": {
        "condition": "$auth_verify != null",
        "then": "parse_schema",
        "else": "error_forbidden"
      }
    },
    {
      "id": "parse_schema",
      "name": "Parse Schema Data",
      "type": "transform.parse_json",
      "typeVersion": 1,
      "position": [900, 100],
      "parameters": {
        "input": "$request.body",
        "out": "schema"
      }
    },
    {
      "id": "save_to_db",
      "name": "Save to Database",
      "type": "dbal.entity_create",
      "typeVersion": 1,
      "position": [1200, 100],
      "parameters": {
        "entity": "SchemaDefinition",
        "data": {
          "tenantId": "$request.tenantId",
          "entity": "$schema.entity",
          "definition": "$schema",
          "createdBy": "$request.user.id",
          "createdAt": "{{ new Date().toISOString() }}"
        },
        "out": "savedEntity"
      }
    },
    {
      "id": "trigger_codegen",
      "name": "Trigger Code Generation",
      "type": "workflow.execute",
      "typeVersion": 1,
      "position": [1500, 100],
      "parameters": {
        "workflowId": "codegen_prisma_schema",
        "input": {
          "entityId": "$savedEntity.id",
          "entity": "$schema"
        },
        "out": "codegenResult"
      }
    },
    {
      "id": "respond_success",
      "name": "Respond Success",
      "type": "http.respond",
      "typeVersion": 1,
      "position": [1800, 100],
      "parameters": {
        "status": 201,
        "body": {
          "ok": true,
          "id": "$savedEntity.id",
          "message": "Entity created successfully",
          "entity": "$schema.entity",
          "timestamp": "{{ new Date().toISOString() }}"
        }
      }
    },
    {
      "id": "error_forbidden",
      "name": "Error: Forbidden",
      "type": "http.respond_error",
      "typeVersion": 1,
      "position": [600, 400],
      "parameters": {
        "status": 403,
        "message": "Only Supergod users can save schemas"
      }
    }
  ],
  "connections": {
    "Trigger: Save Request": {
      "main": {
        "0": [
          {
            "node": "Verify Supergod",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Verify Supergod": {
      "main": {
        "0": [
          {
            "node": "Check Permission",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Check Permission": {
      "main": {
        "0": [
          {
            "node": "Error: Forbidden",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Parse Schema Data",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Parse Schema Data": {
      "main": {
        "0": [
          {
            "node": "Save to Database",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Save to Database": {
      "main": {
        "0": [
          {
            "node": "Trigger Code Generation",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Trigger Code Generation": {
      "main": {
        "0": [
          {
            "node": "Respond Success",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600000,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "staticData": {},
  "meta": {
    "description": "Save entity definition to database and trigger Prisma schema generation",
    "tags": ["schema-editor", "persistence", "codegen"],
    "created": "2026-01-22"
  }
}
```

---

### Workflow 4: `load-schema.json`

**Purpose**: Retrieve entity definition for editing in UI

**Trigger**: Edit entity button click
**Input**:
- Entity ID (from URL params or form)

**Output**:
- Entity definition (JSON)
- Field definitions (array)
- Relationships (array)

**Nodes** (5 total):

```json
{
  "name": "Load Schema",
  "id": "wf_load_schema",
  "version": "1.0.0",
  "tenantId": "{{ $request.tenantId }}",
  "active": true,
  "nodes": [
    {
      "id": "trigger_load",
      "name": "Trigger: Load Request",
      "type": "core.http_trigger",
      "typeVersion": 1,
      "position": [0, 100],
      "parameters": {
        "method": "GET",
        "path": "/schema-editor/load/:entityId"
      }
    },
    {
      "id": "auth_verify",
      "name": "Verify Supergod",
      "type": "auth.verify_role",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "requiredRole": "supergod",
        "input": "$request.user"
      }
    },
    {
      "id": "check_auth",
      "name": "Check Permission",
      "type": "logic.if",
      "typeVersion": 1,
      "position": [600, 100],
      "parameters": {
        "condition": "$auth_verify != null",
        "then": "fetch_entity",
        "else": "error_forbidden"
      }
    },
    {
      "id": "fetch_entity",
      "name": "Fetch Entity Definition",
      "type": "dbal.entity_get",
      "typeVersion": 1,
      "position": [900, 100],
      "parameters": {
        "entity": "SchemaDefinition",
        "id": "$request.params.entityId",
        "filter": {
          "tenantId": "$request.tenantId"
        },
        "out": "entity"
      }
    },
    {
      "id": "check_found",
      "name": "Check Entity Found",
      "type": "logic.if",
      "typeVersion": 1,
      "position": [1200, 100],
      "parameters": {
        "condition": "$entity != null",
        "then": "respond_found",
        "else": "error_not_found"
      }
    },
    {
      "id": "respond_found",
      "name": "Respond Success",
      "type": "http.respond",
      "typeVersion": 1,
      "position": [1500, 0],
      "parameters": {
        "status": 200,
        "body": {
          "ok": true,
          "entity": "$entity",
          "timestamp": "{{ new Date().toISOString() }}"
        }
      }
    },
    {
      "id": "error_forbidden",
      "name": "Error: Forbidden",
      "type": "http.respond_error",
      "typeVersion": 1,
      "position": [600, 400],
      "parameters": {
        "status": 403,
        "message": "Only Supergod users can load schemas"
      }
    },
    {
      "id": "error_not_found",
      "name": "Error: Not Found",
      "type": "http.respond_error",
      "typeVersion": 1,
      "position": [1500, 300],
      "parameters": {
        "status": 404,
        "message": "Entity definition not found"
      }
    }
  ],
  "connections": {
    "Trigger: Load Request": {
      "main": {
        "0": [
          {
            "node": "Verify Supergod",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Verify Supergod": {
      "main": {
        "0": [
          {
            "node": "Check Permission",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Check Permission": {
      "main": {
        "0": [
          {
            "node": "Error: Forbidden",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Fetch Entity Definition",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Fetch Entity Definition": {
      "main": {
        "0": [
          {
            "node": "Check Entity Found",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Check Entity Found": {
      "main": {
        "0": [
          {
            "node": "Error: Not Found",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Respond Success",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600000,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "staticData": {},
  "meta": {
    "description": "Load entity definition from database for editing in schema editor",
    "tags": ["schema-editor", "retrieval"],
    "created": "2026-01-22"
  }
}
```

---

## Updated JSON Examples with Required Properties

### Example 1: Minimal Valid Workflow

```json
{
  "name": "Minimal Workflow",
  "id": "wf_minimal_example",
  "version": "1.0.0",
  "tenantId": "default",
  "active": true,
  "nodes": [
    {
      "id": "node_1",
      "name": "Start",
      "type": "core.trigger",
      "typeVersion": 1,
      "position": [0, 0],
      "parameters": {}
    },
    {
      "id": "node_2",
      "name": "Process",
      "type": "core.processor",
      "typeVersion": 1,
      "position": [300, 0],
      "parameters": {
        "input": "$node_1"
      }
    }
  ],
  "connections": {
    "Start": {
      "main": {
        "0": [
          {
            "node": "Process",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600000,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "staticData": {},
  "meta": {}
}
```

### Example 2: Workflow with Conditional Branching

```json
{
  "name": "Conditional Workflow",
  "id": "wf_conditional_example",
  "version": "1.0.0",
  "tenantId": "default",
  "active": true,
  "nodes": [
    {
      "id": "trigger",
      "name": "Trigger",
      "type": "core.http_trigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "id": "check_condition",
      "name": "Check Condition",
      "type": "logic.if",
      "typeVersion": 1,
      "position": [300, 0],
      "parameters": {
        "condition": "$input.status === 'active'"
      }
    },
    {
      "id": "success_path",
      "name": "Success Path",
      "type": "core.processor",
      "typeVersion": 1,
      "position": [600, -100]
    },
    {
      "id": "error_path",
      "name": "Error Path",
      "type": "core.processor",
      "typeVersion": 1,
      "position": [600, 100]
    }
  ],
  "connections": {
    "Trigger": {
      "main": {
        "0": [
          {
            "node": "Check Condition",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Check Condition": {
      "main": {
        "0": [
          {
            "node": "Error Path",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Success Path",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600000
  },
  "staticData": {},
  "meta": {}
}
```

### Example 3: Complete Workflow with All Optional Fields

```json
{
  "name": "Complete Example",
  "id": "wf_complete_example",
  "version": "1.0.0",
  "tenantId": "acme_corp",
  "active": true,
  "nodes": [
    {
      "id": "start_node",
      "name": "Start Processing",
      "type": "core.trigger",
      "typeVersion": 1,
      "position": [0, 0],
      "parameters": {
        "trigger_type": "manual"
      },
      "disabled": false,
      "notes": "Entry point for the workflow",
      "notesInFlow": true,
      "continueOnFail": false
    },
    {
      "id": "process_node",
      "name": "Process Data",
      "type": "core.processor",
      "typeVersion": 1,
      "position": [300, 0],
      "parameters": {
        "operation": "transform"
      },
      "disabled": false,
      "continueOnFail": true
    }
  ],
  "connections": {
    "Start Processing": {
      "main": {
        "0": [
          {
            "node": "Process Data",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
  "settings": {
    "timezone": "America/New_York",
    "executionTimeout": 7200000,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "none"
  },
  "staticData": {
    "constants": {
      "MAX_RETRIES": 3,
      "TIMEOUT_MS": 5000
    }
  },
  "meta": {
    "description": "Complete workflow example with all properties",
    "tags": ["example", "documentation"],
    "author": "metabuilder",
    "created": "2026-01-22",
    "modified": "2026-01-22"
  }
}
```

---

## Validation Checklist

### Pre-Creation Validation

- [ ] **Task Understanding**
  - [ ] Read CLAUDE.md core principles
  - [ ] Review N8N_COMPLIANCE_AUDIT.md (existing issues)
  - [ ] Understand ui_schema_editor package purpose
  - [ ] Review 7 UI components that workflows support

- [ ] **Reference Materials**
  - [ ] Study existing workflows (auth_login.json, server.json, etc.)
  - [ ] Understand n8n connection format (node names, not IDs)
  - [ ] Review DBAL plugin types available
  - [ ] Check authentication/authorization plugins

- [ ] **Multi-Tenant Verification**
  - [ ] All workflows filter by tenantId
  - [ ] No data leaks across tenants
  - [ ] User context properly passed through workflow

### Per-Workflow Validation

For each workflow file, verify:

#### Root Level Properties
- [ ] `name` - Present and descriptive
- [ ] `id` - Present and unique (format: `wf_*`)
- [ ] `version` - Present (semantic versioning)
- [ ] `tenantId` - Present with `{{ $request.tenantId }}` template
- [ ] `active` - Present and set to `true`
- [ ] `nodes` - Array with 4-7 nodes
- [ ] `connections` - Proper n8n adjacency format (no empty)
- [ ] `settings` - Present with required fields
- [ ] `staticData` - Empty object `{}`
- [ ] `meta` - Present with description and tags

#### Node Properties (For Each Node)
- [ ] `id` - Present, snake_case format
- [ ] `name` - Present, human-readable
- [ ] `type` - Present, valid plugin type
- [ ] `typeVersion` - Present, ≥1
- [ ] `position` - Present, valid [x, y] array
- [ ] `parameters` - Present (at least `{}`)
- [ ] No `[object Object]` strings in any field
- [ ] No duplicate node IDs

#### Connection Validation
- [ ] `connections` object not empty
- [ ] All source node names exist in nodes
- [ ] All target node names exist in nodes
- [ ] No circular references
- [ ] Proper 3-level nesting: NodeName → main → index → targets
- [ ] All target objects have `node`, `type`, `index` properties
- [ ] No parameter-based control flow references
- [ ] If-then-else logic only via connections, not parameters

#### Type & Parameter Validation
- [ ] All node types registered in plugin registry
- [ ] Parameter values match node type expectations
- [ ] No missing required parameters
- [ ] Variable references use `$` prefix (e.g., `$entity.id`)
- [ ] Template expressions use `{{ }}` syntax

#### Security Validation
- [ ] Auth/permission checks present before DBAL operations
- [ ] Role verification (supergod) where required
- [ ] Forbidden/unauthorized error responses defined
- [ ] No credentials exposed in parameters
- [ ] Rate limiting headers handled

#### Multi-Tenant Validation
- [ ] tenantId filter on all entity queries
- [ ] tenantId scoping in responses
- [ ] No cross-tenant data access
- [ ] Audit fields include userId and timestamp

### Final Compliance Check

```bash
# After creating all workflow files:

# 1. Schema validation
npm run validate:workflows

# 2. Format validation
npm run lint:workflows

# 3. Type checking (if TypeScript definitions available)
npm run typecheck:workflows

# 4. Integration test
npm run test:workflows:integration

# 5. Expected result: 100/100 compliance score
```

---

## Directory Structure (After Implementation)

```
/packages/ui_schema_editor/
├── package.json                    ✅ Present
├── SCHEMA_EDITOR_GUIDE.md          ✅ Present
├── seed/
│   ├── metadata.json               ✅ Present
│   ├── page-config.json            ✅ Present
│   └── component.json              ✅ Present
└── workflow/
    ├── editor-init.json            ✨ NEW - 6 nodes, 5 connections
    ├── validate-schema.json        ✨ NEW - 4 nodes, 4 connections
    ├── save-schema.json            ✨ NEW - 7 nodes, 6 connections
    └── load-schema.json            ✨ NEW - 5 nodes, 4 connections
```

---

## Node Type Reference

### Core Node Types Required

| Plugin | Type | Versions | Purpose |
|--------|------|----------|---------|
| **core** | http_trigger | 1 | HTTP request trigger |
| **http** | respond | 1 | Send HTTP response |
| **http** | respond_error | 1 | Send error response |
| **auth** | verify_role | 1 | Check user role |
| **logic** | if | 1 | Conditional branching |
| **transform** | parse_json | 1 | Parse JSON input |
| **transform** | map_fields | 1 | Transform field mappings |
| **dbal** | entity_list | 1 | Query entities |
| **dbal** | entity_get | 1 | Get entity by ID |
| **dbal** | entity_create | 1 | Create entity |
| **validation** | schema_validate | 1 | Validate against schema |
| **workflow** | execute | 1 | Execute another workflow |

### Connection Type Values

- `"main"` - Primary output (success path)
- `"error"` - Error output (exception path)

### Position Coordinates

Use pixel-based grid:
- **X axis**: Horizontal distance (0, 300, 600, 900, 1200, 1500, 1800)
- **Y axis**: Vertical distance (0, ±100, ±200, etc.)

**Recommended layout**:
```
Sequential flow:     Horizontal spacing 300px
Branching:          Vertical offset for alternative paths
Error paths:        Lower Y position
Success paths:      Higher Y position
```

---

## Implementation Timeline

### Phase 1: File Creation (1-2 hours)
- [ ] Create `/packages/ui_schema_editor/workflow/editor-init.json`
- [ ] Create `/packages/ui_schema_editor/workflow/validate-schema.json`
- [ ] Create `/packages/ui_schema_editor/workflow/save-schema.json`
- [ ] Create `/packages/ui_schema_editor/workflow/load-schema.json`

### Phase 2: Validation (1 hour)
- [ ] Run schema validation: `npm run validate:workflows`
- [ ] Run linting: `npm run lint:workflows`
- [ ] Manual review of all connections
- [ ] Verify node type registry compatibility

### Phase 3: Testing (1-2 hours)
- [ ] Create test suite for each workflow
- [ ] Test multi-tenant filtering
- [ ] Test error paths and edge cases
- [ ] Performance testing

### Phase 4: Documentation (30 min)
- [ ] Update SCHEMA_EDITOR_GUIDE.md with workflow diagrams
- [ ] Document API endpoints matched to workflows
- [ ] Create troubleshooting guide
- [ ] Update package.json file inventory

### Phase 5: Integration (1-2 hours)
- [ ] Integrate with frontend UI components
- [ ] Test end-to-end flow
- [ ] Load testing with multiple concurrent requests
- [ ] Final compliance audit

**Total Estimated Time**: 4-6 hours

---

## Success Criteria

### Code Quality
- [ ] 100/100 N8N schema compliance score
- [ ] Zero linting errors
- [ ] All 4 workflows created
- [ ] 21+ nodes total with proper configuration
- [ ] All connections properly defined (no empty objects)
- [ ] No `[object Object]` strings in any field

### Functional Requirements
- [ ] Users can initialize schema editor
- [ ] Users can validate schemas before saving
- [ ] Users can save entity definitions to database
- [ ] Users can load entity definitions for editing
- [ ] Code generation triggered automatically on save
- [ ] Multi-tenant data properly isolated

### Security Requirements
- [ ] Only Supergod users can access workflows
- [ ] All DBAL queries filter by tenantId
- [ ] No data leaks between tenants
- [ ] Proper authorization checks in all workflows
- [ ] Audit trail for all schema modifications

### Documentation
- [ ] SCHEMA_EDITOR_GUIDE.md updated with workflow diagrams
- [ ] Each workflow has clear meta description
- [ ] API endpoint documentation complete
- [ ] Troubleshooting guide created

---

## References

- **Compliance Audit**: `/docs/UI_SCHEMA_EDITOR_N8N_COMPLIANCE_REPORT.md`
- **Core Guide**: `/docs/CLAUDE.md`
- **Package Structure**: `/docs/PACKAGES_INVENTORY.md`
- **N8N Schema**: `/schemas/n8n-workflow.schema.json`
- **Multi-Tenant**: `/docs/MULTI_TENANT_AUDIT.md`
- **Rate Limiting**: `/docs/RATE_LIMITING_GUIDE.md`

---

**Status**: 📋 PLANNING COMPLETE - Ready for Implementation
**Next Steps**: Execute Phase 1 file creation
**Owner**: MetaBuilder Team
**Last Updated**: 2026-01-22
