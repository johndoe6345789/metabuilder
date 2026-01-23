# Next.js Workflow Service Map and Integration Roadmap

**Last Updated**: 2026-01-22
**Status**: Phase 2 Ready for WorkflowLoaderV2 Integration
**Document Focus**: Complete architectural analysis of workflow service in frontends/nextjs

---

## Quick Reference

| Aspect | Location | Status |
|--------|----------|--------|
| **Main Service** | `/frontends/nextjs/src/lib/workflow/workflow-service.ts` | ✅ Implemented |
| **API Routes** | `/frontends/nextjs/src/app/api/v1/[tenant]/workflows/` | ✅ Implemented |
| **Database Schema** | `/dbal/shared/api/schema/entities/core/workflow.yaml` | ✅ YAML (Source of Truth) |
| **Validation Schema** | `/schemas/package-schemas/workflow.schema.json` | ✅ JSON Schema |
| **Middleware** | `/frontends/nextjs/src/lib/middleware/` | ✅ Auth + Rate Limit |
| **DBAL Integration** | `/frontends/nextjs/src/lib/db-client.ts` | ⚠️ Placeholder Methods |
| **WorkflowLoaderV2** | TBD | 🔄 Ready for Integration |

---

## Service Architecture

### 1. Core Service: WorkflowExecutionEngine

**File**: `/frontends/nextjs/src/lib/workflow/workflow-service.ts`

#### Purpose
- Manages complete workflow execution lifecycle
- Integrates with DAG executor from `@metabuilder/workflow`
- Handles execution state persistence to database
- Provides error handling and logging

#### Class: WorkflowExecutionEngine

**Constructor**:
```typescript
constructor()
- Initializes node executor registry from @metabuilder/workflow
- No parameters required
```

**Methods**:

##### 1. executeWorkflow()
```typescript
async executeWorkflow(
  workflow: WorkflowDefinition,
  context: WorkflowContext
): Promise<ExecutionRecord>
```

**Input**:
- `workflow`: Complete workflow definition (from database)
- `context`: Execution context with user, tenant, variables

**Processing**:
1. Generates unique execution ID
2. Creates node executor callback
3. Resolves node executors from registry
4. Creates DAGExecutor instance
5. Executes DAG
6. Collects execution metrics
7. Determines final status (success/error)
8. Saves execution record to database
9. Returns ExecutionRecord

