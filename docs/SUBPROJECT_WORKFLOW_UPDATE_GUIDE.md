# Subproject Workflow Update Guide

**Date**: 2026-01-22
**Version**: 1.0.0
**Status**: Phase 1 - PackageRepo Backend

---

## Overview

This guide explains how to update subprojects to use the new N8N workflow system with validation, registry integration, and multi-tenant safety.

**Affected Subprojects**:
- PackageRepo Backend (Python)
- 14 Package Workflows (JSON)
- 8 GameEngine Workflows (JSON)
- Frontend Workflow Service (TypeScript/Next.js)
- DBAL Executor (TypeScript)

---

## Phase 1: PackageRepo Backend (Python)

### What's New

The new `WorkflowLoaderV2` provides:

| Feature | Benefit |
|---------|---------|
| Automatic Validation | Catches schema errors before execution |
| Registry Integration | Validates node types against master registry |
| Multi-Tenant Safety | Enforces tenant isolation in contexts |
| Better Error Handling | Detailed diagnostic messages |
| Variable Management | First-class workflow variable support |
| Caching | Improved performance with smart caching |

### Implementation Steps

#### Step 1: Update Imports

**Before** (`workflow_loader.py`):
```python
from executor import WorkflowExecutor
```

**After** (`app.py`):
```python
from workflow_loader_v2 import create_workflow_loader_v2
```

#### Step 2: Initialize Loader

**Before**:
```python
# In create_app()
loader = WorkflowLoader(workflows_dir, config)
```

**After**:
```python
# In create_app()
loader = create_workflow_loader_v2(config, tenant_id=request.headers.get('X-Tenant-ID'))
```

#### Step 3: Update Request Handler

**Before**:
```python
@app.route('/api/v1/<tenant>/packages', methods=['POST'])
def publish_package():
    return loader.execute_workflow_for_request('publish_artifact', request)
```

**After**:
```python
@app.route('/api/v1/<tenant>/packages', methods=['POST'])
def publish_package():
    tenant_id = request.headers.get('X-Tenant-ID')
    loader = create_workflow_loader_v2(app.config, tenant_id=tenant_id)
    return loader.execute_workflow_for_request(
        'publish_artifact',
        request,
        validate=True  # Enable validation
    )
```

#### Step 4: Add Error Handling

The new loader provides better error responses:

```python
# Validation errors include field-level details
{
  "ok": False,
  "error": {
    "code": "WORKFLOW_VALIDATION_ERROR",
    "message": "Workflow validation failed: 2 error(s)",
    "details": [
      {
        "type": "error",
        "field": "nodes[0].parameters",
        "message": "Parameters contain node-level attributes (name/typeVersion/position)"
      }
    ]
  }
}
```

### Migration Checklist

- [ ] Import `create_workflow_loader_v2` in Flask app
- [ ] Update workflow loader initialization
- [ ] Add tenant_id to request headers
- [ ] Test with validation enabled
- [ ] Verify error responses match new format
- [ ] Update error handlers in client code
- [ ] Deploy and monitor logs

---

## Phase 2: Package Workflows (JSON)

### Structure Update

All package workflows should be updated with:

1. **Required Fields**:
```json
{
  "id": "wf_unique_id",
  "name": "Workflow Name",
  "version": "3.0.0",
  "active": true,
  "tenantId": "${TENANT_ID}",
  "nodes": [...],
  "connections": {},
  "variables": {}
}
```

2. **Node Structure**:
```json
{
  "nodes": [
    {
      "id": "node_id",
      "name": "Node Name",
      "type": "plugin.type",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "actual": "parameters"
      }
    }
  ]
}
```

### Validation Rules

Each workflow will be validated for:

✅ **Required Fields**:
- id: Unique identifier
- name: Human-readable name
- nodes: Node definitions array
- connections: Connection map

✅ **Parameter Structure**:
- No nested node attributes in parameters
- No "[object Object]" serialization
- Max nesting depth: 2 levels

✅ **Connections**:
- Must reference valid node names
- Output types: "main" or "error" only
- Valid numeric indices

✅ **Variables**:
- Alphanumeric names with underscores
- Explicit type declarations
- Type-safe default values

### Example: Updating ui_auth Package Workflows

**Before**: `packages/ui_auth/workflow/login-workflow.json`
```json
{
  "name": "Login Workflow",
  "nodes": [ /* nodes */ ],
  "connections": { /* connections */ }
}
```

