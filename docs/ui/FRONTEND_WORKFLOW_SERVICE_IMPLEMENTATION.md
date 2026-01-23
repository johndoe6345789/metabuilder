# Frontend Workflow Service Implementation - Tasks 19-23

**Status**: Implementation Guide | **Date**: 2026-01-23 | **Scope**: 5 tasks

---

## Task Breakdown

### Task 19: Create Workflow Service Wrapper
**File**: `frontends/nextjs/src/lib/workflow-service.ts` (280 LOC)

```typescript
import { getWorkflowAdapter } from '@/dbal/workflow-adapter'
import { getValidationAdapter } from '@/dbal/workflow/validation-adapter'
import { PluginValidator } from '@/workflow/executor/ts/validation/plugin-validator'

export class WorkflowService {
  private adapter = getWorkflowAdapter()
  private validator = getValidationAdapter()

  async listWorkflows(tenantId: string, filters?: any) {
    return this.adapter.list({
      tenantId,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
      workflowStatus: filters?.status,
      category: filters?.category,
      isPublished: filters?.published
    })
  }

  async getWorkflow(workflowId: string, tenantId: string) {
    const workflow = await this.adapter.get(workflowId, tenantId)
    if (!workflow) throw new Error('Workflow not found')
    return workflow
  }

  async createWorkflow(tenantId: string, payload: any) {
    return this.adapter.create({
      ...payload,
      tenantId
    })
  }

  async updateWorkflow(workflowId: string, tenantId: string, updates: any) {
    return this.adapter.update(workflowId, tenantId, updates)
  }

  async publishWorkflow(workflowId: string, tenantId: string) {
    return this.adapter.publish(workflowId, tenantId)
  }

  async validateWorkflow(tenantId: string, workflow: any) {
    return this.validator.validateBeforeCreate(tenantId, workflow)
  }

  async deleteWorkflow(workflowId: string, tenantId: string) {
    return this.adapter.delete(workflowId, tenantId)
  }
}

export function getWorkflowService(): WorkflowService {
  return new WorkflowService()
}
```

**Key Methods**: 7 core operations wrapping DBAL adapter

---

### Task 20: Update GET /workflows Endpoint
**File**: `frontends/nextjs/src/app/api/v1/workflows/route.ts` (GET handler)

```typescript
export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('X-Tenant-ID') || 'default'
  const url = new URL(request.url)
  
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const status = url.searchParams.get('status')
  const category = url.searchParams.get('category')
  const published = url.searchParams.get('published') === 'true'

  try {
    const service = getWorkflowService()
    const workflows = await service.listWorkflows(tenantId, {
      limit, offset, status, category, published
    })

    return createResponse({
      data: workflows,
      pagination: { limit, offset, total: workflows.length }
    })
  } catch (error) {
    return handleError(error)
  }
}
```

**Changes**: +25 lines | **Pattern**: Service wrapper + error handling

---

### Task 21: Update POST /workflows Endpoint
**File**: `frontends/nextjs/src/app/api/v1/workflows/route.ts` (POST handler)

```typescript
export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('X-Tenant-ID') || 'default'
  const body = await request.json()

  try {
    // Validate first
    const service = getWorkflowService()
    const validation = await service.validateWorkflow(tenantId, body)

    if (!validation.valid) {
      return createResponse(
        { errors: validation.errors },
        { status: 400 }
      )
    }

    // Create workflow
    const workflow = await service.createWorkflow(tenantId, body)

    return createResponse({ data: workflow }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
```

**Changes**: +35 lines | **Pattern**: Validation before creation

---

### Task 22: Update PUT /workflows/:id Endpoint
**File**: `frontends/nextjs/src/app/api/v1/workflows/[workflowId]/route.ts` (PUT handler)

```typescript
export async function PUT(request: NextRequest, { params }: any) {
  const tenantId = request.headers.get('X-Tenant-ID') || 'default'
  const { workflowId } = params
  const body = await request.json()

  try {
    const service = getWorkflowService()

    // Update workflow (includes validation)
    const updated = await service.updateWorkflow(
      workflowId,
      tenantId,
      body
    )

    return createResponse({ data: updated })
  } catch (error) {
    return handleError(error)
  }
}
```

**Changes**: +25 lines | **Pattern**: Update with built-in validation

---

### Task 23: Create Execute & Versioning Utilities
**File**: `frontends/nextjs/src/lib/workflow-utils.ts` (150 LOC)

```typescript
/**
 * Semantic versioning utilities
 */
export function incrementMajor(version: string): string {
  const [major] = version.split('.')
  return (parseInt(major) + 1) + '.0.0'
}

export function incrementMinor(version: string): string {
  const [major, minor] = version.split('.')
  return major + '.' + (parseInt(minor) + 1) + '.0'
}

export function incrementPatch(version: string): string {
  const [major, minor, patch] = version.split('.')
  return major + '.' + minor + '.' + (parseInt(patch) + 1)
}

/**
 * Workflow execution helpers
 */
export async function executeWorkflow(
  workflowId: string,
  input: any,
  options?: any
) {
  const response = await fetch(
    '/api/v1/workflows/' + workflowId + '/execute',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    }
  )

  if (!response.ok) {
    throw new Error('Execution failed: ' + response.statusText)
  }

  return response.json()
}

/**
 * Workflow validation helpers
 */
export async function validateWorkflowPayload(
  tenantId: string,
  workflow: any
): Promise<any> {
  const response = await fetch('/api/v1/workflows/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify(workflow)
  })

  return response.json()
}
```

