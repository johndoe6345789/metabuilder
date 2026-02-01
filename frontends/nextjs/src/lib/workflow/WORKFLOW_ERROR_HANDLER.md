# Workflow Error Handler - Production-Ready Documentation

**Status**: Production Ready
**Lines of Code**: 450+ with full test coverage
**Error Codes Covered**: 30+ comprehensive error scenarios
**Last Updated**: 2026-01-22

## Overview

The `WorkflowErrorHandler` is a comprehensive, production-ready error handling system for workflow execution in MetaBuilder. It provides:

- **30+ error codes** covering all workflow failure scenarios
- **Structured error responses** with context linking
- **HTTP status code mapping** for all error types
- **Recovery suggestions and hints** for each error
- **Multi-tenant safety** with tenant context enforcement
- **Development vs production modes** for debugging and security
- **Diagnostic information** with validation details
- **Type-safe error formatting** using TypeScript enums

## Quick Start

### Basic Usage

```typescript
import {
  WorkflowErrorHandler,
  WorkflowErrorCode,
  getWorkflowErrorHandler,
} from '@/lib/workflow'

// Get global handler instance
const handler = getWorkflowErrorHandler()

// Handle validation errors
const response = handler.handleValidationError(
  [
    {
      path: 'root.nodes[0]',
      message: 'Invalid node type',
      code: 'INVALID_NODE_TYPE',
      severity: 'error',
    },
  ],
  [], // warnings
  {
    workflowId: 'wf-123',
    tenantId: 'tenant-1',
  }
)
// Returns: NextResponse with 400 status
```

### In API Routes

```typescript
// /app/api/v1/workflows/execute/route.ts

import { NextRequest } from 'next/server'
import { getWorkflowErrorHandler } from '@/lib/workflow'

const handler = getWorkflowErrorHandler()

export async function POST(request: NextRequest) {
  try {
    const { workflowId, tenantId } = await request.json()

    // Validate input
    if (!workflowId) {
      return handler.handleValidationError(
        [
          {
            path: 'root.workflowId',
            message: 'workflowId is required',
            code: 'MISSING_REQUIRED_FIELD',
            severity: 'error',
          },
        ],
        [],
        { tenantId }
      )
    }

    // Execute workflow...
  } catch (error) {
    return handler.handleExecutionError(error, {
      workflowId,
      tenantId,
      action: 'execute_workflow',
      cause: error as Error,
    })
  }
}
```

## Error Code Reference

### 30+ Error Codes Organized by Category

#### Validation Errors (400)

| Code | Message | Hint |
|------|---------|------|
| `VALIDATION_ERROR` | Workflow validation failed | Verify workflow structure, check nodes, connections, and parameters. |
| `MISSING_REQUIRED_FIELD` | Missing required field in workflow definition | Add the missing parameter to the node. |
| `INVALID_NODE_TYPE` | Invalid node type specified | Use a valid node type from the registry. |
| `INVALID_CONNECTION` | Invalid connection between nodes | Ensure target node exists and types are compatible. |
| `INVALID_WORKFLOW_STRUCTURE` | Workflow structure is invalid | Review workflow layout and ensure proper node organization. |
| `DUPLICATE_NODE_NAME` | Duplicate node name detected | Rename nodes to have unique names. |
| `CIRCULAR_DEPENDENCY` | Circular dependency detected | Reorganize workflow to eliminate circular references. |
| `TYPE_MISMATCH` | Type mismatch in node parameters | Verify parameter types match node input requirements. |
| `INVALID_TENANT_ID` | Invalid tenant ID format | Use a valid tenant ID format. |
| `MISSING_TENANT_ID` | Tenant ID is required | Workflow must be associated with a tenant. |

#### Execution Errors (500)

| Code | Message | Hint | HTTP Status |
|------|---------|------|-------------|
| `EXECUTION_ERROR` | Workflow execution failed | Check node parameters and verify target resources. | 500 |
| `EXECUTION_FAILED` | Workflow execution failed | Review execution logs for failure details. | 500 |
| `NODE_EXECUTION_FAILED` | Node execution failed | Check the node configuration and input data. | 500 |
| `EXECUTION_TIMEOUT` | Workflow execution timed out | Increase timeout settings or optimize the workflow. | 504 |
| `NODE_NOT_FOUND` | Node not found in workflow | Verify the node exists in the workflow definition. | 500 |
| `EXECUTOR_NOT_REGISTERED` | Node executor not registered | The required node executor is not available. | 500 |
| `WORKFLOW_EXECUTION_ABORTED` | Workflow execution was aborted | Execution was aborted. Review the abort reason and retry. | 500 |

#### Resource Exhaustion (503)

