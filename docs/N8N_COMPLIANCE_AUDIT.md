# N8N Workflow Format Compliance Audit

**Date**: 2026-01-22
**Status**: 🔴 NON-COMPLIANT
**Python Executor**: Expects full n8n format
**Current Workflows**: Missing critical n8n properties

---

## Executive Summary

MetaBuilder's workflow files are **NOT compliant** with the n8n workflow schema that the Python executor expects. Multiple required properties are missing, and the connection format is incompatible.

### Critical Issues

| Issue | Severity | Files Affected |
|-------|----------|----------------|
| Missing `typeVersion` on all nodes | 🔴 BLOCKING | ALL workflows |
| Missing `position` on all nodes | 🔴 BLOCKING | ALL workflows |
| Wrong `connections` format | 🔴 BLOCKING | `server.json` |
| Missing `connections` entirely | 🔴 BLOCKING | `auth_login.json`, `download_artifact.json`, etc. |
| Nodes use `id` where n8n uses `name` in connections | 🔴 BLOCKING | ALL workflows |

---

## N8N Schema Requirements

Based on AutoMetabuilder's `n8n-workflow.schema.json`:

### Required Workflow Properties

```json
{
  "name": "string (required)",
  "nodes": "array (required, minItems: 1)",
  "connections": "object (required)"
}
```

### Required Node Properties

```json
{
  "id": "string (required, minLength: 1)",
  "name": "string (required, minLength: 1, should be unique)",
  "type": "string (required, e.g., 'packagerepo.parse_json')",
  "typeVersion": "number (required, minimum: 1)",
  "position": "[x, y] (required, array of 2 numbers)"
}
```

### Optional But Important Node Properties

```json
{
  "disabled": "boolean (default: false)",
  "notes": "string",
  "notesInFlow": "boolean",
  "retryOnFail": "boolean",
  "maxTries": "integer",
  "waitBetweenTries": "integer (milliseconds)",
  "continueOnFail": "boolean",
  "alwaysOutputData": "boolean",
  "executeOnce": "boolean",
  "parameters": "object (default: {})",
  "credentials": "object",
  "webhookId": "string",
  "onError": "enum: stopWorkflow | continueRegularOutput | continueErrorOutput"
}
```

### Connections Format (Required)

