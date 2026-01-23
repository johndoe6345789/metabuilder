# DBAL Workflow Extension - Implementation Integration Guide

**Document Version**: 1.0
**Date**: 2026-01-22
**Status**: Implementation Roadmap
**Audience**: Backend developers implementing the DBAL workflow layer

---

## 1. Architecture Layers & Component Interaction

### 1.1 Detailed Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│ API Layer (Next.js / HTTP)                                              │
│ POST /api/v1/acme/workflows                                             │
│ GET  /api/v1/acme/workflows/{id}                                        │
│ PUT  /api/v1/acme/workflows/{id}                                        │
│ DELETE /api/v1/acme/workflows/{id}                                      │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ Auth & Context Extraction Layer                                          │
│ - Extract tenantId from JWT or session                                   │
│ - Extract userId from auth context                                       │
│ - Extract userRole (user, admin, god, supergod)                          │
│ - Create TenantContext object                                            │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ DBAL Client Layer (Request Entry Point)                                 │
│ - createWorkflow(input)                                                 │
│ - getWorkflow(id, tenantId)                                             │
│ - listWorkflows(tenantId, options)                                      │
│ - updateWorkflow(id, tenantId, input)                                   │
│ - deleteWorkflow(id, tenantId)                                          │
│ - validateWorkflow(id, tenantId)                                        │
│ - acquireWorkflowLock(id, tenantId, userId)                             │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬──────────────────┐
        │                  │                  │                  │
        ↓                  ↓                  ↓                  ↓
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐
│ Hot Cache        │ │ Validator Layer  │ │ Lock Manager     │ │ Audit Logger │
│ (In-Memory)      │ │ (WorkflowValidator)
│ - TTL: 100ms     │ │ - Validates nodes│ │ - acquireLock    │ │ - Records all│
│ - LRU eviction   │ │ - Validates edges│ │ - releaseLock    │ │   operations │
│ - Per-tenant     │ │ - Checks vars    │ │ - Timeout check  │ │ - With tenant
│   scoping        │ │ - Multi-tenant   │ │ - Deadlock prev. │ │   ID + userID
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘ └──────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ Operation Layer (Workflow-Specific Logic)                              │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ WorkflowOperations Interface                                       │ │
│ │ - get(id, tenantId) → Workflow | null                              │ │
│ │ - list(tenantId, options) → ListResult<Workflow>                   │ │
│ │ - create(input) → Workflow                                         │ │
│ │ - update(id, tenantId, input) → Workflow                           │ │
│ │ - delete(id, tenantId) → boolean                                   │ │
│ │ - validate(id, tenantId) → ValidationReport                        │ │
│ │ - recordExecution(id, tenantId, result) → Workflow                 │ │
│ │ - clone(id, tenantId, options) → Workflow                          │ │
│ │ - export/import operations...                                      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Validation Integration                                             │ │
│ │ - Parse JSON nodes/edges                                           │ │
│ │ - Call WorkflowValidator.validate()                                │ │
│ │ - Store result in validationStatus + validationErrors              │ │
│ │ - Set validUntil timestamp                                         │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ ACL Adapter Layer                                                       │
│ ┌──────────────────────────────────────────────────────────────────────┐│
│ │ 1. Permission Check: Does user have access to operation?           ││
│ │    - check user role vs. workflow ACL rules                        ││
│ │    - Throws DBALError.forbidden() if denied                        ││
│ ├──────────────────────────────────────────────────────────────────────┤│
│ │ 2. Query Filter: Inject tenantId filter (cannot be overridden)     ││
│ │    - Ensures user only sees their tenant's data                    ││
│ │    - List operations: filter = { ...filter, tenantId }             ││
│ ├──────────────────────────────────────────────────────────────────────┤│
│ │ 3. Row-Level ACL: Verify fetched rows belong to tenant             ││
│ │    - After fetch: if (row.tenantId !== context.tenantId) throw     ││
│ ├──────────────────────────────────────────────────────────────────────┤│
│ │ 4. Audit: Log all operations with context                          ││
│ │    - tenantId, userId, operationName, status, timestamp            ││
│ └──────────────────────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ Adapter Layer (Pluggable Backend)                                       │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ Prisma Adapter          │ Memory Adapter                            │ │
│ │ (Production)            │ (Testing/Dev)                            │ │
│ │                         │                                          │ │
│ │ - create(entity, data)  │ - create(entity, data)                   │ │
│ │ - read(entity, id)      │ - read(entity, id)                       │ │
│ │ - update(entity, id, ..)│ - update(entity, id, ..)                 │ │
│ │ - delete(entity, id)    │ - delete(entity, id)                     │ │
│ │ - list(entity, options) │ - list(entity, options)                  │ │
│ │ - findFirst, findByField│ - findFirst, findByField                 │ │
│ │ - updateMany, deleteMany│ - updateMany, deleteMany                 │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ Database Layer                                                          │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ SQLite (Development)    │ PostgreSQL (Production)                  │ │
│ │                         │                                          │ │
│ │ - workflows table       │ - workflows table                        │ │
│ │   - id (uuid)           │   - id (uuid)                            │ │
│ │   - tenantId (uuid)     │   - tenantId (uuid)                      │ │
│ │   - name (string)       │   - name (string)                        │ │
│ │   - nodes (json)        │   - nodes (jsonb) [Native support]       │ │
│ │   - edges (json)        │   - edges (jsonb) [Native support]       │ │
│ │   - ... (20+ fields)    │   - ... (20+ fields)                     │ │
│ │                         │                                          │ │
│ │ Indexes:                │ Indexes:                                 │ │
│ │ - idx_tenant            │ - idx_tenant (B-tree)                    │ │
│ │ - idx_tenant_enabled    │ - idx_tenant_enabled (B-tree)            │ │
│ │ - idx_tenant_created    │ - idx_tenant_created (B-tree)            │ │
│ │ - idx_tenant_status     │ - gin_nodes (GIN for JSON search)        │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow for Key Operations

