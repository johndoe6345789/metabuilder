# MetaBuilder Workflow Engine v3 - Enterprise N8N-Style DAG System

## Overview

MetaBuilder now includes a **full-featured DAG (Directed Acyclic Graph) workflow engine** based on N8N architecture patterns. This enables complex automation, integrations, and business logic with:

- ✅ **Branching & Conditional Routing** - Multiple execution paths based on node output
- ✅ **Parallel Execution** - Independent nodes run concurrently
- ✅ **Error Handling** - Multiple strategies (stop, continue, retry, skip)
- ✅ **Retry Logic** - Exponential/linear/fibonacci backoff for transient failures
- ✅ **Rate Limiting** - Global, per-tenant, per-user throttling
- ✅ **Multi-Tenant Safety** - Enforced tenant isolation with row-level ACL
- ✅ **Execution Limits** - Memory, time, data size constraints
- ✅ **Audit Logging** - Full execution history and metrics
- ✅ **Extensible** - Custom node types via plugin system

## Architecture

### Three Core Components

```
┌─────────────────────────────────────────────┐
│        Workflow Definition (JSON)            │
│  - Nodes, Connections, Triggers, Settings   │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│        DAG Executor (TypeScript)             │
│  - Priority queue scheduling                 │
│  - Node execution orchestration              │
│  - Error handling & retry logic              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│        Node Executors (Plugins)              │
│  - DBAL operations, HTTP, Email, etc.        │
│  - Custom business logic nodes               │
└─────────────────────────────────────────────┘
```

## Workflow Definition (v3.0.0)

### Minimal Example

