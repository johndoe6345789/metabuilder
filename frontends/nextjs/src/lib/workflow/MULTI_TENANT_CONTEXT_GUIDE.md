# Multi-Tenant Workflow Context Builder Guide

## Overview

The `MultiTenantContextBuilder` provides production-ready context construction for secure, multi-tenant workflow execution. It ensures:

- **Tenant Isolation**: Workflows and users cannot access data outside their tenant
- **User Access Control**: Enforces role-based access (viewer, editor, admin, super-admin)
- **Variable Scoping**: Prevents global-scope variables and cross-tenant data leaks
- **Audit Logging**: Tracks all context creation with metadata
- **Credential Management**: Safely binds and validates credentials

## Quick Start

### Basic Usage

```typescript
import {
  MultiTenantContextBuilder,
  type RequestContext,
} from '@/lib/workflow'
import type { WorkflowDefinition } from '@metabuilder/workflow'

// Get workflow from database
const workflow: WorkflowDefinition = await db.workflows.findOne(id, tenantId)

// Build request context from JWT or session
const requestContext: RequestContext = {
  tenantId: 'tenant-123',
  userId: 'user-456',
  userEmail: 'user@company.com',
  userLevel: 2, // 1=viewer, 2=editor, 3=admin, 4=super-admin
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
}

// Build execution context
const builder = new MultiTenantContextBuilder(workflow, requestContext)
const context = await builder.build({
  triggerData: { source: 'webhook', timestamp: Date.now() },
  variables: { customVar: 'value' },
  secrets: { apiKey: process.env.API_KEY },
})

// Execute workflow
const engine = getWorkflowExecutionEngine()
const record = await engine.executeWorkflow(workflow, context)
```

### From HTTP Request

```typescript
// Next.js API route
export async function POST(req: NextRequest) {
  const { workflowId } = req.json()

  // Extract user from JWT or session
  const user = await verifyAuth(req)

  const requestContext: RequestContext = {
    tenantId: user.tenantId,
    userId: user.id,
    userEmail: user.email,
    userLevel: user.level,
    ipAddress: req.ip,
    userAgent: req.headers.get('user-agent') || '',
  }

  const workflow = await db.workflows.findOne(workflowId, user.tenantId)
  const builder = new MultiTenantContextBuilder(workflow, requestContext)
  const context = await builder.build({
    triggerData: await req.json(),
  })

  return NextResponse.json(context)
}
```

## Architecture

### Request Context → Execution Context Flow

```
┌─────────────────────────────────┐
│   HTTP Request + JWT Token      │
│   - Authorization Header        │
│   - Session Cookie              │
│   - Body Data                   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  RequestContext Extraction      │
│  - tenantId                     │
│  - userId                       │
│  - userLevel (1-4)              │
│  - ipAddress                    │
│  - userAgent                    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  MultiTenantContextBuilder      │
│  1. Tenant Access Validation    │
│  2. User Level Check            │
│  3. Variable Building           │
│  4. Credential Binding          │
│  5. Context Validation          │
│  6. Audit Logging               │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  ExtendedWorkflowContext        │
│  - executionId                  │
│  - tenantId (enforced)          │
│  - userId                       │
│  - variables (scoped)           │
│  - multiTenant metadata         │
│  - credentials                  │
│  - execution limits             │
└─────────────────────────────────┘
```

## Security Features

### 1. Tenant Isolation

Every execution context is strictly bound to its tenant:

```typescript
// ✅ ALLOWED: User in tenant-1 accessing workflow in tenant-1
const context = await builder.build()

// ❌ BLOCKED: User in tenant-1 accessing workflow in tenant-2
// Unless user is super-admin (level 4) with allowCrossTenantAccess enabled
```

### 2. User Access Control

Role-based access enforced by user level:

| Level | Role | Permissions |
|-------|------|-------------|
| 1 | Viewer | Read-only access |
| 2 | Editor | Execute workflows, modify own data |
| 3 | Admin | Manage tenant workflows |
| 4 | Super-Admin | Full access, cross-tenant |

