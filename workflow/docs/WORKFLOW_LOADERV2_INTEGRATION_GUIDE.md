# WorkflowLoaderV2 Integration Guide

**Last Updated**: 2026-01-22
**Target**: Integrate WorkflowLoaderV2 with Next.js Workflow Service
**Scope**: Validation, resolution, and error handling layer
**Status**: Ready for implementation

---

## Overview

WorkflowLoaderV2 provides the validation and node resolution layer between the Next.js API routes and the execution engine. It acts as a gatekeeper ensuring only valid, well-formed workflows enter the execution pipeline.

```
Next.js API Route
  ↓ (workflowId, context)
WorkflowLoaderV2
  ├─ Load workflow from DBAL
  ├─ Validate against schema
  ├─ Resolve node executors
  └─ Return validated/resolved workflow
  ↓ (WorkflowDefinition + metadata)
WorkflowExecutionEngine
  ├─ Create DAGExecutor
  ├─ Execute nodes
  └─ Collect metrics
  ↓ (ExecutionRecord)
Next.js API Route
  └─ Return to client
```

---

## WorkflowLoaderV2 Design

### Class Definition

```typescript
// File: /frontends/nextjs/src/lib/workflow/workflow-loader.ts

import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db-client'
import Ajv from 'ajv'
import workflowSchema from '@/schemas/package-schemas/workflow.schema.json'
import type {
  WorkflowDefinition,
  WorkflowContext,
  ValidationResult
} from '@metabuilder/workflow'

/**
 * WorkflowLoaderV2 - Validates and prepares workflows for execution
 *
 * Responsibilities:
 * - Load workflow definitions from database
 * - Validate against JSON schema
 * - Resolve node executors
 * - Provide detailed error messages
 * - Cache validated workflows
 */
export class WorkflowLoaderV2 {
  private ajv = new Ajv()
  private validator = this.ajv.compile(workflowSchema)
  private cache = new Map<string, {
    workflow: WorkflowDefinition
    timestamp: number
    tenantId: string
  }>()

  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private registry: any // Node executor registry

  /**
   * Initialize loader with node registry
   */
  constructor() {
    const { getNodeExecutorRegistry } = require('@metabuilder/workflow')
    this.registry = getNodeExecutorRegistry()
  }

  /**
   * Load, validate, and resolve a workflow
   *
   * @param workflowId - Workflow ID to load
   * @param tenantId - Tenant ID for multi-tenant filtering
   * @param context - Optional execution context for validation
   * @returns LoadResult with workflow or detailed errors
   */
  async load(
    workflowId: string,
    tenantId: string,
    context?: Partial<WorkflowContext>
  ): Promise<LoadResult> {
    // Check cache first
    const cached = this.getFromCache(workflowId, tenantId)
    if (cached) {
      return { success: true, workflow: cached }
    }

    // Load from database
    const loadResult = await this.loadFromDatabase(workflowId, tenantId)
    if (!loadResult.success) {
      return loadResult
    }

    const workflow = loadResult.workflow!

    // Validate against schema
    const validationResult = this.validateSchema(workflow)
    if (!validationResult.success) {
      return validationResult
    }

    // Resolve node executors
    const resolutionResult = this.resolveNodes(workflow)
    if (!resolutionResult.success) {
      return resolutionResult
    }

    // Validate context if provided
    if (context) {
      const contextResult = this.validateContext(workflow, context)
      if (!contextResult.success) {
        return contextResult
      }
    }

    // Cache the result
    this.cache.set(`${tenantId}:${workflowId}`, {
      workflow,
      timestamp: Date.now(),
      tenantId
    })

    return { success: true, workflow }
  }

  /**
   * Load workflow from database with tenant filtering
   */
  private async loadFromDatabase(
    workflowId: string,
    tenantId: string
  ): Promise<LoadResult> {
    try {
      // DBAL integration - load workflow
      // This replaces the placeholder in workflow-service.ts
      const workflows = await db.workflows.list({
        filter: { id: workflowId, tenantId }
      })

      if (!workflows || workflows.length === 0) {
        return {
          success: false,
          error: {
            code: 'WORKFLOW_NOT_FOUND',
            message: `Workflow ${workflowId} not found for tenant ${tenantId}`
          }
        }
      }

      const workflowData = workflows[0]

      // Parse stringified fields
      let nodes: any[]
      let edges: any[]

      try {
        nodes = typeof workflowData.nodes === 'string'
          ? JSON.parse(workflowData.nodes)
          : workflowData.nodes || []

        edges = typeof workflowData.edges === 'string'
          ? JSON.parse(workflowData.edges)
          : workflowData.edges || {}
      } catch (parseError) {
        return {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: `Failed to parse workflow nodes/edges: ${parseError}`,
            details: { field: 'nodes|edges' }
          }
        }
      }

      // Normalize to WorkflowDefinition type
      const workflow: WorkflowDefinition = {
        id: workflowData.id,
        name: workflowData.name,
        description: workflowData.description || '',
        version: workflowData.version || '1.0.0',
        nodes,
        edges,
        enabled: workflowData.enabled ?? true,
        tenantId: workflowData.tenantId || tenantId,
        createdBy: workflowData.createdBy,
        createdAt: workflowData.createdAt,
        updatedAt: workflowData.updatedAt
      }

      return { success: true, workflow }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to load workflow'
        }
      }
    }
  }

  /**
   * Validate workflow against JSON schema
   */
  private validateSchema(workflow: WorkflowDefinition): LoadResult {
    // Convert to array format expected by schema
    const workflowArray = [workflow]

    const valid = this.validator(workflowArray)

    if (!valid) {
      const errors = this.validator.errors || []
      return {
        success: false,
        error: {
          code: 'SCHEMA_VALIDATION_FAILED',
          message: 'Workflow does not match expected schema',
          details: {
            errors: errors.map(err => ({
              path: err.instancePath || '/',
              message: err.message,
              keyword: err.keyword
            }))
          }
        }
      }
    }

    return { success: true, workflow }
  }

  /**
   * Resolve node executors and validate node types
   */
  private resolveNodes(workflow: WorkflowDefinition): LoadResult {
    const unresolvedNodes: string[] = []
    const resolvedNodeTypes = new Map<string, any>()

    // Check each node type is registered
    for (const node of workflow.nodes) {
      const nodeType = (node as any).type || (node as any).nodeType
      const nodeId = (node as any).id

      if (!nodeType) {
        return {
          success: false,
          error: {
            code: 'MISSING_NODE_TYPE',
            message: `Node ${nodeId} is missing 'type' field`,
            details: { nodeId }
          }
        }
      }

      const executor = this.registry.get(nodeType)
      if (!executor) {
        unresolvedNodes.push(`${nodeId}:${nodeType}`)
      } else {
        resolvedNodeTypes.set(nodeId, executor)
      }
    }

    if (unresolvedNodes.length > 0) {
      return {
        success: false,
        error: {
          code: 'UNRESOLVED_NODE_TYPES',
          message: `Unknown node types in workflow`,
          details: {
            unresolved: unresolvedNodes,
            available: Array.from(this.registry.listExecutors())
          }
        }
      }
    }

    // Validate edge connections
    for (const edge of workflow.edges) {
      const edgeObj = edge as any
      if (!edgeObj.from || !edgeObj.to) {
        return {
          success: false,
          error: {
            code: 'INVALID_EDGE',
            message: 'Edge must have "from" and "to" fields',
            details: { edge }
          }
        }
      }

      // Verify nodes exist
      const fromExists = workflow.nodes.some(n => (n as any).id === edgeObj.from)
      const toExists = workflow.nodes.some(n => (n as any).id === edgeObj.to)

      if (!fromExists || !toExists) {
        return {
          success: false,
          error: {
            code: 'INVALID_EDGE_TARGET',
            message: `Edge references non-existent nodes`,
            details: { from: edgeObj.from, to: edgeObj.to }
          }
        }
      }
    }

    return { success: true, workflow }
  }

  /**
   * Validate execution context against workflow requirements
   */
  private validateContext(
    workflow: WorkflowDefinition,
    context: Partial<WorkflowContext>
  ): LoadResult {
    // Check required context fields
    const requiredFields = ['tenantId', 'userId']
    const missingFields = requiredFields.filter(
      field => !(field in (context as any))
    )

    if (missingFields.length > 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_CONTEXT',
          message: 'Missing required context fields',
          details: { missingFields }
        }
      }
    }

    // Verify tenantId matches
    if (context.tenantId && workflow.tenantId && context.tenantId !== workflow.tenantId) {
      return {
        success: false,
        error: {
          code: 'TENANT_MISMATCH',
          message: 'Context tenantId does not match workflow tenantId',
          details: {
            contextTenant: context.tenantId,
            workflowTenant: workflow.tenantId
          }
        }
      }
    }

    return { success: true, workflow }
  }

  /**
   * Get workflow from cache if still valid
   */
  private getFromCache(
    workflowId: string,
    tenantId: string
  ): WorkflowDefinition | null {
    const key = `${tenantId}:${workflowId}`
    const cached = this.cache.get(key)

    if (!cached) return null

    // Check if cache expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }

    return cached.workflow
  }

  /**
   * Clear cache for a specific workflow
   */
  clearCache(workflowId: string, tenantId: string): void {
    const key = `${tenantId}:${workflowId}`
    this.cache.delete(key)
  }

  /**
   * Clear all cached workflows
   */
  clearAllCache(): void {
    this.cache.clear()
  }
}

/**
 * Global loader instance
 */
let loaderInstance: WorkflowLoaderV2 | null = null

export function getWorkflowLoader(): WorkflowLoaderV2 {
  if (!loaderInstance) {
    loaderInstance = new WorkflowLoaderV2()
  }
  return loaderInstance
}

/**
 * Result type for load operations
 */
export interface LoadResult {
  success: boolean
  workflow?: WorkflowDefinition
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
}

/**
 * Error codes emitted by loader
 */
export const LoadErrorCodes = {
  WORKFLOW_NOT_FOUND: 'WORKFLOW_NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INVALID_JSON: 'INVALID_JSON',
  SCHEMA_VALIDATION_FAILED: 'SCHEMA_VALIDATION_FAILED',
  MISSING_NODE_TYPE: 'MISSING_NODE_TYPE',
  UNRESOLVED_NODE_TYPES: 'UNRESOLVED_NODE_TYPES',
  INVALID_EDGE: 'INVALID_EDGE',
  INVALID_EDGE_TARGET: 'INVALID_EDGE_TARGET',
  INVALID_CONTEXT: 'INVALID_CONTEXT',
  TENANT_MISMATCH: 'TENANT_MISMATCH'
} as const
```

