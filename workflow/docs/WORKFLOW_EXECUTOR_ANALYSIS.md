# TypeScript Workflow Executor - Technical Architecture Analysis

**Date**: 2026-01-22
**Version**: 3.0.0
**Scope**: `/workflow/executor/ts/` - N8N-style DAG workflow execution engine
**Status**: Production Ready - Multi-Tenant Aware

---

## Executive Summary

The MetaBuilder TypeScript workflow executor is a **plugin-based DAG (Directed Acyclic Graph) workflow engine** that follows the N8N execution model. It features:

- **Plugin Registry System**: Extensible architecture for registering node executors
- **DAG-Based Execution**: Priority-queue-based topological execution with retry logic
- **Multi-Tenant Filtering**: Enforced tenant isolation at execution layer
- **Template Engine**: Full variable interpolation with context scoping
- **Comprehensive Validation**: Workflow structure, parameter, and safety validation
- **Error Handling & Recovery**: Exponential/linear/Fibonacci backoff with retryable error detection

### Key Architecture Characteristics

```
Configuration: 95% JSON/YAML (workflow definitions)
Execution: 5% TypeScript (executor logic)
Plugin Model: Class-based + Function-based adapters
Node Resolution: Registry lookup by nodeType string
Execution Flow: Single callback pattern (NodeExecutorFn)
```

---

## Directory Structure & File Purposes

```
workflow/executor/ts/
├── executor/
│   └── dag-executor.ts               [Core DAG execution engine]
├── registry/
│   └── node-executor-registry.ts     [Plugin registration system]
├── plugins/
│   ├── index.ts                       [Built-in executor registration]
│   └── function-executor-adapter.ts   [Function→INodeExecutor adapter]
├── utils/
│   ├── priority-queue.ts              [Min-heap priority queue]
│   ├── template-engine.ts             [{{ }} variable interpolation]
│   └── workflow-validator.ts          [Comprehensive validation]
├── types.ts                           [Complete type definitions]
└── index.ts                           [Public API exports]
```

### File Purpose Matrix

| File | Lines | Purpose | Key Exports |
|------|-------|---------|------------|
| `types.ts` | 342 | Core type definitions | `WorkflowDefinition`, `WorkflowNode`, `ExecutionState`, `INodeExecutor` |
| `dag-executor.ts` | 447 | DAG execution engine | `DAGExecutor`, `NodeExecutorFn`, `ExecutionMetrics` |
| `node-executor-registry.ts` | 154 | Plugin registry | `NodeExecutorRegistry`, `NodeExecutorPlugin`, singleton accessors |
| `function-executor-adapter.ts` | 102 | Function wrapper | `createExecutor()`, `createExecutorsFromMap()`, `registerPluginMap()` |
| `template-engine.ts` | 255 | Variable interpolation | `interpolateTemplate()`, `evaluateTemplate()`, `TemplateContext` |
| `workflow-validator.ts` | 474 | Comprehensive validation | `WorkflowValidator`, `validateWorkflow()` |
| `priority-queue.ts` | 110 | Priority queue | `PriorityQueue<T>`, `QueueItem<T>` |
| `index.ts` | 58 | Public API | Re-exports all subsystems |

---

## Core Architecture Diagram

### Execution Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              WORKFLOW EXECUTION FLOW (N8N-Style)                 │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  1. INITIALIZATION LAYER                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  WorkflowDefinition (JSON)  ─────────────────────────────────────┐  │
│     - nodes: WorkflowNode[]                                       │  │
│     - connections: ConnectionMap                                  │  │
│     - tenantId: string                                            │  │
│     - variables: Record<string, WorkflowVariable>                 │  │
│                                                                   │  │
│  WorkflowContext (Runtime)  ─────────────────────────────────────┤  │
│     - executionId: string                                         │  │
│     - tenantId: string                                            │  │
│     - userId: string                                              │  │
│     - triggerData: Record<string, any>                           │  │
│     - variables: Record<string, any>                              │  │
│                                                                   │  │
└──────────────────────────────────────────────────────────────────┘  │
                             │                                         │
                             ▼                                         │
