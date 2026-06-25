# WorkflowLoaderV2 Quick Reference
## For Frontend Developers

---

## Overview

WorkflowLoaderV2 provides **pre-execution validation** for workflows with comprehensive error diagnostics and multi-tenant safety.

**Key Benefits**:
- Catch workflow errors before execution
- Detailed error messages with suggestions
- Fast validation via caching
- Multi-tenant isolation
- Registry-based node validation

---

## Quick Start

### 1. Import the Loader

```typescript
import { getWorkflowLoader } from '@/lib/workflow/workflow-loader-v2'

const loader = getWorkflowLoader()
```

### 2. Validate a Workflow

```typescript
// Before executing
const validation = await loader.validateWorkflow(workflow)

if (!validation.valid) {
  console.error('Errors:', validation.errors)
  console.warn('Warnings:', validation.warnings)
  return // Don't execute
}

// Safe to execute
await executeWorkflow(workflow)
```

### 3. Handle Errors

```typescript
import { getErrorHandler } from '@/lib/workflow/error-handler'

const errorHandler = getErrorHandler()

// Format validation errors for API response
return errorHandler.handleValidationError(
  validation.errors,
  validation.warnings,
  { workflowId: workflow.id }
)
```

---

## API Reference

### WorkflowLoaderV2

#### `validateWorkflow(workflow)`

Validates a single workflow.

```typescript
const result = await loader.validateWorkflow(workflow)
// Returns: { valid, errors, warnings, _validationTime, _cacheHit }
```

**Returns**:
```typescript
{
  valid: boolean,
  errors: ValidationError[],
  warnings: ValidationError[],
  _validationTime?: number,
  _cacheHit?: boolean
}
```

#### `validateBatch(workflows)`

Validates multiple workflows in parallel.

```typescript
const results = await loader.validateBatch(workflows)
// Returns: ValidationResult[] (one per workflow)
```

#### `getValidationResult(workflowId, tenantId)`

Get cached validation result.

```typescript
const cached = await loader.getValidationResult(workflowId, tenantId)
// Returns: ValidationResult | null
```

#### `invalidateCache(workflowId, tenantId)`

Clear cached validation for workflow.

```typescript
await loader.invalidateCache(workflowId, tenantId)
```

#### `getDiagnostics(workflow)`

Get detailed workflow diagnostics.

```typescript
const diag = await loader.getDiagnostics(workflow)
// Returns metrics, structure info, validation state
```

#### `getCacheStats()`

Get cache performance stats.

```typescript
const stats = loader.getCacheStats()
// Returns: { hits, misses, hitRate, entries, memoryUsedMb }
```

---

## Error Codes

### Validation Errors

| Code | Meaning | Action |
|------|---------|--------|
| `MISSING_REQUIRED_FIELD` | Node parameter missing | Add the parameter |
| `INVALID_NODE_TYPE` | Node type not found | Check node type name |
| `INVALID_CONNECTION_TARGET` | Connection references missing node | Fix target node ID |
| `DUPLICATE_NODE_NAME` | Two nodes have same name | Rename one node |
| `MISSING_TENANT_ID` | Workflow lacks tenantId | Add tenantId field |
| `TYPE_MISMATCH` | Parameter type wrong | Change parameter type |
| `TIMEOUT_TOO_SHORT` | Node timeout < 1s | Increase timeout |
| `TIMEOUT_TOO_LONG` | Node timeout > 1h | Decrease timeout |

### Execution Errors

| Code | Meaning | Status |
|------|---------|--------|
| `VALIDATION_ERROR` | Workflow structure invalid | 400 |
| `NOT_FOUND` | Workflow doesn't exist | 404 |
| `FORBIDDEN` | Access denied (tenant mismatch) | 403 |
| `RATE_LIMITED` | Too many requests | 429 |
| `EXECUTION_ERROR` | Runtime error during execution | 500 |

---

## Common Patterns

### Pattern 1: Create with Validation

```typescript
async function createWorkflow(tenantId, body) {
  // 1. Build workflow
  const workflow = {
    id: uuidv4(),
    tenantId,
    name: body.name,
    nodes: body.nodes || [],
    connections: body.connections || {},
    // ... other fields
  }

  // 2. Validate
  const loader = getWorkflowLoader()
  const validation = await loader.validateWorkflow(workflow)

  if (!validation.valid) {
    // Return error response with diagnostics
    return errorResponse({
      code: 'VALIDATION_ERROR',
      message: 'Workflow has validation errors',
      errors: validation.errors.slice(0, 10),
      errorCount: validation.errors.length
    }, 400)
  }

  // 3. Save to database
  const saved = await db.workflows.create(workflow)

  // 4. Cache validation result
  await loader.cacheValidation(saved.id, tenantId, validation)

  return successResponse(saved, 201)
}
```