### 2.1 Flow: Create Workflow

```
1. API Endpoint receives POST /api/v1/acme/workflows
   ├─ Extract tenantId = 'acme' from URL
   ├─ Extract userId from auth token
   ├─ Extract request body (nodes, edges, name, etc.)
   └─ Create TenantContext { tenantId, userId, userRole, ... }

2. DBALClient.createWorkflow(input)
   ├─ Validate input.tenantId matches context.tenantId
   ├─ Validate input structure (name, nodes, edges, etc.)
   └─ Call WorkflowOperations.create(input)

3. WorkflowOperations.create(input)
   ├─ Validate input through validateWorkflowCreate()
   │  └─ Throws DBALError.validationError if invalid
   ├─ Parse JSON nodes and edges
   │  └─ Throws DBALError.validationError if malformed
   ├─ Call validator.validate(nodes, edges, variables)
   │  ├─ If validation fails → set validationStatus = 'invalid'
   │  └─ If validation passes → set validationStatus = 'valid'
   ├─ Set initial values:
   │  ├─ executionCount = 0
   │  ├─ createdAt = now()
   │  ├─ createdBy = input.createdBy
   │  └─ isLocked = false
   └─ Call adapter.create('workflow', workflowData)

4. ACLAdapter.create('workflow', workflowData)
   ├─ Check ACL: Does user have permission to create?
   │  └─ Role must be in ['admin', 'god', 'supergod']
   │  └─ Throws DBALError.forbidden() if denied
   ├─ Verify tenantId in payload matches context
   │  └─ Throws WorkflowError.tenantMismatch() if different
   └─ Call baseAdapter.create('workflow', workflowData)

5. PrismaAdapter.create('workflow', workflowData)
   ├─ INSERT INTO workflows (id, tenantId, name, nodes, ...) VALUES (...)
   ├─ Return created record with id
   └─ If unique constraint violated → throw DBALError.conflict()

6. Back in WorkflowOperations.create()
   ├─ Cache in hot cache: cache.setHot(`workflow:${id}`, created)
   ├─ Audit the operation with full context
   └─ Return created Workflow object

7. ACLAdapter logs operation
   ├─ auditLog({ operation: 'create', entity: 'workflow',
   │              workflowId, tenantId, userId, status: 'success' })

8. API returns 201 Created with workflow object
   └─ Location header: /api/v1/acme/workflows/{id}

CACHE STATE AFTER:
├─ Hot: { 'workflow:${id}': Workflow }
├─ Warm: { 'workflows:list:acme:...' → invalidated }
└─ Database: Row inserted
```

### 2.2 Flow: Get Workflow