**Error Handling**:
- Catches executor not found errors
- Catches node execution errors
- Wraps errors in ExecutionRecord with error code
- Continues even if save fails (doesn't lose execution state)

**Multi-Tenant**: ✅ Context includes tenantId, passed through DAGExecutor

**Metrics Tracked**:
- `nodesExecuted`: Total nodes run
- `successNodes`: Successful completions
- `failedNodes`: Failed nodes
- `retriedNodes`: Retried nodes
- `totalRetries`: Total retry attempts
- `peakMemory`: Peak memory usage
- `dataProcessed`: Data volume (0 - needs plugin tracking)
- `apiCallsMade`: API calls (0 - needs plugin tracking)

##### 2. loadWorkflow()
```typescript
async loadWorkflow(
  workflowId: string,
  tenantId: string
): Promise<WorkflowDefinition | null>
```

**Status**: ⚠️ Placeholder - returns null
**Integration Point**: DBAL `workflows.read()` or list query

**Multi-Tenant**: ✅ Filters by tenantId

**Expected Implementation**:
```typescript
// Pseudo-code for integration
const workflow = await db.workflows.list({
  filter: { id: workflowId, tenantId }
})
return workflow?.[0] || null
```

##### 3. getExecutionStatus()
```typescript
async getExecutionStatus(
  executionId: string,
  tenantId: string
): Promise<ExecutionRecord | null>
```

**Status**: ⚠️ Placeholder - returns null
**Integration Point**: DBAL `executions.read()`

**Multi-Tenant**: ✅ Filters by tenantId

##### 4. listExecutions()
```typescript
async listExecutions(
  workflowId: string,
  tenantId: string,
  limit: number = 50
): Promise<ExecutionRecord[]>
```

**Status**: ⚠️ Placeholder - returns []
**Integration Point**: DBAL `executions.list()` with filters

**Multi-Tenant**: ✅ Filters by tenantId
**Sorting**: By startTime (descending)

##### 5. abortExecution()
```typescript
async abortExecution(
  executionId: string,
  tenantId: string
): Promise<void>
```

**Status**: ⚠️ Placeholder - logs only
**Integration Point**: Need abort logic in DAGExecutor

##### 6. saveExecutionRecord() [Private]
```typescript
private async saveExecutionRecord(
  record: ExecutionRecord
): Promise<void>
```

**Status**: ⚠️ Placeholder - logs only
**Integration Point**: DBAL `executions.create()`

#### Global Instance

```typescript
let executionEngine: WorkflowExecutionEngine | null = null

export function getWorkflowExecutionEngine(): WorkflowExecutionEngine {
  if (!executionEngine) {
    executionEngine = new WorkflowExecutionEngine()
  }
  return executionEngine
}
```

**Pattern**: Singleton - returns same instance across requests

#### Initialization

```typescript
export async function initializeWorkflowEngine(): Promise<void> {
  const registry = getNodeExecutorRegistry()
  // Registers built-in executors
  // Logs available node types
}
```

**Status**: ⚠️ Stub - imports registry but doesn't register executors

---

### 2. API Routes

#### Route 1: List & Create Workflows

**Endpoint**: `GET|POST /api/v1/{tenant}/workflows`

**File**: `/frontends/nextjs/src/app/api/v1/[tenant]/workflows/route.ts`

##### GET Handler
```typescript
async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse>
```

**Query Parameters**:
- `limit`: number (default: 50, max: 100)
- `offset`: number (default: 0)
- `category`: 'automation' | 'integration' | 'business-logic' | 'data-transformation' | 'notification' | 'approval' | 'other'
- `tags`: comma-separated string
- `active`: boolean

**Authentication**: ✅ Level 1+
**Rate Limiting**: ✅ 'list' (100 requests/minute)
**Multi-Tenant**: ✅ Validates user.tenantId matches route tenant

**Processing**:
1. Apply rate limiting
2. Authenticate user (minLevel: 1)
3. Extract route parameters
4. Validate tenant access
5. Parse query parameters
6. Build filter object
7. Query from database (PLACEHOLDER)
8. Return paginated results

**Current Status**: ⚠️ Returns empty results (no DBAL integration)

**Response** (200):
```json
{
  "workflows": [/* WorkflowDefinition[] */],
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean
  }
}
```

**Error Responses**:
- 400: Bad Request (invalid JSON)
- 403: Forbidden (tenant access denied)
- 401: Unauthorized
- 500: Internal Server Error

##### POST Handler
```typescript
async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse>
```

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "category": "automation | integration | ... (required)",
  "nodes": "array (optional)",
  "connections": "object (optional)",
  "triggers": "array (optional)",
  "tags": "array (optional)",
  "active": "boolean (optional, default: true)",
  "metadata": "object (optional)"
}
```

**Authentication**: ✅ Level 2+ (moderator)
**Rate Limiting**: ✅ 'mutation' (50 requests/minute)
**Multi-Tenant**: ✅ Validates tenant access

**Processing**:
1. Apply rate limiting
2. Authenticate user (minLevel: 2)
3. Validate tenant access
4. Parse and validate request body
5. Validate required fields (name, category)
6. Create workflow object with defaults
7. Save to database (PLACEHOLDER)
8. Return created workflow summary

**Default Values Created**:
- `id`: UUID
- `tenantId`: From route
- `version`: "1.0.0"
- `createdBy`: user.id
- `createdAt`/`updatedAt`: Current time
- `active`: true (unless specified)
- `locked`: false
- `settings`: Default with 5min timeout, UTC timezone, no debug mode
- `errorHandling`: Stop on error, no notifications
- `retryPolicy`: Disabled
- `rateLimiting`: Disabled
- `executionLimits`: Memory 512MB, data 100MB

**Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "category": "string",
  "version": "1.0.0",
  "createdAt": "ISO string",
  "updatedAt": "ISO string",
  "active": boolean
}
```