**n8n Expected Format**:
```json
{
  "connections": {
    "fromNodeName": {
      "main": {
        "0": [
          {
            "node": "targetNodeName",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

**Key Points**:
- Uses **node `name`**, not `id`
- Structure: `fromName -> outputType -> outputIndex -> array of targets`
- Each target has: `node` (name), `type`, `index`

---

## Current MetaBuilder Format Analysis

### Example: `server.json`

**Current Format** (WRONG):
```json
{
  "name": "Package Repository Server",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "create_app",
      "type": "web.create_flask_app",
      "parameters": { ... }
    }
  ],
  "connections": {
    "create_app": ["register_publish"],
    "register_publish": ["register_download"]
  }
}
```

**Issues**:
1. ❌ Nodes missing `name` property
2. ❌ Nodes missing `typeVersion` property
3. ❌ Nodes missing `position` property
4. ❌ Connections format is simplified array, not n8n nested structure
5. ❌ Connections use `id` instead of `name`
6. ⚠️ Has non-standard `version` property (should use `versionId` if needed)

### Example: `auth_login.json`

**Current Format** (WRONG):
```json
{
  "name": "Authenticate User",
  "description": "Login and generate JWT token",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "parse_body",
      "type": "packagerepo.parse_json",
      "parameters": {
        "input": "$request.body",
        "out": "credentials"
      }
    }
  ]
}
```

**Issues**:
1. ❌ NO `connections` property at all
2. ❌ Nodes missing `name` property
3. ❌ Nodes missing `typeVersion` property
4. ❌ Nodes missing `position` property

---

## Detailed Property Comparison

### Workflow Level

| Property | n8n Required | n8n Optional | MetaBuilder Has | Status |
|----------|--------------|--------------|-----------------|--------|
| `name` | ✅ | | ✅ | ✅ GOOD |
| `nodes` | ✅ | | ✅ | ✅ GOOD |
| `connections` | ✅ | | ⚠️ (wrong format or missing) | ❌ BAD |
| `id` | | ✅ | ❌ | ⚠️ Optional |
| `active` | | ✅ | ❌ | ⚠️ Optional |
| `versionId` | | ✅ | ❌ (has `version` instead) | ⚠️ Different |
| `tags` | | ✅ | ❌ | ⚠️ Optional |
| `meta` | | ✅ | ❌ | ⚠️ Optional |
| `settings` | | ✅ | ❌ | ⚠️ Optional |
| `triggers` | | ✅ | ❌ | ⚠️ Optional |
| `description` | | ❌ | ✅ | ⚠️ Extra |
| `version` | | ❌ | ✅ | ⚠️ Non-standard |

### Node Level

| Property | n8n Required | n8n Optional | MetaBuilder Has | Status |
|----------|--------------|--------------|-----------------|--------|
| `id` | ✅ | | ✅ | ✅ GOOD |
| `name` | ✅ | | ❌ | 🔴 MISSING |
| `type` | ✅ | | ✅ | ✅ GOOD |
| `typeVersion` | ✅ | | ❌ | 🔴 MISSING |
| `position` | ✅ | | ❌ | 🔴 MISSING |
| `parameters` | | ✅ | ✅ | ✅ GOOD |
| `disabled` | | ✅ | ❌ | ⚠️ Optional |
| `notes` | | ✅ | ❌ | ⚠️ Optional |
| `continueOnFail` | | ✅ | ❌ | ⚠️ Optional |
| `credentials` | | ✅ | ❌ | ⚠️ Optional |

---

## Impact on Python Executor

### `n8n_schema.py` Validation Will Fail

```python
class N8NNode:
    @staticmethod
    def validate(value: Any) -> bool:
        required = ["id", "name", "type", "typeVersion", "position"]
        if not all(key in value for key in required):
            return False  # ❌ WILL FAIL
```

### `execution_order.py` Will Fail

```python
def build_execution_order(nodes, connections, start_node_id=None):
    node_names = {node["name"] for node in nodes}  # ❌ KeyError: 'name'
```

### `n8n_executor.py` Will Fail

```python
def _find_node_by_name(self, nodes: List[Dict], name: str):
    for node in nodes:
        if node.get("name") == name:  # ❌ Never matches
            return node