```
1. API Endpoint receives GET /api/v1/acme/workflows/123
   ├─ Extract tenantId = 'acme'
   ├─ Extract id = '123' from URL
   └─ Create TenantContext

2. DBALClient.getWorkflow('123', 'acme')
   └─ Call WorkflowOperations.get('123', 'acme')

3. WorkflowOperations.get('123', 'acme')
   ├─ Check hot cache: cache.getHot('workflow:123')
   │  ├─ If found and not expired → return cached
   │  └─ If not found or expired → continue
   ├─ Call adapter.read('workflow', '123')
   │  └─ (ACL layer ensures tenantId filtering)
   └─ If found:
      ├─ Verify row.tenantId === context.tenantId (row-level ACL)
      ├─ Parse JSON nodes and edges to objects (optional)
      ├─ Cache in hot cache with 100ms TTL
      └─ Return Workflow

4. ACLAdapter.read('workflow', '123')
   ├─ Check ACL: Does user have read permission?
   │  └─ Role must be in ['user', 'admin', 'god', 'supergod']
   ├─ Call baseAdapter.read('workflow', '123')
   │  └─ Query: SELECT * FROM workflows WHERE id = '123'
   └─ Row-level check: if (row.tenantId !== context.tenantId) throw

5. PrismaAdapter.read('workflow', '123')
   ├─ SELECT * FROM workflows WHERE id = '123' LIMIT 1
   └─ Return row or null

6. Back in WorkflowOperations.get()
   ├─ Set hot cache: cache.setHot('workflow:123', workflow)
   ├─ Audit: { operation: 'get', workflowId: '123', tenantId, ... }
   └─ Return workflow

7. API returns 200 OK with workflow JSON

CACHE STATE AFTER:
├─ Hot: { 'workflow:123': Workflow (TTL: 100ms) }
└─ Database: No change
```

### 2.3 Flow: List Workflows (Multi-Tenant Safety)

```
1. API Endpoint receives GET /api/v1/acme/workflows?enabled=true&limit=20&page=1
   ├─ Extract tenantId = 'acme'
   ├─ Parse query params: enabled=true, limit=20, page=1
   └─ Create TenantContext

2. DBALClient.listWorkflows('acme', { filter: { enabled: true }, limit: 20, page: 1 })
   └─ Call WorkflowOperations.list('acme', options)

3. WorkflowOperations.list('acme', options)
   ├─ Build cache key: 'workflows:list:acme:enabled=true:page=1:limit=20'
   ├─ Check warm cache: cache.getWarm(cacheKey)
   │  ├─ If found and not expired → return cached
   │  └─ If not found → continue
   ├─ Merge filter with tenantId (CANNOT BE OVERRIDDEN):
   │  └─ safeFilter = { enabled: true, tenantId: 'acme' }
   └─ Call adapter.list('workflow', { filter: safeFilter, ... })

4. ACLAdapter.list('workflow', options)
   ├─ Check ACL: Does user have read permission?
   │  └─ Role must be in ['user', 'admin', 'god', 'supergod']
   ├─ ENFORCE tenantId in filter (CRITICAL):
   │  └─ if (!filter.tenantId) filter.tenantId = context.tenantId
   │  └─ filter.tenantId = context.tenantId (force overwrite)
   ├─ Call baseAdapter.list('workflow', { filter: { tenantId, enabled }, ... })
   │  └─ Query execution
   └─ Row-level ACL check on ALL returned rows:
      ├─ for (const row of results.items) {
      │    if (row.tenantId !== context.tenantId) throw
      │  }

5. PrismaAdapter.list('workflow', options)
   ├─ Query:
   │  SELECT * FROM workflows
   │  WHERE tenantId = 'acme' AND enabled = true
   │  ORDER BY createdAt DESC
   │  LIMIT 20 OFFSET 0
   ├─ Return paginated result with total count
   └─ Return { items: [...], total: 150, hasMore: true }

6. Back in WorkflowOperations.list()
   ├─ Set warm cache: cache.setWarm(cacheKey, result, 5*60*1000)
   ├─ Audit: { operation: 'list', filter, tenantId, count: 20, ... }
   └─ Return ListResult

7. API returns 200 OK with JSON array + pagination metadata

CRITICAL SAFETY CHECKS:
├─ ✓ TenantId injected at ACL layer
├─ ✓ User cannot override tenantId filter
├─ ✓ Row-level ACL verifies tenantId on results
├─ ✓ Query physically filters by tenantId in SQL
└─ ✓ Audit log records actual tenantId queried

CACHE STATE AFTER:
├─ Hot: No change (not single-item operation)
├─ Warm: { 'workflows:list:acme:...' → ListResult (TTL: 5min) }
└─ Database: No change
```

### 2.4 Flow: Update Workflow (with Lock)

