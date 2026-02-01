# DBAL Workflow Extension - Quick Reference

**For Developers Implementing DBAL Workflow Operations**

---

## One-Minute Overview

The DBAL Workflow Extension adds comprehensive workflow persistence and execution support to the MetaBuilder DBAL layer with guaranteed multi-tenant isolation.

**Core Principle**: Every workflow operation automatically filters by `tenantId` at the ACL layer - you cannot accidentally expose one tenant's workflows to another.

---

## Key Files & Locations

| File | Purpose |
|------|---------|
| `/docs/DBAL_WORKFLOW_EXTENSION_SPECIFICATION.md` | Full architecture & design |
| `/docs/DBAL_WORKFLOW_INTEGRATION_GUIDE.md` | Implementation details & data flows |
| `dbal/shared/api/schema/entities/core/workflow.yaml` | (New) YAML entity schema |
| `dbal/development/src/core/foundation/types/automation/workflow.ts` | (New) TypeScript types |
| `dbal/development/src/core/entities/operations/automation/workflow-operations.ts` | (New) Interface definition |
| `dbal/development/src/core/entities/workflow/crud/*.ts` | (New) CRUD implementation |
| `dbal/development/src/core/entities/workflow/validation/*.ts` | (New) Validation logic |

---

## Essential TypeScript Types

```typescript
// Main entity type
interface Workflow {
  id: string                              // UUID
  tenantId: string                        // REQUIRED - enforced at all layers
  name: string                            // Human-readable name
  description?: string | null
  nodes: string                           // JSON stringified WorkflowNode[]
  edges: string                           // JSON stringified WorkflowConnections
  enabled: boolean                        // Can workflow execute?
  version: number                         // Semantic version
  executionCount: number                  // Total runs
  lastExecutedAt?: bigint | null          // Timestamp of last run
  lastExecutionStatus?: 'success' | 'failure' | 'pending' | 'timeout' | null
  averageExecutionTime?: number | null    // Average duration (ms)
  createdAt: bigint                       // Creation timestamp
  updatedAt: bigint                       // Last modification timestamp
  createdBy: string                       // Creator user ID
  updatedBy?: string | null               // Last modifier user ID
  variables?: string | null               // JSON stringified variables
  config?: string | null                  // JSON stringified execution config
  tags?: string | null                    // Comma-separated tags
  category?: 'system' | 'user' | 'package' | 'automation' | 'integration' | 'template' | null
  validationStatus: 'valid' | 'invalid' | 'stale' | 'pending'
  validationErrors?: string | null        // JSON stringified validation errors
  isLocked: boolean                       // Locked during execution?
  lockedBy?: string | null                // User holding lock
  lockedAt?: bigint | null                // When lock acquired
}

// For creating workflows
interface CreateWorkflowInput {
  tenantId: string                        // MANDATORY
  name: string
  description?: string | null
  nodes: string                           // JSON string
  edges: string                           // JSON string
  enabled?: boolean                       // Default: true
  version?: number                        // Default: 1
  createdBy: string                       // MANDATORY
  variables?: string | null
  config?: string | null
  tags?: string | null
  category?: string | null
}

// For updating workflows
interface UpdateWorkflowInput {
  name?: string
  description?: string | null
  nodes?: string
  edges?: string
  enabled?: boolean
  version?: number
  variables?: string | null
  config?: string | null
  tags?: string | null
  category?: string | null
  updatedBy?: string                      // MANDATORY if updating
}

// Query filters (tenantId always injected)
interface WorkflowQueryFilter {
  tenantId: string                        // Automatic (cannot be overridden)
  enabled?: boolean
  category?: string
  createdBy?: string
  tags?: string
  validationStatus?: string
  lastExecutionStatus?: string
  search?: string                         // Full-text search
}
```

---

## Main Operations

### Read Operations

```typescript
// Get single workflow (cached in hot cache)
const workflow = await db.workflows.get(id, tenantId)

// List workflows (cached in warm cache)
const { items, total, hasMore } = await db.workflows.list(tenantId, {
  filter: { enabled: true, category: 'automation' },
  sort: { field: 'createdAt', direction: 'desc' },
  page: 1,
  limit: 20
})

// Find first match
const workflow = await db.workflows.findFirst(tenantId, { category: 'user' })

// Find multiple by field
const workflows = await db.workflows.findByField(tenantId, 'createdBy', userId)

// Full-text search
const results = await db.workflows.search(tenantId, 'data pipeline', { limit: 10 })

// Execution statistics
const stats = await db.workflows.getExecutionStats(id, tenantId, {
  startTime: BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endTime: BigInt(Date.now())
})
```

