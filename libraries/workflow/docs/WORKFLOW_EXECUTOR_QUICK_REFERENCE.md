# Workflow Executor - Quick Reference Guide

## At a Glance

| Aspect | Details |
|--------|---------|
| **Architecture** | Plugin-based DAG executor (N8N-style) |
| **Core Files** | 9 files across 5 directories |
| **Lines of Code** | ~2,000 LOC (types, executor, plugins, utils) |
| **Node Types** | ~80 (9 class-based + 7 plugin categories) |
| **Multi-Tenant** | ✓ Full support (enforced at validation & execution) |
| **Retry Logic** | ✓ Exponential/Linear/Fibonacci backoff |
| **Validation** | ✓ Comprehensive (nodes, connections, variables, multi-tenant) |
| **Template Engine** | ✓ Full variable interpolation with utilities |

---

## Core Concepts

### 1. Node Type Resolution (Critical to understand)

```typescript
// Workflow JSON defines nodes with nodeType field
const node: WorkflowNode = {
  id: 'node_42',
  nodeType: 'dbal-read',  // ◄─── KEY FIELD (string identifier)
  parameters: { entity: 'user', filter: { ... } }
};

// At runtime, executor looks up nodeType in registry
const executor = registry.get(node.nodeType);  // → INodeExecutor
await executor.execute(node, context, state);
```

**Key Point**: NodeType is the **only mechanism** for resolving which executor handles a node.

### 2. Plugin Registration (Two Patterns)

**Class-Based (direct)**:
```typescript
class MyExecutor implements INodeExecutor { ... }
registry.register('my-node', new MyExecutor());
```

**Function-Based (via adapter)**:
```typescript
const myPlugins = {
  'my.action': async (node, context, state) => { ... }
};
registerPluginMap(registry, myPlugins);
// Internally: createExecutor() wraps function → INodeExecutor
```

### 3. Execution Flow (Single Callback Pattern)

```typescript
new DAGExecutor(
  executionId,
  workflow,
  context,
  nodeExecutor  // ◄─── Single callback for ALL node types
);

// Inside DAGExecutor._executeNodeWithRetry():
const result = await nodeExecutor(nodeId, workflow, context, state);

// The callback must:
// 1. Find node by nodeId
// 2. Look up executor by node.nodeType
// 3. Call executor.execute()
```

### 4. Multi-Tenant Safety (Three Layers)

**Layer 1: Type-Level**
```typescript
interface WorkflowDefinition {
  tenantId: string;  // REQUIRED
}
```

**Layer 2: Validation-Level**
```typescript
validateMultiTenantSafety(workflow) {
  if (!workflow.tenantId) throw Error('Missing tenantId');
}
```

**Layer 3: Execution-Level (DBAL plugins)**
```typescript
// DBAL plugins auto-inject tenantId into filters
const filter = { status: 'active' };
if (context.tenantId && !filter.tenantId) {
  filter.tenantId = context.tenantId;  // AUTO-INJECT
}
```

---

## File Quick Reference

| File | Lines | Purpose | Key Points |
|------|-------|---------|-----------|
| **index.ts** | 58 | Public API exports | Call `initializeWorkflowEngine()` at startup |
| **types.ts** | 342 | Type definitions | Define all interfaces (no implementation) |
| **dag-executor.ts** | 447 | Core execution engine | Main logic: loop, retry, route, error handle |
| **node-executor-registry.ts** | 154 | Plugin registry | Singleton global registry (Map-based) |
| **function-executor-adapter.ts** | 102 | Function wrapper | Converts functions → INodeExecutor |
| **plugins/index.ts** | 135 | Built-in registration | Registers 80+ node types at startup |
| **template-engine.ts** | 255 | Variable interpolation | {{ }} syntax support |
| **workflow-validator.ts** | 474 | Validation logic | 9 validation checks (nodes, connections, multi-tenant) |
| **priority-queue.ts** | 110 | Execution queue | Min-heap for priority-based execution |

---

## Common Tasks

### Initialize Workflow Engine
```typescript
import { initializeWorkflowEngine } from '@metabuilder/workflow';

// At application startup (once):
initializeWorkflowEngine();
// ✓ Registers 80+ built-in node executors
```

### Execute a Workflow
```typescript
import { DAGExecutor, validateWorkflow } from '@metabuilder/workflow';

const workflow: WorkflowDefinition = { /* ... */ };
const context: WorkflowContext = {
  executionId: 'exec_123',
  tenantId: 'tenant-1',  // ✓ REQUIRED
  userId: 'user_456',
  trigger: { kind: 'manual' },
  triggerData: { /* ... */ },
  variables: { /* ... */ }
};

// Validate first
const validation = validateWorkflow(workflow);
if (!validation.valid) {
  throw new Error(`Validation failed: ${validation.errors}`);
}

// Execute
const nodeExecutor = async (nodeId, wf, ctx, state) => {
  const node = wf.nodes.find(n => n.id === nodeId);
  const executor = registry.get(node.nodeType);
  if (!executor) throw new Error(`Unknown: ${node.nodeType}`);
  return await executor.execute(node, ctx, state);
};

const dagExecutor = new DAGExecutor(
  context.executionId,
  workflow,
  context,
  nodeExecutor
);

const executionState = await dagExecutor.execute();
const metrics = dagExecutor.getMetrics();
```

