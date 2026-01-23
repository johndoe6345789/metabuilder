# WorkflowLoaderV2 & Registry Integration Plan
## Next.js Workflow Service Enhancement

**Status**: Implementation Ready
**Target**: Production Integration
**Audience**: Frontend Developers, API Maintainers

---

## Executive Summary

This document provides a detailed integration plan for incorporating `WorkflowLoaderV2` and registry support into the existing Next.js workflow service. The plan ensures:

- **Pre-execution validation** with comprehensive error diagnostics
- **Multi-tenant safety** through context propagation
- **Performance optimization** via caching strategies
- **Backward compatibility** with existing workflows
- **Detailed error responses** with actionable diagnostics

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Endpoint Modifications](#endpoint-modifications)
3. [Validation Integration](#validation-integration)
4. [Error Response Templates](#error-response-templates)
5. [Multi-Tenant Context Flow](#multi-tenant-context-flow)
6. [Caching Strategy](#caching-strategy)
7. [Testing Checklist](#testing-checklist)
8. [Migration Path](#migration-path)

---

## Architecture Overview

### Current State

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js API Route                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  authenticate() → rateLimitCheck() → loadWorkflow()         │
│         ↓              ↓                  ↓                  │
│   [Auth Guard]    [Rate Limit]    [Database Load]          │
│                                                               │
│  executeWorkflow(definition, context)                        │
│         ↓                                                    │
│   DAGExecutor → NodeExecutorRegistry → Node Executors       │
│         ↓                                                    │
│   Persistence → Return ExecutionRecord                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Proposed State with WorkflowLoaderV2

```
┌──────────────────────────────────────────────────────────────┐
│                        Next.js API Route                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  authenticate() → rateLimitCheck() → loadWorkflow()          │
│         ↓              ↓                  ↓                   │
│   [Auth Guard]    [Rate Limit]    [Database Load]           │
│                                                                │
│                                                                │
│  ┌─────────────────── WorkflowLoaderV2 ───────────────────┐ │
│  │                                                          │ │
│  │  loadWorkflow()                                         │ │
│  │      ↓                                                  │ │
│  │  validateWorkflow(definition)  ← validateWithRegistry() │ │
│  │      ├─ SchemaValidator                               │ │
│  │      ├─ ConnectionValidator                           │ │
│  │      ├─ RegistryValidator                             │ │
│  │      ├─ MultiTenantValidator                          │ │
│  │      └─ ResourceConstraintValidator                   │ │
│  │      ↓                                                  │ │
│  │  cacheValidation(workflow, result)                     │ │
│  │      ↓                                                  │ │
│  │  return ValidatedWorkflow                             │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│         ↓                                                      │
│  buildExecutionContext(workflow, context, multiTenant)        │
│         ↓                                                      │
│  executeWorkflow(validatedWorkflow, context)                 │
│         ↓                                                      │
│  DAGExecutor → NodeExecutorRegistry → Node Executors         │
│         ↓                                                      │
│  Persistence → Return ExecutionRecord                        │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Endpoint Modifications

### 1. GET /api/v1/{tenant}/workflows

#### Before
```typescript
// Current: Simple list without validation metadata
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // ... auth, rate limit, tenant check ...

  const result = {
    items: [],     // WorkflowDefinition[]
    total: 0,
    limit,
    offset,
  }

  return NextResponse.json({
    workflows: result.items,
    pagination: { ... }
  })
}
```

#### After
```typescript
// Enhanced: Includes validation state and metadata
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ... auth, rate limit, tenant check ...

    const resolvedParams = await params
    const { tenant } = resolvedParams

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeValidation = searchParams.get('includeValidation') === 'true'

    // Build filter
    const filter: Record<string, any> = { tenantId: tenant }

    if (searchParams.get('category')) {
      filter.category = searchParams.get('category')
    }
    if (searchParams.get('active')) {
      filter.active = searchParams.get('active') === 'true'
    }

    // Load workflows
    const workflows = await db.workflows.list({
      filter,
      limit,
      offset,
      sort: { updatedAt: -1 }
    })

    // Optional: Include validation metadata
    let enriched = workflows
    if (includeValidation) {
      const loader = getWorkflowLoader()
      enriched = await Promise.all(
        workflows.map(async (wf) => ({
          ...wf,
          validation: await loader.validateWorkflow(wf)
        }))
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        workflows: enriched,
        pagination: {
          total: workflows.length,
          limit,
          offset,
          hasMore: offset + limit < workflows.length
        }
      }
    }, { status: 200 })
  } catch (error) {
    return handleWorkflowError(error, 'LIST_WORKFLOWS')
  }
}
```

**New Query Parameters**:
- `includeValidation=true` - Include validation state for each workflow
- `includeMetrics=true` - Include execution metrics

**Response Changes**:
```typescript
// Enhanced response includes validation state
{
  success: true,
  data: {
    workflows: [
      {
        id: "uuid",
        name: "string",
        // ... other fields ...
        validation?: {
          valid: boolean,
          errors: ValidationError[],
          warnings: ValidationError[],
          validatedAt: ISO8601,
          cacheHit: boolean
        }
      }
    ],
    pagination: { ... }
  }
}
```

---

### 2. POST /api/v1/{tenant}/workflows

#### Before
```typescript
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // ... validation of request fields ...

  const workflow = {
    id: uuidv4(),
    tenantId: tenant,
    name: body.name,
    // ... other fields ...
  }

  const saved = await db.workflows.create(workflow)

  return NextResponse.json({
    id: saved.id,
    name: saved.name,
    // ... basic fields ...
  }, { status: 201 })
}
```

#### After
```typescript
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ... auth, rate limit checks ...

    const resolvedParams = await params
    const { tenant } = resolvedParams
    const user = authResult.user!

    // Parse body
    let body: any
    try {
      body = await request.json()
    } catch {
      return Errors.badRequest('Invalid JSON in request body')
    }

    // Validate required fields
    const basicErrors = validateWorkflowCreationRequest(body)
    if (basicErrors.length > 0) {
      return Errors.validationError({
        errors: basicErrors,
        hint: 'Required fields: name, category'
      })
    }

    // Create workflow object
    const workflowId = uuidv4()
    const now = new Date()

    const workflow: WorkflowDefinition = {
      id: workflowId,
      tenantId: tenant,
      name: body.name,
      description: body.description || '',
      category: body.category,
      version: '1.0.0',
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
      nodes: Array.isArray(body.nodes) ? body.nodes : [],
      connections: body.connections || {},
      triggers: Array.isArray(body.triggers) ? body.triggers : [],
      variables: body.variables || {},
      // ... other fields ...
    }

    // Pre-creation validation with WorkflowLoaderV2
    const loader = getWorkflowLoader()
    const validation = await loader.validateWorkflow(workflow)

    if (!validation.valid && validation.errors.length > 0) {
      // Return validation errors without creating workflow
      return Errors.validationError({
        errors: validation.errors,
        warnings: validation.warnings,
        hint: 'Fix structural issues before saving workflow'
      })
    }

    // Save to database
    const saved = await db.workflows.create(workflow)

    // Cache validation result
    await loader.cacheValidation(saved.id, tenant, validation)

    return successResponse({
      id: saved.id,
      name: saved.name,
      description: saved.description,
      category: saved.category,
      version: saved.version,
      createdAt: saved.createdAt,
      validation: {
        valid: validation.valid,
        warnings: validation.warnings
      }
    }, HTTP_STATUS.CREATED)
  } catch (error) {
    return handleWorkflowError(error, 'CREATE_WORKFLOW')
  }
}
```

---

### 3. GET /api/v1/{tenant}/workflows/{workflowId}

#### Before
```typescript
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // ... auth, tenant check ...

  const workflow = await db.workflows.findOne({ id: workflowId, tenantId: tenant })

  if (!workflow) {
    return NextResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    )
  }

  return NextResponse.json(workflow)
}
```

#### After
```typescript
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ... auth, tenant check ...

    const resolvedParams = await params
    const { tenant, workflowId } = resolvedParams

    const workflow = await db.workflows.findOne({
      id: workflowId,
      tenantId: tenant
    })

    if (!workflow) {
      return Errors.notFound('Workflow')
    }

    // Get validation metadata
    const loader = getWorkflowLoader()
    const validation = await loader.getValidationResult(
      workflowId,
      tenant
    )

    return successResponse({
      ...workflow,
      validation: validation || {
        valid: false,
        errors: [{
          path: 'root',
          message: 'Validation not performed',
          code: 'NOT_VALIDATED'
        }],
        warnings: [],
        validatedAt: null,
        cacheHit: false
      }
    })
  } catch (error) {
    return handleWorkflowError(error, 'GET_WORKFLOW')
  }
}
```

---

### 4. POST /api/v1/{tenant}/workflows/{workflowId}/execute

#### Before
```typescript
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ... auth, rate limit ...

    const resolvedParams = await params
    const { tenant, workflowId } = resolvedParams

    const requestBody = await request.json()

    const engine = getWorkflowExecutionEngine()
    const workflow = await engine.loadWorkflow(workflowId, tenant)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Workflow not found' },
        { status: 404 }
      )
    }

    const context: WorkflowContext = {
      executionId: uuidv4(),
      tenantId: tenant,
      userId: user.id,
      // ... other context ...
    }

    const executionRecord = await engine.executeWorkflow(workflow, context)

    return NextResponse.json({
      executionId: executionRecord.id,
      workflowId: executionRecord.workflowId,
      status: executionRecord.status,
      // ... other fields ...
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    )
  }
}
```

#### After
```typescript
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const executionId = uuidv4()

  try {
    // 1. Auth & rate limit
    const authResult = await authenticate(request, { minLevel: 1 })
    if (!authResult.success) {
      return authResult.error!
    }
    const user = authResult.user!

    const limitResponse = applyRateLimit(request, 'mutation')
    if (limitResponse) {
      return limitResponse
    }

    // 2. Extract parameters
    const resolvedParams = await params
    const { tenant, workflowId } = resolvedParams

    if (user.tenantId !== tenant && user.level < 4) {
      return Errors.forbidden('Access denied to this tenant')
    }

    // 3. Parse request body
    let requestBody: ExecuteWorkflowRequest
    try {
      requestBody = await request.json()
    } catch {
      return Errors.badRequest('Invalid JSON in request body')
    }

    // 4. Load workflow from database
    const engine = getWorkflowExecutionEngine()
    const workflow = await engine.loadWorkflow(workflowId, tenant)

    if (!workflow) {
      return Errors.notFound('Workflow')
    }

    // 5. VALIDATION WITH WorkflowLoaderV2
    const loader = getWorkflowLoader()
    const validation = await loader.validateWorkflow(workflow)

    if (!validation.valid) {
      // Return detailed validation errors
      return Errors.validationError({
        executionId,
        workflowId,
        reason: 'WORKFLOW_VALIDATION_FAILED',
        errors: validation.errors.slice(0, 10), // First 10 errors
        errorCount: validation.errors.length,
        warnings: validation.warnings,
        hint: 'Workflow structure is invalid. Fix issues and save before executing.'
      })
    }

    // 6. Log validation warnings (if any)
    if (validation.warnings.length > 0) {
      console.warn(`[${executionId}] Workflow validation warnings:`,
        validation.warnings.slice(0, 5)
      )
    }

    // 7. Build execution context with multi-tenant safety
    const trigger: WorkflowTrigger = {
      nodeId: '',
      kind: 'manual',
      enabled: true,
      metadata: {
        startTime: Date.now(),
        triggeredBy: 'api',
        userId: user.id,
        tenantId: tenant
      }
    }

    const context: WorkflowContext = {
      executionId,
      tenantId: tenant,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email || '',
        level: user.level
      },
      trigger,
      triggerData: requestBody.triggerData || {},
      variables: {
        ...workflow.variables,
        ...requestBody.variables
      },
      secrets: await loadSecretsForTenant(tenant),
      request: requestBody.request,
      multiTenant: {
        enforced: true,
        tenantId: tenant,
        userId: user.id,
        accessLevel: user.level
      }
    }

    // 8. Execute workflow
    console.log(`[${executionId}] Starting workflow execution`, {
      workflowId,
      tenant,
      userId: user.id,
      nodeCount: workflow.nodes.length
    })

    const executionRecord = await engine.executeWorkflow(workflow, context)

    // 9. Return execution result
    return successResponse({
      executionId: executionRecord.id,
      workflowId: executionRecord.workflowId,
      status: executionRecord.status,
      state: executionRecord.state,
      metrics: executionRecord.metrics,
      startTime: executionRecord.startTime,
      endTime: executionRecord.endTime,
      duration: executionRecord.duration,
      error: executionRecord.error
    }, HTTP_STATUS.OK)
  } catch (error) {
    console.error(`[${executionId}] Workflow execution error:`, error)

    return handleWorkflowError(error, 'EXECUTE_WORKFLOW', {
      executionId,
      workflowId: params.workflowId
    })
  }
}
```

---

### 5. PUT /api/v1/{tenant}/workflows/{workflowId} (Update)

#### New Endpoint
```typescript
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ... auth, rate limit, tenant check ...

    const resolvedParams = await params
    const { tenant, workflowId } = resolvedParams
    const user = authResult.user!

    // Parse update data
    let body: Partial<WorkflowDefinition>
    try {
      body = await request.json()
    } catch {
      return Errors.badRequest('Invalid JSON')
    }

    // Load current workflow
    const current = await db.workflows.findOne({
      id: workflowId,
      tenantId: tenant
    })

    if (!current) {
      return Errors.notFound('Workflow')
    }

    // Merge updates
    const updated: WorkflowDefinition = {
      ...current,
      ...body,
      id: current.id,
      tenantId: current.tenantId,
      createdBy: current.createdBy,
      createdAt: current.createdAt,
      updatedAt: new Date(),
      updatedBy: user.id
    }

    // Validate updated workflow
    const loader = getWorkflowLoader()
    const validation = await loader.validateWorkflow(updated)

    if (!validation.valid && validation.errors.length > 0) {
      return Errors.validationError({
        errors: validation.errors.slice(0, 10),
        errorCount: validation.errors.length,
        warnings: validation.warnings,
        hint: 'Fix validation errors before saving'
      })
    }

    // Save updated workflow
    const saved = await db.workflows.update(workflowId, updated)

    // Invalidate cache for this workflow
    await loader.invalidateCache(workflowId, tenant)

    // Cache new validation
    await loader.cacheValidation(workflowId, tenant, validation)

    return successResponse({
      ...saved,
      validation: {
        valid: validation.valid,
        warnings: validation.warnings
      }
    })
  } catch (error) {
    return handleWorkflowError(error, 'UPDATE_WORKFLOW')
  }
}
```

---

### 6. POST /api/v1/{tenant}/workflows/{workflowId}/validate (New)

#### Purpose
Pre-execution validation endpoint for frontend to validate before saving

```typescript
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ... auth, tenant check ...

    const resolvedParams = await params
    const { tenant, workflowId } = resolvedParams

    // Parse workflow definition from request
    let workflow: WorkflowDefinition
    try {
      workflow = await request.json()
    } catch {
      return Errors.badRequest('Invalid JSON')
    }

    // Validate against registry and rules
    const loader = getWorkflowLoader()
    const validation = await loader.validateWorkflow(workflow)

    return successResponse({
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      diagnostics: {
        nodeCount: workflow.nodes.length,
        connectionCount: Object.keys(workflow.connections).length,
        triggerCount: workflow.triggers?.length || 0,
        variables: Object.keys(workflow.variables || {}).length
      }
    })
  } catch (error) {
    return handleWorkflowError(error, 'VALIDATE_WORKFLOW')
  }
}
```

---

## Validation Integration

### Validation Flow

```
Input Workflow Definition
    ↓