| Code | Message | HTTP Status |
|------|---------|-------------|
| `INSUFFICIENT_RESOURCES` | Insufficient resources to execute workflow | 503 |
| `MEMORY_LIMIT_EXCEEDED` | Memory limit exceeded during execution | 503 |
| `EXECUTION_QUEUE_FULL` | Execution queue is full | 503 |

#### Data/Configuration Errors (422)

| Code | Message |
|------|---------|
| `MISSING_WORKFLOW_DEFINITION` | Workflow definition is required |
| `INVALID_WORKFLOW_FORMAT` | Workflow format is invalid |
| `INVALID_CONTEXT` | Invalid execution context |
| `INVALID_PARAMETER` | Invalid parameter value |
| `MISSING_VARIABLE` | Required variable is missing |
| `INVALID_EXPRESSION` | Invalid expression syntax |

#### Access Control Errors (403)

| Code | Message | HTTP Status |
|------|---------|-------------|
| `FORBIDDEN` | Access to workflow is forbidden | 403 |
| `TENANT_MISMATCH` | Tenant mismatch - cannot access workflow | 403 |
| `UNAUTHORIZED` | Unauthorized - authentication required | 401 |
| `PERMISSION_DENIED` | Permission denied for this action | 403 |

#### Not Found Errors (404)

| Code | Message |
|------|---------|
| `NOT_FOUND` | Resource not found |
| `WORKFLOW_NOT_FOUND` | Workflow not found |
| `EXECUTION_NOT_FOUND` | Execution not found |
| `RESOURCE_NOT_FOUND` | Requested resource not found |

#### Rate Limiting (429)

| Code | Message |
|------|---------|
| `RATE_LIMITED` | Too many requests, please try again later |
| `CONCURRENT_EXECUTION_LIMIT` | Concurrent execution limit reached |

## API Reference

### Constructor

```typescript
constructor(isDevelopment: boolean = process.env.NODE_ENV !== 'production')
```

Creates a new error handler. In development mode, includes stack traces in errors.

### Methods

#### `handleValidationError(errors, warnings, context)`

Formats validation errors with suggestions and diagnostic hints.

```typescript
const response = handler.handleValidationError(
  errors: ValidationError[],
  warnings: ValidationError[] = [],
  context: ErrorContext = {}
)

// Returns: NextResponse<FormattedError> with status 400
```

**Parameters:**
- `errors`: Array of validation errors
- `warnings`: Array of validation warnings (optional)
- `context`: Error context with workflowId, tenantId, etc.

**Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Workflow validation failed: 2 error(s), 1 warning(s)",
    "statusCode": 400,
    "details": {
      "errorCount": 2,
      "warningCount": 1,
      "action": "validate_workflow"
    }
  },
  "context": {
    "workflowId": "wf-123",
    "tenantId": "tenant-1"
  },
  "diagnostics": {
    "errors": [
      {
        "path": "root.nodes[0]",
        "message": "Invalid node type",
        "code": "INVALID_NODE_TYPE",
        "severity": "error",
        "suggestion": "Use a valid node type from the registry."
      }
    ],
    "warnings": [],
    "hint": "Verify workflow structure...",
    "suggestions": ["Use a valid node type...", "Fix validation issues..."]
  }
}
```

#### `handleExecutionError(error, context)`

Formats execution errors with diagnostic context.

```typescript
const response = handler.handleExecutionError(
  error: unknown,
  context: ErrorContext = {}
)

// Returns: NextResponse<FormattedError> with appropriate HTTP status
```

**Features:**
- Automatic error code detection
- Stack trace in development mode only
- HTTP status code mapping
- Context linking (executionId, workflowId, nodeId, tenantId)

**Example:**
```typescript
try {
  await executeWorkflow(workflow, context)
} catch (error) {
  return handler.handleExecutionError(error, {
    executionId: 'exec-123',
    workflowId: 'wf-123',
    nodeId: 'node-1',
    tenantId: 'tenant-1',
    cause: error as Error, // For stack trace
  })
}
```

#### `handleAccessError(context)`

Formats multi-tenant access control errors.

```typescript
const response = handler.handleAccessError(context: ErrorContext)

// Returns: NextResponse<FormattedError> with status 403
```

**Use for:**
- Tenant ID mismatches
- Unauthorized access attempts
- Missing permissions

#### `handleAuthError(errorCode, context)`

Formats authentication/authorization errors.

```typescript
const response = handler.handleAuthError(
  errorCode: WorkflowErrorCode,
  context: ErrorContext = {}
)
```

**Status codes:**
- `UNAUTHORIZED`: 401
- `FORBIDDEN`: 403
- `PERMISSION_DENIED`: 403

#### `handleNotFoundError(resource, context)`

Formats not found errors.

```typescript
const response = handler.handleNotFoundError(
  resource: string,
  context: ErrorContext = {}
)