┌─────────────────────────────────────────────────────────────────────┐
│  2. REGISTRY & PLUGIN RESOLUTION                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  NodeExecutorRegistry (Global Singleton)                            │
│     │                                                                │
│     ├─► Built-in Class-Based Executors:                           │
│     │    - dbalReadExecutor                                         │
│     │    - dbalWriteExecutor                                        │
│     │    - httpRequestExecutor                                      │
│     │    - emailSendExecutor                                        │
│     │    - conditionExecutor                                        │
│     │    - transformExecutor                                        │
│     │    - waitExecutor                                             │
│     │    - setVariableExecutor                                      │
│     │    - webhookResponseExecutor                                  │
│     │                                                                │
│     └─► Function-Based Plugin Maps (via Adapter):                 │
│          - stringPlugins (15+ string operations)                    │
│          - mathPlugins (arithmetic)                                 │
│          - logicPlugins (boolean operations)                        │
│          - listPlugins (array operations)                           │
│          - dictPlugins (object operations)                          │
│          - convertPlugins (type conversion)                         │
│          - varPlugins (variable manipulation)                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────┘  │
                             │                                         │
                             ▼                                         │
┌─────────────────────────────────────────────────────────────────────┐
│  3. DAG EXECUTOR (MAIN EXECUTION ENGINE)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  DAGExecutor {                                                       │
│    - executionId: string                                            │
│    - workflow: WorkflowDefinition                                   │
│    - context: WorkflowContext                                       │
│    - state: ExecutionState                                          │
│    - queue: PriorityQueue<string>                                   │
│    - metrics: ExecutionMetrics                                      │
│    - nodeExecutor: NodeExecutorFn (callback)                        │
│  }                                                                   │
│                                                                      │
│  Execution Loop:                                                     │
│    1. _initializeTriggers()          ─► Enqueue trigger nodes       │
│    2. while (!queue.empty()):                                       │
│         │                                                            │
│         ├─► _executeNode(nodeId)                                    │
│         │    │                                                       │
│         │    ├─► Skip if disabled/failed                           │
│         │    ├─► _executeNodeWithRetry()                            │
│         │    │    │                                                 │
│         │    │    └─► Exponential backoff retry loop                │
│         │    │         └─► nodeExecutor(nodeId, workflow, ...) {    │
│         │    │              registry.get(nodeType).execute()        │
│         │    │             }                                         │
│         │    │                                                       │
│         │    ├─► _handleNodeError()                                 │
│         │    │    - stopWorkflow                                    │
│         │    │    - continueErrorOutput                             │
│         │    │    - continueRegularOutput                           │
│         │    │                                                       │
│         │    └─► _routeOutput(nodeId, result) ─► Enqueue next nodes │
│         │         └─► Check conditional routing                     │
│         │                                                            │
│         └─► Metrics: nodesExecuted++, etc.                         │
│                                                                      │
│  3. Return ExecutionState                                           │
│                                                                      │
└──────────────────────────────────────────────────────────────────┘  │
                             │                                         │
                             ▼                                         │
┌─────────────────────────────────────────────────────────────────────┐
│  4. NODE EXECUTION (PER-NODE LAYER)                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  NodeExecutor (INodeExecutor interface)                             │
│     async execute(                                                   │
│       node: WorkflowNode,                                           │
│       context: WorkflowContext,        ◄─── Multi-tenant safe       │
│       state: ExecutionState                 (tenantId enforced)      │
│     ): Promise<NodeResult>                                          │
│                                                                      │
│  NodeResult {                                                        │
│    status: 'success' | 'error' | 'skipped' | 'pending'             │
│    output?: any                                                      │
│    error?: string                                                    │
│    timestamp: number                                                 │
│    duration?: number                                                 │
│  }                                                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────┘  │
                             │                                         │
                             ▼                                         │
┌─────────────────────────────────────────────────────────────────────┐
│  5. TEMPLATE & CONTEXT RESOLUTION (WITHIN NODE EXECUTION)            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Before executing node, interpolate parameters:                     │
│                                                                      │
│  interpolateTemplate(nodeParams, {                                 │
│    context: WorkflowContext                                         │
│    state: ExecutionState  ◄─── Access previous node outputs        │
│    json: triggerData                                                 │
│    env: process.env                                                 │
│    workflow: workflow.variables                                     │
│    utils: { flatten, pick, omit, ... }                             │
│  })                                                                  │
│                                                                      │
│  Supports:                                                           │
│    - {{ $context.variable }}                                        │
│    - {{ $json.field }}                                              │
│    - {{ $steps.nodeId.output }}                                     │
│    - {{ $env.VAR }}                                                 │
│    - {{ $workflow.variables.name }}                                 │
│    - {{ $utils.uppercase("text") }}                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────┘  │
                             │                                         │
                             ▼                                         │
┌─────────────────────────────────────────────────────────────────────┐
│  6. MULTI-TENANT SAFETY ENFORCEMENT                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ✓ WorkflowDefinition.tenantId validated (required)                │
│  ✓ WorkflowContext.tenantId injected into execution                │
│  ✓ DBAL filters auto-injected with tenantId (dbalReadExecutor)     │
│  ✓ Template engine respects tenant scope                            │
│  ✓ Workflow validator checks for global-scope variables            │
│                                                                      │
│  Example (DBAL Read):                                               │
│    Input filter: { status: 'active' }                              │
│    Output filter: { status: 'active', tenantId: 'tenant-123' }     │
│                                                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Node Resolution Mechanism