```
1. API Endpoint receives PUT /api/v1/acme/workflows/123
   ├─ Extract tenantId, userId from context
   ├─ Extract request body (partial updates)
   └─ Create TenantContext

2. DBALClient.updateWorkflow('123', 'acme', updateInput)
   └─ Call WorkflowOperations.update('123', 'acme', updateInput)

3. WorkflowOperations.update('123', 'acme', updateInput)
   ├─ Check if workflow exists:
   │  └─ existing = adapter.read('workflow', '123')
   │  └─ If null → throw DBALError.notFound()
   ├─ Verify row-level ACL:
   │  ├─ if (existing.tenantId !== context.tenantId) throw forbidden()
   │  ├─ if (existing.createdBy !== context.userId && context.role !== 'admin') throw
   ├─ Acquire lock:
   │  ├─ locked = acquireLock('123', 'acme', userId)
   │  ├─ if (!locked) throw WorkflowError.workflowLocked()
   ├─ Validate update input:
   │  └─ Throws DBALError.validationError() if invalid
   ├─ If nodes or edges changed:
   │  ├─ Parse new JSON
   │  ├─ Call validator.validate(newNodes, newEdges, ...)
   │  ├─ Set validationStatus = validation.valid ? 'valid' : 'invalid'
   │  └─ Store validation errors if present
   ├─ Build update payload:
   │  ├─ Merge existing + update input
   │  ├─ Set updatedAt = now()
   │  ├─ Set updatedBy = userId
   │  └─ Increment version (optional)
   └─ Call adapter.update('workflow', '123', updatePayload)

4. ACLAdapter.update('workflow', '123', updatePayload)
   ├─ Check ACL: Does user have update permission?
   │  └─ Role must be in ['admin', 'god', 'supergod'] OR owner
   │  └─ Throws DBALError.forbidden() if denied
   ├─ Verify tenantId NOT being changed:
   │  ├─ if (updatePayload.tenantId && updatePayload.tenantId !== context.tenantId)
   │  │   throw WorkflowError.tenantMismatch()
   └─ Call baseAdapter.update('workflow', '123', updatePayload)

5. PrismaAdapter.update('workflow', '123', updatePayload)
   ├─ UPDATE workflows SET ... WHERE id = '123'
   ├─ Return updated row
   └─ If validation error → throw DBALError

6. Back in WorkflowOperations.update()
   ├─ Release lock:
   │  ├─ releaseLock('123', 'acme', userId)
   ├─ Invalidate caches:
   │  ├─ cache.invalidateHot(`workflow:123`)
   │  ├─ cache.invalidateWarm(`workflows:list:acme:*`)
   ├─ Audit the operation with full context
   └─ Return updated Workflow

7. API returns 200 OK with updated workflow

CRITICAL SAFETY MECHANISMS:
├─ ✓ Lock prevents concurrent updates
├─ ✓ ACL checks ownership or admin status
├─ ✓ TenantId verified and cannot be changed
├─ ✓ Validation re-run if structure changed
├─ ✓ Caches invalidated to prevent stale data
└─ ✓ Updated timestamp tracks modification

CACHE STATE AFTER:
├─ Hot: Invalidated (workflow:123)
├─ Warm: Invalidated (all lists with acme tenant)
└─ Database: Updated row with new values
```

---

## 3. Multi-Tenant Isolation Test Cases

### 3.1 Critical Test Scenarios