```typescript
// Editor (level 2) can only execute in their own tenant
const context = await builder.build()

// Super-Admin (level 4) can execute cross-tenant
const builder = new MultiTenantContextBuilder(workflow, {
  ...requestContext,
  userLevel: 4,
  tenantId: 'different-tenant',
}, {
  allowCrossTenantAccess: true
})
const context = await builder.build()
```

### 3. Variable Scoping

Variables are automatically scoped and validated:

```typescript
// Global-scope variables are REJECTED
const workflow = {
  variables: {
    secret: {
      scope: 'global',  // ❌ Rejected
      defaultValue: 'global-secret'
    }
  }
}

// Workflow-scope variables are allowed
const workflow = {
  variables: {
    config: {
      scope: 'workflow',  // ✅ Allowed
      defaultValue: { apiUrl: 'https://...' }
    }
  }
}

// Context variables injected automatically
const context = await builder.build()
console.log(context.variables._tenantId)  // Read-only tenant context
console.log(context.variables._userId)    // Read-only user context
console.log(context.variables._userLevel) // Read-only level context
```

### 4. Credential Safety

Credentials are bound but never exposed in logs or serialization:

```typescript
// Credentials loaded from secure store
const context = await builder.build({
  secrets: { apiKey: 'secret-value' }
})

// During logging, secrets are never exposed
const sanitized = sanitizeContextForLogging(context)
console.log(sanitized)  // No secrets in output

// Credentials accessible only during node execution
// through context.credentialBindings
const credential = context.credentialBindings.get('node-id')
```

### 5. Audit Logging

Every context creation is logged with full metadata:

```typescript
// Automatic audit log entry:
// [AUDIT] Workflow execution context created {
//   executionId: 'exec-123...',
//   workflowId: 'wf-456...',
//   tenantId: 'tenant-789...',
//   userId: 'user-abc...',
//   executionMode: 'api',
//   timestamp: '2026-01-22T10:30:00Z',
//   ipAddress: '192.168.1.1',
// }
```

## API Reference

### MultiTenantContextBuilder

#### Constructor

```typescript
constructor(
  workflow: WorkflowDefinition,
  requestContext: RequestContext,
  options?: ContextBuilderOptions
)
```

**Parameters:**
- `workflow`: The workflow to execute
- `requestContext`: User and tenant information from request
- `options`: Configuration options (optional)

**Options:**
```typescript
interface ContextBuilderOptions {
  allowCrossTenantAccess?: boolean        // Allow super-admin cross-tenant (default: false)
  enforceCredentialValidation?: boolean   // Validate credentials exist (default: true)
  enforceSecretEncryption?: boolean       // Require encrypted secrets (default: true)
  captureRequestData?: boolean            // Include request body in context (default: true)
  enableAuditLogging?: boolean            // Log context creation (default: true)
}
```

#### Methods

##### build()

```typescript
async build(
  requestData?: {
    triggerData?: Record<string, any>
    variables?: Record<string, any>
    request?: any
    secrets?: Record<string, string>
  },
  trigger?: WorkflowTrigger
): Promise<ExtendedWorkflowContext>
```

Builds and validates complete execution context.

**Throws:**
- `Error` if tenant mismatch, access denied, or validation fails

**Returns:** Fully initialized context ready for execution

##### validate()

```typescript
async validate(): Promise<ContextValidationResult>
```

Validates context without building it.

**Returns:**
```typescript
interface ContextValidationResult {
  valid: boolean
  errors: ContextValidationError[]
  warnings: ContextValidationWarning[]
}
```

### Helper Functions

#### createContextFromRequest()

Factory function for common use case:

```typescript
async function createContextFromRequest(
  workflow: WorkflowDefinition,
  requestContext: RequestContext,
  requestData?: RequestData,
  options?: ContextBuilderOptions
): Promise<ExtendedWorkflowContext>
```

#### canUserAccessWorkflow()

Simple access check:

```typescript
function canUserAccessWorkflow(
  userTenantId: string,
  userLevel: number,
  workflowTenantId: string
): boolean
```

