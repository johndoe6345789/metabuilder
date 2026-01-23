# Workflow Validation Checklist

**Purpose**: Quick reference checklist for validating workflows against n8n schema
**Target**: All workflows in MetaBuilder project
**Last Updated**: 2026-01-22

---

## Pre-Validation Checklist

- [ ] Workflow file is valid JSON
- [ ] File is named `{workflow_name}.json`
- [ ] File location matches package structure: `/packages/{packageId}/workflow/` or `/packagerepo/backend/workflows/`
- [ ] Workflow ID is unique across system
- [ ] No syntax errors in JSON

---

## Required Fields Validation

### Identity & Versioning (5 items)

```json
{
  "id": "workflow_package_name",
  "name": "Human Readable Name",
  "version": "1.0.0",
  "active": false,
  "versionId": "v1_2026-01-22"
}
```

- [ ] `id`: Present, matches pattern `^workflow_[a-z_]+$`, unique
- [ ] `name`: Present, non-empty, 1-255 characters
- [ ] `version`: Present, semantic version format (e.g., "1.0.0")
- [ ] `active`: Present, boolean value (true/false)
- [ ] `versionId`: Present (optional but recommended), format `v{number}_{date}`

### Metadata (4 items)

```json
{
  "description": "What this workflow does",
  "tenantId": null,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z"
}
```

- [ ] `description`: Present (can be null), max 500 characters
- [ ] `tenantId`: Present (null for system-wide, UUID for tenant-specific)
- [ ] `createdAt`: ISO 8601 format or null
- [ ] `updatedAt`: ISO 8601 format or null

### Core Structure (3 items)

```json
{
  "nodes": [{ "id": "node_1", "name": "Node 1", "type": "trigger.http" }],
  "connections": {},
  "settings": { "timezone": "UTC", "executionTimeout": 3600 }
}
```

- [ ] `nodes`: Array with minItems 1, all nodes valid
- [ ] `connections`: Object (can be empty), proper connection structure
- [ ] `settings`: Object with required properties (timezone, executionTimeout)

---

## Node Structure Validation

For each node in `nodes` array:

### Basic Node Properties

```json
{
  "id": "node_1",
  "name": "Node Name",
  "type": "trigger.http",
  "typeVersion": 1,
  "position": [100, 100]
}
```

- [ ] `id`: Unique within workflow, format `node_*`
- [ ] `name`: Non-empty, descriptive string
- [ ] `type`: Valid type string (check against plugin registry)
- [ ] `typeVersion`: Integer >= 1
- [ ] `position`: Array with exactly 2 numbers [x, y]

### Node Parameters

```json
{
  "parameters": {
    "param1": "value1",
    "param2": 123,
    "param3": true
  }
}
```

- [ ] `parameters`: Object or absent
- [ ] All parameter values are valid for node type
- [ ] No undefined or null values (unless explicitly allowed)
- [ ] Complex parameters (objects, arrays) properly formatted

---

## Connection Validation

### Connection Structure

```json
{
  "connections": {
    "node_1": {
      "main": {
        "0": [
          { "node": "node_2", "type": "main", "index": 0 }
        ]
      }
    },
    "node_2": {
      "main": {
        "0": [
          { "node": "node_3", "type": "main", "index": 0 }
        ]
      }
    }
  }
}
```

- [ ] `connections` is object (empty `{}` is valid)
- [ ] Each source node ID exists in `nodes` array
- [ ] Each target node ID exists in `nodes` array
- [ ] Output indices (0, 1, 2, ...) match node type capabilities
- [ ] No circular connections (no A→B→...→A)
- [ ] All referenced nodes are valid

### Connection Validation Steps

For each connection entry:

1. [ ] Source node ID exists
2. [ ] Target node ID exists
3. [ ] Connection path `main` → `0` is present
4. [ ] Target node reference contains `node`, `type`, `index`
5. [ ] Index is non-negative integer
6. [ ] No circular dependencies

---

## Advanced Fields Validation

### Tags (Optional)

```json
{
  "tags": [
    { "id": "tag_1", "name": "automation" },
    { "id": "tag_2", "name": "daily" }
  ]
}
```

- [ ] `tags`: Array of objects
- [ ] Each tag has `id` and `name`
- [ ] Tag IDs are unique within workflow
- [ ] Tag names are non-empty strings

### Meta (Optional)

```json
{
  "meta": {
    "category": "notifications",
    "author": "admin_user_id",
    "permissions": {
      "execute": ["authenticated"],
      "edit": ["admin"]
    }
  }
}
```