```typescript
describe('Workflow Operations - Multi-Tenant Isolation', () => {
  // Tenant A user trying to access Tenant B workflow
  test('should prevent cross-tenant read access', async () => {
    const tenantA_User = { tenantId: 'tenant-a', userId: 'user-1', role: 'user' }
    const tenantB_User = { tenantId: 'tenant-b', userId: 'user-2', role: 'user' }

    // Tenant B creates workflow
    const workflow = await db.workflows.create({
      tenantId: 'tenant-b',
      name: 'Secret Workflow',
      ...
    })

    // Tenant A user tries to read it
    const result = await db.workflows.get(workflow.id, 'tenant-a')

    // Should throw or return null
    expect(result).toBeNull() // OR expect(async).rejects.toThrow()
  })

  // User tries to override tenantId in query filter
  test('should prevent tenantId override in list filter', async () => {
    const userContext = { tenantId: 'tenant-a', userId: 'user-1' }

    // Try to inject malicious filter
    const result = await db.workflows.list('tenant-a', {
      filter: {
        tenantId: 'tenant-b' // Attempt to override
      }
    })

    // Should still only return tenant-a workflows
    expect(result.items.every(w => w.tenantId === 'tenant-a')).toBe(true)
  })

  // Admin trying to read user from different tenant
  test('admin cannot override tenant boundaries', async () => {
    const tenantA_Admin = { tenantId: 'tenant-a', role: 'admin' }
    const tenantB_Workflow = { tenantId: 'tenant-b', id: '123' }

    const result = await db.workflows.get('123', 'tenant-a')
    expect(result).toBeNull()
  })

  // Cache should be tenant-scoped
  test('hot cache should be isolated per tenant', async () => {
    const workflow_a = await db.workflows.create({
      tenantId: 'tenant-a',
      name: 'Workflow A',
      ...
    })

    const workflow_b = await db.workflows.create({
      tenantId: 'tenant-b',
      name: 'Workflow B', // Same ID in different tenant
      ...
    })

    // Both should be cached but isolated
    const read_a = await db.workflows.get(workflow_a.id, 'tenant-a')
    const read_b = await db.workflows.get(workflow_b.id, 'tenant-b')

    expect(read_a.tenantId).toBe('tenant-a')
    expect(read_b.tenantId).toBe('tenant-b')
  })

  // Concurrent updates from different tenants
  test('should handle concurrent updates from different tenants', async () => {
    const workflow_a = await db.workflows.create({
      tenantId: 'tenant-a',
      name: 'Original',
      ...
    })

    const workflow_b = await db.workflows.create({
      tenantId: 'tenant-b',
      name: 'Original',
      ...
    })

    const [result_a, result_b] = await Promise.all([
      db.workflows.update(workflow_a.id, 'tenant-a', { name: 'Updated A' }),
      db.workflows.update(workflow_b.id, 'tenant-b', { name: 'Updated B' })
    ])

    expect(result_a.name).toBe('Updated A')
    expect(result_b.name).toBe('Updated B')
  })

  // Audit logs should record correct tenant
  test('audit logs should record tenantId for all operations', async () => {
    await db.workflows.create({
      tenantId: 'tenant-a',
      name: 'Audited Workflow',
      ...
    })

    const logs = await auditLog.query({ entity: 'workflow' })
    const lastLog = logs[logs.length - 1]

    expect(lastLog.tenantId).toBe('tenant-a')
    expect(lastLog.userId).toBeDefined()
    expect(lastLog.operationName).toBe('create')
  })
})
```

---

## 4. Cache Invalidation Patterns

### 4.1 Invalidation Cascade on Update

```typescript
/**
 * When a workflow is updated, cascade invalidates all dependent caches
 */
async function invalidateOnWorkflowUpdate(
  id: string,
  tenantId: string
): Promise<void> {
  // 1. Invalidate single-item cache
  cache.invalidateHot(new RegExp(`^workflow:${id}$`))

  // 2. Invalidate all list queries for this tenant
  cache.invalidateWarm(new RegExp(`^workflows:list:${tenantId}:`))

  // 3. Invalidate validation cache
  cache.invalidateWarm(new RegExp(`^workflow:validation:${id}$`))

  // 4. Invalidate execution stats cache
  cache.invalidateWarm(new RegExp(`^workflow:stats:${id}$`))

  // 5. Clear any search results that might include this workflow
  cache.invalidateWarm(new RegExp(`^workflows:search:${tenantId}:`))

  // 6. If workflow was deleted, also clear clone-related caches
  // (no need for this workflow, but might be referenced elsewhere)
}

/**
 * Partial invalidation for non-structural updates
 * (e.g., only executionCount changed, validation still valid)
 */
async function partialInvalidateOnUpdate(
  id: string,
  tenantId: string,
  changedFields: string[]
): Promise<void> {
  const structuralFields = ['nodes', 'edges', 'variables', 'config']
  const hasStructuralChange = changedFields.some(f => structuralFields.includes(f))

  // Only invalidate validation if structure changed
  if (hasStructuralChange) {
    cache.invalidateWarm(new RegExp(`^workflow:validation:${id}$`))
  }

  // Always invalidate single-item cache
  cache.invalidateHot(new RegExp(`^workflow:${id}$`))

  // Always invalidate list caches (updated timestamp changed)
  cache.invalidateWarm(new RegExp(`^workflows:list:${tenantId}:`))
}
```

### 4.2 Cache Invalidation on Delete

```typescript
/**
 * Complete cache cleanup when workflow is deleted
 */
async function invalidateOnWorkflowDelete(
  id: string,
  tenantId: string
): Promise<void> {
  // 1. Workflow itself
  cache.invalidateHot(new RegExp(`^workflow:${id}$`))

  // 2. All metadata
  cache.invalidateWarm(new RegExp(`^workflow:${id}:`))

  // 3. All lists for tenant (deletedCount affected)
  cache.invalidateWarm(new RegExp(`^workflows:list:${tenantId}:`))

  // 4. Search results
  cache.invalidateWarm(new RegExp(`^workflows:search:${tenantId}:`))

  // 5. Stats cache (count changed)
  cache.invalidateWarm(new RegExp(`^workflows:stats:${tenantId}:`))
}
```