┌─────────────────────────────────────────────────┐
│      WorkflowLoaderV2.validateWorkflow()        │
├─────────────────────────────────────────────────┤
│                                                   │
│  1. Schema Validation                           │
│     └─ Structure, required fields, types        │
│                                                   │
│  2. Node Validation                             │
│     ├─ Node IDs unique                          │
│     ├─ Node types exist in registry             │
│     ├─ Node parameters match type               │
│     └─ Node timeouts reasonable                 │
│                                                   │
│  3. Connection Validation                       │
│     ├─ All referenced nodes exist               │
│     ├─ Port types valid (main, error)           │
│     ├─ Target nodes exist                       │
│     └─ No circular dependencies                 │
│                                                   │
│  4. Registry Validation                         │
│     ├─ Node types registered                    │
│     ├─ Execution constraints met                │
│     ├─ Plugin availability                      │
│     └─ Multi-language support                   │
│                                                   │
│  5. Multi-Tenant Validation                     │
│     ├─ TenantId present                         │
│     ├─ No global scope variables                │
│     ├─ ACL rules compliant                      │
│     └─ Data access patterns safe                │
│                                                   │
│  6. Resource Constraint Validation              │
│     ├─ Max nodes (≤500)                         │
│     ├─ Max variables (≤100)                     │
│     ├─ Max execution time (≤3600s)              │
│     ├─ Max memory (≤512MB)                      │
│     └─ Max data size (≤100MB)                   │
│                                                   │
└─────────────────────────────────────────────────┘
    ↓
  Return ValidationResult
    ├─ valid: boolean
    ├─ errors: ValidationError[]
    ├─ warnings: ValidationError[]
    └─ metadata: { cacheHit, validatedAt }