Returns true if user can execute workflow.

#### sanitizeContextForLogging()

Remove sensitive data before logging:

```typescript
function sanitizeContextForLogging(
  context: ExtendedWorkflowContext
): Record<string, any>
```

Removes or truncates:
- Secrets
- API keys
- Request bodies
- IP addresses (shortened)
- User agents (shortened)

#### createMockContext()

Create test context:

```typescript
function createMockContext(
  workflow: WorkflowDefinition,
  overrides?: Partial<RequestContext>
): ExtendedWorkflowContext
```

## Common Patterns

### 1. Executing User-Submitted Workflow

```typescript
export async function executeWorkflow(req: NextRequest) {
  const user = await getUser(req)
  const { workflowId, variables } = await req.json()

  // Load workflow - DBAL ensures tenant filtering
  const workflow = await db.workflows.findOne(workflowId, user.tenantId)
  if (!workflow) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Build context
  const builder = new MultiTenantContextBuilder(workflow, {
    tenantId: user.tenantId,
    userId: user.id,
    userEmail: user.email,
    userLevel: user.level,
    ipAddress: req.ip,
    userAgent: req.headers.get('user-agent') || '',
  })

  const context = await builder.build({ variables })

  // Execute
  const engine = getWorkflowExecutionEngine()
  const record = await engine.executeWorkflow(workflow, context)

  return NextResponse.json(record)
}
```

### 2. Webhook Trigger

```typescript
export async function handleWebhook(req: NextRequest) {
  const { workflowId, tenantId } = getWebhookMetadata(req)

  const workflow = await db.workflows.findOne(workflowId, tenantId)
  if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Build context with webhook metadata
  const builder = new MultiTenantContextBuilder(workflow, {
    tenantId,
    userId: 'webhook-system',
    userEmail: 'webhook@metabuilder.local',
    userLevel: 3, // Treat as admin for system webhooks
  })

  const context = await builder.build(
    {
      triggerData: await req.json(),
      request: {
        method: req.method,
        headers: Object.fromEntries(req.headers),
        query: Object.fromEntries(new URL(req.url).searchParams),
        body: await req.json(),
      },
    },
    {
      nodeId: workflow.nodes[0]?.id || 'webhook',
      kind: 'webhook',
      enabled: true,
      metadata: { webhookId: getWebhookId(req) },
    }
  )

  const engine = getWorkflowExecutionEngine()
  const record = await engine.executeWorkflow(workflow, context)

  return NextResponse.json({ success: true, executionId: record.id })
}
```

### 3. Scheduled Execution

```typescript
export async function executeScheduledWorkflow(
  workflow: WorkflowDefinition,
  tenantId: string
) {
  const builder = new MultiTenantContextBuilder(workflow, {
    tenantId,
    userId: 'scheduler-system',
    userEmail: 'scheduler@metabuilder.local',
    userLevel: 3,
  })

  const context = await builder.build(
    {
      triggerData: {
        scheduledAt: new Date(),
        timezone: workflow.settings.timezone,
      },
    },
    {
      nodeId: workflow.nodes[0]?.id || 'schedule',
      kind: 'schedule',
      enabled: true,
      schedule: '0 */6 * * *', // cron expression
      metadata: { cronExpression: '0 */6 * * *' },
    }
  )

  const engine = getWorkflowExecutionEngine()
  return await engine.executeWorkflow(workflow, context)
}
```

### 4. Validation Before Execution

```typescript
export async function validateWorkflowExecution(
  workflowId: string,
  tenantId: string,
  userId: string,
  userLevel: number
) {
  const workflow = await db.workflows.findOne(workflowId, tenantId)
  if (!workflow) {
    return { valid: false, error: 'Workflow not found' }
  }

  const builder = new MultiTenantContextBuilder(workflow, {
    tenantId,
    userId,
    userEmail: '', // Will be loaded from DB
    userLevel,
  })

  const result = await builder.validate()

  return {
    valid: result.valid,
    errors: result.errors,
    warnings: result.warnings,
  }
}
```

## Error Handling