- [ ] `meta`: Object (can be empty `{}`)
- [ ] Common keys: category, author, description, permissions
- [ ] Custom keys allowed for extensibility
- [ ] Values are valid types

### Settings (Required)

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

- [ ] `timezone`: Valid timezone string (e.g., "UTC", "America/New_York")
- [ ] `executionTimeout`: Positive integer (milliseconds)
- [ ] `saveExecutionProgress`: Boolean
- [ ] `saveDataErrorExecution`: "all", "final", "none"
- [ ] `saveDataSuccessExecution`: "all", "final", "none"

### Credentials (Optional)

```json
{
  "credentials": [
    {
      "id": "cred_1",
      "name": "API Key",
      "type": "api_key",
      "binding": "node_2"
    }
  ]
}
```

- [ ] `credentials`: Array (can be empty)
- [ ] Each credential has `id`, `name`, `type`, `binding`
- [ ] Binding node ID exists in `nodes` array
- [ ] Credential IDs are unique

### Triggers (Optional)

```json
{
  "triggers": [
    {
      "type": "http",
      "config": {
        "method": "POST",
        "path": "/api/v1/webhook"
      }
    },
    {
      "type": "schedule",
      "config": {
        "cron": "0 9 * * MON-FRI"
      }
    }
  ]
}
```

- [ ] `triggers`: Array (can be empty for manual workflows)
- [ ] Each trigger has `type` and `config`
- [ ] Trigger types are valid (http, schedule, event, webhook, etc.)
- [ ] Config matches trigger type requirements

### Variables (Optional)

```json
{
  "variables": {
    "maxRetries": {
      "type": "integer",
      "value": 3
    },
    "apiEndpoint": {
      "type": "string",
      "value": "https://api.example.com"
    }
  }
}
```

- [ ] `variables`: Object (can be empty)
- [ ] Each variable has `type` and `value`
- [ ] Variable types are valid: "string", "integer", "boolean", "array", "object"
- [ ] Variable values match declared type

### StaticData & PinData (Engine-Managed)

```json
{
  "staticData": {},
  "pinData": {
    "node_1": [
      { "example": "data" }
    ]
  }
}
```

- [ ] `staticData`: Object (reserved for engine, usually empty)
- [ ] `pinData`: Object (optional, for development/testing)
- [ ] PinData values are arrays of objects (execution results)

---

## Multi-Tenant Safety Validation

- [ ] `tenantId` field present (null or valid UUID)
- [ ] All database query nodes include tenantId filtering
- [ ] No hard-coded tenant IDs in node parameters
- [ ] Credential bindings are tenant-scoped
- [ ] Data responses filtered by tenantId
- [ ] No cross-tenant data exposure in node outputs

**Check each node with database operations**:
- [ ] Node has `tenantId` parameter
- [ ] TenantId is sourced from request/context, not hard-coded
- [ ] Filter conditions include `tenantId: "{{ $request.user.tenantId }}"`

---

## Error Handling Validation

- [ ] Workflow has error handler nodes (if/else, error node)
- [ ] All conditional branches have both "true" and "false" paths
- [ ] Error paths respond with appropriate HTTP status code (400, 401, 404, 500)
- [ ] Error messages are meaningful and user-friendly
- [ ] Error nodes don't leak sensitive information

**For each conditional node**:
- [ ] "then" path connects to valid node
- [ ] "else" path connects to valid node or error handler
- [ ] Condition expression is valid

---

## HTTP Response Validation

For workflows exposing HTTP endpoints:

```json
{
  "id": "respond_success",
  "type": "packagerepo.respond_json",
  "parameters": {
    "body": { "ok": true, "data": "..." },
    "status": 200
  }
}
```

- [ ] Response node has `status` field
- [ ] Status code is valid HTTP status (200, 201, 400, 401, 404, 500)
- [ ] Response body is valid JSON
- [ ] Response includes `ok` or `error` field for clarity
- [ ] Error responses include `message` field
- [ ] Content-Type headers correct (application/json)

**Status Code Mapping**:
- [ ] 200 - Success (GET, data retrieval)
- [ ] 201 - Created (POST, new resource)
- [ ] 400 - Bad Request (validation error)
- [ ] 401 - Unauthorized (auth failure)
- [ ] 404 - Not Found (resource missing)
- [ ] 500 - Server Error (workflow execution failure)

---

## Performance & Limits Validation