```

### WorkflowLoaderV2 Interface

```typescript
export interface WorkflowLoaderV2 {
  // Core validation
  validateWorkflow(workflow: WorkflowDefinition): Promise<ValidationResult>

  // Registry-based validation
  validateWithRegistry(
    workflow: WorkflowDefinition,
    registry: NodeRegistry
  ): Promise<RegistryValidationResult>

  // Batch validation
  validateBatch(
    workflows: WorkflowDefinition[],
    tenantId: string
  ): Promise<ValidationResult[]>

  // Caching
  cacheValidation(
    workflowId: string,
    tenantId: string,
    result: ValidationResult
  ): Promise<void>

  getValidationResult(
    workflowId: string,
    tenantId: string
  ): Promise<ValidationResult | null>

  invalidateCache(
    workflowId: string,
    tenantId: string
  ): Promise<void>

  // Diagnostics
  getDiagnostics(
    workflowId: string
  ): Promise<WorkflowDiagnostics>
}
```

### Validation Error Examples

```typescript
export interface ValidationError {
  path: string              // "nodes[0].parameters.url"
  message: string           // "URL is required"
  severity: 'error' | 'warning'
  code: string             // "MISSING_REQUIRED_FIELD"
  suggestion?: string      // "Add a URL parameter"
  nodeId?: string          // Link to problematic node
  connectedNodes?: string[] // Affected dependent nodes
}
```

**Error Codes**:
- `MISSING_NODE_ID` - Node lacks ID
- `MISSING_NODE_NAME` - Node lacks name
- `MISSING_NODE_TYPE` - Node lacks type
- `INVALID_NODE_TYPE` - Node type not in registry
- `INVALID_CONNECTION_SOURCE` - Connection references non-existent source
- `INVALID_CONNECTION_TARGET` - Connection references non-existent target
- `MISSING_REQUIRED_FIELD` - Node parameter missing
- `TYPE_MISMATCH` - Parameter type doesn't match definition
- `ENUM_VALIDATION_FAILED` - Value not in allowed list
- `REGEX_PATTERN_INVALID` - Pattern doesn't match regex
- `TIMEOUT_TOO_SHORT` - Node timeout < 1000ms
- `TIMEOUT_TOO_LONG` - Node timeout > 3600000ms
- `CIRCULAR_DEPENDENCY` - Nodes form circular reference
- `MISSING_TENANT_ID` - Workflow lacks tenantId
- `RESOURCE_LIMIT_EXCEEDED` - Too many nodes/variables
- `EXECUTION_CONSTRAINT_VIOLATED` - Node violates registry constraints

---

## Error Response Templates

### Standard Error Response Format

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string              // Machine-readable error code
    message: string           // User-friendly message
    details?: {
      executionId?: string    // Trace for execution errors
      workflowId?: string
      nodeId?: string
      reason?: string         // Specific failure reason
    }
  }
  diagnostics?: {             // Debug information (dev mode)
    errors?: Array<{
      path: string
      message: string
      code: string
      suggestion?: string
    }>
    warnings?: Array<{ ... }>
    stack?: string            // Only in development
  }
}
```