**Error Responses**:
- 400: Bad Request (invalid JSON, missing required fields)
- 403: Forbidden (tenant access denied)
- 401: Unauthorized
- 500: Internal Server Error

---

#### Route 2: Execute Workflow

**Endpoint**: `POST /api/v1/{tenant}/workflows/{workflowId}/execute`

**File**: `/frontends/nextjs/src/app/api/v1/[tenant]/workflows/[workflowId]/execute/route.ts`

**Handler**:
```typescript
async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse>
```

**Route Parameters**:
- `tenant`: string
- `workflowId`: string

**Request Body**:
```json
{
  "triggerData": "object (optional)",
  "variables": "object (optional)",
  "request": {
    "method": "string (optional)",
    "headers": "object (optional)",
    "query": "object (optional)",
    "body": "object (optional)"
  }
}
```

**Authentication**: ✅ Level 1+
**Rate Limiting**: ✅ 'mutation' (50 requests/minute)
**Multi-Tenant**: ✅ Validates tenant access

**Processing**:
1. Apply rate limiting
2. Authenticate user
3. Validate tenant access
4. Parse and validate request body
5. Load workflow from database
6. Build execution context
7. Create trigger object (manual, api-triggered)
8. Execute workflow via engine
9. Return execution record

**Context Built**:
```typescript
{
  executionId: UUID,
  tenantId: tenant,
  userId: user.id,
  user: { id, email, level },
  trigger: { kind: 'manual', metadata: { startTime, triggeredBy: 'api' } },
  triggerData: from request,
  variables: from request,
  secrets: {} // TODO: Load from secrets manager,
  request: from body
}
```

**Response** (200):
```json
{
  "executionId": "uuid",
  "workflowId": "uuid",
  "status": "running | success | error",
  "state": { /* node execution states */ },
  "metrics": {
    "nodesExecuted": number,
    "successNodes": number,
    "failedNodes": number,
    "retriedNodes": number,
    "totalRetries": number,
    "peakMemory": number,
    "dataProcessed": number,
    "apiCallsMade": number
  },
  "startTime": "ISO string",
  "endTime": "ISO string",
  "duration": number,
  "error": { "message": string, "code": string } // Only if error
}
```

**Error Responses**:
- 400: Bad Request (invalid JSON, missing workflowId)
- 403: Forbidden (tenant access denied)
- 404: Not Found (workflow not found)
- 401: Unauthorized
- 500: Internal Server Error

---

### 3. Middleware

#### Authentication Middleware

**File**: `/frontends/nextjs/src/lib/middleware/auth-middleware.ts`

**Main Function**:
```typescript
async function authenticate(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<AuthResult>
```

**Options**:
- `minLevel`: 0-5 (default: 0) - Minimum permission level required
- `allowPublic`: boolean - Allow without authentication
- `customCheck`: (user) => boolean - Custom permission check

**Permission Levels**:
- 0: Public
- 1: User
- 2: Moderator
- 3: Admin
- 4: God
- 5: Supergod

**Usage in Workflow Routes**:
- List: `minLevel: 1` (users can list)
- Create: `minLevel: 2` (moderators only)
- Execute: `minLevel: 1` (users can execute)

**Returns**:
```typescript
{
  success: boolean,
  user?: CurrentUser,
  error?: NextResponse
}
```

#### Rate Limiting Middleware

**File**: `/frontends/nextjs/src/lib/middleware/rate-limit.ts`

**Predefined Limiters**:
- `login`: 5/min
- `register`: 3/min
- `list`: 100/min
- `mutation`: 50/min
- `public`: 1000/hour
- `bootstrap`: 1/hour

**Usage**:
```typescript
const limitResponse = applyRateLimit(request, 'mutation')
if (limitResponse) return limitResponse
```