- [ ] `executionTimeout` >= 3000ms and <= 300000ms
- [ ] Node count <= 100 (check against `meta.nodeCount`)
- [ ] Connection count <= 200 (check against `meta.edgeCount`)
- [ ] No deeply nested connections (max 5 levels)
- [ ] Loop nodes have exit conditions
- [ ] No infinite loops detected
- [ ] Variable sizes reasonable (< 100MB total)
- [ ] Batch operation sizes limited (< 10000 items per batch)

**Performance Checks**:
- [ ] Average node execution < 1000ms
- [ ] Total workflow execution < timeout
- [ ] Memory usage reasonable
- [ ] No resource leaks in loops

---

## Documentation Validation

- [ ] `description` field is present and meaningful (50+ chars)
- [ ] `meta.category` documents workflow purpose
- [ ] All nodes have descriptive `name` (not just "node_1")
- [ ] Complex nodes have explanation in `meta`
- [ ] Parameter values documented (especially for magic strings)
- [ ] Trigger configuration documented
- [ ] Variable documentation includes type and purpose
- [ ] Example data in `pinData` is realistic

---

## Security Audit

- [ ] No hard-coded credentials in node parameters
- [ ] All secrets use credential bindings
- [ ] API keys/tokens not logged in execution data
- [ ] No SQL injection in database query parameters
- [ ] Input validation on all user-provided data
- [ ] Output sanitization for HTML contexts
- [ ] Permission checks for sensitive operations
- [ ] Audit logging for compliance
- [ ] No XSS vulnerabilities in response bodies

---

## Final Validation Checklist

### Pre-Deployment Checks

- [ ] Entire workflow JSON is valid (no syntax errors)
- [ ] All required fields present and correct
- [ ] All optional fields properly formatted
- [ ] Nodes are all valid and connected properly
- [ ] Connections have no circular references
- [ ] All node IDs are unique
- [ ] All external references (other nodes) exist
- [ ] Settings include all required properties
- [ ] Error handling complete
- [ ] Documentation sufficient
- [ ] Multi-tenant safety verified
- [ ] Security audit passed
- [ ] Performance acceptable

### Testing Before Deployment

- [ ] Unit test: Each node executes independently
- [ ] Integration test: Workflow runs end-to-end
- [ ] Error test: Error paths execute correctly
- [ ] Performance test: Execution within timeout
- [ ] Concurrency test: Multiple executions don't interfere
- [ ] Data test: Output matches expected format
- [ ] Security test: No data leaks, proper auth

### Deployment Sign-Off

- [ ] Code review completed and approved
- [ ] All tests passing (100% pass rate)
- [ ] Documentation complete and accurate
- [ ] Team lead sign-off received
- [ ] Rollback plan documented
- [ ] Monitoring/alerting configured

---

## Quick Validation Script

```bash
# Validate workflow JSON syntax
jq . packages/ui_workflow_editor/workflow/initialize_editor.json > /dev/null && echo "✅ Valid JSON"

# Check for required fields
jq '.id, .name, .version, .active, .nodes, .connections, .settings' workflow.json

# Count nodes
jq '.nodes | length' workflow.json

# List all node IDs
jq '.nodes[] | .id' workflow.json

# Check for node references in connections
jq '.connections | keys[]' workflow.json

# Validate connection targets exist
jq '.connections[].main | .[] | .[]' workflow.json
```

---

## Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Missing `id` | Cannot store in DB | Add `id: "workflow_packageid_name"` |
| Invalid `version` | Won't parse | Use semver: `"1.0.0"` |
| Empty `nodes` | Workflow won't run | Add at least one node |
| Missing `connections` | Parser error | Add `"connections": {}` |
| Node not in connections | Can't execute | Ensure all source nodes referenced |
| Circular connections | Infinite loop | Verify graph is DAG (directed acyclic) |
| Invalid node type | Type not found | Check plugin registry for valid types |
| Missing node ID | Connection fails | Ensure all nodes have unique `id` |
| Wrong position format | Canvas won't display | Use `[x, y]` format, both numbers |
| Missing settings | Parser error | Add all 5 required settings properties |

---

## Related Resources

- **N8N Workflow Schema**: `/schemas/n8n-workflow.schema.json`
- **Package Workflow Schema**: `/schemas/package-schemas/workflow.schema.json`
- **UI Workflow Editor Update Plan**: `/docs/UI_WORKFLOW_EDITOR_UPDATE_PLAN.md`
- **Workflow Engine Guide**: `/workflow/WORKFLOW_GUIDE.md`
- **YAML Entity Definition**: `/dbal/shared/api/schema/entities/core/workflow.yaml`

---

**Use this checklist before committing any workflow changes**