### Current Flow

```
WorkflowNode {
  nodeType: string          ◄─── KEY FIELD
  parameters: Record<any>
  ... other properties
}
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  DAGExecutor._executeNode(nodeId)                          │
│    │                                                        │
│    ├─► Find node in workflow.nodes                        │
│    │                                                        │
│    └─► Call nodeExecutor callback:                        │
│        nodeExecutor(nodeId, workflow, context, state)     │
│          │                                                  │
│          ├─► Extract node: workflow.nodes.find(n=>n.id)   │
│          │                                                  │
│          └─► Call: this.registry.get(node.nodeType)       │
│              .execute(node, context, state)               │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  NodeExecutorRegistry.get(nodeType: string)               │
│    │                                                        │
│    └─► Map Lookup:                                        │
│        - this.executors.get(nodeType)                     │
│        - Returns INodeExecutor | undefined                │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  INodeExecutor.execute(node, context, state)              │
│    │                                                        │
│    ├─► Class-based (e.g., DBALReadExecutor)              │
│    │   - Direct implementation of INodeExecutor           │
│    │   - Example: dbalReadExecutor at /workflow/plugins/  │
│    │   - ts/dbal-read/src/index.ts                        │
│    │                                                        │
│    └─► Function-based (via adapter)                       │
│        - createExecutor(nodeType, pluginFunction)         │
│        - Wraps function in INodeExecutor interface        │
│        - Used for string, math, logic, list, dict, etc.   │
└───────────────────────────────────────────────────────────┘
```

### Node Type Registration

**Class-Based (Built-in)**:
```typescript
registry.register('dbal-read', dbalReadExecutor);        // INodeExecutor instance
registry.register('http-request', httpRequestExecutor);  // INodeExecutor instance
```

**Function-Based (Plugins)**:
```typescript
registerPluginMap(registry, stringPlugins, 'string');
// Internally calls:
//   createExecutor('string.concat', stringConcatFn, { category: 'string' })
//   createExecutor('string.upper', stringUpperFn, { category: 'string' })
//   ... for each plugin in map
```

### Resolution Order
1. **nodeType field** in WorkflowNode (e.g., `'dbal-read'`, `'string.upper'`, `'http-request'`)
2. **Registry lookup** by nodeType string
3. **Executor.execute()** called if found
4. **Error** thrown if executor not registered

---

## Plugin Registration Pattern

### Current Implementation

**File**: `/workflow/executor/ts/plugins/index.ts`

```typescript
// 1. IMPORT EXECUTORS
import { dbalReadExecutor } from '../../../plugins/ts/dbal-read/src/index';
import { stringPlugins } from '../../../plugins/ts/string/src/index';  // { [key: string]: PluginFunction }

// 2. REGISTER BUILT-IN
export function registerBuiltInExecutors(): void {
  const registry = getNodeExecutorRegistry();

  // Class-based (direct)
  registry.register('dbal-read', dbalReadExecutor);

  // Function-based (via adapter)
  registerPluginMap(registry, stringPlugins, 'string');
}

// 3. CALLED AT STARTUP
export function initializeWorkflowEngine() {
  registerBuiltInExecutors();
  console.log('✓ MetaBuilder Workflow Engine v3.0.0 initialized');
}
```

### Adapter Pattern

**File**: `/workflow/executor/ts/plugins/function-executor-adapter.ts`

```typescript
function createExecutor(
  nodeType: string,
  fn: PluginFunction,
  meta?: PluginMeta
): INodeExecutor {
  return {
    nodeType,
    async execute(node, context, state): Promise<NodeResult> {
      return fn(node, context, state);  // Call wrapped function
    },
    validate(node): ValidationResult {
      // Optional validation logic
      const errors = [];
      if (meta?.requiredParams) {
        for (const param of meta.requiredParams) {
          if (!(param in node.parameters)) {
            errors.push(`Missing required parameter: ${param}`);
          }
        }
      }
      return { valid: errors.length === 0, errors, warnings: [] };
    }
  };
}
```

**Usage**:
```typescript
const stringPlugins = {
  'string.concat': async (node, context, state) => { ... },
  'string.upper': async (node, context, state) => { ... },
  'string.lower': async (node, context, state) => { ... },
};

registerPluginMap(registry, stringPlugins);
// Converts each function to INodeExecutor and registers
```