### Pattern 2: Execute with Validation

```typescript
async function executeWorkflow(tenantId, workflowId, triggerData) {
  // 1. Load workflow
  const workflow = await db.workflows.get(workflowId, tenantId)
  if (!workflow) {
    return notFoundError('Workflow')
  }

  // 2. Validate before execution
  const loader = getWorkflowLoader()
  const validation = await loader.validateWorkflow(workflow)

  if (!validation.valid) {
    return validationError(validation.errors, validation.warnings, {
      reason: 'CANNOT_EXECUTE_INVALID_WORKFLOW'
    })
  }

  // 3. Build context with multi-tenant
  const context = await buildMultiTenantContext(
    workflow,
    tenantId,
    userId,
    userLevel,
    { triggerData }
  )

  // 4. Execute
  const result = await engine.executeWorkflow(workflow, context)

  return successResponse(result)
}
```

### Pattern 3: Batch Validation

```typescript
async function importWorkflows(tenantId, workflows) {
  const loader = getWorkflowLoader()
  const results = await loader.validateBatch(workflows)

  const valid = workflows.filter((_, i) => results[i].valid)
  const invalid = results
    .map((r, i) => ({ workflow: workflows[i], errors: r.errors }))
    .filter(x => !x.errors || x.errors.length > 0)

  // Save valid ones
  const saved = await db.workflows.createMany(valid)

  return {
    imported: saved.length,
    failed: invalid.length,
    errors: invalid
  }
}
```

### Pattern 4: Cache Management

```typescript
async function updateWorkflow(tenantId, workflowId, updates) {
  // Load current
  const current = await db.workflows.get(workflowId, tenantId)

  // Apply updates
  const updated = { ...current, ...updates }

  // Validate
  const loader = getWorkflowLoader()
  const validation = await loader.validateWorkflow(updated)

  if (!validation.valid) {
    return validationError(validation.errors)
  }

  // Save
  const saved = await db.workflows.update(workflowId, updated)

  // Invalidate cache (important!)
  await loader.invalidateCache(workflowId, tenantId)

  return successResponse(saved)
}
```

---

## Multi-Tenant Safety

### Building Context

```typescript
import { buildMultiTenantContext, canAccessWorkflow } from '@/lib/workflow/multi-tenant-context'

// Check access first
if (!canAccessWorkflow(user.tenantId, user.level, workflow.tenantId)) {
  return forbiddenError('Cannot access this workflow')
}

// Build context
const context = await buildMultiTenantContext(
  workflow,        // Must belong to tenantId
  tenantId,        // From route params
  userId,          // From auth
  userLevel,       // From auth
  { triggerData }  // Optional execution data
)

// Context now has multi-tenant metadata
console.log(context.multiTenant.enforced) // true
console.log(context.multiTenant.tenantId) // tenantId
```

### Validation Rules

```typescript
// ✅ VALID: Same tenant
const workflow = { tenantId: 'acme', ... }
const context = await buildMultiTenantContext(workflow, 'acme', userId, level)

// ❌ INVALID: Different tenants
const workflow = { tenantId: 'acme', ... }
const context = await buildMultiTenantContext(workflow, 'globex', userId, level)
// Throws: "Workflow tenant mismatch"
```

---

## Performance Tips

### 1. Leverage Cache

```typescript
// First execution: validates (150ms, cache miss)
await loader.validateWorkflow(workflow)

// Second execution: cached (5ms, cache hit)
await loader.validateWorkflow(workflow) // Same workflow object

// Cache key includes workflow structure hash
// Changing nodes/connections invalidates cache automatically
```

### 2. Batch Operations

```typescript
// ✅ GOOD: Single batch call for 100 workflows
const results = await loader.validateBatch(allWorkflows)

// ❌ BAD: Sequential calls for each
for (const wf of allWorkflows) {
  await loader.validateWorkflow(wf) // N calls, slower
}
```

### 3. Async Validation

```typescript
// ✅ GOOD: Validate in background after create
const saved = await db.workflows.create(workflow)
loader.validateWorkflow(workflow).catch(err => {
  console.error('Background validation failed:', err)
})

// ❌ BAD: Block on validation
const validation = await loader.validateWorkflow(workflow)
const saved = await db.workflows.create(workflow)
```

---

## Debugging

### Check Cache Stats