### Validation Error Response (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Workflow validation failed: 3 errors, 2 warnings",
    "details": {
      "reason": "WORKFLOW_VALIDATION_FAILED",
      "executionId": "550e8400-e29b-41d4-a716-446655440000"
    }
  },
  "diagnostics": {
    "errors": [
      {
        "path": "nodes[0].parameters",
        "message": "Missing required parameter: url",
        "code": "MISSING_REQUIRED_FIELD",
        "suggestion": "Add a 'url' parameter to the HTTP Request node"
      },
      {
        "path": "connections.node1.main.0",
        "message": "Target node 'nonexistent' not found",
        "code": "INVALID_CONNECTION_TARGET_NODE",
        "suggestion": "Ensure target node ID matches a node in the workflow"
      },
      {
        "path": "variables.apiKey.type",
        "message": "Invalid variable type 'credential' (must be: string, number, boolean, array, object, date, any)",
        "code": "INVALID_VARIABLE_TYPE",
        "suggestion": "Use 'string' and store secret separately"
      }
    ],
    "warnings": [
      {
        "path": "nodes[2].timeout",
        "message": "Timeout of 60000ms is very long",
        "code": "TIMEOUT_TOO_LONG",
        "suggestion": "Consider reducing to 30000ms for faster failure detection"
      }
    ]
  }
}
```

### Node Not Found Error (404)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Workflow not found",
    "details": {
      "workflowId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### Execution Failed Error (500)

```json
{
  "success": false,
  "error": {
    "code": "EXECUTION_ERROR",
    "message": "Workflow execution failed after 45 seconds",
    "details": {
      "executionId": "550e8400-e29b-41d4-a716-446655440001",
      "workflowId": "550e8400-e29b-41d4-a716-446655440000",
      "reason": "NODE_EXECUTION_FAILED",
      "nodeId": "http-request-1"
    }
  },
  "diagnostics": {
    "errors": [
      {
        "path": "execution.nodes.http-request-1",
        "message": "HTTP request failed: Connection timeout",
        "code": "EXECUTION_TIMEOUT",
        "suggestion": "Check target service availability or increase node timeout"
      }
    ]
  }
}
```

### Rate Limit Error (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many workflow executions. Limit: 50 per minute",
    "details": {
      "retryAfter": 15
    }
  }
}
```