### Validation Errors

```typescript
try {
  const context = await builder.build()
} catch (error) {
  if (error.message.includes('Forbidden')) {
    // Access denied - return 403
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }

  if (error.message.includes('validation failed')) {
    // Invalid context - return 400
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  // Unknown error - return 500
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Testing

### Unit Tests

```typescript
import { MultiTenantContextBuilder, createMockContext } from '@/lib/workflow'

describe('MultiTenantContextBuilder', () => {
  it('should build valid context', async () => {
    const workflow = createTestWorkflow('tenant-1')
    const builder = new MultiTenantContextBuilder(workflow, {
      tenantId: 'tenant-1',
      userId: 'user-123',
      userEmail: 'user@example.com',
      userLevel: 2,
    })

    const context = await builder.build()

    expect(context.tenantId).toBe('tenant-1')
    expect(context.multiTenant.enforced).toBe(true)
  })

  it('should reject cross-tenant access', async () => {
    const workflow = createTestWorkflow('tenant-1')
    const builder = new MultiTenantContextBuilder(workflow, {
      tenantId: 'tenant-2',
      userId: 'user-123',
      userEmail: 'user@example.com',
      userLevel: 2,
    })

    await expect(builder.build()).rejects.toThrow('Forbidden')
  })
})
```

### Integration Tests

```typescript
it('should execute workflow with context', async () => {
  const workflow = createTestWorkflow('tenant-1')
  const context = createMockContext(workflow)

  const engine = getWorkflowExecutionEngine()
  const record = await engine.executeWorkflow(workflow, context)

  expect(record.status).toBe('success')
  expect(record.tenantId).toBe('tenant-1')
})
```

## Performance Considerations

### Caching

Validation results are cached for identical workflows:

```typescript
// First call - validates
const context1 = await builder.build()

// Second call - uses cache (if workflow unchanged)
const context2 = await builder.build()
```

### Async Operations

Credential loading is async:

```typescript
const context = await builder.build()  // Awaits credential binding
```

### Memory

Large request bodies can impact memory:

```typescript
// Disable capturing large request data if not needed
const builder = new MultiTenantContextBuilder(workflow, requestContext, {
  captureRequestData: false,
})
```

## Production Checklist

- [ ] JWT token validation implemented for RequestContext extraction
- [ ] All workflows have tenantId set
- [ ] Secrets stored in secure key management (not in code)
- [ ] Audit logging configured and monitored
- [ ] Credential binding tested for all node types
- [ ] Rate limiting on workflow execution endpoints
- [ ] Tenant filtering on all database queries
- [ ] Cross-tenant access only allowed for super-admins
- [ ] Global-scope variables rejected by validator
- [ ] Request data sanitization before logging
- [ ] Error messages don't leak tenant/user info
- [ ] Tests cover multi-tenant isolation
- [ ] Tests cover user access control
- [ ] Tests cover variable scoping

## Troubleshooting

### "Workflow tenant mismatch"

```
Error: Context tenant foo does not match workflow tenant bar
```

**Cause:** User is in one tenant, workflow in another
**Fix:**
1. Verify user's tenantId matches
2. Load workflow with tenant filtering
3. Check super-admin override is enabled if needed

### "Global-scope variable skipped"

```
[SECURITY] Skipping global-scope variable CONFIG - not allowed
```

**Cause:** Workflow defines a global-scope variable
**Fix:** Change variable scope to 'workflow' or 'execution' in workflow definition

### "Credential not found"

```
[SECURITY] Credential 123 not found for node webhook
```

**Cause:** Credential binding references non-existent credential
**Fix:**
1. Verify credential exists in tenant
2. Check credential ID is correct
3. Ensure user has access to credential

## See Also

- [WORKFLOW_LOADERV2_IMPLEMENTATION.md](./docs/WORKFLOW_LOADERV2_IMPLEMENTATION.md)
- [MULTI_TENANT_AUDIT.md](./docs/MULTI_TENANT_AUDIT.md)
- [CLAUDE.md](./docs/CLAUDE.md) - Core development patterns