---

## 5. Validator Integration Checklist

### 5.1 Pre-Store Validation

```typescript
// In WorkflowOperations.create() before adapter.create()
async function validateBeforeStore(
  input: CreateWorkflowInput
): Promise<void> {
  // 1. Parse JSON structures
  let nodes: WorkflowNode[]
  let edges: WorkflowConnections
  try {
    nodes = JSON.parse(input.nodes)
    edges = JSON.parse(input.edges)
  } catch (e) {
    throw DBALError.validationError('Invalid JSON in nodes or edges', [
      { field: 'nodes/edges', error: 'Must be valid JSON' }
    ])
  }

  // 2. Parse variables if provided
  let variables: WorkflowVariables | undefined
  if (input.variables) {
    try {
      variables = JSON.parse(input.variables)
    } catch (e) {
      throw DBALError.validationError('Invalid JSON in variables', [
        { field: 'variables', error: 'Must be valid JSON' }
      ])
    }
  }

  // 3. Run full validator
  const result = validator.validate({
    tenantId: input.tenantId,
    nodes,
    edges,
    variables
  })

  // 4. Decide on blocking vs. warning
  if (!result.valid) {
    // BLOCK: Critical validation errors
    throw DBALError.validationError(
      'Workflow validation failed',
      result.errors.map(e => ({
        field: e.path,
        error: e.message
      }))
    )
  }

  // NOTE: Warnings are stored but don't block creation
}
```

### 5.2 Post-Store Validation Cache

```typescript
// In WorkflowOperations.create() after adapter.create()
async function cacheValidationResult(
  workflow: Workflow,
  validationResult: WorkflowValidationResult
): Promise<void> {
  // Update workflow record with validation result
  await adapter.update('workflow', workflow.id, {
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    validationErrors: validationResult.valid ? null : JSON.stringify(validationResult.errors),
    validatedAt: Date.now(),
    validUntil: Date.now() + (1 * 60 * 60 * 1000) // 1 hour
  })

  // Cache validation result in warm cache
  const cacheKey = CacheKeyGenerator.validation(workflow.id)
  await cache.setWarm(cacheKey, {
    workflowId: workflow.id,
    valid: validationResult.valid,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
    timestamp: Date.now(),
    expiresAt: Date.now() + (1 * 60 * 60 * 1000)
  }, 60 * 60 * 1000) // 1 hour TTL
}
```

---

## 6. Lock Management Implementation

### 6.1 Lock Acquisition & Release

```typescript
/**
 * In-memory lock manager (thread-safe with async handling)
 */
class WorkflowLockManager {
  private locks = new Map<string, LockEntry>()
  private readonly defaultTimeout = 30000 // 30 seconds

  async acquireLock(
    id: string,
    tenantId: string,
    userId: string,
    timeout = this.defaultTimeout
  ): Promise<boolean> {
    const lockKey = `${tenantId}:${id}`
    const existing = this.locks.get(lockKey)

    // Check if already locked and not expired
    if (existing && Date.now() < existing.expiresAt) {
      return false // Already locked by someone else
    }

    // Remove expired lock if exists
    if (existing && Date.now() >= existing.expiresAt) {
      this.locks.delete(lockKey)
    }

    // Acquire new lock
    this.locks.set(lockKey, {
      userId,
      tenantId,
      workflowId: id,
      acquiredAt: Date.now(),
      expiresAt: Date.now() + timeout
    })

    // Also update database record
    await adapter.update('workflow', id, {
      isLocked: true,
      lockedBy: userId,
      lockedAt: BigInt(Date.now())
    })

    return true
  }

  async releaseLock(
    id: string,
    tenantId: string,
    userId?: string
  ): Promise<boolean> {
    const lockKey = `${tenantId}:${id}`
    const lock = this.locks.get(lockKey)

    if (!lock) {
      return false // No lock exists
    }

    // If userId provided, verify ownership
    if (userId && lock.userId !== userId) {
      throw DBALError.forbidden('You do not own this lock')
    }

    // Remove from memory
    this.locks.delete(lockKey)

    // Update database
    await adapter.update('workflow', id, {
      isLocked: false,
      lockedBy: null,
      lockedAt: null
    })

    return true
  }

  /**
   * Check if workflow is currently locked
   */
  isLocked(id: string, tenantId: string): boolean {
    const lockKey = `${tenantId}:${id}`
    const lock = this.locks.get(lockKey)

    if (!lock) return false
    if (Date.now() >= lock.expiresAt) {
      this.locks.delete(lockKey) // Cleanup expired lock
      return false
    }

    return true
  }

  /**
   * Get lock owner (for debugging)
   */
  getLockOwner(id: string, tenantId: string): string | null {
    const lockKey = `${tenantId}:${id}`
    const lock = this.locks.get(lockKey)
    return lock ? lock.userId : null
  }

  /**
   * Cleanup expired locks (call periodically)
   */
  cleanupExpiredLocks(): number {
    let count = 0
    const now = Date.now()

    for (const [key, lock] of this.locks) {
      if (now >= lock.expiresAt) {
        this.locks.delete(key)
        count++
      }
    }

    return count
  }
}
```