### Multi-Tenant Access Error (403)

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied to workflow",
    "details": {
      "workflowId": "550e8400-e29b-41d4-a716-446655440000",
      "reason": "TENANT_MISMATCH",
      "requiredTenant": "tenant-a",
      "accessTenant": "tenant-b"
    }
  }
}
```

---

## Multi-Tenant Context Flow

### Context Propagation Pattern

```
API Request
├─ Authorization (authenticate)
│  └─ Extract: userId, userLevel, tenantId
│
├─ Route Parameters
│  └─ Extract: {tenant}, {workflowId}
│
├─ Validation Check
│  └─ user.tenantId === params.tenant || user.level >= 4
│
├─ Build MultiTenantContext
│  ├─ tenantId: params.tenant
│  ├─ userId: user.id
│  ├─ userLevel: user.level
│  └─ enforced: true
│
├─ Load Workflow (with tenantId filter)
│  └─ db.workflows.findOne({ id, tenantId })
│
├─ Build ExecutionContext
│  ├─ context.tenantId = params.tenant
│  ├─ context.userId = user.id
│  ├─ context.multiTenant = { enforced: true, tenantId, userId, accessLevel }
│  └─ All node execution inherits this context
│
└─ Execute Workflow
   └─ Every database query includes tenantId filter