// Returns: NextResponse<FormattedError> with status 404
```

**Example:**
```typescript
if (!workflow) {
  return handler.handleNotFoundError('Workflow', {
    workflowId: 'wf-123',
  })
}
```

#### `handleRateLimitError(retryAfter, context)`

Formats rate limiting errors with Retry-After header.

```typescript
const response = handler.handleRateLimitError(
  retryAfter: number = 60,
  context: ErrorContext = {}
)

// Returns: NextResponse<FormattedError> with status 429
// Header: Retry-After: 60
```

#### `handleResourceExhaustedError(reason, context)`

Formats resource exhaustion errors (memory, queue).

```typescript
const response = handler.handleResourceExhaustedError(
  reason: string = 'Insufficient resources',
  context: ErrorContext = {}
)
```

**Detects:**
- `"memory"` → `MEMORY_LIMIT_EXCEEDED` (503)
- `"queue"` → `EXECUTION_QUEUE_FULL` (429)
- Default → `INSUFFICIENT_RESOURCES` (503)

#### `handleTimeoutError(context)`

Formats timeout errors.

```typescript
const response = handler.handleTimeoutError(
  context: ErrorContext = {}
)

// Returns: NextResponse<FormattedError> with status 504
```

## Error Context

The `ErrorContext` interface provides rich context linking:

```typescript
interface ErrorContext {
  executionId?: string          // Execution ID for linking
  workflowId?: string           // Workflow ID for context
  nodeId?: string               // Node ID for specific node errors
  tenantId?: string             // Tenant ID for multi-tenant safety
  userId?: string               // User ID for audit trail
  action?: string               // Action being performed
  timestamp?: Date              // When error occurred
  reason?: string               // Custom reason
  cause?: Error                 // Original error for stack trace
  statusCode?: number           // Override HTTP status
  retryable?: boolean           // Whether error is retryable
}
```

## Error Response Format

All error responses follow a consistent format:

```typescript
interface FormattedError {
  success: false
  error: {
    code: string                              // Error code enum
    message: string                           // User-friendly message
    statusCode?: number                       // HTTP status code
    details?: Record<string, any>             // Additional details
  }
  context?: {                                 // Linking information
    executionId?: string
    workflowId?: string
    nodeId?: string
    tenantId?: string
  }
  diagnostics?: {                             // Diagnostic information
    errors?: ValidationError[]                // Validation errors with suggestions
    warnings?: ValidationError[]              // Validation warnings
    hint?: string                             // Recovery hint
    stack?: string                            // Stack trace (dev only)
    context?: Record<string, any>             // Additional context
    suggestions?: string[]                    // Recovery suggestions
  }
}
```

## Usage Examples

### Example 1: Validating Workflow Before Execution

```typescript
import { getWorkflowErrorHandler } from '@/lib/workflow'
import { getWorkflowLoader } from '@/lib/workflow'

const handler = getWorkflowErrorHandler()
const loader = getWorkflowLoader()

export async function validateWorkflow(
  workflow: WorkflowDefinition,
  tenantId: string
) {
  // Validate workflow
  const validation = await loader.validateWorkflow(workflow)

  if (!validation.valid) {
    return handler.handleValidationError(
      validation.errors,
      validation.warnings,
      {
        workflowId: workflow.id,
        tenantId,
        action: 'validate_workflow',
      }
    )
  }

  return { success: true, workflow }
}
```

### Example 2: Executing Workflow with Error Handling

```typescript
export async function executeWorkflow(
  workflowId: string,
  tenantId: string,
  userId: string
) {
  const handler = getWorkflowErrorHandler()

  try {
    // Load workflow
    const workflow = await loadWorkflow(workflowId, tenantId)

    if (!workflow) {
      return handler.handleNotFoundError('Workflow', {
        workflowId,
        tenantId,
      })
    }

    // Check access
    if (!canAccessWorkflow(userId, tenantId, workflow.tenantId)) {
      return handler.handleAccessError({
        workflowId,
        tenantId,
        userId,
        reason: 'Tenant mismatch',
      })
    }

    // Execute workflow
    const executionId = uuidv4()
    const startTime = Date.now()

    const result = await executeWorkflowDAG(workflow, {
      executionId,
      tenantId,
      userId,
    })

    return {
      success: true,
      executionId,
      duration: Date.now() - startTime,
      result,
    }
  } catch (error) {
    return handler.handleExecutionError(error, {
      workflowId,
      tenantId,
      userId,
      action: 'execute_workflow',
      cause: error as Error,
    })
  }
}
```

### Example 3: Rate Limiting Workflow Executions

```typescript
import { applyRateLimit } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  const handler = getWorkflowErrorHandler()

  // Apply rate limit (max 50 mutations/minute)
  const limitResponse = applyRateLimit(request, 'mutation')
  if (limitResponse) {
    return handler.handleRateLimitError(60)
  }

  // Continue with execution...
}
```

### Example 4: Handling Resource Exhaustion

```typescript
export async function executeWithResourceCheck(
  workflow: WorkflowDefinition,
  context: WorkflowContext
) {
  const handler = getWorkflowErrorHandler()

  // Check available memory
  const availableMemory = getAvailableMemory()
  if (availableMemory < 100 * 1024 * 1024) {
    // Less than 100MB
    return handler.handleResourceExhaustedError('Memory limit exceeded', {
      workflowId: workflow.id,
      tenantId: context.tenantId,
    })
  }

  // Check execution queue
  const queueSize = getExecutionQueueSize()
  if (queueSize > 1000) {
    return handler.handleResourceExhaustedError('Execution queue is full', {
      workflowId: workflow.id,
    })
  }

  // Safe to execute
  return executeWorkflowDAG(workflow, context)
}
```

## Best Practices

### 1. Always Include Context

```typescript
// ✅ GOOD: Rich context for debugging
return handler.handleExecutionError(error, {
  executionId: context.executionId,
  workflowId: workflow.id,
  nodeId: currentNode.id,
  tenantId: context.tenantId,
  userId: context.userId,
  action: 'execute_node',
  cause: error as Error,
})