**After**: `packages/ui_auth/workflow/login-workflow.json`
```json
{
  "id": "wf_ui_auth_login",
  "name": "Login Workflow",
  "version": "3.0.0",
  "active": true,
  "tenantId": "${TENANT_ID}",
  "nodes": [ /* updated nodes */ ],
  "connections": { /* updated connections */ },
  "variables": {
    "maxAttempts": {
      "type": "number",
      "defaultValue": 3
    },
    "sessionTimeout": {
      "type": "number",
      "defaultValue": 3600
    }
  }
}
```

### Update All 14 Packages

| Package | Workflows | Status |
|---------|-----------|--------|
| ui_auth | 4 | To Update |
| user_manager | 5 | To Update |
| forum_forge | 4 | To Update |
| notification_center | 4 | To Update |
| media_center | 4 | To Update |
| irc_webchat | 4 | To Update |
| stream_cast | 4 | To Update |
| audit_log | 4 | To Update |
| data_table | 4 | To Update |
| dashboard | 4 | To Update |
| ui_json_script_editor | 5 | To Update |
| ui_schema_editor | ? | To Update |
| ui_workflow_editor | ? | To Update |
| ui_database_manager | ? | To Update |

---

## Phase 3: GameEngine Workflows

### GameEngine Structure

GameEngine workflows are in:
```
gameengine/packages/*/workflows/
├── bootstrap/
│   ├── boot_default.json
│   ├── frame_default.json
│   └── n8n_skeleton.json
├── assets/
│   └── assets_catalog.json
├── engine_tester/
│   └── validation_tour.json
├── gui/
│   └── gui_frame.json
└── ... (5 more packages)
```

### Update Process

Each GameEngine package workflow needs:

1. **Add Metadata**:
```json
{
  "id": "wf_gameengine_bootstrap_boot",
  "name": "Boot Default",
  "version": "3.0.0",
  "active": true
}
```

2. **Validate Node Format**:
```json
{
  "nodes": [
    {
      "id": "frame_setup",
      "name": "Frame Setup",
      "type": "gameengine.frame_initialize",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {}
    }
  ]
}
```

3. **Define Connections**:
```json
{
  "connections": {
    "frame_setup": {
      "main": {
        "0": [
          {"node": "render_loop", "type": "main", "index": 0}
        ]
      }
    }
  }
}
```

---

## Phase 4: Frontend Workflow Service (TypeScript)

### Update workflow-service.ts

**New Features**:

```typescript
import { validateWorkflow } from '@/lib/workflow/validator'

export async function createWorkflow(workflow: WorkflowDefinition) {
  // Validate before saving
  const { valid, errors } = validateWorkflow(workflow)

  if (!valid) {
    throw new ValidationError('Workflow validation failed', errors)
  }

  // Save to database
  return await api.post('/api/v1/workflows', workflow)
}

export async function executeWorkflow(
  workflowId: string,
  context?: Record<string, any>
) {
  // Add tenant context
  const response = await api.post(
    `/api/v1/workflows/${workflowId}/execute`,
    { context },
    {
      headers: {
        'X-Tenant-ID': getCurrentTenant()
      }
    }
  )

  return response
}
```

### Update API Routes

**Before**: `/src/app/api/v1/[tenant]/workflows/route.ts`
```typescript
export async function POST(request: Request) {
  const workflow = await request.json()
  return await db.workflows.create(workflow)
}
```

**After**:
```typescript
import { validateWorkflow } from '@/lib/workflow/validator'

export async function POST(request: Request) {
  const workflow = await request.json()

  // Validate workflow
  const { valid, errors } = validateWorkflow(workflow)
  if (!valid) {
    return Response.json(
      { ok: false, error: 'Validation failed', details: errors },
      { status: 400 }
    )
  }

  // Multi-tenant safety
  const tenantId = request.headers.get('X-Tenant-ID')
  workflow.tenantId = tenantId

  return await db.workflows.create(workflow)
}
```

---

## Phase 5: DBAL Executor Update

### Update TypeScript Executor

**File**: `workflow/executor/ts/executor/dag-executor.ts`

**Changes**:

1. **Import Registry**:
```typescript
import { getNodeRegistry } from '@/registry'

class DAGExecutor {
  private registry: NodeRegistryManager

  constructor() {
    this.registry = getNodeRegistry()
  }
}
```