```

### ExecutionContext with Multi-Tenant

```typescript
interface ExecutionContext extends WorkflowContext {
  multiTenant: {
    enforced: boolean          // Always true
    tenantId: string           // From route params
    userId: string
    accessLevel: number        // User level (1-4)
    requestedAt: ISO8601
    ipAddress?: string
    userAgent?: string
  }
}
```

### Multi-Tenant Validation Rules

```typescript
// Before execution, validate:

1. Route tenant matches user's tenant (unless admin)
   if (user.tenantId !== routeTenant && user.level < 4) {
     throw ForbiddenError('Access denied')
   }

2. Workflow tenantId matches route tenant
   if (workflow.tenantId !== routeTenant) {
     throw ForbiddenError('Workflow belongs to different tenant')
   }

3. All node executions maintain tenantId
   // Every node executor receives context with tenantId
   // Must filter all database queries by tenantId

4. No cross-tenant data access
   // Variables, secrets, credentials must be tenant-scoped
   // Cannot reference global resources

5. Audit log includes tenant context
   auditLog({
     tenant: routeTenant,
     user: user.id,
     action: 'EXECUTE_WORKFLOW',
     resource: workflowId,
     status: 'success'
   })
```

---

## Caching Strategy

### Cache Layers

```
┌──────────────────────────────────────────────────┐
│          Validation Cache Hierarchy               │
├──────────────────────────────────────────────────┤
│                                                    │
│  L1: Memory Cache (Node.js process)               │
│      ├─ Size: 100 entries max                    │
│      ├─ TTL: 1 hour                              │
│      ├─ Key: `{tenantId}:{workflowId}`          │
│      └─ Hit rate: ~80% for repeated validations │
│                                                    │
│  L2: Redis Cache (Distributed)                   │
│      ├─ Size: 10,000 entries                     │
│      ├─ TTL: 24 hours                            │
│      ├─ Key: `workflow:validation:{id}:{hash}`  │
│      └─ Shared across all processes              │
│                                                    │
│  L3: Database (Source of Truth)                  │
│      ├─ Validation metadata table                │
│      ├─ TTL: Unlimited                           │
│      └─ Stores: errors, warnings, timestamp      │
│                                                    │
└──────────────────────────────────────────────────┘
```

### Cache Key Strategy

```typescript
// Memory cache key
const memKey = `${tenantId}:${workflowId}:${version}`

// Redis cache key
const redisKey = `workflow:validation:${tenantId}:${workflowId}:v${version}`

// Hash of workflow for invalidation
function getWorkflowHash(workflow: WorkflowDefinition): string {
  const json = JSON.stringify({
    nodes: workflow.nodes,
    connections: workflow.connections,
    variables: workflow.variables,
    triggers: workflow.triggers
  })
  return crypto.createHash('sha256').update(json).digest('hex')
}
```

### Cache Invalidation

```typescript
// Invalidate on:
interface InvalidationTrigger {
  // 1. Workflow update
  workflowUpdated: (workflowId: string, tenantId: string) => void

  // 2. Node type registry change
  registryUpdated: (nodeType: string) => void

  // 3. Manual invalidation
  invalidateWorkflow: (workflowId: string, tenantId: string) => void

  // 4. Tenant config change
  tenantConfigChanged: (tenantId: string) => void