**Storage**: In-memory (single process) - ⚠️ Not suitable for distributed deployments

**Multi-Tenant**: By IP address (not user-based)

---

## Database Integration

### DBAL Client

**File**: `/frontends/nextjs/src/lib/db-client.ts`

```typescript
const db = getDB() // Singleton instance
export const db = getDB()
```

**Current Status**: ⚠️ Legacy compatibility layer
**Pattern**: Wraps `getDBALClient()` with old adapter methods

**Expected Usage in Workflow Service**:
```typescript
// For implementing loadWorkflow():
const workflow = await db.workflows.read(workflowId)

// For implementing listExecutions():
const executions = await db.executions.list({
  filter: { workflowId, tenantId }
})
```

### Workflow Entity Schema

**File**: `/dbal/shared/api/schema/entities/core/workflow.yaml`

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | uuid | ✅ | Primary key, auto-generated |
| `tenantId` | uuid | ⚠️ Optional in YAML | **Must filter all queries** |
| `name` | string | ✅ | Max 255 chars |
| `description` | text | ❌ | Nullable |
| `nodes` | string | ✅ | Serialized JSON of node graph |
| `edges` | string | ✅ | Serialized JSON of connections |
| `enabled` | boolean | ✅ | Default: true |
| `version` | integer | ✅ | Default: 1 |
| `createdAt` | bigint | ❌ | Timestamp |
| `updatedAt` | bigint | ❌ | Timestamp |
| `createdBy` | uuid | ❌ | Foreign key to User |

**Indexes**:
- `tenantId` (filtering)
- `enabled` (query optimization)

**ACL**:
- Create: god, supergod
- Read: admin, god, supergod
- Update: god, supergod
- Delete: god, supergod

**⚠️ Note**: Current API routes allow `minLevel: 1` (users) to list/execute, but YAML schema restricts to admin+. This is a **permission mismatch** to resolve.

### Execution Record (In-Memory)

**Type**: `ExecutionRecord` (from `@metabuilder/workflow`)

**Fields**:
```typescript
{
  id: string,
  workflowId: string,
  tenantId: string,
  userId: string,
  triggeredBy: 'manual' | 'api' | 'scheduled' | etc,
  startTime: Date,
  endTime: Date,
  duration: number (ms),
  status: 'success' | 'error' | 'running',
  state: Record<string, NodeResult>,
  metrics: ExecutionMetrics,
  logs: LogEntry[],
  error?: { message: string, code: string }
}
```

**Current Storage**: ⚠️ Placeholder in `saveExecutionRecord()` - logs to console

**Integration Point**: Need DBAL entity for `executions` with similar fields

---

## Current Error Handling Patterns

### Service Level (workflow-service.ts)

1. **Node Executor Not Found**:
   - Throws Error with message
   - Caught in try-catch
   - Returns ExecutionRecord with error status

2. **Node Execution Error**:
   - Caught in node executor callback
   - Returns NodeResult with error status
   - Execution continues

3. **Save Failure**:
   - Caught in try-catch
   - Logged but doesn't stop execution
   - Prevents data loss

### Route Level (execute/route.ts)

1. **Rate Limit Exceeded**: 429 Too Many Requests
2. **Authentication Failed**: 401 Unauthorized
3. **Tenant Access Denied**: 403 Forbidden
4. **Invalid JSON**: 400 Bad Request
5. **Workflow Not Found**: 404 Not Found
6. **Execution Error**: 500 Internal Server Error (with message)

### Validation

1. **workflowId Required**: Checked in route handler
2. **Body JSON Valid**: Caught in try-catch
3. **Tenant Access**: Verified before processing
4. **User Level**: Checked by auth middleware

---

## Multi-Tenant Support Status

### ✅ Implemented

1. **Route Parameters**: All routes include `{tenant}`
2. **Context Inclusion**: tenantId passed to execution engine
3. **Authentication Check**: User.tenantId must match route tenant
4. **Permission Levels**: Checked against minLevel
5. **DAGExecutor Integration**: Context passed through

### ⚠️ Needs Implementation