### Register Custom Executor (Class-Based)
```typescript
import { getNodeExecutorRegistry, INodeExecutor } from '@metabuilder/workflow';

class MyCustomExecutor implements INodeExecutor {
  nodeType = 'my-custom-action';

  async execute(node, context, state) {
    // Your logic here
    return {
      status: 'success',
      output: { /* ... */ },
      timestamp: Date.now()
    };
  }

  validate(node) {
    return { valid: true, errors: [], warnings: [] };
  }
}

// Register
const registry = getNodeExecutorRegistry();
registry.register('my-custom-action', new MyCustomExecutor());
```

### Register Custom Executors (Function-Based)
```typescript
import { registerPluginMap, getNodeExecutorRegistry } from '@metabuilder/workflow';

const myPlugins = {
  'my.concat': async (node, context, state) => {
    return {
      status: 'success',
      output: { result: node.parameters.a + node.parameters.b },
      timestamp: Date.now()
    };
  },
  'my.double': async (node, context, state) => {
    return {
      status: 'success',
      output: { result: node.parameters.value * 2 },
      timestamp: Date.now()
    };
  }
};

const registry = getNodeExecutorRegistry();
registerPluginMap(registry, myPlugins);
```

### Interpolate Variables
```typescript
import { interpolateTemplate } from '@metabuilder/workflow';

const template = {
  message: 'User {{ $context.userId }} in {{ $context.tenantId }}',
  data: '{{ $json.payload }}',
  step: '{{ $steps.node_1.output.id }}'
};

const resolved = interpolateTemplate(template, {
  context: { userId: 'user_123', tenantId: 'tenant-1' },
  json: { payload: { /* ... */ } },
  steps: { node_1: { output: { id: 42 } } }
});
// Result:
// {
//   message: 'User user_123 in tenant-1',
//   data: { /* ... */ },
//   step: 42
// }
```

---

## Available Node Types

### Class-Based (9)
- `dbal-read` - Database query
- `dbal-write` - Database write
- `dbal-delete` - Database delete
- `http-request` - HTTP API call
- `email-send` - Send email
- `condition` - Conditional branching
- `transform` - Data transformation
- `wait` - Wait/delay
- `webhook-response` - Webhook response
- `set-variable` - Set workflow variable

### Function-Based Plugin Maps (~70)

**String (15)**: concat, format, length, lower, upper, trim, replace, split, join, substring, includes, startsWith, endsWith, padStart, padEnd

**Math (13)**: add, subtract, multiply, divide, modulo, power, sqrt, abs, floor, ceil, round, min, max

**Logic (7)**: and, or, not, xor, equal, greaterThan, lessThan

**List (10)**: push, pop, shift, unshift, concat, slice, splice, map, filter, reduce

**Dict (8)**: get, set, merge, keys, values, entries, pick, omit

**Convert (5)**: toString, toNumber, toBoolean, toDate, toJSON

**Var (6)**: set, get, increment, decrement, append, clear

---

## Error Handling Strategy

### Retry Logic
```
Attempt 0: Immediate
Attempt 1: 1s (exponential: 2^0 × 1s)
Attempt 2: 2s (exponential: 2^1 × 1s)
Attempt 3: 4s (exponential: 2^2 × 1s)
Attempt 4: 8s (exponential: 2^3 × 1s)
... (capped at maxDelay: 60s)
```

**Retryable Errors**: HTTP 408, 429, 500, 502, 503, 504 + custom codes
**Non-Retryable**: Validation errors, unknown node types, 4xx (except above)

### Error Routing
```
node.onError = 'stopWorkflow'          // ✓ Abort entire execution
node.onError = 'continueErrorOutput'   // ✓ Route to error port
node.onError = 'continueRegularOutput' // ✓ Treat as success
```

---

## Validation Rules

### Workflow Level
- ✓ `tenantId` required (NOT empty)
- ✓ All node IDs unique
- ✓ All node types defined

### Node Level
- ✓ Required fields: id, name, type
- ✓ Timeout: 1s min, 1hr max (warning outside range)
- ✓ Parameters: max nesting depth 2

### Connection Level
- ✓ Source node exists
- ✓ Output type: 'main' or 'error'
- ✓ Target node exists
- ✓ Format: proper object/array structure

### Variable Level
- ✓ Name matches: `[a-zA-Z_][a-zA-Z0-9_]*`
- ✓ Type: string | number | boolean | array | object | date | any
- ✓ Default value matches declared type
- ✓ Regex complexity check (ReDoS detection)

### Multi-Tenant Level
- ✓ `tenantId` present (error if missing)
- ✓ Global-scope variables flagged (warning)

---

## Architecture Diagram (Text)