---

## Registry Integration Points

### Where Plugin Registry Should Integrate

#### 1. **Initialization Phase** (Already Implemented)
```typescript
// In application startup:
import { initializeWorkflowEngine } from '@metabuilder/workflow';
initializeWorkflowEngine();  // Registers all built-in executors
```

#### 2. **Custom Plugin Registration** (New Plugins)
```typescript
// In custom workflow package:
const customRegistry = getNodeExecutorRegistry();

// Register custom class-based executor
customRegistry.register('custom-action', new MyCustomExecutor());

// Or register function-based
registerPluginMap(customRegistry, {
  'my-function': async (node, context, state) => { ... }
});
```

#### 3. **Runtime Plugin Discovery** (Future)
```typescript
// Could be implemented:
// 1. Load plugin manifests from database
// 2. Dynamically import and register
// 3. Validate plugin compatibility before registration
```

### Current Bottleneck

**Single Callback Pattern**:
```typescript
// DAGExecutor receives nodeExecutor callback
constructor(..., nodeExecutor: NodeExecutorFn)

// This callback must resolve ALL node types
nodeExecutor = async (nodeId, workflow, context, state) => {
  const node = workflow.nodes.find(n => n.id === nodeId);
  const executor = registry.get(node.nodeType);  // Registry lookup here
  if (!executor) throw new Error(`Unknown node type: ${node.nodeType}`);
  return executor.execute(node, context, state);
}
```

**Improvement Opportunity**:
- Registry is accessed INSIDE the callback
- Could be passed as dependency to DAGExecutor
- Would reduce coupling and improve testability

---

## Multi-Tenant Support

### Existing Implementation

**1. Type-Level**:
```typescript
export interface WorkflowDefinition {
  tenantId: string;  // REQUIRED
  // ...
}

export interface WorkflowContext {
  tenantId: string;  // REQUIRED
  userId: string;
  user: { id, email, level };
  // ...
}
```

**2. Validation-Level**:
```typescript
// In WorkflowValidator.validateMultiTenantSafety():
if (!workflow.tenantId) {
  errors.push({
    code: 'MISSING_TENANT_ID',
    message: 'Workflow must have a tenantId for multi-tenant safety'
  });
}
```

**3. Execution-Level** (DBAL Executor Example):
```typescript
// In DBALReadExecutor.execute():
const resolvedFilter = interpolateTemplate(filter, { context, state, ... });

// Enforce tenant filtering
if (context.tenantId && !resolvedFilter.tenantId) {
  resolvedFilter.tenantId = context.tenantId;  // AUTO-INJECT
}
```

**4. Template Engine-Level**:
```typescript
// Context variables include tenant info:
interpolateTemplate(params, {
  context: { tenantId, userId, ... },
  state: executionState,
  ...
})
```

### Multi-Tenant Safety Verification Checklist

- ✓ `WorkflowDefinition.tenantId` enforced at type level
- ✓ `WorkflowContext.tenantId` required for execution
- ✓ `WorkflowValidator` checks for missing tenantId
- ✓ `WorkflowValidator` warns about global-scope variables
- ✓ `DBAL plugins` auto-inject tenantId into filters
- ✓ Template engine scopes variables to execution context
- ⚠ **Gap**: No audit logging of cross-tenant access attempts
- ⚠ **Gap**: No runtime enforcement in generic node executors

### Recommended Multi-Tenant Improvements

```typescript
// 1. Add audit trail to execution
export interface WorkflowContext {
  tenantId: string;
  auditTrail?: {
    timestamp: Date;
    action: string;
    sourceNode: string;
    accessedEntity?: string;
  }[];
}

// 2. Add tenant access validator
class TenantAccessValidator {
  validateNodeAccess(node: WorkflowNode, context: WorkflowContext): ValidationResult {
    // Check if node operations respect tenant boundaries
  }
}

// 3. Add rate limiting per tenant
export interface RateLimitPolicy {
  key: 'global' | 'tenant' | 'user' | 'ip' | 'custom';
  // Existing: requestsPerWindow, windowSeconds, etc.
}
```

---

## Execution Flow & Transformation Layers

### Complete Data Transformation Pipeline