1. **Database Queries**: DBAL methods not yet implemented
2. **Execution Records**: No database storage for execution history
3. **Workflow Loading**: Returns null placeholder
4. **Filtering**: DBAL operations need `filter: { tenantId }`

### ❌ Missing

1. **Cross-Tenant Audit**: No logging of cross-tenant attempts
2. **Secrets Per Tenant**: No secrets manager integration
3. **Execution History**: Not persisted to database
4. **Rate Limit Per Tenant**: Currently per IP (should be per tenant+IP)

---

## Integration Points for WorkflowLoaderV2

### 1. Workflow Loading
**Location**: `WorkflowExecutionEngine.loadWorkflow()`

**Current Code**:
```typescript
async loadWorkflow(workflowId: string, tenantId: string): Promise<WorkflowDefinition | null> {
  try {
    // Placeholder - returns null
    return null
  } catch (error) { }
}
```

**Integration Required**:
- Load from DBAL workflows entity
- Filter by tenantId
- Validate against `workflow.schema.json`
- Return WorkflowDefinition type

**WorkflowLoaderV2 Role**:
- Parse workflow definition
- Validate against schema
- Resolve node types
- Inject context/secrets

---

### 2. Validation Layer
**Location**: Between loading and execution

**Current Gap**: No validation between load and execute

**Integration Required**:
- Call WorkflowLoaderV2.validate()
- Return validation errors to client
- Prevent invalid workflows from executing

**Error Response** (400):
```json
{
  "error": "Validation failed",
  "details": [
    { "path": "nodes[0]", "message": "Unknown node type" }
  ]
}
```

---

### 3. Node Resolution
**Location**: `WorkflowExecutionEngine.executeWorkflow()` -> node executor callback

**Current Code**:
```typescript
const executor = this.registry.get(node.nodeType)
if (!executor) {
  throw new Error(`No executor registered for node type: ${node.nodeType}`)
}
```

**Integration Required**:
- WorkflowLoaderV2 should pre-resolve node types
- Provide executor mapping
- Cache resolved nodes
- Fail fast on invalid node types

---

### 4. Execution Context
**Location**: `POST /api/v1/{tenant}/workflows/{workflowId}/execute`

**Current Code**:
```typescript
const context: WorkflowContext = {
  executionId,
  tenantId: tenant,
  userId: user.id,
  // ... other fields
}
```

**Integration Required**:
- WorkflowLoaderV2 validates context structure
- Ensures all required fields present
- Type-checks variables
- Validates secrets accessibility

---

### 5. Error Handling
**Location**: Both service and routes

**Current Gap**: Generic error messages

**Integration Required**:
- WorkflowLoaderV2 provides specific error codes
- Maps to appropriate HTTP status codes
- Includes validation details in response

---

## Dependency Map

```
frontends/nextjs/src/app/api/v1/[tenant]/workflows/
  ↓
frontends/nextjs/src/lib/workflow/workflow-service.ts
  ↓
@metabuilder/workflow (external package)
  ├─ DAGExecutor
  ├─ NodeExecutorRegistry
  └─ Types (WorkflowDefinition, etc)
  ↓
frontends/nextjs/src/lib/middleware/
  ├─ auth-middleware.ts
  └─ rate-limit.ts
  ↓
frontends/nextjs/src/lib/db-client.ts (DBAL)
  ↓
dbal/shared/api/schema/entities/core/workflow.yaml
  ↓
schemas/package-schemas/workflow.schema.json
```

---

## File Inventory

### Service Files
- `/frontends/nextjs/src/lib/workflow/workflow-service.ts` (336 lines)
- `/frontends/nextjs/src/lib/workflow/index.ts` (40 lines)

### API Routes
- `/frontends/nextjs/src/app/api/v1/[tenant]/workflows/route.ts` (314 lines)
- `/frontends/nextjs/src/app/api/v1/[tenant]/workflows/[workflowId]/execute/route.ts` (178 lines)