**Changes**: +150 lines | **Pattern**: Utility functions for common operations

---

## Implementation Checklist

### Task 19: Workflow Service
- [ ] Create `workflow-service.ts` with 7 methods
- [ ] Implement error handling in service layer
- [ ] Add JSDoc documentation
- [ ] Create singleton instance

### Task 20: GET /workflows
- [ ] Update GET handler in `/workflows/route.ts`
- [ ] Add query parameter parsing (limit, offset, status, category)
- [ ] Integrate WorkflowService.listWorkflows()
- [ ] Add pagination metadata to response
- [ ] Test with multiple tenants

### Task 21: POST /workflows
- [ ] Update POST handler in `/workflows/route.ts`
- [ ] Add validation before creation
- [ ] Call WorkflowService.createWorkflow()
- [ ] Return 201 status on success
- [ ] Return validation errors with 400 status

### Task 22: PUT /workflows/:id
- [ ] Update PUT handler in `/workflows/[workflowId]/route.ts`
- [ ] Add tenant permission check
- [ ] Integrate WorkflowService.updateWorkflow()
- [ ] Return updated workflow
- [ ] Test version increments

### Task 23: Versioning & Utilities
- [ ] Create `workflow-utils.ts`
- [ ] Implement version increment functions
- [ ] Create execution wrapper
- [ ] Create validation wrapper
- [ ] Add error handling

### Post-Implementation
- [ ] TypeScript check: `npm run typecheck`
- [ ] Run tests: `npm run test`
- [ ] Run E2E: `npm run test:e2e`
- [ ] Test multi-tenant isolation
- [ ] Verify error recovery paths

---

## File Summary

| Task | File | Changes | Lines |
|------|------|---------|-------|
| 19 | `workflow-service.ts` | New | 280 |
| 20 | `workflows/route.ts` | GET update | +25 |
| 21 | `workflows/route.ts` | POST update | +35 |
| 22 | `[workflowId]/route.ts` | PUT update | +25 |
| 23 | `workflow-utils.ts` | New | 150 |

**Total**: 515 LOC across 4 files

---

## Integration with DBAL

```
API Endpoints
│
├─ GET /workflows
│  └─ WorkflowService.listWorkflows()
│     └─ WorkflowAdapter.list()
│        └─ Database query + Cache
│
├─ POST /workflows
│  └─ ValidationAdapter.validateBeforeCreate()
│     └─ WorkflowService.createWorkflow()
│        └─ WorkflowAdapter.create()
│
├─ PUT /workflows/:id
│  └─ ValidationAdapter.validateBeforeUpdate()
│     └─ WorkflowService.updateWorkflow()
│        └─ WorkflowAdapter.update()
│
└─ POST /workflows/:id/execute
   └─ ExecutionWrapper()
      └─ ErrorRecoveryManager + DAG Executor
```

---

## Error Handling Patterns

```typescript
// Validation errors
{
  status: 400,
  body: {
    errors: ['Field X is required', 'Connection cycle detected']
  }
}

// Authorization errors
{
  status: 403,
  body: {
    error: 'Unauthorized: workflow belongs to different tenant'
  }
}

// Not found
{
  status: 404,
  body: {
    error: 'Workflow not found'
  }
}

// Server errors
{
  status: 500,
  body: {
    error: 'Internal server error'
  }
}
```

---

## Testing Examples

```typescript
// Test list with filtering
const workflows = await service.listWorkflows('tenant-1', {
  status: 'published',
  limit: 20
})
expect(workflows.every(w => w.status === 'published')).toBe(true)

// Test validation before create
const validation = await service.validateWorkflow('tenant-1', {
  name: 'Test',
  nodes: [],  // Invalid: empty
  connections: {}
})
expect(validation.valid).toBe(false)
expect(validation.errors).toContain('Workflow must have at least one node')

// Test multi-tenant isolation
const workflow1 = await adapter.create({
  tenantId: 'tenant-1',
  name: 'Workflow 1',
  ...payload
})

const retrieved = await adapter.get(workflow1.id, 'tenant-2')
// Should throw: Unauthorized

// Test versioning
const v1 = await service.createWorkflow('tenant-1', payload)
const v2Updated = await service.updateWorkflow(
  v1.id,
  'tenant-1',
  { version: '1.1.0' }
)
expect(v2Updated.version).toBe('1.1.0')
```

---

## Next Steps

After Task 19-23 complete:

1. **Task 24-30**: E2E Testing
   - Test all workflow endpoints
   - Verify multi-tenant isolation
   - Test error recovery paths
   - Load testing (100+ concurrent requests)

2. **Task 31+**: Production Readiness
   - Performance profiling
   - Database connection pooling
   - Monitoring and alerting
   - Security audit
   - Canary deployment

---

**Phase 3 Week 4 Progress**: 65% (Tasks 1-18 complete, Tasks 19-23 ready)