```
┌──────────────────────────────────┐
│ Input: WorkflowDefinition (JSON) │
│ - nodes: WorkflowNode[]          │
│ - connections: ConnectionMap     │
└──────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Layer 1: VALIDATION                  │
│ WorkflowValidator.validate()         │
│ - Node structure validation          │
│ - Connection integrity               │
│ - Variable safety                    │
│ - Multi-tenant safety                │
└──────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Layer 2: INITIALIZATION              │
│ DAGExecutor.constructor()            │
│ - Queue: PriorityQueue<string>       │
│ - State: ExecutionState = {}         │
│ - Metrics: ExecutionMetrics          │
└──────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Layer 3: TRIGGER RESOLUTION          │
│ _initializeTriggers()                │
│ - Find trigger nodes                 │
│ - Enqueue at priority 0              │
│ - Find start nodes (no inputs)       │
└──────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Layer 4: EXECUTION LOOP              │
│ while (!queue.empty()):              │
│  - Dequeue next node                 │
│  - Check skip conditions             │
│  - Execute with retries              │
│  - Update state & metrics            │
│  - Route output → next nodes         │
└──────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Layer 5: PER-NODE EXECUTION          │
│ nodeExecutor callback                │
│ - Resolve executor from registry     │
│ - Interpolate parameters             │
│ - Execute with multi-tenant context  │
└──────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Layer 6: PARAMETER TRANSFORMATION    │
│ interpolateTemplate()                │
│ - {{ $context.var }} → value         │
│ - {{ $steps.nodeId.output }} → val   │
│ - {{ $utils.func(arg) }} → result    │
└──────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Layer 7: ERROR HANDLING              │
│ _handleNodeError()                   │
│ - Route to error port                │
│ - Check retry policy                 │
│ - Exponential backoff                │
│ - Continue/stop decision             │
└──────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Layer 8: ROUTING                     │
│ _routeOutput()                       │
│ - Check connections                  │
│ - Evaluate conditions                │
│ - Enqueue next nodes                 │
│ - Maintain priority                  │
└──────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Output: ExecutionState               │
│ {                                    │
│   [nodeId]: NodeResult {             │
│     status, output, error, duration  │
│   },                                 │
│   ...                                │
│ }                                    │
└──────────────────────────────────────┘
```

### Backoff Strategies Implemented

```typescript
// exponential (default): 1s → 2s → 4s → 8s → 16s → ... (max 60s)
// linear: 1s → 2s → 3s → 4s → 5s → ... (max 60s)
// fibonacci: 1s → 1s → 2s → 3s → 5s → 8s → ... (max 60s)

_calculateBackoff(attempt: number, type: string, initial: number, max: number): number {
  switch (type) {
    case 'exponential':
      return Math.min(initial * Math.pow(2, attempt), max);
    case 'linear':
      return Math.min(initial * (attempt + 1), max);
    case 'fibonacci':
      return Math.min(_fibonacci(attempt + 1) * initial, max);
  }
}
```

---

## Key Type Definitions

### Workflow Structure

```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  tenantId: string;                    // MULTI-TENANT
  createdBy: string;
  active: boolean;
  nodes: WorkflowNode[];               // DAG nodes
  connections: ConnectionMap;          // Edge definitions
  triggers: WorkflowTrigger[];          // Entry points
  variables: Record<string, WorkflowVariable>;
  errorHandling: ErrorHandlingPolicy;
  retryPolicy: RetryPolicy;
  settings: WorkflowSettings;
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'operation' | 'action' | 'logic' | 'transformer' | ...;
  nodeType: string;                    // KEY: 'dbal-read', 'http-request', 'string.upper'
  parameters: Record<string, any>;     // Node-specific config
  disabled: boolean;
  skipOnFail: boolean;
  onError: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
  retryPolicy?: RetryPolicy;
  maxTries: number;
}

interface ConnectionMap {
  [fromNodeId: string]: {
    [outputType: string]: {         // 'main' | 'error'
      [outputIndex: string]: ConnectionTarget[];
    };
  };
}
```

### Execution Context

```typescript
interface WorkflowContext {
  executionId: string;
  tenantId: string;                    // MULTI-TENANT
  userId: string;
  trigger: WorkflowTrigger;
  triggerData: Record<string, any>;
  variables: Record<string, any>;
  secrets: Record<string, string>;
}

interface ExecutionState {
  [nodeId: string]: NodeResult;
}

interface NodeResult {
  status: 'success' | 'error' | 'skipped' | 'pending';
  output?: any;
  error?: string;
  errorCode?: string;
  timestamp: number;
  duration?: number;
  retries?: number;
}
```

### Plugin Interface

```typescript
interface INodeExecutor {
  nodeType: string;
  execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult>;

  validate(node: WorkflowNode): ValidationResult;
}

interface NodeExecutorPlugin {
  nodeType: string;
  version: string;
  executor: INodeExecutor;
  metadata?: {
    description?: string;
    category?: string;
    icon?: string;
    author?: string;
  };
}
```

---

## Validation System

### Comprehensive Validation Coverage