// ❌ BAD: Minimal context
return handler.handleExecutionError(error, {})
```

### 2. Use Specific Error Handlers

```typescript
// ✅ GOOD: Use specific handler for access errors
if (!hasPermission(user, workflow)) {
  return handler.handleAccessError({
    workflowId: workflow.id,
    tenantId: context.tenantId,
  })
}

// ❌ BAD: Generic execution error for access
if (!hasPermission(user, workflow)) {
  return handler.handleExecutionError(
    new Error('Access denied'),
    { workflowId: workflow.id }
  )
}
```

### 3. Always Check Tenant ID

```typescript
// ✅ GOOD: Validate tenant ID matches
if (workflow.tenantId !== context.tenantId) {
  return handler.handleAccessError({
    workflowId: workflow.id,
    tenantId: context.tenantId,
    reason: 'Tenant ID mismatch',
  })
}

// ❌ BAD: No tenant validation
const workflow = await db.workflows.findById(workflowId)
```

### 4. Include Stack Traces in Development

```typescript
// ✅ GOOD: Pass error for stack trace
try {
  await executeWorkflow()
} catch (error) {
  return handler.handleExecutionError(error, {
    cause: error as Error, // Includes stack trace in dev
  })
}

// ❌ BAD: No stack trace
try {
  await executeWorkflow()
} catch (error) {
  return handler.handleExecutionError(error)
}
```

### 5. Map Validation Errors to Suggestions

The error handler automatically suggests fixes:

```typescript
{
  "path": "root.nodes[0].parameters",
  "message": "Missing required parameter",
  "code": "MISSING_REQUIRED_FIELD",
  "severity": "error",
  "suggestion": "Add the missing parameter to the node."
}
```

## Testing

Run the comprehensive test suite:

```bash
npm run test -- workflow-error-handler.test.ts
```

Tests cover:
- All 30+ error codes
- HTTP status code mappings
- Error message formatting
- Context linking
- Development vs production modes
- Recovery suggestions and hints
- Multi-tenant safety

## Migration Guide

### From error-reporting.ts

If migrating from the legacy `error-reporting.ts`:

```typescript
// OLD (error-reporting.ts)
import { errorReporting } from '@/lib/error-reporting'

const report = errorReporting.reportError(error, {
  component: 'workflow',
  action: 'execute',
})

// NEW (workflow-error-handler.ts)
import { getWorkflowErrorHandler } from '@/lib/workflow'

const handler = getWorkflowErrorHandler()
const response = handler.handleExecutionError(error, {
  action: 'execute',
})
```

## Troubleshooting

### Stack traces not showing in development?

Ensure you're passing the error as the `cause`:

```typescript
handler.handleExecutionError(error, {
  cause: error as Error, // Required for stack trace
})
```

### Error hints not helpful?

Check if the error code is being detected correctly:

```typescript
// In development mode, check logs:
console.error('Error code detected:', body.error.code)
console.error('Hint:', body.diagnostics.hint)
```

### Status codes unexpected?

Verify the error code mapping in `ERROR_STATUS_MAP`. Custom status codes can be overridden:

```typescript
handler.handleExecutionError(error, {
  statusCode: 503, // Override the mapped status
})
```

## See Also

- [WorkflowLoaderV2](./workflow-loader-v2.ts) - Validation and loading
- [ValidationCache](./validation-cache.ts) - Caching layer
- [WorkflowService](./workflow-service.ts) - Execution engine
- [WORKFLOW_LOADERV2_IMPLEMENTATION.md](../../docs/WORKFLOW_LOADERV2_IMPLEMENTATION.md) - Full implementation guide