```typescript
const stats = loader.getCacheStats()
console.log(`Cache: ${stats.hits} hits, ${stats.misses} misses`)
console.log(`Hit rate: ${stats.hitRate.toFixed(1)}%`)
console.log(`Memory: ${stats.memoryUsedMb.toFixed(2)}MB`)
```

### Get Diagnostics

```typescript
const diag = await loader.getDiagnostics(workflow)
console.log(`Nodes: ${diag.nodeCount}`)
console.log(`Connections: ${diag.connectionCount}`)
console.log(`Errors: ${diag.validation.errorCount}`)
console.log(`Validation time: ${diag.metrics.validationTimeMs}ms`)
console.log(`Cache hit: ${diag.metrics.cacheHit ? 'yes' : 'no'}`)
```

### Check Specific Errors

```typescript
const validation = await loader.validateWorkflow(workflow)

// Find all errors for a specific path
const nodeErrors = validation.errors.filter(e => e.path.includes('nodes[0]'))

// Find all missing field errors
const missingFields = validation.errors.filter(e =>
  e.code === 'MISSING_REQUIRED_FIELD'
)

// Print with suggestions
missingFields.forEach(e => {
  console.error(`${e.path}: ${e.message}`)
  console.error(`  → Suggestion: ${e.suggestion || 'Fix this issue'}`)
})
```

---

## Error Response Format

### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Workflow validation failed: 2 errors"
  },
  "diagnostics": {
    "errors": [
      {
        "path": "nodes[0].parameters",
        "message": "Missing required parameter: url",
        "code": "MISSING_REQUIRED_FIELD",
        "suggestion": "Add a URL parameter to the HTTP node"
      }
    ]
  }
}
```

### Execution Error (500)

```json
{
  "success": false,
  "error": {
    "code": "EXECUTION_ERROR",
    "message": "Workflow execution failed",
    "details": {
      "executionId": "exec-123",
      "workflowId": "wf-456",
      "reason": "NODE_EXECUTION_FAILED"
    }
  }
}
```

---

## Migration Guide

### From Old System

**Before**:
```typescript
// No validation, errors caught at runtime
const result = await engine.executeWorkflow(workflow)
if (result.status === 'error') {
  // Handle execution error (too late!)
}
```

**After**:
```typescript
// Validate before execution
const validation = await loader.validateWorkflow(workflow)
if (!validation.valid) {
  // Return 400 with detailed errors (fail fast!)
  return errorResponse(validation.errors)
}

const result = await engine.executeWorkflow(workflow)
```

### Gradual Rollout

```typescript
// Phase 1: Logging only
const validation = await loader.validateWorkflow(workflow)
if (!validation.valid) {
  console.warn('Validation failed (not enforced)', validation.errors)
}
const result = await engine.executeWorkflow(workflow)

// Phase 2: Optional enforcement
if (req.query.enforceValidation) {
  if (!validation.valid) {
    return errorResponse(validation.errors)
  }
}

// Phase 3: Always enforce (final state)
if (!validation.valid) {
  return errorResponse(validation.errors)
}
```

---

## Troubleshooting

### "Workflow validation failed: 3 errors"

This means the workflow structure is invalid. Check:
- All nodes have unique IDs and names
- All node types are registered
- Connections reference existing nodes
- Required parameters are present

### Cache hit rate is 0%

This usually means:
- Workflows are modified frequently
- Each workflow is unique
- Cache TTL is too short

Solutions:
- Increase `cacheTTLMs` option
- Batch validations where possible

### Validation takes 500ms+

This is slow. Check:
- Workflow size (node count)
- Registry size (available node types)
- Concurrent validations

Solutions:
- Profile with `diagnostics.validationTimeMs`
- Reduce workflow complexity
- Use batch validation for efficiency

### "Access denied to workflow"

Multi-tenant isolation working correctly. Ensure:
- User's tenantId matches route param
- User level >= 4 for cross-tenant access
- Workflow's tenantId matches route param

---

## Summary

**Key Functions**:
- `validateWorkflow()` - Validate single workflow
- `validateBatch()` - Validate multiple workflows
- `invalidateCache()` - Clear cached validation
- `getDiagnostics()` - Get workflow structure info
- `getCacheStats()` - Get cache performance

**Error Codes**: `MISSING_REQUIRED_FIELD`, `INVALID_NODE_TYPE`, `INVALID_CONNECTION_TARGET`, etc.

**Patterns**: Create with validation, execute with validation, batch operations, cache management

**Multi-tenant**: Use `buildMultiTenantContext()` to ensure tenant isolation

**Performance**: Leverage caching, use batch operations, validate async when possible
