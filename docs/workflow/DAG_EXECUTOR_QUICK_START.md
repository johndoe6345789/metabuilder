# DAG Executor Quick Start Guide

**For**: Frontend executor developers
**Time**: 10 minutes
**Goal**: Understand how to integrate and use the DAG executor

---

## 5-Minute Overview

The MetaBuilder DAG executor is a production-grade workflow engine that:
- Executes workflows as **Directed Acyclic Graphs** (DAG)
- Manages **dependency resolution** automatically
- Handles **errors, retries, and conditional routing**
- Supports **multi-tenant execution** with secure isolation
- Tracks **metrics** (execution time, node count, success rate)

---

## Installation

The executor is built into the MetaBuilder monorepo. No installation needed.

```bash
# Initialize at startup (once per app)
import { initializeWorkflowEngine } from '@metabuilder/workflow'
initializeWorkflowEngine()
```

---

## Quick Example (30 seconds)

```typescript
import { DAGExecutor, WorkflowValidator } from '@metabuilder/workflow'

// 1. Load workflow (from database/JSON)
const workflow = loadWorkflowFromDatabase('wf_123')

// 2. Validate
const validator = new WorkflowValidator()
const result = validator.validate(workflow)
if (!result.valid) throw new Error('Invalid workflow')

// 3. Create context
const context = {
  executionId: 'exec_1',
  tenantId: 'acme',
  userId: 'user_1',
  user: { id: 'user_1', email: 'user@acme.com', level: 2 },
  trigger: workflow.triggers[0],
  triggerData: { message: 'hello' },
  variables: {},
  secrets: {}
}

// 4. Create executor
const executor = new DAGExecutor(
  context.executionId,
  workflow,
  context,
  nodeExecutor  // Your callback function
)

// 5. Execute
const state = await executor.execute()
const metrics = executor.getMetrics()

console.log(`Executed ${metrics.nodesExecuted} nodes in ${metrics.duration}ms`)
```

---

## Key Concepts

### 1. Workflow Structure

A workflow is a **DAG** (no cycles allowed) with:

```typescript
{
  nodes: [           // Individual tasks
    { id, name, type, parameters, ... }
  ],
  connections: {     // Edges between nodes
    "nodeA": {
      "main": {
        "0": [{ node: "nodeB", type: "main" }]
      }
    }
  }
}
```

### 2. Node Execution

Nodes execute **sequentially** (one at a time) based on:
1. **Dependency resolution** - Can't run until inputs are ready
2. **Priority queue** - Higher priority nodes dequeued first
3. **Availability** - Trigger nodes start automatically

### 3. Error Handling

Each node has an `onError` policy:

```typescript
onError: 'stopWorkflow'          // Abort everything (default)
onError: 'continueErrorOutput'   // Route to error port
onError: 'continueRegularOutput' // Route to main port with empty output
onError: 'skipNode'              // Skip dependent nodes
```

### 4. Retries

Nodes can retry on failure:

```typescript
{
  maxTries: 3,
  retryPolicy: {
    backoffType: 'exponential',
    initialDelay: 1000,
    maxDelay: 30000,
    retryableErrors: ['TIMEOUT', 'TEMPORARY_FAILURE'],
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  }
}
```

### 5. Variables & Templates

Use `{{ }}` syntax to reference data:

```json
{
  "to": "{{ $context.user.email }}",
  "subject": "{{ $json.title }}",
  "body": "{{ $steps.transform.output.content }}"
}
```

---

## The Node Executor Callback

The executor calls your callback for each node:

```typescript
async function nodeExecutor(nodeId, workflow, context, state) {
  const node = workflow.nodes.find(n => n.id === nodeId)

  // Your implementation:
  // 1. Get the executor for this node type
  // 2. Execute the node
  // 3. Return result
  // 4. Handle errors

  try {
    const executor = registry.get(node.type)
    if (!executor) {
      return { status: 'error', error: 'No executor', timestamp: Date.now() }
    }

    return await executor.execute(node, context, state)
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: Date.now()
    }
  }
}
```

---

## Common Tasks

### Task 1: Execute a Workflow

```typescript
const executor = new DAGExecutor(execId, workflow, context, nodeExecutor)
const state = await executor.execute()
```

### Task 2: Check Execution Status

```typescript
const metrics = executor.getMetrics()
console.log(`${metrics.successNodes} of ${metrics.nodesExecuted} nodes succeeded`)
console.log(`Duration: ${metrics.duration}ms`)
```

### Task 3: Stop Execution

```typescript
executor.abort()  // Stops at next checkpoint
```

### Task 4: Validate Before Executing

```typescript
const validator = new WorkflowValidator()
const result = validator.validate(workflow)

if (!result.valid) {
  result.errors.forEach(error => {
    console.error(`${error.path}: ${error.message}`)
  })
  return
}
```

### Task 5: Interpolate Variables

```typescript
import { interpolateTemplate } from '@metabuilder/workflow'

const interpolated = interpolateTemplate(node.parameters, {
  context,
  json: triggerData,
  steps: state
})
```

### Task 6: Register a Custom Node Type

```typescript
import { getNodeExecutorRegistry } from '@metabuilder/workflow'

const registry = getNodeExecutorRegistry()
registry.register('custom.node.type', {
  nodeType: 'custom.node.type',
  async execute(node, context, state) {
    return {
      status: 'success',
      output: { message: 'Executed' },
      timestamp: Date.now()
    }
  },
  validate(node) {
    return {
      valid: true,
      errors: [],
      warnings: []
    }
  }
})
```