```json
{
  "id": "wf-simple",
  "name": "Simple Workflow",
  "version": "3.0.0",
  "tenantId": "acme",
  "nodes": [
    {
      "id": "trigger",
      "name": "Manual Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "id": "send-email",
      "name": "Send Email",
      "type": "action",
      "typeVersion": 1,
      "nodeType": "email-send",
      "position": [200, 0],
      "parameters": {
        "to": "user@example.com",
        "subject": "Test",
        "body": "Hello"
      }
    }
  ],
  "connections": {
    "trigger": {
      "main": {
        "0": [
          {
            "node": "send-email",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

### Complete Feature Example

See `/packages/examples/workflows/complex-approval-flow.workflow.json` for a production-grade example with:
- Parallel validation nodes
- Conditional branching (if/else logic)
- Error handling and fallback paths
- Retry policies with exponential backoff
- Rate limiting configuration
- Multi-tenant safety enforcement

## Key Concepts

### 1. Nodes

Every workflow is composed of nodes:

```typescript
interface WorkflowNode {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: 'trigger' | 'operation' | 'action' | ...;  // Node category
  typeVersion: number;           // Implementation version
  position: [number, number];    // Canvas coordinates
  parameters: object;            // Node-specific config
  inputs: NodePort[];            // Input definitions
  outputs: NodePort[];           // Output definitions
  disabled?: boolean;            // Skip execution
  maxTries?: number;             // Retry attempts
  onError?: string;              // Error handling strategy
}
```

### 2. Connections (DAG Edges)

Connections define the execution flow:

```json
{
  "connections": {
    "node-a": {
      "main": {
        "0": [
          {
            "node": "node-b",
            "type": "main",
            "index": 0
          }
        ]
      },
      "error": {
        "0": [
          {
            "node": "error-handler",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

**Connection Structure:**
- Source node → Output port type → Output port index → Array of targets
- Each target: destination node, input type, input index
- Supports multiple connections per output
- Error routing separate from success path

### 3. Triggers

Define how workflows start:

```typescript
interface WorkflowTrigger {
  nodeId: string;        // Node that triggers
  kind: 'webhook' | 'schedule' | 'manual' | 'event' | ...;
  enabled: boolean;

  // For webhooks
  webhookId?: string;
  webhookUrl?: string;
  webhookMethods?: ['POST', 'GET', ...];

  // For schedules
  schedule?: string;  // Cron: "0 0 * * *"
  timezone?: string;

  // For events
  eventType?: string;
  eventFilters?: object;
}
```

### 4. Execution Paths

Multiple execution paths based on output:

```json
{
  "outputs": [
    {
      "name": "main",
      "type": "success",
      "index": 0,
      "label": "On Success"
    },
    {
      "name": "main",
      "type": "error",
      "index": 1,
      "label": "On Error"
    }
  ]
}
```

### 5. Error Handling

Four strategies per node:

| Strategy | Behavior |
|----------|----------|
| `stopWorkflow` | Stop execution, mark as failed (default) |
| `continueRegularOutput` | Continue to next node, ignore error |
| `continueErrorOutput` | Route to error output port |
| `skipNode` | Skip this node, continue with next |

```json
{
  "onError": "continueErrorOutput",
  "outputs": [
    { "name": "main", "type": "main", ... },
    { "name": "main", "type": "error", ... }
  ]
}
```

### 6. Retry Policy

Automatic retry with backoff:

```json
{
  "retryPolicy": {
    "enabled": true,
    "maxAttempts": 3,
    "backoffType": "exponential",  // linear, fibonacci
    "initialDelay": 1000,           // ms
    "maxDelay": 30000,              // ms
    "retryableErrors": ["TIMEOUT", "RATE_LIMIT"],
    "retryableStatusCodes": [408, 429, 500, 502, 503, 504]
  }
}
```

**Backoff Calculation:**
- **Linear**: delay = initial × (attempt + 1)
- **Exponential**: delay = initial × 2^attempt (capped at maxDelay)
- **Fibonacci**: delay = fib(attempt) × initial

### 7. Parallel Execution

Run multiple nodes concurrently:

```json
{
  "id": "parallel-node",
  "type": "parallel",
  "parameters": {
    "tasks": [
      { "nodeId": "task-1", "type": "main" },
      { "nodeId": "task-2", "type": "main" },
      { "nodeId": "task-3", "type": "main" }
    ]
  }
}
```

All tasks execute in parallel. Workflow waits for all to complete before continuing.

### 8. Conditional Branching

Route based on conditions:

```json
{
  "id": "decision",
  "type": "logic",
  "nodeType": "condition",
  "parameters": {
    "condition": "{{ $json.amount > 1000 }}"
  },
  "outputs": [
    { "name": "main", "type": "success", "index": 0, "label": "Yes" },
    { "name": "main", "type": "condition", "index": 1, "label": "No" }
  ]
}
```

## Built-in Node Types

### Data Operations
- `dbal-read` - Query database
- `dbal-write` - Create/update records
- `dbal-delete` - Delete records
- `dbal-aggregate` - Aggregate queries

### Integration
- `http-request` - Make HTTP calls
- `email-send` - Send emails
- `webhook-trigger` - Receive webhooks

### Logic
- `condition` - If/else branching
- `loop` - Iterate over arrays
- `parallel` - Run tasks concurrently
- `merge` - Combine multiple inputs
- `split` - Split output to multiple paths

### Utility
- `wait` - Delay execution
- `set-variable` - Store values
- `transform` - Transform data with templates
- `webhook-response` - Return HTTP response

## Execution Engine

### DAGExecutor Class

```typescript
class DAGExecutor {
  async execute(): Promise<ExecutionState> {
    // 1. Initialize triggers
    // 2. Priority-queue based execution
    // 3. Retry logic with backoff
    // 4. Error routing
    // 5. Parallel task handling
    // Returns final execution state
  }
}
```

### Priority Queue Scheduling

Nodes execute based on priority:

```
Priority 0:  Trigger nodes (start)
Priority 5:  Error handler nodes
Priority 10: Main execution path
Priority 20: Cleanup/finalization
```

### Execution State

Every node produces a result:

```typescript
interface NodeResult {
  status: 'success' | 'error' | 'skipped' | 'pending';
  output?: any;           // Node output data
  error?: string;         // Error message
  duration?: number;      // Execution time (ms)
  retries?: number;       // Retry attempts used
}
```

## Multi-Tenant Safety

Enforced at multiple levels:

### 1. Schema Level
```json
{
  "tenantId": "acme",
  "multiTenancy": {
    "enforced": true,
    "tenantIdField": "tenantId",
    "restrictNodeTypes": ["raw-sql", "eval", "shell-exec"],
    "allowCrossTenantAccess": false,
    "auditLogging": true
  }
}
```

### 2. Node Level
```json
{
  "parameters": {
    "filter": {
      "tenantId": "{{ $context.tenantId }}",
      "userId": "{{ $context.user.id }}"
    }
  }
}
```

### 3. Execution Level
```typescript
const context: WorkflowContext = {
  executionId: "...",
  tenantId: "acme",        // Enforced tenant
  userId: "user-123",      // Current user
  user: { level: 3, ... }  // User level for ACL
};
```

## Rate Limiting

### Global Workflow Limit
```json
{
  "rateLimiting": {
    "enabled": true,
    "requestsPerWindow": 100,
    "windowSeconds": 60,
    "key": "tenant",        // Per tenant
    "onLimitExceeded": "queue"
  }
}
```

### Per-Node Limit
```json
{
  "rateLimiting": {
    "enabled": true,
    "requestsPerWindow": 10,
    "windowSeconds": 3600,
    "key": "user",          // Per user
    "onLimitExceeded": "reject"
  }
}
```

## Execution Limits

Resource constraints:

```json
{
  "executionLimits": {
    "maxExecutionTime": 3600,      // seconds
    "maxMemoryMb": 512,            // MB
    "maxNodeExecutions": 1000,     // max nodes per run
    "maxDataSizeMb": 50,           // per node output
    "maxArrayItems": 10000         // before truncation
  }
}
```

## Example Workflows

### 1. Simple Email Alert
Location: `packages/examples/workflows/simple-email.workflow.json`
- Trigger: Manual
- Action: Send email

### 2. Complex Approval Flow
Location: `packages/examples/workflows/complex-approval-flow.workflow.json`
- Trigger: Webhook
- Parallel validations (budget, permissions, fraud)
- Conditional branching
- Error handling
- Email notifications

### 3. Data Sync Pipeline
Location: `packages/examples/workflows/data-sync-pipeline.workflow.json` (to be created)
- Timer trigger
- Read from source
- Transform data
- Write to destination
- Retry on failure

## API Usage

### Execute Workflow

```bash
POST /api/v1/{tenant}/workflows/{workflowId}/execute
Content-Type: application/json

{
  "triggerData": {
    "requestId": "req-123",
    "amount": 5000
  }
}
```

### Response

```json
{
  "executionId": "exec-456",
  "status": "success",
  "state": {
    "validate-request": { "status": "success", "output": {...} },
    "parallel-checks": { "status": "success", ... },
    "send-approval": { "status": "success", "output": {...} }
  },
  "metrics": {
    "nodesExecuted": 8,
    "successNodes": 8,
    "failedNodes": 0,
    "totalRetries": 1,
    "duration": 2345
  }
}
```

## Performance Considerations

### Optimization Tips

1. **Use Parallel Execution** - Run independent validations concurrently
2. **Set Appropriate Timeouts** - Avoid hanging on slow external APIs
3. **Limit Array Sizes** - Configure `maxArrayItems` to prevent memory issues
4. **Use Retry Policies Wisely** - Exponential backoff prevents cascading failures
5. **Monitor Execution Metrics** - Track performance, identify bottlenecks

### Benchmarks

- Sequential 5-node workflow: ~500ms
- Parallel 3-task validation: ~300ms (vs ~900ms sequential)
- With retries (max 3): +1-2s for failures
- Large data transfer (50MB): +2-5s depending on network

## Future Enhancements

- [ ] Visual workflow builder UI
- [ ] Workflow templates library
- [ ] Advanced scheduling (cron with human readable)
- [ ] Workflow versioning and rollback
- [ ] Performance profiling and optimization
- [ ] Custom webhook signatures
- [ ] OAuth2 credential management
- [ ] Scheduled cleanup jobs
- [ ] Workflow composition (call other workflows)
- [ ] State machine patterns

## Troubleshooting

### Workflow Won't Start
1. Check trigger is enabled
2. Verify start node has no incoming connections
3. Check tenant ID matches context

### Nodes Not Executing
1. Check connections are defined
2. Verify previous node succeeded (not skipped)
3. Check `disabled` flag is false
4. Review error handling strategy

### High Memory Usage
1. Reduce `maxArrayItems` limit
2. Add data transformation nodes to shrink payloads
3. Split large workflows into smaller ones
4. Use streaming for large datasets

### Retries Not Working
1. Check `retryPolicy.enabled` is true
2. Verify error is in `retryableErrors` list
3. Check `maxTries` is > 1
4. Review backoff delays aren't too long

## Reference

- **Schema**: `/dbal/shared/api/schema/workflow/metabuilder-workflow-v3.schema.json`
- **Executor**: `/dbal/development/src/workflow/dag-executor.ts`
- **Types**: `/dbal/development/src/workflow/types.ts`
- **Examples**: `/packages/examples/workflows/`