---

## Integration Points

### 1. Update execute/route.ts

**Current Code** (line 105-106):
```typescript
const engine = getWorkflowExecutionEngine()
const workflow = await engine.loadWorkflow(workflowId, tenant)
```

**Updated Code**:
```typescript
// Import loader
import { getWorkflowLoader } from '@/lib/workflow/workflow-loader'

// In POST handler after tenant validation:
const loader = getWorkflowLoader()
const loadResult = await loader.load(workflowId, tenant, {
  tenantId: tenant,
  userId: user.id
})

if (!loadResult.success) {
  // Map error codes to HTTP status
  const statusMap: Record<string, number> = {
    'WORKFLOW_NOT_FOUND': 404,
    'DATABASE_ERROR': 500,
    'SCHEMA_VALIDATION_FAILED': 400,
    'UNRESOLVED_NODE_TYPES': 400,
    'INVALID_CONTEXT': 400,
    'TENANT_MISMATCH': 403,
  }

  const status = statusMap[loadResult.error!.code] || 400

  return NextResponse.json(
    {
      error: loadResult.error!.code,
      message: loadResult.error!.message,
      details: loadResult.error!.details
    },
    { status }
  )
}

const workflow = loadResult.workflow!
```

**Benefit**:
- Validates before executing
- Returns specific error codes
- Prevents invalid workflows from running
- Caches validated workflows