### Write Operations

```typescript
// Create workflow
const workflow = await db.workflows.create({
  tenantId: 'acme',
  name: 'Data Pipeline',
  nodes: JSON.stringify([...]),
  edges: JSON.stringify({...}),
  enabled: true,
  createdBy: userId
})

// Update workflow
const updated = await db.workflows.update(id, tenantId, {
  name: 'Updated Name',
  enabled: false
})

// Delete workflow
const deleted = await db.workflows.delete(id, tenantId)

// Upsert (create if not exists, update if exists)
const workflow = await db.workflows.upsert(
  tenantId,
  'Workflow Name',
  createData,
  updateData
)

// Bulk operations
await db.workflows.createMany(tenantId, [input1, input2, input3])
const count = await db.workflows.updateMany(tenantId, { enabled: true }, { enabled: false })
const deleted = await db.workflows.deleteMany(tenantId, { category: 'old' })
```

### Workflow-Specific Operations

```typescript
// Validate against compliance rules
const report = await db.workflows.validate(id, tenantId)
if (!report.valid) {
  console.error('Validation errors:', report.errors)
}

// Acquire lock before execution
const locked = await db.workflows.acquireLock(id, tenantId, userId)
if (!locked) throw new Error('Already executing')

// Release lock after execution
await db.workflows.releaseLock(id, tenantId, userId)

// Record execution results
await db.workflows.recordExecution(id, tenantId, {
  status: 'success',
  executionTime: 1234
})

// Clone workflow
const cloned = await db.workflows.clone(id, tenantId, {
  newName: 'Workflow Clone',
  enabled: false
})

// Export for backup
const exported = await db.workflows.export(id, tenantId)
// { workflow: {...}, validationReport: {...}, exportedAt: ... }

// Import from external definition
const imported = await db.workflows.import(tenantId, definition, {
  name: 'Imported Workflow',
  enabled: false
})

// Enable/disable
const updated = await db.workflows.setEnabled(id, tenantId, false)
```

---

## Multi-Tenant Safety Guarantees

```typescript
// GUARANTEE 1: TenantId filter is automatic
await db.workflows.list('tenant-a')
// Returns ONLY workflows where tenantId === 'tenant-a'
// User cannot override this filter

// GUARANTEE 2: Single-item operations verify tenantId
const workflow = await db.workflows.get(id, 'tenant-a')
// If workflow.tenantId !== 'tenant-a', returns null OR throws

// GUARANTEE 3: Operations verify ownership
try {
  await db.workflows.delete(id, 'wrong-tenant')
} catch (e) {
  // DBALError.forbidden('Workflow belongs to different tenant')
}

// GUARANTEE 4: Cache is tenant-scoped
// Hot cache key: 'workflow:${id}' (but verify tenantId after retrieval)
// Warm cache key: 'workflows:list:${tenantId}:...'

// GUARANTEE 5: Audit logs record tenantId
// Every operation logged with full context: tenantId, userId, operationName, etc.
```

---

## Caching Strategy

```
┌─────────────────────────────────────────────────────┐
│ HOT CACHE (In-Memory)                               │
│ - TTL: 100ms                                        │
│ - Usage: Single workflow lookups                    │
│ - Key: 'workflow:${id}'                             │
│ - Strategy: LRU, 1000 items per tenant              │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ WARM CACHE (Redis/Memory)                           │
│ - TTL: 5 minutes                                    │
│ - Usage: List queries, validation results          │
│ - Key: 'workflows:list:${tenantId}:...'             │
│ - Strategy: TTL-based expiration                    │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ COLD CACHE (Database)                               │
│ - TTL: 1 hour                                       │
│ - Usage: Validation results, execution stats        │
│ - Key: validationStatus + validatedAt fields        │
│ - Strategy: Stale detection + background re-check   │
└─────────────────────────────────────────────────────┘

INVALIDATION ON UPDATE:
├─ Hot: invalidate('workflow:${id}')
├─ Warm: invalidate('workflows:list:${tenantId}:*')
├─ Warm: invalidate('workflow:validation:${id}')
└─ Warm: invalidate('workflow:stats:${id}')
```