  // 5. Expire old cache entries
  expireCache: (ttlMs: number) => void
}
```

### Cache Performance Metrics

```typescript
interface CacheMetrics {
  hits: number          // Successful cache hits
  misses: number        // Cache misses requiring validation
  hitRate: number       // hits / (hits + misses)
  avgValidationMs: number  // Time to validate (cache miss)
  avgCacheMs: number    // Time to retrieve (cache hit)
  memoryUsedMb: number
  redisHits: number
  redisSize: number
}
```

---

## Testing Checklist

### Unit Tests

- [ ] **WorkflowValidator**
  - [ ] Duplicate node names detected
  - [ ] Missing required fields detected
  - [ ] Invalid node types detected
  - [ ] Connection integrity verified
  - [ ] Variable names validated
  - [ ] Type matching validated
  - [ ] Multi-tenant safety checked
  - [ ] Resource limits enforced

- [ ] **WorkflowLoaderV2**
  - [ ] Workflow validation succeeds for valid input
  - [ ] Validation errors returned for invalid input
  - [ ] Cache hit/miss behavior correct
  - [ ] Cache invalidation works
  - [ ] Batch validation succeeds
  - [ ] Diagnostics returned correctly

- [ ] **ErrorHandling**
  - [ ] Validation errors formatted correctly
  - [ ] Execution errors logged with context
  - [ ] Stack traces excluded in production
  - [ ] Error codes machine-readable
  - [ ] Messages user-friendly

### Integration Tests

- [ ] **API Endpoints**
  - [ ] GET /workflows lists with optional validation
  - [ ] POST /workflows validates before creating
  - [ ] PUT /workflows validates on update
  - [ ] POST /workflows/{id}/execute validates before execution
  - [ ] POST /workflows/{id}/validate responds correctly

- [ ] **Multi-Tenant Safety**
  - [ ] User cannot access other tenant's workflows
  - [ ] Tenant mismatch rejected (403)
  - [ ] Admin can access any tenant
  - [ ] All queries include tenantId filter
  - [ ] Execution context includes tenantId

- [ ] **Caching**
  - [ ] Repeated validations use cache
  - [ ] Cache invalidated on workflow update
  - [ ] Redis falls back to memory cache
  - [ ] Old cache entries expire

- [ ] **Error Responses**
  - [ ] Validation errors include diagnostics
  - [ ] Execution errors include traceback (dev only)
  - [ ] Not found errors (404) correct
  - [ ] Access denied errors (403) correct
  - [ ] Rate limit errors (429) include retry info

### E2E Tests

- [ ] **Happy Path: Create and Execute**
  ```typescript
  1. POST /workflows with valid definition
  2. Response includes 201 Created
  3. GET /workflows/{id} returns workflow
  4. POST /workflows/{id}/execute runs to completion
  5. Execution status is 'success'
  ```

- [ ] **Validation Flow**
  ```typescript
  1. POST /workflows with invalid nodes
  2. Response 400 with validation errors
  3. Frontend displays error list
  4. User fixes errors
  5. POST again succeeds
  ```

- [ ] **Execution with Validation**
  ```typescript
  1. Workflow has validation warning
  2. Execution proceeds with warning logged
  3. POST /workflows/{id}/execute succeeds
  4. Execution completes despite warnings
  ```

- [ ] **Multi-Tenant Isolation**
  ```typescript
  1. Create workflow in tenant-a
  2. Switch to tenant-b user
  3. Attempt to execute workflow
  4. Request rejected with 403
  5. Audit log records attempt
  ```

- [ ] **Cache Effectiveness**
  ```typescript
  1. First validation: 150ms (cache miss)
  2. Second validation: 5ms (cache hit)
  3. Update workflow
  4. Next validation: 150ms (cache invalidated)
  ```

### Load Tests

- [ ] **Validation Performance**
  - [ ] Validate 100-node workflow < 500ms
  - [ ] Validate 1000 workflows in batch < 30s
  - [ ] Cache hit latency < 5ms
  - [ ] Memory usage stable over time

- [ ] **Concurrent Executions**
  - [ ] 10 concurrent executions succeed
  - [ ] 100 concurrent executions stable
  - [ ] 1000 concurrent executions degraded gracefully

- [ ] **Rate Limiting**
  - [ ] 60 requests per minute enforced
  - [ ] Burst handled gracefully
  - [ ] 429 responses include retry-after

---

## Migration Path

### Phase 1: Foundation (Week 1-2)

1. **Create WorkflowLoaderV2**
   - Implement core validation logic
   - Integrate with existing WorkflowValidator
   - Setup caching infrastructure

2. **Update Types**
   - Add ValidationResult types
   - Add MultiTenantContext types
   - Extend WorkflowContext

3. **Unit Tests**
   - Validation tests
   - Error handling tests
   - Cache tests

### Phase 2: Integration (Week 3-4)

1. **Endpoint Updates**
   - Add validation to POST /workflows (create)
   - Add validation to PUT /workflows (update)
   - Add validation to POST /workflows/{id}/execute

2. **Error Response**
   - Implement error handler
   - Deploy error templates
   - Add diagnostic logging

3. **Multi-Tenant Context**
   - Update ExecutionContext
   - Add multi-tenant validation
   - Audit logging

### Phase 3: Optimization (Week 5-6)

1. **Caching Implementation**
   - Setup Redis cache
   - Implement cache invalidation
   - Performance monitoring

2. **Performance Tuning**
   - Profile validation speed
   - Optimize hot paths
   - Load testing

3. **Documentation**
   - API documentation
   - Developer guides
   - Troubleshooting guide

### Phase 4: Production (Week 7-8)

1. **Staging Deployment**
   - Deploy to staging environment
   - Run full test suite
   - Performance validation

2. **Production Rollout**
   - Canary deployment (10% traffic)
   - Monitor error rates
   - Monitor performance

3. **Rollback Plan**
   - If error rate > 5%, rollback immediately
   - Keep old endpoint for compatibility
   - Fallback to skip validation option

### Backward Compatibility

```typescript
// Support legacy workflows without validation
interface ExecuteWorkflowRequest {
  triggerData?: Record<string, any>
  variables?: Record<string, any>
  skipValidation?: boolean  // For gradual rollout
  request?: { ... }
}