---

### 2. Update workflow-service.ts

**Remove placeholder loadWorkflow()**:
```typescript
// DELETE this method - loader now handles it
async loadWorkflow(workflowId: string, tenantId: string): Promise<WorkflowDefinition | null>
```

**Update executeWorkflow() signature**:
```typescript
// OLD: Takes WorkflowDefinition (already loaded)
async executeWorkflow(workflow: WorkflowDefinition, context: WorkflowContext)

// NEW: Can optionally load on demand
async executeWorkflow(
  workflowOrId: WorkflowDefinition | string,
  context: WorkflowContext,
  loader?: WorkflowLoaderV2
)
```

**Why**: Allows fallback loading if needed, but routes load first

---

### 3. Error Mapping

**HTTP Status Codes**:

| Error Code | HTTP Status | Message |
|-----------|----------|---------|
| `WORKFLOW_NOT_FOUND` | 404 | Workflow not found |
| `DATABASE_ERROR` | 500 | Database unavailable |
| `INVALID_JSON` | 400 | Invalid JSON in nodes/edges |
| `SCHEMA_VALIDATION_FAILED` | 400 | Validation errors in schema |
| `MISSING_NODE_TYPE` | 400 | Node missing type field |
| `UNRESOLVED_NODE_TYPES` | 400 | Unknown node executors |
| `INVALID_EDGE` | 400 | Edge malformed |
| `INVALID_EDGE_TARGET` | 400 | Edge references missing nodes |
| `INVALID_CONTEXT` | 400 | Missing context fields |
| `TENANT_MISMATCH` | 403 | Tenant mismatch (security) |