---

## 7. Execution Recording

### 7.1 Recording Execution Results

```typescript
/**
 * Update workflow execution metadata after execution
 */
async function recordExecution(
  id: string,
  tenantId: string,
  result: {
    status: 'success' | 'failure' | 'timeout'
    executionTime: number // in milliseconds
  }
): Promise<Workflow> {
  // 1. Get current workflow
  const workflow = await adapter.read('workflow', id)
  if (!workflow) throw DBALError.notFound('Workflow not found')

  // 2. Verify tenantId
  if ((workflow as any).tenantId !== tenantId) {
    throw DBALError.forbidden('Workflow belongs to different tenant')
  }

  // 3. Calculate new averageExecutionTime
  const currentCount = workflow.executionCount || 0
  const currentAvg = workflow.averageExecutionTime || 0
  const newAvg = currentCount === 0
    ? result.executionTime
    : (currentAvg * currentCount + result.executionTime) / (currentCount + 1)

  // 4. Update execution metadata
  const updated = await adapter.update('workflow', id, {
    lastExecutedAt: BigInt(Date.now()),
    executionCount: currentCount + 1,
    lastExecutionStatus: result.status,
    averageExecutionTime: Math.round(newAvg),
    updatedAt: BigInt(Date.now())
  })

  // 5. Invalidate caches
  cache.invalidateHot(new RegExp(`^workflow:${id}$`))
  cache.invalidateWarm(new RegExp(`^workflow:stats:${id}$`))
  cache.invalidateWarm(new RegExp(`^workflows:list:${tenantId}:`))

  // 6. Audit
  await auditLog({
    operationName: 'recordExecution',
    workflowId: id,
    tenantId,
    status: 'success',
    data: { executionStatus: result.status, executionTime: result.executionTime }
  })

  return updated as Workflow
}
```

---

## 8. File Structure & Organization

### 8.1 Directory Layout

```
dbal/development/src/core/entities/
├── operations/
│   ├── automation/              ← NEW: Workflow operations
│   │   ├── workflow-operations.ts       (main interface definition)
│   │   └── workflow/
│   │       ├── index.ts                 (factory + exports)
│   │       ├── create.ts                (CreateWorkflowInput handler)
│   │       ├── read.ts                  (Get, List, Find operations)
│   │       ├── update.ts                (Update, Upsert operations)
│   │       ├── delete.ts                (Delete, DeleteMany operations)
│   │       ├── validate.ts              (Validation integration)
│   │       ├── execute.ts               (Lock, RecordExecution operations)
│   │       ├── clone.ts                 (Clone, Export, Import operations)
│   │       ├── lock.ts                  (Lock/Unlock helpers)
│   │       ├── cache.ts                 (Cache key generation, invalidation)
│   │       └── utils.ts                 (Helper functions)
│   │
│   ├── core/
│   │   └── user-operations.ts
│   │
│   └── system/
│       └── package-operations.ts
│
├── workflow/                    ← NEW: Workflow entity storage
│   ├── index.ts                 (main exports)
│   ├── types.ts                 (workflow-specific types)
│   ├── crud/
│   │   ├── create-workflow.ts
│   │   ├── read-workflow.ts
│   │   ├── update-workflow.ts
│   │   └── delete-workflow.ts
│   ├── validation/
│   │   ├── validate-workflow-create.ts
│   │   ├── validate-workflow-update.ts
│   │   └── validate-graph-structure.ts
│   └── store/
│       └── in-memory-store.ts   (for Memory adapter)
│
└── [existing entities...]

dbal/development/src/core/
├── foundation/
│   ├── types/
│   │   ├── automation/
│   │   │   ├── index.ts         (workflow.ts re-export)
│   │   │   └── workflow.ts      ← NEW: Workflow type definitions
│   │   └── [existing...]
│   └── validation/
│       ├── entities/
│       │   └── workflow/
│       │       ├── validate-workflow-create.ts
│       │       └── validate-workflow-update.ts
│       └── [existing...]
│
└── [existing...]

tests/
├── unit/
│   └── workflows/
│       ├── workflow-operations.test.ts
│       ├── workflow-multi-tenant.test.ts
│       ├── workflow-cache.test.ts
│       ├── workflow-validation.test.ts
│       ├── workflow-lock.test.ts
│       └── workflow-crud.test.ts
│
├── integration/
│   └── workflows/
│       ├── workflow-adapter-compatibility.test.ts
│       ├── workflow-acl-enforcement.test.ts
│       ├── workflow-execution-recording.test.ts
│       └── workflow-end-to-end.test.ts
│
└── [existing...]
```