// If skipValidation=true:
if (requestBody.skipValidation) {
  console.warn('[DEPRECATED] skipValidation will be removed in v2.0')
  // Proceed without validation
  const executionRecord = await engine.executeWorkflow(workflow, context)
  return successResponse({...executionRecord})
}

// Standard path: always validate
const validation = await loader.validateWorkflow(workflow)
if (!validation.valid) {
  return Errors.validationError({...})
}
```

---

## Implementation Checklist

### Setup

- [ ] Create `/frontends/nextjs/src/lib/workflow/workflow-loader-v2.ts`
- [ ] Create `/frontends/nextjs/src/lib/workflow/validation-cache.ts`
- [ ] Create `/frontends/nextjs/src/lib/workflow/error-handler.ts`
- [ ] Update `/frontends/nextjs/src/lib/workflow/workflow-service.ts`
- [ ] Create test files for each module

### Endpoints

- [ ] GET /api/v1/{tenant}/workflows (add validation query param)
- [ ] POST /api/v1/{tenant}/workflows (add validation before create)
- [ ] GET /api/v1/{tenant}/workflows/{id} (add validation metadata)
- [ ] PUT /api/v1/{tenant}/workflows/{id} (add validation before update)
- [ ] POST /api/v1/{tenant}/workflows/{id}/execute (add validation before execute)
- [ ] POST /api/v1/{tenant}/workflows/{id}/validate (new validation endpoint)

### Database

- [ ] Add validation_metadata table (if not exists)
- [ ] Schema: workflowId, tenantId, validationResult, validatedAt
- [ ] Add index on (workflowId, tenantId)

### Monitoring

- [ ] Add metrics export for validation performance
- [ ] Add error rate monitoring
- [ ] Add cache hit rate tracking
- [ ] Add execution time percentiles

### Documentation

- [ ] Update API documentation
- [ ] Add integration guide
- [ ] Add troubleshooting guide
- [ ] Add examples (curl, JavaScript, Python)

---

## References

### Related Files

- `/frontends/nextjs/src/lib/workflow/workflow-service.ts` - Current execution engine
- `/workflow/executor/ts/executor/dag-executor.ts` - DAG execution logic
- `/workflow/executor/ts/utils/workflow-validator.ts` - Validation logic
- `/workflow/plugins/registry/node-registry.ts` - Node type registry
- `/frontends/nextjs/src/lib/api/responses.ts` - Response templates
- `/dbal/development/src/core/foundation/errors.ts` - Error types

### Documentation

- `CLAUDE.md` - Project architecture and patterns
- `docs/MULTI_TENANT_AUDIT.md` - Multi-tenant safety rules
- `docs/RATE_LIMITING_GUIDE.md` - Rate limiting patterns
- `.github/PULL_REQUEST_TEMPLATE.md` - PR requirements

---

## Summary

This integration plan provides:

1. **Endpoint Modifications** - Before/after signatures for all 6 main endpoints
2. **Validation Integration** - Multi-layer validation with registry support
3. **Error Responses** - Detailed diagnostic errors for debugging
4. **Multi-Tenant Safety** - Context propagation and isolation
5. **Caching Strategy** - L1/L2/L3 cache hierarchy for performance
6. **Testing Checklist** - Comprehensive test coverage plan
7. **Migration Path** - Phased rollout with backward compatibility

**Next Steps**:
1. Review this plan with the team
2. Create WorkflowLoaderV2 implementation
3. Update endpoints according to specifications
4. Run full test suite before deployment