---

## Error Codes

```typescript
enum WorkflowErrorCode {
  // Validation errors
  INVALID_NODES = 4220,
  INVALID_EDGES = 4221,
  CIRCULAR_DEPENDENCY = 4222,
  ORPHANED_NODE = 4223,
  MISSING_VARIABLE = 4224,
  INVALID_VARIABLE_TYPE = 4225,

  // Lock errors
  WORKFLOW_LOCKED = 4231,
  LOCK_ACQUISITION_FAILED = 4232,
  LOCK_NOT_OWNED = 4233,

  // Execution errors
  WORKFLOW_NOT_EXECUTABLE = 4241,
  EXECUTION_IN_PROGRESS = 4242,
  VALIDATION_STATUS_INVALID = 4243,

  // Multi-tenant errors
  TENANT_MISMATCH = 4034,
  CROSS_TENANT_ACCESS_DENIED = 4035,

  // Import/export errors
  INVALID_EXPORT_FORMAT = 4251,
  IMPORT_VALIDATION_FAILED = 4252,

  // State errors
  WORKFLOW_NOT_FOUND = 4041,
  WORKFLOW_DISABLED = 4042
}
```

---

## ACL Rules

```typescript
// Create: admin, god, supergod only
// Condition: tenantId must match user's tenantId

// Read: user, admin, god, supergod
// Condition: tenantId must match user's tenantId

// Update: admin, god, supergod, OR owner (createdBy)
// Condition: tenantId must match user's tenantId

// Delete: admin, god, supergod, OR owner
// Condition: tenantId must match user's tenantId

// Execute: user, admin, god, supergod (if enabled && validation.valid)
// Condition: tenantId must match user's tenantId

// ReleaseLock: Lock owner OR admin
// Condition: Must own the lock OR be admin
```

---

## Validation Integration

```typescript
// Validation happens at 3 points:

// 1. PRE-STORE (CREATE/UPDATE)
await db.workflows.create({
  tenantId: 'acme',
  name: 'Pipeline',
  nodes: '[invalid json]',  // ← Throws DBALError.validationError()
  ...
})

// 2. ON-DEMAND
const report = await db.workflows.validate(id, tenantId)
// Returns: { valid: boolean, errors: [], warnings: [] }

// 3. AUTOMATIC CACHING
// - validationStatus field: 'valid' | 'invalid' | 'stale' | 'pending'
// - validationErrors field: Cached error details
// - validUntil timestamp: When cache becomes stale

// Before execution, system checks:
if (workflow.validationStatus !== 'valid') {
  throw new Error('Workflow validation failed')
}
```

---

## Lock Management

```typescript
// Acquire lock before execution
const locked = await db.workflows.acquireLock(
  workflowId,
  tenantId,
  userId,
  timeout = 30000  // 30 second timeout
)

if (!locked) {
  throw new Error('Workflow is already executing')
}

try {
  // Execute workflow
  const result = await executeWorkflow(workflow)

  // Record execution
  await db.workflows.recordExecution(workflowId, tenantId, {
    status: 'success',
    executionTime: duration
  })
} finally {
  // Always release lock
  await db.workflows.releaseLock(workflowId, tenantId, userId)
}
```

---

## Common Patterns

### Pattern 1: Safe Workflow Execution

```typescript
async function executeWorkflowSafely(
  workflowId: string,
  tenantId: string,
  userId: string
): Promise<void> {
  // 1. Get workflow
  const workflow = await db.workflows.get(workflowId, tenantId)
  if (!workflow) throw new Error('Workflow not found')

  // 2. Validate
  if (workflow.validationStatus !== 'valid') {
    throw new Error('Workflow validation failed')
  }

  // 3. Acquire lock
  const locked = await db.workflows.acquireLock(
    workflowId,
    tenantId,
    userId
  )
  if (!locked) throw new Error('Workflow already executing')

  try {
    // 4. Execute
    const startTime = Date.now()
    const result = await dagExecutor.execute(workflow)
    const duration = Date.now() - startTime

    // 5. Record results
    await db.workflows.recordExecution(workflowId, tenantId, {
      status: result.success ? 'success' : 'failure',
      executionTime: duration
    })
  } finally {
    // 6. Release lock
    await db.workflows.releaseLock(workflowId, tenantId, userId)
  }
}
```