```
┌──────────────────────────────────────┐
│  WorkflowDefinition (JSON)           │
│  - nodes: WorkflowNode[]             │
│  - connections: ConnectionMap        │
│  - tenantId: string ◄─── REQUIRED    │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  WorkflowValidator                   │
│  - Syntax validation                 │
│  - Multi-tenant check                │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  DAGExecutor                         │
│  ├─ initializeTriggers()             │
│  ├─ while (!queue.empty()):          │
│  │   └─ executeNode(nodeId)          │
│  │      ├─ retry loop                │
│  │      ├─ nodeExecutor callback ◄┐  │
│  │      ├─ error handling           │  │
│  │      └─ route output             │  │
│  └─ return ExecutionState           │  │
└──────────────────────────────────────┘  │
                                         │
           ┌─────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  NodeExecutor Callback               │
│  1. Find node by nodeId              │
│  2. Extract node.nodeType            │
│  3. registry.get(nodeType)           │
│  4. executor.execute(node, ctx, ste) │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  NodeExecutorRegistry                │
│  (Global Singleton)                  │
│  Map<string, INodeExecutor>          │
│  'dbal-read' → DBALReadExecutor      │
│  'string.upper' → StringUpper        │
│  ... (~80 total)                     │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  INodeExecutor.execute()             │
│  ├─ Validate parameters              │
│  ├─ interpolateTemplate()            │
│  ├─ Execute logic                    │
│  └─ Return NodeResult                │
└──────────────────────────────────────┘
```

---

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Registry lookup | O(1) | Map-based, constant time |
| Queue enqueue | O(log N) | Min-heap bubble-up |
| Queue dequeue | O(log N) | Min-heap bubble-down |
| Template interpolation | O(K) | K = number of {{ }} placeholders |
| Workflow validation | O(N + E) | N = nodes, E = edges |
| Node execution | O(?) | Depends on node executor |

**Typical Workflow**: ~10-100 nodes → execution O(N log N) for queue operations

---

## Key Design Decisions

1. **Single Callback Pattern**: nodeExecutor callback is responsible for registry lookup
   - ✓ Flexible: Can implement custom resolution logic
   - ✗ Coupling: Registry access inside callback
   - *Future*: Refactor to inject registry into DAGExecutor

2. **Global Singleton Registry**: One registry instance for entire application
   - ✓ Simple: No passing registry around
   - ✗ Testing: Harder to mock/reset
   - *Mitigation*: `resetNodeExecutorRegistry()` for tests

3. **Class + Function Hybrid**: Both INodeExecutor implementations and functions
   - ✓ Flexibility: Different use cases
   - ✗ Complexity: Two patterns to learn
   - *Note*: Adapter pattern unifies both

4. **No Database Integration**: Executor is pure, no DB dependency
   - ✓ Testable: No mocking database
   - ✓ Reusable: Works in any context
   - ✗ Limitation: Must call DB elsewhere (e.g., DBAL plugin)

5. **Template Engine Scope Precedence**: context → json → env → steps → workflow
   - ✓ Intuitive: Most-specific first
   - ✗ Risk: Can hide variables with same name
   - *Mitigation*: Prefix convention ($context., $json., etc.)

---

## Testing Strategy

### Unit Tests by Component

```typescript
// 1. Template Engine
interpolateTemplate({ a: '{{ $context.x }}' }, { context: { x: 5 } })
// → { a: 5 }

// 2. Registry
registry.register('test', executor);
expect(registry.get('test')).toBe(executor);

// 3. Validator
const result = validateWorkflow(invalidWorkflow);
expect(result.valid).toBe(false);
expect(result.errors.length).toBeGreaterThan(0);

// 4. Priority Queue
queue.enqueue('a', 10);
queue.enqueue('b', 5);
expect(queue.dequeue().item).toBe('b');  // Lower priority first

// 5. DAGExecutor
const state = await dagExecutor.execute();
expect(state['node_1'].status).toBe('success');
```

### Integration Tests

```typescript
// Full workflow execution
const workflow = buildWorkflow();
const context = buildContext({ tenantId: 'tenant-1' });
const state = await executeWorkflow(workflow, context);
expect(state['final_node'].output).toEqual(expectedResult);
```

---

## Troubleshooting Guide

| Problem | Cause | Solution |
|---------|-------|----------|
| "No executor registered for node type X" | Node type not registered | Call `initializeWorkflowEngine()` or register manually |
| Multi-tenant isolation broken | tenantId not in context | Ensure `context.tenantId` is set before execution |
| Template interpolation returns literal | Syntax error in template | Check `{{ }}` syntax, use `$context.`, `$json.`, etc. |
| Workflow hangs (infinite loop) | Circular connections | Check workflow connections for cycles |
| Retry not triggering | Error not retryable | Check `retryableErrors` list in retry policy |
| Validation fails but should pass | Nested parameters too deep | Ensure parameters nesting ≤ 2 levels |

---

## Related Files

- **Database Integration**: `/dbal/development/src/`
- **Plugin Examples**: `/workflow/plugins/ts/`
- **Frontend Integration**: `/frontends/nextjs/src/lib/workflow/`
- **Type Definitions**: `/schemas/` (JSON schemas)
- **Documentation**: `/docs/CLAUDE.md` (full development guide)

---

**Last Updated**: 2026-01-22
**Version**: 3.0.0
**Status**: Production Ready