```

---

## Required Fixes

### 1. Add Missing Node Properties

Every node needs:

```json
{
  "id": "unique_id",
  "name": "Unique Human Name",  // ADD THIS
  "type": "plugin.type",
  "typeVersion": 1,  // ADD THIS
  "position": [100, 200],  // ADD THIS (x, y coordinates)
  "parameters": {}
}
```

**Naming Convention**:
- Use `id` for stable identifiers (`parse_body`, `create_app`)
- Use `name` for display (`Parse Body`, `Create Flask App`)
- `name` should be unique within workflow

### 2. Fix Connections Format

**From**:
```json
{
  "connections": {
    "create_app": ["register_publish"]
  }
}
```

**To**:
```json
{
  "connections": {
    "Create Flask App": {
      "main": {
        "0": [
          {
            "node": "Register Publish Route",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

**Rules**:
- Use node `name` (not `id`) as keys
- Structure: `name -> outputType -> outputIndex -> targets[]`
- Each target has `node` (name), `type`, `index`

### 3. Add Connections to All Workflows

Files missing connections entirely:
- `auth_login.json`
- `download_artifact.json`
- `list_versions.json`
- `resolve_latest.json`

Each must define execution order via connections.

### 4. Optional: Add Workflow Metadata

Consider adding:
```json
{
  "active": true,
  "tags": [{"name": "packagerepo"}, {"name": "auth"}],
  "settings": {
    "executionTimeout": 300,
    "saveExecutionProgress": true
  },
  "triggers": [
    {
      "nodeId": "start",
      "kind": "manual",
      "enabled": true
    }
  ]
}
```

---

## Migration Strategy

### Phase 1: Minimal Compliance (CRITICAL)

Fix blocking issues to make Python executor work:

1. **Add `name` to all nodes**
   - Generate from `id`: `parse_body` → `Parse Body`
   - Ensure uniqueness within workflow

2. **Add `typeVersion: 1` to all nodes**
   - Default to `1` for all plugins

3. **Add `position` to all nodes**
   - Auto-generate grid layout: `[index * 200, 0]`
   - Or use specific coordinates for visual DAGs

4. **Fix connections format**
   - Convert array format to nested object format
   - Use node `name` instead of `id`

5. **Add missing connections**
   - Infer from node order for sequential workflows
   - Or add explicit connections for DAGs

### Phase 2: Enhanced Compliance (OPTIONAL)

Add optional properties for better UX:

1. **Add workflow `settings`**
2. **Add workflow `triggers`**
3. **Add node `disabled` flag for debugging**
4. **Add node `notes` for documentation**
5. **Add node error handling (`continueOnFail`, `onError`)**

### Phase 3: Tooling Integration (FUTURE)

1. **Schema validation script**
2. **Migration script for existing workflows**
3. **JSON Schema in `schemas/` directory**
4. **Visual workflow editor integration**

---

## Action Items

### Immediate (Blocking Python Executor)

- [ ] Add `name` property to all workflow nodes
- [ ] Add `typeVersion: 1` to all workflow nodes
- [ ] Add `position: [x, y]` to all workflow nodes
- [ ] Convert connections from array to nested object format
- [ ] Add connections to workflows that are missing them
- [ ] Update workflow files:
  - [ ] `packagerepo/backend/workflows/server.json`
  - [ ] `packagerepo/backend/workflows/auth_login.json`
  - [ ] `packagerepo/backend/workflows/download_artifact.json`
  - [ ] `packagerepo/backend/workflows/list_versions.json`
  - [ ] `packagerepo/backend/workflows/resolve_latest.json`

### Short Term

- [ ] Create JSON Schema for n8n workflows in `schemas/`
- [ ] Add validation tests for n8n compliance
- [ ] Document n8n workflow format in `docs/WORKFLOWS.md`
- [ ] Update `CLAUDE.md` with n8n format requirements

### Long Term

- [ ] Build migration script for all workflows
- [ ] Add workflow visual editor
- [ ] Implement workflow validation in CI/CD

---

## Example: Compliant Workflow

```json
{
  "name": "Authenticate User",
  "nodes": [
    {
      "id": "parse_body",
      "name": "Parse Request Body",
      "type": "packagerepo.parse_json",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "$request.body",
        "out": "credentials"
      }
    },
    {
      "id": "validate_fields",
      "name": "Validate Credentials",
      "type": "logic.if",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "condition": "$credentials.username == null || $credentials.password == null"
      }
    },
    {
      "id": "error_invalid",
      "name": "Invalid Request Error",
      "type": "packagerepo.respond_error",
      "typeVersion": 1,
      "position": [500, 50],
      "parameters": {
        "message": "Missing username or password",
        "status": 400
      }
    },
    {
      "id": "verify_password",
      "name": "Verify Password",
      "type": "packagerepo.auth_verify_password",
      "typeVersion": 1,
      "position": [500, 150],
      "parameters": {
        "username": "$credentials.username",
        "password": "$credentials.password",
        "out": "user"
      }
    }
  ],
  "connections": {
    "Parse Request Body": {
      "main": {
        "0": [
          {
            "node": "Validate Credentials",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Validate Credentials": {
      "main": {
        "0": [
          {
            "node": "Invalid Request Error",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Verify Password",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
  "triggers": [
    {
      "nodeId": "parse_body",
      "kind": "manual",
      "enabled": true
    }
  ]
}
```

---

## Conclusion

The Python executor from AutoMetabuilder is **fully functional** but expects strict n8n format compliance. MetaBuilder's workflows need immediate updates to work with this executor.

**Estimated Fix Time**: 2-3 hours for all workflows
**Complexity**: Medium (structural changes)
**Risk**: Low (additive changes, backwards compatible with TypeScript executor if needed)

The fixes are **critical** for Python workflow execution to work correctly.