---

## 9. Dependencies & Imports

### 9.1 Required Imports for Implementation

```typescript
// In workflow-operations.ts

// DBAL Core
import type { DBALAdapter } from '../../adapters/adapter'
import type { ACLContext } from '../../adapters/acl-adapter/context'
import { DBALError } from '../../../foundation/errors'

// Types
import type {
  Workflow,
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowQueryFilter,
  WorkflowQueryOptions,
  WorkflowValidationReport
} from '../../../foundation/types'
import type { ListOptions, ListResult } from '../../../foundation/types'

// Workflow Validation
import { WorkflowValidator } from '../../../../workflow/executor/ts/utils/workflow-validator'

// Cache Management
import { CacheKeyGenerator } from './cache'
import type { WorkflowCacheManager } from './cache'

// Lock Management
import { WorkflowLockManager } from './lock'

// Audit Logging
import { auditLog } from '../../adapters/acl/audit-logger'

// Utilities
import { isValidUUID } from '../../../foundation/validation'
import {
  validateWorkflowCreate,
  validateWorkflowUpdate
} from '../../../foundation/validation'
```

---

## 10. Next Steps & Milestones

### Phase 2.1: Foundation (Week 1)
- [ ] Create `workflow.ts` type definitions
- [ ] Create `validate-workflow-create.ts` and `-update.ts`
- [ ] Create `workflow-operations.ts` interface
- [ ] Create folder structure and index files

### Phase 2.2: CRUD Implementation (Week 2)
- [ ] `create.ts` - CreateWorkflowInput → Workflow
- [ ] `read.ts` - Get + Find operations with caching
- [ ] `update.ts` - Update + Upsert with validation
- [ ] `delete.ts` - Delete + DeleteMany with cleanup
- [ ] Write unit tests for each

### Phase 2.3: Advanced Features (Week 3)
- [ ] `validate.ts` - WorkflowValidator integration
- [ ] `lock.ts` - Lock/Unlock + Lock manager
- [ ] `execute.ts` - RecordExecution + getStats
- [ ] `clone.ts` - Clone + Export/Import
- [ ] Write unit tests

### Phase 2.4: Performance & Caching (Week 4)
- [ ] `cache.ts` - CacheKeyGenerator + invalidation logic
- [ ] Implement HotCacheImpl (in-memory)
- [ ] Implement WarmCacheImpl (Redis if available)
- [ ] Integrate cold cache (DB-backed validation)
- [ ] Performance benchmarking

### Phase 2.5: Integration & Testing (Week 5)
- [ ] Integration tests with adapters
- [ ] Multi-tenant isolation tests
- [ ] ACL enforcement tests
- [ ] Concurrent operation tests
- [ ] DAG executor integration

### Phase 2.6: Documentation & Rollout (Week 6)
- [ ] API documentation
- [ ] Migration guide for existing code
- [ ] Usage examples
- [ ] Troubleshooting guide
- [ ] Code review & cleanup

---

## 11. Debugging & Troubleshooting

### 11.1 Common Issues & Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Cross-tenant data leak | TenantId filter not enforced at adapter level | Verify filter injection in ACL adapter |
| Cache inconsistency | Invalidation pattern too narrow | Review CacheKeyGenerator patterns |
| Lock timeout | Process crashed holding lock | Implement auto-cleanup of expired locks |
| Validation always passes | Validator not called before store | Add validation before adapter.create() |
| Performance degradation | Cache hits not working | Check cache key generation consistency |

### 11.2 Debug Logging

```typescript
// Enable debug logging during development
const DEBUG = process.env.DBAL_WORKFLOW_DEBUG === 'true'

function debug(message: string, data?: unknown) {
  if (DEBUG) {
    console.log(`[DBAL:Workflow] ${message}`, data || '')
  }
}

// Usage in operations
debug('Cache hit', { key, tenantId })
debug('Creating workflow', { tenantId, name })
debug('Acquiring lock', { workflowId, tenantId, userId })
```

---

**Document Status**: Ready for Development
**Next Review**: After Phase 2.1 completion