**WorkflowValidator** (474 lines) provides:

1. **Node Validation**
   - Required fields: id, name, type
   - Timeout constraints (1s min, 1hr max)
   - Parameter structure validation

2. **Parameter Validation**
   - Detects `[object Object]` serialization failures
   - Identifies nested parameter wrapping errors
   - Enforces maximum nesting depth (2 levels)

3. **Connection Validation**
   - Source node existence
   - Output type validation ('main' | 'error')
   - Target node existence
   - Connection format compliance

4. **Variable Validation**
   - Name format validation: `[a-zA-Z_][a-zA-Z0-9_]*`
   - Type validation: string | number | boolean | array | object | date | any
   - Default value type matching
   - Regex complexity analysis (ReDoS detection)

5. **Multi-Tenant Validation**
   - Required tenantId check
   - Global-scope variable warnings
   - Audit logging recommendations

### Validation Error Codes

| Code | Severity | Example |
|------|----------|---------|
| `MISSING_TENANT_ID` | Error | Workflow lacks tenantId |
| `MISSING_NODE_ID` | Error | Node.id is empty |
| `DUPLICATE_NODE_NAME` | Error | Multiple nodes with same name |
| `INVALID_CONNECTION_SOURCE` | Error | Connection from non-existent node |
| `OBJECT_SERIALIZATION_FAILURE` | Error | Parameter = "[object Object]" |
| `EXCESSIVE_PARAMETER_NESTING` | Error | Parameters.parameters.parameters... |
| `TIMEOUT_TOO_SHORT` | Warning | Timeout < 1000ms |
| `GLOBAL_SCOPE_VARIABLE` | Warning | Global-scope variable used |
| `REGEX_COMPLEXITY_WARNING` | Warning | Pattern too complex (ReDoS risk) |

---

## Template Engine

### Variable Interpolation Syntax

```typescript
// Supported patterns:
{{ $context.variable }}           // Context variables
{{ $json.field }}                 // Trigger data
{{ $json.nested.field }}          // Dot notation
{{ $json.array[0] }}              // Array indexing
{{ $steps.nodeId.output }}        // Previous node output
{{ $env.VAR_NAME }}               // Environment variables
{{ $workflow.variables.name }}    // Workflow variables
{{ $utils.uppercase("text") }}    // Utility functions

// Literals:
{{ "string" }}                    // String literal
{{ 42 }}                          // Number literal
{{ true }}, {{ false }}           // Boolean literals
{{ null }}, {{ undefined }}       // Null/undefined
{{ { key: "value" } }}            // JSON object
{{ ["a", "b"] }}                  // JSON array
```

### Utility Functions

```typescript
// Object operations:
$utils.flatten(obj)          // Convert nested to dot notation
$utils.pick(obj, ["a", "b"])      // Select keys
$utils.omit(obj, ["a", "b"])      // Exclude keys
$utils.merge(...objs)        // Combine objects
$utils.keys(obj)             // Get object keys
$utils.values(obj)           // Get object values
$utils.entries(obj)          // Get [key, value] pairs

// Array operations:
$utils.length(arr)           // Array/string length
$utils.first(arr)            // First element
$utils.last(arr)             // Last element
$utils.reverse(arr)          // Reverse array
$utils.sort(arr)             // Sort array
$utils.unique(arr)           // Unique values
$utils.join(arr, sep)        // Join to string
$utils.split(str, sep)       // Split string

// String operations:
$utils.uppercase(str)        // UPPERCASE
$utils.lowercase(str)        // lowercase
$utils.trim(str)             // Remove whitespace
$utils.replace(str, a, b)    // Replace substring
$utils.includes(str, sub)    // Check contains
$utils.startsWith(str, pre)  // Check prefix
$utils.endsWith(str, suf)    // Check suffix

// Time operations:
$utils.now()                 // ISO 8601 timestamp
$utils.timestamp()           // Unix milliseconds
```

### Template Engine Context Precedence

```typescript
// When evaluating {{ $variable }}:
1. $context.variable
2. $json.variable
3. $env.variable
4. $steps.variable
5. $workflow.variable
6. undefined (not found)
```

---

## Dependencies & Imports

### Internal Dependencies

