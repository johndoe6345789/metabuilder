# DAG Executor Technical Reference

**Date**: 2026-01-22
**Version**: 3.0.0
**For**: Developers implementing frontend executor integration

---

## Table of Contents

1. [API Reference](#api-reference)
2. [Code Examples](#code-examples)
3. [Type Definitions](#type-definitions)
4. [Configuration Reference](#configuration-reference)
5. [Error Codes & Messages](#error-codes--messages)
6. [Troubleshooting Guide](#troubleshooting-guide)

---

## API Reference

### DAGExecutor Class

#### Constructor

```typescript
constructor(
  executionId: string,
  workflow: WorkflowDefinition,
  context: WorkflowContext,
  nodeExecutor: NodeExecutorFn
)
```

**Parameters**:
- `executionId`: Unique identifier for this execution run
- `workflow`: Complete workflow definition with nodes and connections
- `context`: Execution context including tenant, user, trigger data
- `nodeExecutor`: Callback function to execute individual nodes

**Example**:
```typescript
const executor = new DAGExecutor(
  'exec_12345',
  workflow,
  {
    executionId: 'exec_12345',
    tenantId: 'acme',
    userId: 'user_789',
    user: { id: 'user_789', email: 'user@acme.com', level: 2 },
    trigger: workflow.triggers[0],
    triggerData: { message: 'hello' },
    variables: {},
    secrets: { API_KEY: '...' }
  },
  nodeExecutor
)
```

#### execute()

```typescript
async execute(): Promise<ExecutionState>
```

**Returns**: Object mapping node IDs to their results

**Throws**:
- Error if workflow is invalid
- Error if critical node fails (depending on error policy)

**Example**:
```typescript
try {
  const state = await executor.execute()
  console.log('Execution completed successfully')
  console.log(state)
  // {
  //   "nodeA": { status: 'success', output: {...}, timestamp: 1234567890 },
  //   "nodeB": { status: 'success', output: {...}, timestamp: 1234567891 }
  // }
} catch (error) {
  console.error('Workflow failed:', error.message)
}
```

#### getMetrics()

```typescript
getMetrics(): ExecutionMetrics
```

**Returns**: Execution performance metrics

**Example**:
```typescript
const metrics = executor.getMetrics()
console.log(`Executed ${metrics.nodesExecuted} nodes in ${metrics.duration}ms`)
console.log(`Success rate: ${(metrics.successNodes / metrics.nodesExecuted * 100).toFixed(1)}%`)
```

#### getState()

```typescript
getState(): ExecutionState
```

**Returns**: Current execution state (can be called mid-execution)

#### abort()

```typescript
abort(): void
```

**Effect**: Stops execution at next available checkpoint

**Example**:
```typescript
setTimeout(() => {
  if (!executor.isComplete()) {
    executor.abort()
  }
}, 5000)
```

#### isComplete()

```typescript
isComplete(): boolean
```

**Returns**: true if queue is empty or execution was aborted

---

### WorkflowValidator Class

#### validate()

```typescript
validate(workflow: WorkflowDefinition): WorkflowValidationResult
```

**Returns**: Validation result with errors and warnings arrays

**Example**:
```typescript
const validator = new WorkflowValidator()
const result = validator.validate(workflow)

if (!result.valid) {
  console.error('Validation failed:')
  result.errors.forEach(error => {
    console.error(`  ${error.path}: ${error.message} [${error.code}]`)
  })
}

if (result.warnings.length > 0) {
  console.warn('Validation warnings:')
  result.warnings.forEach(warn => {
    console.warn(`  ${warn.path}: ${warn.message}`)
  })
}
```

**Validation Result**:
```typescript
interface WorkflowValidationResult {
  valid: boolean                    // true if no errors
  errors: ValidationError[]         // Critical issues
  warnings: ValidationError[]       // Non-critical issues
}

interface ValidationError {
  path: string                      // Location in workflow (e.g., "nodes[0].id")
  message: string                   // Human-readable error message
  severity: 'error' | 'warning'     // Error level
  code: string                      // Machine-readable error code
}
```

---

### NodeExecutorRegistry Class

#### register()

```typescript
register(
  nodeType: string,
  executor: INodeExecutor,
  plugin?: NodeExecutorPlugin
): void
```

**Example**:
```typescript
const registry = getNodeExecutorRegistry()
registry.register('http-request', httpRequestExecutor, {
  nodeType: 'http-request',
  version: '1.0.0',
  metadata: {
    description: 'Make HTTP requests',
    category: 'integration',
    icon: 'globe'
  }
})
```

#### registerBatch()

```typescript
registerBatch(executors: Array<{
  nodeType: string
  executor: INodeExecutor
  plugin?: NodeExecutorPlugin
}>): void
```

**Example**:
```typescript
registry.registerBatch([
  { nodeType: 'http-request', executor: httpRequestExecutor },
  { nodeType: 'dbal-read', executor: dbalReadExecutor },
  { nodeType: 'condition', executor: conditionExecutor }
])
```

#### get()

```typescript
get(nodeType: string): INodeExecutor | undefined
```

**Returns**: Executor for node type, or undefined if not registered

#### execute()

```typescript
async execute(
  nodeType: string,
  node: WorkflowNode,
  context: WorkflowContext,
  state: ExecutionState
): Promise<NodeResult>
```

**Validates** node before execution, throws error if invalid

#### listExecutors()

```typescript
listExecutors(): string[]
```

**Returns**: Array of all registered node types

#### listPlugins()

```typescript
listPlugins(): NodeExecutorPlugin[]
```

**Returns**: Array of all registered plugins with metadata

---

### TemplateEngine Functions

#### interpolateTemplate()

```typescript
interpolateTemplate(template: any, context: TemplateContext): any
```

**Recursively processes** objects and arrays, interpolating string values

**Example**:
```typescript
const result = interpolateTemplate({
  to: '{{ $context.user.email }}',
  subject: 'Hello {{ $json.name }}',
  timestamp: '{{ $utils.now() }}',
  data: {
    status: '{{ $json.status }}'
  }
}, {
  context: { user: { email: 'admin@acme.com' } },
  json: { name: 'John', status: 'active' }
})

// Result:
// {
//   to: 'admin@acme.com',
//   subject: 'Hello John',
//   timestamp: '2026-01-22T10:30:00.000Z',
//   data: { status: 'active' }
// }
```

#### evaluateTemplate()

```typescript
evaluateTemplate(expression: string, context: TemplateContext): any
```

**Evaluates** a single expression and returns result

**Example**:
```typescript
const value = evaluateTemplate('{{ $json.count + 10 }}', {
  json: { count: 5 }
})
// Result: 15
```

---

## Code Examples

### Example 1: Execute Simple Workflow

```typescript
import { DAGExecutor, WorkflowValidator } from '@metabuilder/workflow'

const workflow = {
  id: 'wf_123',
  name: 'Simple Pipeline',
  version: '1.0.0',
  tenantId: 'acme',
  createdBy: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  locked: false,
  tags: [],
  category: 'automation',
  settings: { timezone: 'UTC', executionTimeout: 3600, saveExecutionProgress: true },
  nodes: [
    {
      id: 'trigger',
      name: 'Manual Trigger',
      type: 'trigger',
      typeVersion: 1,
      nodeType: 'manual',
      position: [100, 100],
      parameters: {},
      inputs: [],
      outputs: [{ name: 'main', type: 'main', maxConnections: 1, dataTypes: ['object'], required: true }],
      credentials: {},
      disabled: false,
      skipOnFail: false,
      alwaysOutputData: true,
      maxTries: 1,
      waitBetweenTries: 0,
      continueOnError: false,
      onError: 'stopWorkflow',
      metadata: {}
    },
    {
      id: 'log_data',
      name: 'Log Data',
      type: 'operation',
      typeVersion: 1,
      nodeType: 'function',
      position: [300, 100],
      parameters: { code: 'console.log($json); return $json;' },
      inputs: [{ name: 'main', type: 'main', maxConnections: 10, dataTypes: ['object'], required: true }],
      outputs: [{ name: 'main', type: 'main', maxConnections: 1, dataTypes: ['object'], required: true }],
      credentials: {},
      disabled: false,
      skipOnFail: false,
      alwaysOutputData: true,
      maxTries: 1,
      waitBetweenTries: 0,
      continueOnError: false,
      onError: 'stopWorkflow',
      metadata: {}
    }
  ],
  connections: {
    trigger: {
      main: {
        '0': [{ node: 'log_data', type: 'main', index: 0 }]
      }
    }
  },
  triggers: [],
  variables: {},
  errorHandling: { default: 'stopWorkflow', errorNotification: false, notifyChannels: [] },
  retryPolicy: { enabled: false, maxAttempts: 1, backoffType: 'exponential', initialDelay: 1000, maxDelay: 60000, retryableErrors: [], retryableStatusCodes: [] },
  rateLimiting: { enabled: false, key: 'global' },
  credentials: [],
  metadata: {},
  executionLimits: { maxExecutionTime: 3600, maxMemoryMb: 512, maxDataSizeMb: 100, maxArrayItems: 1000 },
  multiTenancy: { enforced: true, tenantIdField: 'tenantId', restrictNodeTypes: [], allowCrossTenantAccess: false, auditLogging: true },
  versionHistory: []
}

// Validate
const validator = new WorkflowValidator()
const validation = validator.validate(workflow)
if (!validation.valid) {
  throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
}

// Execute
const context = {
  executionId: 'exec_1',
  tenantId: 'acme',
  userId: 'user_1',
  user: { id: 'user_1', email: 'user@acme.com', level: 2 },
  trigger: { nodeId: 'trigger', kind: 'manual', enabled: true, metadata: {} },
  triggerData: { input: 'test' },
  variables: {},
  secrets: {}
}

async function nodeExecutor(nodeId, workflow, context, state) {
  const node = workflow.nodes.find(n => n.id === nodeId)
  return {
    status: 'success',
    output: { message: `Executed ${node.name}` },
    timestamp: Date.now()
  }
}

const executor = new DAGExecutor('exec_1', workflow, context, nodeExecutor)
const finalState = await executor.execute()
const metrics = executor.getMetrics()

console.log('Execution metrics:', metrics)
console.log('Final state:', finalState)
```

### Example 2: Handle Node Execution with Registry

```typescript
import { getNodeExecutorRegistry, registerBuiltInExecutors } from '@metabuilder/workflow'

// Initialize
registerBuiltInExecutors()
const registry = getNodeExecutorRegistry()

// Define node executor callback
async function nodeExecutor(nodeId, workflow, context, state) {
  const node = workflow.nodes.find(n => n.id === nodeId)
  if (!node) throw new Error(`Node not found: ${nodeId}`)

  // Get executor from registry
  const executor = registry.get(node.type)
  if (!executor) {
    return {
      status: 'error',
      error: `No executor registered for node type: ${node.type}`,
      timestamp: Date.now()
    }
  }

  try {
    // Execute node using registered executor
    return await registry.execute(node.type, node, context, state)
  } catch (error) {
    return {
      status: 'error',
      error: String(error),
      errorCode: error.code,
      timestamp: Date.now()
    }
  }
}

// Now create and execute workflow
const executor = new DAGExecutor(executionId, workflow, context, nodeExecutor)
const state = await executor.execute()
```

### Example 3: Handle Errors and Retries

```typescript
// Workflow node with retry configuration
{
  id: 'api_call',
  name: 'Call External API',
  type: 'http-request',
  parameters: {
    url: 'https://api.example.com/data',
    method: 'GET'
  },
  maxTries: 3,
  retryPolicy: {
    enabled: true,
    maxAttempts: 3,
    backoffType: 'exponential',
    initialDelay: 1000,
    maxDelay: 30000,
    retryableErrors: ['TIMEOUT', 'TEMPORARY_FAILURE'],
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  },
  onError: 'continueErrorOutput'  // Route to error port on final failure
}

// Error routing:
{
  connections: {
    api_call: {
      main: {
        '0': [
          { node: 'process_data', type: 'main', index: 0 }
        ]
      },
      error: {
        '0': [
          { node: 'handle_error', type: 'main', index: 0 }
        ]
      }
    }
  }
}
```

### Example 4: Template Interpolation

```typescript
import { interpolateTemplate } from '@metabuilder/workflow'

// Workflow node using templates
{
  id: 'send_email',
  type: 'email-send',
  parameters: {
    to: '{{ $context.user.email }}',
    cc: '{{ $json.reviewers[0].email }}',
    subject: 'Status Update: {{ $json.status }}',
    body: `
Hello {{ $json.recipientName }},

Your request {{ $json.requestId }} is now {{ $json.status }}.

Details:
- Submitted: {{ $steps.api_call.output.createdAt }}
- Updated: {{ $utils.now() }}
- Total cost: ${{ $json.cost + 0.00 }}

Best regards,
{{ $context.user.name }}`
  }
}

// Execution context
const context = {
  executionId: 'exec_1',
  tenantId: 'acme',
  userId: 'user_1',
  user: { id: 'user_1', email: 'admin@acme.com', name: 'Admin User', level: 2 },
  trigger: { nodeId: 'trigger', kind: 'manual', enabled: true, metadata: {} },
  triggerData: {
    requestId: 'req_123',
    status: 'approved',
    recipientName: 'John',
    reviewers: [{ email: 'reviewer@acme.com' }],
    cost: 99.99
  },
  variables: {},
  secrets: {}
}

// Interpolate parameters
const interpolated = interpolateTemplate(node.parameters, {
  context,
  json: context.triggerData,
  steps: {
    api_call: {
      output: { createdAt: '2026-01-22T10:30:00Z' }
    }
  },
  utils: buildDefaultUtilities()
})

// Result:
// {
//   to: 'admin@acme.com',
//   cc: 'reviewer@acme.com',
//   subject: 'Status Update: approved',
//   body: 'Hello John,\n\nYour request req_123 is now approved...'
// }
```

### Example 5: Conditional Routing

```typescript
// Workflow with conditional branching
{
  nodes: [
    {
      id: 'check_status',
      type: 'operation',
      parameters: { status: '{{ $json.status }}' }
    },
    {
      id: 'send_approval_email',
      type: 'email-send',
      parameters: { to: 'approver@acme.com' }
    },
    {
      id: 'send_rejection_email',
      type: 'email-send',
      parameters: { to: 'requester@acme.com' }
    }
  ],
  connections: {
    check_status: {
      main: {
        '0': [
          {
            node: 'send_approval_email',
            type: 'main',
            index: 0,
            conditional: true,
            condition: '{{ $json.status === "approved" }}'  // <-- Conditional!
          },
          {
            node: 'send_rejection_email',
            type: 'main',
            index: 0,
            conditional: true,
            condition: '{{ $json.status === "rejected" }}'
          }
        ]
      }
    }
  }
}

// During routing, executor evaluates conditions:
if (target.conditional && target.condition) {
  const shouldRoute = evaluateTemplate(target.condition, {
    context,
    json: state.check_status.output
  })
  if (!shouldRoute) {
    console.log('Conditional route blocked')
    return
  }
}

// Queue next node if condition evaluates to truthy
```

---

## Type Definitions

### WorkflowDefinition

```typescript
interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  version: string
  tenantId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  active: boolean
  locked: boolean
  tags: string[]
  category: 'automation' | 'integration' | 'business-logic' | 'data-transformation' | 'notification' | 'approval' | 'other'
  settings: WorkflowSettings
  nodes: WorkflowNode[]
  connections: ConnectionMap
  triggers: WorkflowTrigger[]
  variables: Record<string, WorkflowVariable>
  errorHandling: ErrorHandlingPolicy
  retryPolicy: RetryPolicy
  rateLimiting: RateLimitPolicy
  credentials: CredentialBinding[]
  metadata: Record<string, any>
  executionLimits: ExecutionLimits
  multiTenancy: MultiTenancyPolicy
  versionHistory: VersionHistoryEntry[]
}
```

### WorkflowNode

```typescript
interface WorkflowNode {
  id: string
  name: string
  description?: string
  type: 'trigger' | 'operation' | 'action' | 'logic' | 'transformer' | 'iterator' | 'parallel' | 'wait' | 'webhook' | 'schedule'
  typeVersion: number
  nodeType: string
  position: [number, number]
  size?: [number, number]
  parameters: Record<string, any>
  parameterSchema?: Record<string, any>
  inputs: NodePort[]
  outputs: NodePort[]
  credentials: Record<string, CredentialRef>
  disabled: boolean
  skipOnFail: boolean
  alwaysOutputData: boolean
  retryPolicy?: RetryPolicy
  timeout?: number
  maxTries: number
  waitBetweenTries: number
  continueOnError: boolean
  onError: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput' | 'retry'
  errorOutput?: string
  notes?: string
  notesInFlow: boolean
  color?: string
  icon?: string
  metadata: Record<string, any>
}
```

### ExecutionState

```typescript
type ExecutionState = {
  [nodeId: string]: NodeResult
}

interface NodeResult {
  status: 'success' | 'error' | 'skipped' | 'pending'
  output?: any
  error?: string
  errorCode?: string
  timestamp: number
  duration?: number
  retries?: number
  inputData?: any
  outputData?: any
}
```

### ExecutionContext

```typescript
interface WorkflowContext {
  executionId: string
  tenantId: string
  userId: string
  user: {
    id: string
    email: string
    level: number
  }
  trigger: WorkflowTrigger
  triggerData: Record<string, any>
  variables: Record<string, any>
  secrets: Record<string, string>
  request?: {
    method: string
    headers: Record<string, string>
    query: Record<string, any>
    body: Record<string, any>
  }
}
```

---

## Configuration Reference

### Retry Policy Configuration

```typescript
interface RetryPolicy {
  enabled: boolean
  maxAttempts: number
  backoffType: 'linear' | 'exponential' | 'fibonacci'
  initialDelay: number        // ms
  maxDelay: number            // ms
  retryableErrors: string[]
  retryableStatusCodes: number[]
}
```

**Examples**:

```typescript
// Conservative: linear backoff
{
  enabled: true,
  maxAttempts: 2,
  backoffType: 'linear',
  initialDelay: 500,
  maxDelay: 5000,
  retryableErrors: ['TIMEOUT'],
  retryableStatusCodes: [408, 504]
}

// Aggressive: exponential backoff
{
  enabled: true,
  maxAttempts: 5,
  backoffType: 'exponential',
  initialDelay: 100,
  maxDelay: 60000,
  retryableErrors: ['TIMEOUT', 'TEMPORARY_FAILURE', 'RATE_LIMIT'],
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
}
```

### Error Handling Policies

```typescript
type ErrorPolicy =
  | 'stopWorkflow'           // Abort immediately
  | 'continueRegularOutput'  // Continue with empty output
  | 'continueErrorOutput'    // Route to error port
  | 'skipNode'               // Skip dependent nodes
```

**Decision Tree**:
```
Node executes
    │
    ├─ Success → Route to main port
    │
    └─ Error
        │
        ├─ Is retryable?
        │   ├─ Yes, attempts left → Retry with backoff
        │   │   │
        │   │   ├─ Success → Route to main port
        │   │   │
        │   │   └─ Failed (attempts exhausted) → Apply error policy
        │   │
        │   └─ No → Apply error policy immediately
        │
        └─ Apply error policy
            ├─ stopWorkflow → Abort execution
            ├─ continueErrorOutput → Route to error port
            ├─ continueRegularOutput → Route to main port with empty output
            └─ skipNode → Don't queue dependents
```

---

## Error Codes & Messages

### Validation Errors

| Code | Message | Severity | Fix |
|------|---------|----------|-----|
| `DUPLICATE_NODE_NAME` | Duplicate node name | error | Rename node |
| `MISSING_NODE_ID` | Node id is required | error | Add unique ID |
| `MISSING_NODE_NAME` | Node name is required | error | Add human-readable name |
| `MISSING_NODE_TYPE` | Node type is required | error | Specify node type |
| `INVALID_CONNECTION_SOURCE` | Source node not found | error | Fix connection source |
| `INVALID_CONNECTION_TARGET_NODE` | Target node not found | error | Fix connection target |
| `INVALID_OUTPUT_TYPE` | Output type must be "main" or "error" | error | Use valid port type |
| `OBJECT_SERIALIZATION_FAILURE` | Parameter value is "[object Object]" | error | Properly serialize object |
| `EXCESSIVE_PARAMETER_NESTING` | Parameters nested too deeply | error | Flatten parameter structure |
| `TIMEOUT_TOO_SHORT` | Node timeout < 1000ms | warning | Increase timeout |
| `TIMEOUT_TOO_LONG` | Node timeout > 3600000ms | warning | Decrease timeout |
| `MISSING_TENANT_ID` | Workflow must have tenantId | error | Add tenantId |
| `GLOBAL_SCOPE_VARIABLE` | Global-scope variables not recommended | warning | Use 'workflow' scope |
| `REGEX_COMPLEXITY_WARNING` | Regex pattern too complex (ReDoS risk) | warning | Simplify pattern |

### Execution Errors

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| `NODE_NOT_FOUND` | Node not found: {nodeId} | Referenced node doesn't exist | Check workflow structure |
| `EXECUTOR_NOT_REGISTERED` | No executor for node type: {type} | Node type not registered | Register executor |
| `VALIDATION_FAILED` | Node validation failed | Node parameters invalid | Fix parameters |
| `EXECUTION_TIMEOUT` | Execution timeout exceeded | Workflow took too long | Increase timeout |
| `MAX_RETRIES_EXCEEDED` | Max retries exceeded: {nodeId} | Too many failures | Check configuration |
| `INVALID_CONDITION` | Failed to evaluate condition | Malformed expression | Fix expression syntax |

---

## Troubleshooting Guide

### Issue: Workflow hangs indefinitely

**Symptoms**: No progress, queue appears stuck

**Debug**:
```typescript
const metrics = executor.getMetrics()
console.log(`Executed: ${metrics.nodesExecuted}`)
console.log(`Active nodes: ${executor._activeNodes.size}`)  // Access internal state
console.log(`Queue size: ${executor._queue.size()}`)
```

**Common Causes**:
1. **Circular connection** - Workflow has cycle
   - Fix: Verify DAG property (no cycles)
2. **Waiting for impossible dependency** - Skipped input node
   - Fix: Check skipOnFail conditions
3. **Error in executor callback** - Infinite retry
   - Fix: Check if error is retryable

### Issue: Incorrect execution order

**Symptoms**: Nodes execute in unexpected sequence

**Debug**:
```typescript
// Enable detailed logging
const originalLog = console.log
console.log = function(...args) {
  if (args[0]?.includes('[')) {
    originalLog(...args)  // Log DAG executor messages
  }
}
```

**Common Causes**:
1. **Priority queue bug** - Check dequeue order
2. **Incomplete dependency check** - Multiple input sources
3. **Race condition** - Node marked active before queued

**Solution**:
```typescript
// Print execution trace
const trace = []
const nodeExecutor = async (nodeId, workflow, context, state) => {
  trace.push(nodeId)
  // ... execute
}

await executor.execute()
console.log('Execution order:', trace)
```

### Issue: Memory leak during execution

**Symptoms**: Memory grows continuously

**Debug**:
```typescript
const metrics = executor.getMetrics()
console.log(`Peak memory: ${metrics.peakMemory}MB`)
console.log(`State size: ${JSON.stringify(executor.getState()).length} bytes`)
```

**Common Causes**:
1. **Large output accumulation** - State grows unbounded
2. **Retry loop creating objects** - Memory not released
3. **Template engine leaking** - Regex not garbage collected

**Solution**:
```typescript
// Limit state size
if (JSON.stringify(state).length > 100 * 1024 * 1024) {  // 100MB
  throw new Error('State exceeded 100MB limit')
}

// Clear old state after processing
state[nodeId] = { /* only keep current result */ }
```

### Issue: Template interpolation not working

**Symptoms**: `{{ $json.field }}` appears in output unchanged

**Debug**:
```typescript
const result = interpolateTemplate('{{ $json.test }}', {
  json: { test: 'value' }
})
console.log('Result:', result)  // Should be 'value'

// Check context
console.log('Context:', { json: { test: 'value' } })
```

**Common Causes**:
1. **Context not provided** - Missing from `TemplateContext`
2. **Wrong key name** - Typo in variable reference
3. **Null/undefined value** - Returns undefined

**Solution**:
```typescript
// Always provide all context objects
const context: TemplateContext = {
  context: { user: { email: '...' } },
  json: triggerData,
  env: process.env,
  steps: state,
  utils: buildDefaultUtilities()
}

// Check for undefined
const value = evaluateTemplate('{{ $json?.field }}', context) || 'default'
```

### Issue: Error port not being routed

**Symptoms**: Error output not reaching error handler

**Debug**:
```typescript
// Check node.onError policy
console.log('Error policy:', node.onError)

// Check error connections
const errorConnections = workflow.connections[nodeId]?.error
console.log('Error routes:', errorConnections)

// Check if error route is being queued
// Add logging to _routeErrorOutput
```

**Common Causes**:
1. **Error policy is 'stopWorkflow'** - Aborts instead of routing
2. **No error connections defined** - Routes not configured
3. **Target node name mismatch** - Connection points to non-existent node

**Solution**:
```typescript
// Set correct error policy
{
  id: 'risky_node',
  onError: 'continueErrorOutput'  // Must route to error port
}

// Define error routes
{
  connections: {
    risky_node: {
      error: {
        '0': [{ node: 'error_handler' }]
      }
    }
  }
}
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Compatibility**: DAGExecutor v3.0.0+