---

## Execution Flow (Visual)

```
Start
  │
  ▼
Initialize Triggers
  │ (find nodes with no inputs)
  ▼
Queue Start Nodes
  │
  ┌─────────────────────────┐
  │ Main Execution Loop     │
  │                         │
  ▼                         │
Dequeue Node              │
  │                       │
  ├─ Check Dependencies   │
  │ (skip if failed)      │
  │                       │
  ├─ Execute Node         │
  │ (with retries)        │
  │                       │
  ├─ Handle Error         │
  │ (apply policy)        │
  │                       │
  └─ Route Output         │
    (queue dependents)   ─┘
       │
       ▼
    Queue Empty?
       │
    ├─ No → [Loop back]
    │
    └─ Yes
         │
         ▼
      Finalize
      │
      ├─ Calculate metrics
      ├─ Return state
      │
      ▼
      End
```

---

## Validation Rules (Must Know)

The validator checks these rules before execution:

| Check | Description |
|-------|-------------|
| **Unique node IDs** | Each node must have unique ID |
| **Node names unique** | Each node must have unique name |
| **Valid node types** | Each node type must be registered |
| **Connection targets exist** | All connection targets must be valid nodes |
| **No circular connections** | Workflow must be a DAG (no cycles) |
| **Parameter structure** | No "[object Object]" serialization bugs |
| **Variable names valid** | Regex: `[a-zA-Z_][a-zA-Z0-9_]*` |
| **Multi-tenant safety** | tenantId must be present |
| **No dangling references** | All connection targets exist |

**Check before executing**:
```typescript
const validator = new WorkflowValidator()
const result = validator.validate(workflow)
if (!result.valid) {
  throw new Error(`Validation failed: ${result.errors.map(e => e.message).join(', ')}`)
}
```

---

## Error Handling Patterns

### Pattern 1: Fail Fast (Stop Immediately)

```json
{
  "onError": "stopWorkflow"
}
```

Use when: Critical operations that can't continue

### Pattern 2: Route to Error Handler

```json
{
  "onError": "continueErrorOutput"
}
```

With connections:
```json
{
  "connections": {
    "risky_node": {
      "error": {
        "0": [{ "node": "error_handler" }]
      }
    }
  }
}
```

Use when: Want to handle errors gracefully

### Pattern 3: Continue with Default

```json
{
  "onError": "continueRegularOutput"
}
```

Use when: Node failure is non-critical, continue with empty output

### Pattern 4: Skip Dependents

```json
{
  "onError": "skipNode"
}
```

Use when: Node failure invalidates all subsequent nodes

---

## Performance Tips

1. **Cache template regexes** - Don't compile same regex repeatedly
2. **Index connections by target** - O(n) lookup → O(1) lookup
3. **Pre-build dependency graph** - Calculate once, reuse
4. **Stream large state** - Don't keep everything in memory
5. **Limit node count** - Executioner scales to ~1000 nodes

---

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Workflow hangs | Circular connection or waiting for impossible dependency | Check DAG property |
| Wrong node order | Priority queue issue | Verify dependency resolution |
| Template not interpolating | Missing context or typo | Check context object |
| Error not routing | Wrong error policy | Set `onError: 'continueErrorOutput'` |
| Out of memory | Large state accumulation | Limit state size |
| Slow execution | Too many retries | Reduce maxAttempts or adjust backoff |

---

## Next Steps

1. **Read full architecture**: [DAG_EXECUTOR_N8N_INTEGRATION_ANALYSIS.md](./DAG_EXECUTOR_N8N_INTEGRATION_ANALYSIS.md)
2. **Check code examples**: [DAG_EXECUTOR_TECHNICAL_REFERENCE.md](./DAG_EXECUTOR_TECHNICAL_REFERENCE.md)
3. **Implement integration**: Follow Phase 3 Week 2 plan
4. **Write tests**: Use provided test patterns
5. **Deploy**: Monitor metrics in production

---

## Key Files

| File | Purpose | Location |
|------|---------|----------|
| `dag-executor.ts` | Main engine | `workflow/executor/ts/executor/` |
| `types.ts` | Type definitions | `workflow/executor/ts/` |
| `workflow-validator.ts` | Validation logic | `workflow/executor/ts/utils/` |
| `node-executor-registry.ts` | Plugin system | `workflow/executor/ts/registry/` |
| `priority-queue.ts` | Execution scheduling | `workflow/executor/ts/utils/` |
| `template-engine.ts` | Variable interpolation | `workflow/executor/ts/utils/` |

---

## Support

- **Architecture questions**: See [DAG_EXECUTOR_N8N_INTEGRATION_ANALYSIS.md](./DAG_EXECUTOR_N8N_INTEGRATION_ANALYSIS.md)
- **API reference**: See [DAG_EXECUTOR_TECHNICAL_REFERENCE.md](./DAG_EXECUTOR_TECHNICAL_REFERENCE.md)
- **Code examples**: Search for "Example" in technical reference
- **Troubleshooting**: See "Troubleshooting Guide" in technical reference

---

**Ready to integrate?** Start with the [full integration analysis](./DAG_EXECUTOR_N8N_INTEGRATION_ANALYSIS.md).