### Pattern 2: Batch Operations

```typescript
// Create multiple workflows
const workflows = await Promise.all([
  db.workflows.create({ tenantId: 'acme', name: 'Pipeline 1', ... }),
  db.workflows.create({ tenantId: 'acme', name: 'Pipeline 2', ... }),
  db.workflows.create({ tenantId: 'acme', name: 'Pipeline 3', ... })
])

// Or use bulk operation
const count = await db.workflows.createMany('acme', [
  { tenantId: 'acme', name: 'Pipeline 1', ... },
  { tenantId: 'acme', name: 'Pipeline 2', ... },
  { tenantId: 'acme', name: 'Pipeline 3', ... }
])
```

### Pattern 3: Backup & Restore

```typescript
// Export for backup
const exported = await db.workflows.export(workflowId, tenantId)
fs.writeFileSync('workflow-backup.json', JSON.stringify(exported))

// Import from backup
const backup = JSON.parse(fs.readFileSync('workflow-backup.json'))
const restored = await db.workflows.import(tenantId, backup.workflow, {
  name: backup.workflow.name + ' (Restored)',
  enabled: false
})
```

### Pattern 4: Conditional Updates

```typescript
// Update only if validation passes
const workflow = await db.workflows.get(id, tenantId)

const updated = await db.workflows.update(id, tenantId, {
  name: newName,
  nodes: newNodes,
  edges: newEdges
})

if (updated.validationStatus === 'invalid') {
  console.warn('Updated workflow has validation errors')
  // Could revert or notify user
}
```

---

## Testing

```typescript
// Unit test template
describe('Workflow Operations', () => {
  test('should create workflow with tenantId enforcement', async () => {
    const workflow = await db.workflows.create({
      tenantId: 'acme',
      name: 'Test Workflow',
      nodes: '[]',
      edges: '{}',
      enabled: true,
      createdBy: userId
    })

    expect(workflow.tenantId).toBe('acme')
    expect(workflow.validationStatus).toBe('valid' | 'invalid')
  })

  test('should prevent cross-tenant access', async () => {
    const workflow = await db.workflows.create({
      tenantId: 'acme',
      ...
    })

    const result = await db.workflows.get(workflow.id, 'different-tenant')
    expect(result).toBeNull() // or expect(async).rejects.toThrow()
  })

  test('should enforce validation on create', async () => {
    expect(async () => {
      await db.workflows.create({
        tenantId: 'acme',
        name: 'Invalid',
        nodes: 'invalid json',  // ← Should throw
        edges: '{}',
        createdBy: userId
      })
    }).rejects.toThrow('VALIDATION_ERROR')
  })
})
```

---

## Performance Tips

| Tip | Rationale |
|-----|-----------|
| Use `.get()` for single lookups | Hot cache (100ms TTL) |
| Use `.list()` with pagination | Warm cache (5min TTL) |
| Use `.search()` for text | Full-text index on DB |
| Batch `.createMany()` | Fewer round trips |
| Validate before large updates | Avoid storing invalid workflows |
| Record execution asynchronously | Don't block workflow completion |
| Clean up expired locks | Prevents deadlocks |

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Getting wrong tenant's data | TenantId filter not injected | Check ACL adapter configuration |
| Validation always fails | Validator too strict | Review validation rules |
| Lock timeout | Workflow stuck executing | Check for deadlocks, implement auto-cleanup |
| Cache inconsistency | Invalidation pattern missed | Add missing cache.invalidate() calls |
| Slow list queries | Cache miss | Check cache key generation |

---

## Related Documentation

- **Full Specification**: `/docs/DBAL_WORKFLOW_EXTENSION_SPECIFICATION.md`
- **Implementation Guide**: `/docs/DBAL_WORKFLOW_INTEGRATION_GUIDE.md`
- **Workflow Validator**: `workflow/executor/ts/utils/workflow-validator.ts`
- **DBAL Architecture**: `/docs/CLAUDE.md#dbal---database-abstraction-layer`
- **Multi-Tenant Safety**: `/docs/MULTI_TENANT_AUDIT.md`

---

**Last Updated**: 2026-01-22
**Status**: Ready for Development