2. **Validate Nodes**:
```typescript
async executeNode(node: WorkflowNode): Promise<NodeExecutionResult> {
  // Validate node before execution
  const nodeQuery = this.registry.queryNodeType(node.type)
  if (!nodeQuery.found) {
    throw new Error(`Unknown node type: ${node.type}`)
  }

  // Validate parameters
  const validation = this.registry.validateNodeProperties(
    node.type,
    node.parameters
  )

  if (!validation.valid) {
    throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`)
  }

  // ... execute node
}
```

3. **Multi-Tenant Filtering**:
```typescript
async execute(
  workflow: WorkflowDefinition,
  context: ExecutionContext
): Promise<ExecutionResult> {
  // Enforce tenant ID
  if (!context.tenantId) {
    throw new Error('tenantId is required for multi-tenant safety')
  }

  // Propagate tenant ID to all DBAL calls
  const dbContext = {
    ...context,
    tenantId: context.tenantId
  }

  // ... execute
}
```

---

## Validation Integration

### Enable Validation Everywhere

**Workflow Creation**:
```typescript
const validator = new WorkflowValidator()
const result = validator.validate(workflow)

if (!result.valid) {
  // Handle errors
  for (const error of result.errors) {
    console.error(`${error.code}: ${error.path} - ${error.message}`)
  }
}
```

**Node Execution**:
```typescript
const registry = await getNodeRegistry()
const validation = registry.validateNodeProperties(nodeType, parameters)

if (!validation.valid) {
  throw new Error(`Node validation failed: ${validation.errors.join('; ')}`)
}
```

---

## Testing Strategy

### Validation Tests

```typescript
describe('WorkflowValidator', () => {
  it('should detect missing id field', () => {
    const workflow = { name: 'Test' }
    const { valid, errors } = validator.validate(workflow)

    expect(valid).toBe(false)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'id' })
    )
  })

  it('should detect nested parameters', () => {
    const workflow = {
      id: 'test',
      nodes: [{
        parameters: {
          name: 'Node',
          typeVersion: 1,
          parameters: { actual: 'param' }
        }
      }]
    }

    const { valid } = validator.validate(workflow)
    expect(valid).toBe(false)
  })
})
```

### End-to-End Tests

```typescript
describe('Workflow Execution', () => {
  it('should execute validated workflow', async () => {
    const workflow = loadWorkflow('test-workflow.json')
    const { valid } = validator.validate(workflow)

    expect(valid).toBe(true)

    const result = await executor.execute(workflow, context)
    expect(result.success).toBe(true)
  })
})
```

---

## Rollout Plan

### Week 1: PackageRepo Backend
- [ ] Implement `WorkflowLoaderV2`
- [ ] Update Flask app initialization
- [ ] Test with sample workflows
- [ ] Deploy to staging

### Week 2: Package Workflows
- [ ] Update all 14 package workflows
- [ ] Add validation tests
- [ ] Verify in staging
- [ ] Deploy to production

### Week 3: GameEngine
- [ ] Update 9 GameEngine workflows
- [ ] Test engine startup
- [ ] Deploy to staging

### Week 4: Frontend & DBAL
- [ ] Update TypeScript executor
- [ ] Update Next.js service layer
- [ ] Update API routes
- [ ] End-to-end testing

### Week 5: Monitoring & Polish
- [ ] Monitor production usage
- [ ] Fix edge cases
- [ ] Update documentation
- [ ] Finalize Phase 1

---

## Troubleshooting

### Common Issues

**Issue**: "Workflow validation failed: node type not found"
```
Solution: Register node type in registry or update type name
```

**Issue**: "Parameters contain node-level attributes"
```
Solution: Remove name/typeVersion/position from parameters object
         They should only be at node level
```

**Issue**: "Connection target node not found"
```
Solution: Verify connection uses node 'name' not 'id'
         Connection format: { fromNodeName: { main: { 0: [targets] } } }
```

**Issue**: "[object Object] in parameters"
```
Solution: Ensure all parameter values are properly serialized
         Use JSON.stringify() for complex objects before storing
```

---

## Validation Checklist

Before deploying updates:

- [ ] All workflows have `id` field
- [ ] All workflows have `tenantId` (for multi-tenant subprojects)
- [ ] Node parameters don't contain name/typeVersion/position
- [ ] No "[object Object]" values in parameters
- [ ] Connections reference valid node names
- [ ] Output types are "main" or "error"
- [ ] Variables have explicit types
- [ ] No circular dependencies
- [ ] Registry has all node types used
- [ ] Tests pass with validation enabled

---

## References

- **Workflow Validator**: `workflow/executor/ts/utils/workflow-validator.ts`
- **Node Registry**: `workflow/plugins/registry/node-registry.ts`
- **Schema**: `schemas/n8n-workflow.schema.json`
- **Examples**: `workflow/examples/python/` (19 complete workflows)

---

**Status**: Phase 1 Implementation Ready
**Next Step**: Execute PackageRepo backend update (Week 1)
**Timeline**: 5-week full rollout