---

### 4. Export from index.ts

**File**: `/frontends/nextjs/src/lib/workflow/index.ts`

**Add**:
```typescript
export {
  WorkflowLoaderV2,
  getWorkflowLoader,
  LoadErrorCodes,
  type LoadResult
} from './workflow-loader'
```

---

## Usage Examples

### Example 1: Execute Workflow with Validation

```typescript
import { getWorkflowLoader } from '@/lib/workflow'

export async function POST(request: NextRequest) {
  const loader = getWorkflowLoader()

  // Load and validate
  const result = await loader.load(workflowId, tenantId, {
    tenantId,
    userId: user.id
  })

  if (!result.success) {
    // Handle error
    return NextResponse.json(result.error, { status: 400 })
  }

  // Execute validated workflow
  const engine = getWorkflowExecutionEngine()
  const execution = await engine.executeWorkflow(result.workflow, context)

  return NextResponse.json(execution)
}
```

### Example 2: Handle Validation Errors

```typescript
const result = await loader.load(workflowId, tenantId)

if (!result.success) {
  const { code, message, details } = result.error!

  switch (code) {
    case 'UNRESOLVED_NODE_TYPES':
      // Tell user which node types are missing
      console.log('Missing:', details.unresolved)
      break
    case 'SCHEMA_VALIDATION_FAILED':
      // Show validation errors with paths
      console.log('Errors:', details.errors)
      break
    case 'TENANT_MISMATCH':
      // Security issue - log and reject
      console.log('Tenant mismatch detected')
      break
  }
}
```

### Example 3: Cache Management

```typescript
const loader = getWorkflowLoader()

// Load workflow (will be cached)
const result1 = await loader.load(id, tenant)

// Second load hits cache
const result2 = await loader.load(id, tenant)

// Clear cache after workflow update
loader.clearCache(id, tenant)

// Or clear all
loader.clearAllCache()
```