### Middleware
- `/frontends/nextjs/src/lib/middleware/auth-middleware.ts` (172 lines)
- `/frontends/nextjs/src/lib/middleware/rate-limit.ts` (316 lines)

### Database
- `/frontends/nextjs/src/lib/db-client.ts` (36 lines, legacy wrapper)
- `/frontends/nextjs/src/lib/db/dbal-client.ts` (245 lines, adapter)

### Schema
- `/dbal/shared/api/schema/entities/core/workflow.yaml` (76 lines)
- `/schemas/package-schemas/workflow.schema.json` (128 lines)

### Types
- `/frontends/nextjs/src/lib/workflow/index.ts` (re-exports from @metabuilder/workflow)

---

## Current Limitations and TODOs

### High Priority (Blocks Execution)

1. **DBAL Methods Unimplemented** ⚠️
   ```
   Files: workflow-service.ts
   Methods: loadWorkflow(), saveExecutionRecord(),
           getExecutionStatus(), listExecutions()
   Impact: Returns null/empty instead of real data
   ```

2. **No Execution Storage** ⚠️
   ```
   Files: workflow-service.ts (saveExecutionRecord)
   Impact: Execution history not persisted
   ```

3. **Placeholder Node Executor Registration** ⚠️
   ```
   Files: workflow-service.ts (initializeWorkflowEngine)
   Impact: Built-in node types not registered
   ```

### Medium Priority (Reduces Functionality)

4. **No Secrets Manager Integration** ⚠️
   ```
   Files: execute/route.ts (context.secrets = {})
   Impact: Workflows can't access secure credentials
   ```

5. **Missing Abort Logic** ⚠️
   ```
   Files: workflow-service.ts (abortExecution)
   Impact: Can't stop running workflows
   ```

6. **No Execution Metrics Collection** ⚠️
   ```
   Files: workflow-service.ts (metrics.dataProcessed, apiCallsMade)
   Impact: Plugin metrics not tracked
   ```

### Lower Priority (Improvements)

7. **Distributed Rate Limiting** ⚠️
   ```
   Files: rate-limit.ts
   Current: In-memory store
   Needed: Redis for multi-instance deployments
   ```

8. **Per-Tenant Rate Limiting** ⚠️
   ```
   Files: rate-limit.ts
   Current: IP-based limiting
   Needed: Tenant-aware rate limiting
   ```

9. **No Workflow Versioning** ⚠️
   ```
   Schema has version field but not used
   ```

10. **Permission Mismatch** ⚠️
    ```
    API allows minLevel: 1 to create/execute
    YAML schema restricts to admin+ (minLevel: 3)
    ```

---

## Integration Roadmap

### Phase 1: DBAL Integration (1-2 hours)

**Goal**: Connect service to actual database

**Steps**:
1. Implement `loadWorkflow()` using DBAL
2. Implement `saveExecutionRecord()` using DBAL
3. Create `Execution` entity in `/dbal/shared/api/schema/entities/`
4. Generate Prisma schema
5. Implement `getExecutionStatus()` and `listExecutions()`

**Files to Modify**:
- `workflow-service.ts` (5 methods)
- `dbal/shared/api/schema/entities/core/execution.yaml` (create new)

---

### Phase 2: WorkflowLoaderV2 Integration (2-3 hours)

**Goal**: Add validation and resolution layer

**Steps**:
1. Create WorkflowLoaderV2 class
2. Implement schema validation
3. Add node type resolution
4. Integrate into `executeWorkflow()`
5. Return validation errors to client

**Files to Modify**:
- Create: `/frontends/nextjs/src/lib/workflow/workflow-loader.ts`
- Modify: `execute/route.ts` (add validation step)
- Modify: `workflow-service.ts` (use loader)

---

### Phase 3: Execution Recording (1-2 hours)

**Goal**: Persist execution details

**Steps**:
1. Implement full `saveExecutionRecord()`
2. Collect node execution logs
3. Store metrics in database
4. Create execution history list endpoint

**Files to Modify**:
- `workflow-service.ts` (saveExecutionRecord, metrics collection)

---