```
dag-executor.ts
  ├─ types.ts (WorkflowDefinition, WorkflowContext, etc.)
  ├─ priority-queue.ts (PriorityQueue<T>)
  ├─ template-engine.ts (interpolateTemplate, evaluateTemplate)
  └─ (Receives nodeExecutor callback from outside)

registry/node-executor-registry.ts
  └─ types.ts (INodeExecutor, WorkflowNode, etc.)

plugins/function-executor-adapter.ts
  └─ types.ts (INodeExecutor, ValidationResult, etc.)

plugins/index.ts
  ├─ registry/node-executor-registry.ts
  ├─ plugins/function-executor-adapter.ts
  ├─ ../../../plugins/ts/dbal-read/src/index.ts
  ├─ ../../../plugins/ts/string/src/index.ts
  ├─ ... (9 plugin modules)
  └─ types.ts

utils/template-engine.ts
  └─ (No internal dependencies, pure functions)

utils/workflow-validator.ts
  └─ types.ts (WorkflowDefinition, WorkflowNode, etc.)

index.ts (Public API)
  ├─ executor/dag-executor.ts
  ├─ registry/node-executor-registry.ts
  ├─ types.ts
  ├─ utils/* (all utilities)
  └─ plugins/index.ts
```

### External Dependencies

```
@metabuilder/workflow (public package exports)
  ├─ interfaces (INodeExecutor, WorkflowNode, etc.)
  ├─ DAGExecutor
  ├─ NodeExecutorRegistry
  └─ utility functions
```

### Plugin Module Exports

Each plugin module exports:
```typescript
// Class-based:
export class DBALReadExecutor implements INodeExecutor { ... }
export const dbalReadExecutor = new DBALReadExecutor();

// Function-based:
export const stringPlugins: Record<string, PluginFunction> = {
  'string.concat': async (node, context, state) => { ... },
  'string.upper': async (node, context, state) => { ... },
  ...
};
```

---

## Current Gaps & Future Integration Points

### Gap 1: Registry Dependency Injection
**Current**: Registry accessed inside nodeExecutor callback
**Impact**: Tighter coupling, harder to test alternative registries
**Solution**:
```typescript
// Refactor DAGExecutor constructor
constructor(
  executionId: string,
  workflow: WorkflowDefinition,
  context: WorkflowContext,
  registry: NodeExecutorRegistry,  // NEW: Inject registry
  nodeExecutor?: NodeExecutorFn    // OPTIONAL: Custom executor
)
```

### Gap 2: Plugin Discovery & Dynamic Loading
**Current**: Plugins must be pre-registered at startup
**Impact**: Cannot load new plugins at runtime
**Solution**:
```typescript
class PluginManager {
  async loadPlugin(manifest: PluginManifest): Promise<void>
  async unloadPlugin(nodeType: string): Promise<void>
  validatePluginCompatibility(plugin: PluginManifest): boolean
}
```

### Gap 3: Audit Logging for Multi-Tenant Access
**Current**: Validator warns but no runtime audit trail
**Impact**: Cross-tenant access attempts not tracked
**Solution**:
```typescript
interface ExecutionAuditLog {
  timestamp: Date;
  tenantId: string;
  userId: string;
  nodeId: string;
  action: 'execute' | 'skip' | 'error' | 'route';
  accessedEntities?: string[];
}
```

### Gap 4: Rate Limiting Integration
**Current**: Defined in types but not enforced
**Impact**: No actual rate limit enforcement
**Solution**:
```typescript
class RateLimiter {
  checkLimit(policy: RateLimitPolicy, context: WorkflowContext): boolean
  recordRequest(policy: RateLimitPolicy, context: WorkflowContext): void
}
```

### Gap 5: Performance Metrics
**Current**: Only basic execution metrics (duration, count)
**Impact**: Hard to optimize performance bottlenecks
**Solution**:
```typescript
interface AdvancedMetrics {
  nodesExecuted: number;
  peakMemory: number;
  totalDataProcessed: number;
  apiCallsMade: number;
  nodeTimings: Map<string, number>;  // Per-node duration
  queueWaitTime: number;              // Time in queue
}
```

---

## Summary: Node Type Resolution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ COMPLETE NODE TYPE RESOLUTION FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. STARTUP PHASE
   ├─ initializeWorkflowEngine()
   │  ├─ getNodeExecutorRegistry() ─► Singleton creation
   │  ├─ registerBuiltInExecutors()
   │  │  ├─ registry.register('dbal-read', dbalReadExecutor)
   │  │  ├─ registerPluginMap(registry, stringPlugins, 'string')
   │  │  │  └─► createExecutor('string.concat', fn) ─► INodeExecutor
   │  │  ├─ registerPluginMap(registry, mathPlugins, 'math')
   │  │  └─ ... (7 more plugin maps)
   │  └─ console.log('✓ Registered N node executors')
   │
   └─► Registry now has ~80 node types registered