---

## Testing Strategy

### Unit Tests

**File**: `/frontends/nextjs/src/lib/workflow/workflow-loader.test.ts`

```typescript
describe('WorkflowLoaderV2', () => {
  let loader: WorkflowLoaderV2

  beforeEach(() => {
    loader = new WorkflowLoaderV2()
  })

  describe('loadFromDatabase', () => {
    it('loads workflow and parses JSON fields')
    it('filters by tenantId (multi-tenant safety)')
    it('returns 404 when workflow not found')
    it('handles database errors gracefully')
  })

  describe('validateSchema', () => {
    it('validates against JSON schema')
    it('returns detailed validation errors')
    it('passes valid workflows')
  })

  describe('resolveNodes', () => {
    it('resolves all registered node types')
    it('fails on unknown node types')
    it('validates edge connections')
    it('detects missing nodes referenced in edges')
  })

  describe('validateContext', () => {
    it('checks required fields')
    it('verifies tenantId matches')
    it('allows missing optional fields')
  })

  describe('caching', () => {
    it('caches valid workflows')
    it('respects cache TTL')
    it('clears cache on demand')
  })
})
```

### Integration Tests

**File**: `/frontends/nextjs/src/app/api/v1/[tenant]/workflows/[workflowId]/execute.test.ts`

```typescript
describe('Execute with WorkflowLoaderV2', () => {
  it('validates before executing')
  it('returns 404 for missing workflow')
  it('returns 400 for invalid schema')
  it('returns 400 for unresolved nodes')
  it('returns 403 for tenant mismatch')
  it('executes valid workflows')
  it('includes error details in response')
})
```

---

## Performance Impact

### Positive
- **Caching**: 5-minute TTL reduces database load
- **Early validation**: Prevents invalid workflows from entering execution
- **Schema validation once**: Per-cache hit, not per-execution

### Potential Issues
- **AJV compilation**: Happens once per class instance
- **Node resolution**: O(nodes * executors) - typically fast
- **Cache memory**: Linear growth with unique workflows

### Optimization Tips
1. Preload frequently-used workflows on startup
2. Increase cache TTL for stable workflows
3. Batch load workflows in background

---

## Migration Path

### Step 1: Create WorkflowLoaderV2 class
- [ ] File: `/frontends/nextjs/src/lib/workflow/workflow-loader.ts`
- [ ] Implement all methods above
- [ ] Add to index.ts exports

### Step 2: Update execute route
- [ ] Import loader
- [ ] Add loader.load() before engine.executeWorkflow()
- [ ] Map error codes to HTTP status
- [ ] Update response format

### Step 3: Testing
- [ ] Write unit tests for loader
- [ ] Write integration tests for route
- [ ] Test error scenarios
- [ ] Test multi-tenant filtering

### Step 4: DBAL Integration
- [ ] Implement db.workflows.list() method
- [ ] Test with real database
- [ ] Verify caching works

### Step 5: Cleanup
- [ ] Remove loadWorkflow() from engine
- [ ] Remove placeholder methods
- [ ] Update documentation

---

## Related Files to Review

- `/frontends/nextjs/src/app/api/v1/[tenant]/workflows/[workflowId]/execute/route.ts`
- `/frontends/nextjs/src/lib/workflow/workflow-service.ts`
- `/schemas/package-schemas/workflow.schema.json`
- `/dbal/shared/api/schema/entities/core/workflow.yaml`

---

## Success Criteria

- [ ] Workflows validated before execution
- [ ] Invalid workflows return 400 with details
- [ ] Caching reduces database calls
- [ ] All error codes mapped to HTTP status
- [ ] Multi-tenant filtering enforced
- [ ] Tests pass (unit + integration)
- [ ] Documentation updated
- [ ] Zero regressions in existing tests