### Phase 4: Advanced Features (3-5 hours)

**Goal**: Complete workflow management

**Steps**:
1. Implement abort logic
2. Add secrets manager integration
3. Add distributed rate limiting
4. Add execution filtering API
5. Add workflow versioning support

**Files to Modify**:
- `workflow-service.ts` (abortExecution)
- `initializeWorkflowEngine()` (register all executors)
- Create: `/frontends/nextjs/src/lib/secrets/secrets-manager.ts`
- Modify: `rate-limit.ts` (Redis backend)

---

## Type System Integration

### Imported Types from @metabuilder/workflow

```typescript
// From workflow/executor/ts/types/
export type WorkflowDefinition
export type WorkflowContext
export type ExecutionState
export type NodeResult
export type ExecutionRecord
export type ExecutionMetrics
export type LogEntry
export type WorkflowNode
export type WorkflowTrigger
export type WorkflowSettings
export type ErrorHandlingPolicy
export type RetryPolicy
export type RateLimitPolicy
export type ValidationResult

// From workflow/executor/ts/registry/
export type BuiltInNodeType
export type INodeExecutor
```

### Types Needed in Next.js

All types above are re-exported in:
- `/frontends/nextjs/src/lib/workflow/index.ts`

### Type Mismatch Issues

1. **Workflow Storage**: API creates detailed workflow object, but YAML schema stores as strings
   - `nodes` field: string (should be parsed JSON)
   - `edges` field: string (should be parsed JSON)

2. **ExecutionRecord**: No DBAL entity yet
   - Needs creation in `/dbal/shared/api/schema/entities/`

---

## Security Considerations

### ✅ Implemented

1. **Multi-tenant isolation**: Route checks user.tenantId vs route tenant
2. **Authentication**: All routes require auth (except explicit allowPublic)
3. **Permission levels**: Enforced via middleware
4. **Rate limiting**: Prevents abuse
5. **Input validation**: JSON parsing with error handling

### ⚠️ Needs Review

1. **Workflow access control**: Should check workflow.tenantId == user.tenantId
2. **Secrets visibility**: Context.secrets not filled (no secrets manager)
3. **Execution access**: Can user view other users' execution records?
4. **Node executor safety**: Are plugins sandboxed?

---

## Performance Considerations

### Current Design

1. **Synchronous execution**: Route waits for workflow to complete
   - OK for short workflows (< 10 seconds)
   - Bad for long workflows

2. **In-memory rate limiting**: Uses Map storage
   - OK for single-instance deployments
   - Bad for distributed setups

3. **No execution caching**: Loads workflow from DB every time
   - Should cache frequently-used workflows

### Recommendations

1. Implement async execution with job queue
2. Add workflow result caching
3. Add execution progress streaming (WebSocket)
4. Move to Redis for rate limiting

---

## Testing Strategy

### Unit Tests Needed

- `workflow-service.ts`: Test execution flow, error handling
- `loadWorkflow()`: Test DBAL calls, filtering
- `executeWorkflow()`: Test DAG execution, metrics collection

### Integration Tests Needed

- `GET /api/v1/{tenant}/workflows`: Test listing, filtering, pagination
- `POST /api/v1/{tenant}/workflows`: Test creation, defaults
- `POST /api/v1/{tenant}/workflows/{id}/execute`: Test execution, error handling

### E2E Tests Needed

- Complete workflow creation to execution flow
- Error scenarios: invalid node types, tenant mismatch
- Permission scenarios: different user levels
- Rate limiting: verify 429 responses

---

## Summary

The Next.js workflow service provides a solid foundation for workflow execution with proper:
- ✅ Authentication and authorization
- ✅ Rate limiting
- ✅ Multi-tenant structure
- ✅ Error handling framework

However, it requires:
- 🔄 DBAL integration (database connectivity)
- 🔄 WorkflowLoaderV2 (validation layer)
- 🔄 Execution persistence (storage)
- 🔄 Secrets management
- 🔄 Node executor registration

The integration roadmap above provides a phased approach to complete the implementation.