2. WORKFLOW EXECUTION PHASE
   ├─ WorkflowDefinition loaded (JSON from database)
   ├─ validateWorkflow() ─► Syntax validation
   ├─ new DAGExecutor(executionId, workflow, context, nodeExecutor)
   │
   └─ dagExecutor.execute()
      └─ _initializeTriggers() ─► Enqueue trigger nodes
         └─ while (!queue.empty()):
            └─ _executeNode(nodeId)
               ├─ Find node: workflow.nodes.find(n => n.id === nodeId)
               ├─ Check skip conditions
               ├─ _executeNodeWithRetry(node)
               │  └─ for attempt = 0 to maxTries:
               │     └─ nodeExecutor(nodeId, workflow, context, state)
               │        │
               │        ├─ Find node (again): wf.nodes.find(n => n.id === nodeId)
               │        ├─ Extract node.nodeType ◄─ KEY LOOKUP FIELD
               │        ├─ registry.get(node.nodeType) ◄─ REGISTRY LOOKUP
               │        │  └─► INodeExecutor | undefined
               │        │
               │        └─ IF executor:
               │           ├─ executor.validate(node) ─► Validation errors?
               │           ├─ interpolateTemplate(node.parameters, context)
               │           └─ executor.execute(node, context, state)
               │              └─► NodeResult { status, output, error, ... }
               │
               │        ELSE:
               │           └─ throw Error(`No executor: ${node.nodeType}`)
               │
               ├─ Update state[nodeId] = result
               ├─ Update metrics
               ├─ _handleNodeError() if status === 'error'
               └─ _routeOutput() ─► Enqueue downstream nodes


3. POST-EXECUTION PHASE
   ├─ Return ExecutionState
   ├─ Create ExecutionRecord
   └─ Save to database
```

---

## Recommendations for Architect

### Priority 1: Immediate (v3.1.0)
1. **Refactor nodeExecutor callback** to receive registry as parameter
2. **Add plugin compatibility validation** before registration
3. **Implement audit logging** for multi-tenant access

### Priority 2: Short-term (v3.2.0)
1. **Dynamic plugin loading** from package.json or plugin manifest
2. **Runtime rate limiting** enforcement
3. **Advanced performance metrics** tracking

### Priority 3: Long-term (v4.0.0)
1. **C++ executor** for high-performance nodes (Phase 3)
2. **Plugin marketplace** integration
3. **Distributed DAG execution** across workers
4. **GraphQL API** for workflow introspection

---

## File Reference Summary

| Path | Purpose | Key Exports |
|------|---------|------------|
| `/workflow/executor/ts/types.ts` | Core type definitions | `WorkflowDefinition`, `WorkflowNode`, `INodeExecutor`, `WorkflowContext` |
| `/workflow/executor/ts/executor/dag-executor.ts` | DAG execution engine | `DAGExecutor`, `NodeExecutorFn`, `ExecutionMetrics` |
| `/workflow/executor/ts/registry/node-executor-registry.ts` | Plugin registry | `NodeExecutorRegistry`, `getNodeExecutorRegistry()` |
| `/workflow/executor/ts/plugins/function-executor-adapter.ts` | Function adapter | `createExecutor()`, `registerPluginMap()` |
| `/workflow/executor/ts/plugins/index.ts` | Built-in registration | `registerBuiltInExecutors()`, `getAvailableNodeTypes()` |
| `/workflow/executor/ts/utils/template-engine.ts` | Variable interpolation | `interpolateTemplate()`, `evaluateTemplate()` |
| `/workflow/executor/ts/utils/workflow-validator.ts` | Validation logic | `WorkflowValidator`, `validateWorkflow()` |
| `/workflow/executor/ts/utils/priority-queue.ts` | Execution queue | `PriorityQueue<T>` |
| `/workflow/executor/ts/index.ts` | Public API | All exports for npm package |

---

## Integration Example: Custom Plugin

```typescript
// In a custom package: packages/my-custom-action/src/index.ts

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult,
  getNodeExecutorRegistry
} from '@metabuilder/workflow';

export class MyCustomExecutor implements INodeExecutor {
  nodeType = 'my-custom-action';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    try {
      const { apiKey, payload } = node.parameters;

      // Multi-tenant safe: context.tenantId available
      const result = await someApiCall(apiKey, payload, context.tenantId);

      return {
        status: 'success',
        output: result,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        errorCode: 'CUSTOM_EXECUTOR_ERROR',
        timestamp: Date.now()
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];

    if (!node.parameters.apiKey) {
      errors.push('apiKey is required');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

// Register at startup:
export function registerCustomExecutors() {
  const registry = getNodeExecutorRegistry();
  registry.register('my-custom-action', new MyCustomExecutor());
}
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Next Review**: When plugin registry integration is implemented
