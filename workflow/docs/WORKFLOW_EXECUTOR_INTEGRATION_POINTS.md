# Workflow Executor - Plugin Registry Integration Points

## Overview

This document maps where the plugin registry integrates with the rest of the MetaBuilder system and identifies the critical paths for plugin resolution.

---

## Integration Points Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLUGIN REGISTRY INTEGRATION POINTS             │
└─────────────────────────────────────────────────────────────────┘

1. INITIALIZATION LAYER
   ├─► Application Startup
   │   └─► initializeWorkflowEngine()
   │       └─► registerBuiltInExecutors()
   │           ├─► getNodeExecutorRegistry() [Singleton access]
   │           ├─► registry.register('dbal-read', dbalReadExecutor)
   │           ├─► registry.register('dbal-write', dbalWriteExecutor)
   │           ├─► ... (7 more class-based)
   │           ├─► registerPluginMap(registry, stringPlugins)
   │           ├─► registerPluginMap(registry, mathPlugins)
   │           └─► ... (5 more function-based maps)
   │
   │   Location: /workflow/executor/ts/plugins/index.ts:59-83
   │   Called from: /frontends/nextjs/src/lib/workflow/workflow-service.ts
   │


2. REGISTRATION PATH (Direct)
   ├─► Custom Package Startup
   │   └─► getNodeExecutorRegistry()
   │       └─► registry.register('custom-node', customExecutor)
   │
   │   Location: /workflow/executor/ts/registry/node-executor-registry.ts:27-38
   │   Pattern:
   │     const registry = getNodeExecutorRegistry();
   │     registry.register('my-action', new MyExecutor());
   │


3. REGISTRATION PATH (Batch)
   ├─► Plugin Bundle Registration
   │   └─► registry.registerBatch([
   │       { nodeType: 'a', executor: execA },
   │       { nodeType: 'b', executor: execB }
   │     ])
   │
   │   Location: /workflow/executor/ts/registry/node-executor-registry.ts:43-49
   │


4. REGISTRATION PATH (Map-Based)
   ├─► Function Plugin Registration
   │   └─► registerPluginMap(registry, pluginMap, category)
   │       ├─► for each (nodeType, pluginFunction) in pluginMap:
   │       └─► createExecutor(nodeType, fn) → INodeExecutor
   │           └─► registry.register(nodeType, executor)
   │
   │   Location:
   │     - Adapter: /workflow/executor/ts/plugins/function-executor-adapter.ts:92-101
   │     - Usage: /workflow/executor/ts/plugins/index.ts:74-80
   │


5. LOOKUP PATH (Critical Hot Path)
   ├─► Workflow Execution
   │   └─► DAGExecutor.execute()
   │       └─► _executeNode(nodeId)
   │           └─► _executeNodeWithRetry(node)
   │               └─► nodeExecutor callback
   │                   ├─► const node = workflow.nodes.find(n => n.id === nodeId)
   │                   ├─► const nodeType = node.nodeType
   │                   ├─► const executor = registry.get(nodeType) ◄─── REGISTRY LOOKUP
   │                   │   (Location: /workflow/executor/ts/registry/node-executor-registry.ts:54-56)
   │                   │
   │                   ├─► if (!executor) throw Error(...)
   │                   │
   │                   └─► return executor.execute(node, context, state)
   │
   │   Location: /frontends/nextjs/src/lib/workflow/workflow-service.ts:55-86
   │   (Note: nodeExecutor callback is defined here)
   │


6. METADATA QUERY PATHS
   ├─► List All Executors
   │   └─► registry.listExecutors(): string[]
   │       Location: /workflow/executor/ts/registry/node-executor-registry.ts:68-70
   │
   ├─► List All Plugins
   │   └─► registry.listPlugins(): NodeExecutorPlugin[]
   │       Location: /workflow/executor/ts/registry/node-executor-registry.ts:75-77
   │
   ├─► Get Plugin Info
   │   └─► registry.getPluginInfo(nodeType): NodeExecutorPlugin | undefined
   │       Location: /workflow/executor/ts/registry/node-executor-registry.ts:82-84
   │
   ├─► Get Available Node Types
   │   └─► getAvailableNodeTypes(): string[]
   │       Location: /workflow/executor/ts/plugins/index.ts:88-115
   │
   └─► Get Node Types by Category
       └─► getNodeTypesByCategory(): Record<string, string[]>
           Location: /workflow/executor/ts/plugins/index.ts:120-134
```

---

## Critical Hot Paths

### Path 1: Plugin Registry Lookup (CRITICAL - Executes per node)

**Frequency**: Executed for EVERY node in EVERY workflow execution
**Performance Impact**: HIGH - Direct O(1) Map lookup
**Code Location**: `/workflow/executor/ts/registry/node-executor-registry.ts:54-56`

```typescript
// ❌ CURRENT STATE: Registry accessed inside nodeExecutor callback
async execute(
  nodeType: string,
  node: WorkflowNode,
  context: WorkflowContext,
  state: ExecutionState
): Promise<NodeResult> {
  const executor = this.get(nodeType);  // ◄─── O(1) Map lookup

  if (!executor) {
    throw new Error(`No executor registered for node type: ${nodeType}`);
  }

  // Validate node
  const validation = executor.validate(node);
  if (!validation.valid) {
    throw new Error(`Node validation failed: ${validation.errors.join(', ')}`);
  }

  // Execute
  return await executor.execute(node, context, state);
}
```

**Optimization Opportunity**:
- Cache executor references in WorkflowNode during validation
- Skip registry lookup for known executors
- Implement executor type hints in WorkflowDefinition

---

### Path 2: Plugin Registration (Initialization)

**Frequency**: Called ONCE at application startup
**Performance Impact**: LOW - initialization only
**Code Location**: `/workflow/executor/ts/plugins/index.ts:59-83`

```typescript
export function registerBuiltInExecutors(): void {
  const registry = getNodeExecutorRegistry();

  // Class-based: Direct registration (9 executors)
  registry.register('dbal-read', dbalReadExecutor);
  registry.register('dbal-write', dbalWriteExecutor);
  // ... (7 more)

  // Function-based: Map-based registration (70+ executors via adapter)
  registerPluginMap(registry, stringPlugins, 'string');  // 15 executors
  registerPluginMap(registry, mathPlugins, 'math');      // 13 executors
  registerPluginMap(registry, logicPlugins, 'logic');    // 7 executors
  registerPluginMap(registry, listPlugins, 'list');      // 10 executors
  registerPluginMap(registry, dictPlugins, 'dict');      // 8 executors
  registerPluginMap(registry, convertPlugins, 'convert'); // 5 executors
  registerPluginMap(registry, varPlugins, 'var');        // 6 executors

  console.log(`✓ Registered ${registry.listExecutors().length} node executors`);
}
```

**Improvement Opportunity**:
- Move to lazy registration (register on-demand)
- Load plugins from plugin manifest files
- Support dynamic plugin discovery

---

## Plugin Module Interfaces

### INodeExecutor (Core Plugin Interface)

**Location**: `/workflow/executor/ts/types.ts:304-312`

```typescript
export interface INodeExecutor {
  nodeType: string;

  execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult>;

  validate(node: WorkflowNode): ValidationResult;
}
```

**Implementers**:
- `/workflow/plugins/ts/dbal-read/src/index.ts` → DBALReadExecutor
- `/workflow/plugins/ts/dbal-write/src/index.ts` → DBALWriteExecutor
- `/workflow/plugins/ts/integration/http-request/src/index.ts` → HttpRequestExecutor
- `/workflow/plugins/ts/integration/email-send/src/index.ts` → EmailSendExecutor
- `/workflow/plugins/ts/control-flow/condition/src/index.ts` → ConditionExecutor
- `/workflow/plugins/ts/utility/transform/src/index.ts` → TransformExecutor
- `/workflow/plugins/ts/utility/wait/src/index.ts` → WaitExecutor
- `/workflow/plugins/ts/utility/set-variable/src/index.ts` → SetVariableExecutor
- `/workflow/plugins/ts/integration/webhook-response/src/index.ts` → WebhookResponseExecutor

---

### NodeExecutorPlugin (Metadata)

**Location**: `/workflow/executor/ts/registry/node-executor-registry.ts:8-18`

```typescript
export interface NodeExecutorPlugin {
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

**Usage**: Optional metadata for plugin discovery and UI rendering

---

## Where Each Registry Method Is Called

### `register(nodeType, executor, plugin?)`

| Location | Caller | Reason |
|----------|--------|--------|
| `/workflow/executor/ts/plugins/index.ts:63-71` | registerBuiltInExecutors | Register class-based executors |
| `/workflow/executor/ts/plugins/function-executor-adapter.ts:99` | registerPluginMap | Register function-based executors |
| Custom packages (runtime) | Custom code | Register custom executors |

---

### `registerBatch(executors)`

| Location | Usage | Notes |
|----------|-------|-------|
| Not currently used | Available for future | Batch registration optimization |

---

### `get(nodeType)`

| Location | Frequency | Context |
|----------|-----------|---------|
| `/frontends/nextjs/src/lib/workflow/workflow-service.ts:67` | Per node execution | NodeExecutor callback in DAGExecutor |
| Registry.execute() | Per node execution | Registry itself (delegated) |
| Test code | Unit tests | Plugin lookup verification |

---

### `execute(nodeType, node, context, state)`

| Location | Usage | Notes |
|----------|-------|-------|
| Registry class itself | Not directly called | Alternative execution path (rarely used) |
| Tests | Unit tests | Direct registry.execute() call |

---

### `listExecutors()` / `listPlugins()` / `getPluginInfo()`

| Location | Usage | Notes |
|----------|-------|-------|
| Plugin discovery UIs | Future | List available nodes for UI |
| Admin dashboards | Future | Show registered plugins |
| Tests | Current | Verify registration count |

---

## Data Flow: From Node Definition to Execution

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. WORKFLOW JSON (DATABASE)                                     │
├─────────────────────────────────────────────────────────────────┤
│ {                                                                │
│   "id": "wf_123",                                               │
│   "nodes": [                                                     │
│     {                                                            │
│       "id": "node_42",                                           │
│       "nodeType": "dbal-read",  ◄─── KEY IDENTIFIER             │
│       "parameters": { ... }                                      │
│     }                                                            │
│   ],                                                             │
│   "connections": { ... }                                        │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. VALIDATION (Optional but Recommended)                        │
├─────────────────────────────────────────────────────────────────┤
│ validateWorkflow(workflow)                                       │
│   ├─ Checks nodeType is valid (string, non-empty)               │
│   ├─ Validates parameter structure                              │
│   └─ Validates multi-tenant safety                              │
└─────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. DAG EXECUTION STARTS                                         │
├─────────────────────────────────────────────────────────────────┤
│ new DAGExecutor(executionId, workflow, context, nodeExecutor)   │
│   └─ Stores nodeExecutor callback (from workflow-service.ts)    │
└─────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. NODE EXECUTION                                               │
├─────────────────────────────────────────────────────────────────┤
│ dagExecutor.execute()                                            │
│   └─ _executeNode(nodeId)  // For each node in DAG order        │
│       └─ _executeNodeWithRetry(node)                            │
│           └─ nodeExecutor(nodeId, workflow, context, state)     │
└─────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. REGISTRY LOOKUP (CALLBACK LOGIC)                             │
├─────────────────────────────────────────────────────────────────┤
│ In workflow-service.ts:                                          │
│                                                                  │
│ const nodeExecutor = async (nodeId, wf, ctx, state) => {        │
│   const node = wf.nodes.find(n => n.id === nodeId);            │
│   const executor = registry.get(node.nodeType);  ◄─── LOOKUP   │
│   if (!executor) throw Error(...);                              │
│   return executor.execute(node, ctx, state);                    │
│ };                                                              │
└─────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. EXECUTOR RESOLUTION                                          │
├─────────────────────────────────────────────────────────────────┤
│ NodeExecutorRegistry.get('dbal-read')                           │
│   └─► Map<string, INodeExecutor>                                │
│       └─► 'dbal-read' → DBALReadExecutor instance              │
│                          {                                      │
│                            nodeType: 'dbal-read',               │
│                            execute: async function,             │
│                            validate: function                   │
│                          }                                      │
└─────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. NODE EXECUTION                                               │
├─────────────────────────────────────────────────────────────────┤
│ executor.validate(node)                                          │
│ → Validates parameters against node requirements                │
│                                                                  │
│ executor.execute(node, context, state)                          │
│ → Runs node logic (DBAL read, HTTP call, etc.)                  │
│ → Returns NodeResult { status, output, error, ... }             │
│                                                                  │
│ [Multi-tenant safe: context.tenantId available]                │
└─────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. RESULT PROCESSING                                            │
├─────────────────────────────────────────────────────────────────┤
│ DAGExecutor:                                                     │
│   ├─ Update state[nodeId] = result                              │
│   ├─ Update metrics (success count, duration, etc.)             │
│   ├─ Handle errors (retry, route to error port, etc.)           │
│   └─ Route output to next nodes (enqueue in priority queue)     │
└─────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. COMPLETION                                                   │
├─────────────────────────────────────────────────────────────────┤
│ return ExecutionState {                                          │
│   [nodeId]: NodeResult { status, output, error, ... }           │
│   ...                                                            │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Where Registry Integration Gaps Exist

### Gap 1: No Registry Parameter in DAGExecutor

**Current**:
```typescript
// Registry accessed INSIDE nodeExecutor callback
const nodeExecutor = async (nodeId, wf, ctx, state) => {
  const executor = this.registry.get(node.nodeType);  // ◄─── Implicit
};

new DAGExecutor(id, wf, ctx, nodeExecutor);  // Registry not passed
```

**Problem**: DAGExecutor doesn't know about registry, can't validate node types before execution

**Solution**:
```typescript
// Pass registry as dependency
new DAGExecutor(id, wf, ctx, registry, nodeExecutor?);  // ◄─── NEW
```

---

### Gap 2: No Plugin Manifest System

**Current**: Plugins hardcoded in `/workflow/executor/ts/plugins/index.ts`

**Problem**: Adding new plugins requires code changes, no dynamic discovery

**Solution**:
```typescript
// Plugin manifest (plugins/manifest.json)
{
  "plugins": [
    {
      "name": "dbal-read",
      "type": "class",
      "module": "./plugins/ts/dbal-read/src/index.ts",
      "export": "dbalReadExecutor"
    },
    {
      "name": "string",
      "type": "map",
      "module": "./plugins/ts/string/src/index.ts",
      "export": "stringPlugins"
    }
  ]
}

// Dynamic loading
async function loadPluginsFromManifest(manifest) {
  for (const plugin of manifest.plugins) {
    const module = await import(plugin.module);
    const exported = module[plugin.export];

    if (plugin.type === 'class') {
      registry.register(plugin.name, exported);
    } else if (plugin.type === 'map') {
      registerPluginMap(registry, exported, plugin.category);
    }
  }
}
```

---

### Gap 3: No Plugin Validation Before Registration

**Current**:
```typescript
registry.register('custom', executor);  // ◄─── No validation
```

**Problem**: Can register invalid executors, no version checking

**Solution**:
```typescript
function validatePlugin(plugin: NodeExecutorPlugin): ValidationResult {
  const errors: string[] = [];

  if (!plugin.nodeType || !plugin.nodeType.match(/^[\w.-]+$/)) {
    errors.push('Invalid nodeType format');
  }

  if (!plugin.version) {
    errors.push('Plugin must have version');
  }

  if (typeof plugin.executor.execute !== 'function') {
    errors.push('Executor must implement execute() method');
  }

  if (typeof plugin.executor.validate !== 'function') {
    errors.push('Executor must implement validate() method');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

registry.register(plugin.nodeType, plugin.executor, plugin);
```

---

### Gap 4: No Runtime Plugin Unloading

**Current**: Plugins can only be registered, never unregistered (except via `resetNodeExecutorRegistry()`)

**Problem**: Can't update plugins without full application restart

**Solution**:
```typescript
// Already implemented but not fully utilized:
registry.unregister(nodeType);  // Remove single plugin
registry.clear();                // Clear all plugins

// Could add:
async function reloadPlugin(nodeType: string) {
  registry.unregister(nodeType);
  const plugin = await loadPlugin(nodeType);
  registry.register(nodeType, plugin.executor, plugin);
}
```

---

## Integration Checklist for New Plugin Implementations

### For Class-Based Executor

```typescript
// ✓ 1. Implement INodeExecutor interface
export class MyExecutor implements INodeExecutor {
  nodeType = 'my-action';

  async execute(node, context, state): Promise<NodeResult> { ... }
  validate(node): ValidationResult { ... }
}

// ✓ 2. Create singleton instance
export const myExecutor = new MyExecutor();

// ✓ 3. Register in built-in executors
// File: /workflow/executor/ts/plugins/index.ts
import { myExecutor } from '../../../plugins/ts/my-action/src/index';

registry.register('my-action', myExecutor);

// OR register in custom package startup:
const registry = getNodeExecutorRegistry();
registry.register('my-action', new MyExecutor());
```

### For Function-Based Plugin

```typescript
// ✓ 1. Create plugin functions map
export const myPlugins: Record<string, PluginFunction> = {
  'my.action1': async (node, context, state) => { ... },
  'my.action2': async (node, context, state) => { ... }
};

// ✓ 2. Register map
// File: /workflow/executor/ts/plugins/index.ts
import { myPlugins } from '../../../plugins/ts/my-category/src/index';

registerPluginMap(registry, myPlugins, 'my-category');

// OR in custom package:
const registry = getNodeExecutorRegistry();
registerPluginMap(registry, myPlugins, 'my-category');
```

### For Custom Package

```typescript
// ✓ 1. Create executor (class-based or function-based)
// File: packages/my-package/src/executors/my-action.ts

// ✓ 2. Register on package initialization
// File: packages/my-package/src/index.ts
import { initializePackage } from '@metabuilder/workflow';

export function initializeMyPackage() {
  const registry = getNodeExecutorRegistry();
  registry.register('my-action', myExecutor);
}

// ✓ 3. Call in application startup
// File: pages/_app.tsx or main.ts
import { initializeMyPackage } from '@/packages/my-package';
initializeMyPackage();
```

---

## Testing Strategy for Registry Integration

### Unit Test: Plugin Registration

```typescript
import { NodeExecutorRegistry } from '@metabuilder/workflow';

describe('NodeExecutorRegistry', () => {
  let registry: NodeExecutorRegistry;

  beforeEach(() => {
    registry = new NodeExecutorRegistry();
  });

  it('should register class-based executor', () => {
    class TestExecutor implements INodeExecutor {
      nodeType = 'test';
      async execute() { return { status: 'success', timestamp: Date.now() }; }
      validate() { return { valid: true, errors: [], warnings: [] }; }
    }

    const executor = new TestExecutor();
    registry.register('test', executor);

    expect(registry.get('test')).toBe(executor);
    expect(registry.has('test')).toBe(true);
    expect(registry.listExecutors()).toContain('test');
  });

  it('should register function-based executor via adapter', () => {
    const pluginFn = async () => ({ status: 'success', timestamp: Date.now() });
    const executor = createExecutor('test-fn', pluginFn);

    registry.register('test-fn', executor);

    expect(registry.get('test-fn')).toBeDefined();
    expect(registry.listExecutors()).toContain('test-fn');
  });
});
```

### Integration Test: Workflow Execution with Custom Plugin

```typescript
describe('Workflow Execution with Custom Plugin', () => {
  it('should execute node with custom executor', async () => {
    const registry = new NodeExecutorRegistry();

    // Register custom executor
    class CustomExecutor implements INodeExecutor {
      nodeType = 'custom';
      async execute(node, context, state) {
        return {
          status: 'success',
          output: { computed: node.parameters.value * 2 },
          timestamp: Date.now()
        };
      }
      validate() { return { valid: true, errors: [], warnings: [] }; }
    }

    registry.register('custom', new CustomExecutor());

    // Create workflow
    const workflow = {
      id: 'wf_test',
      tenantId: 'tenant_1',
      nodes: [
        {
          id: 'n1',
          nodeType: 'custom',
          parameters: { value: 5 }
        }
      ],
      connections: {}
    };

    // Execute
    const nodeExecutor = async (nodeId, wf, ctx, state) => {
      const node = wf.nodes.find(n => n.id === nodeId);
      const executor = registry.get(node.nodeType);
      return executor.execute(node, ctx, state);
    };

    const dag = new DAGExecutor('exec_1', workflow, { tenantId: 'tenant_1' }, nodeExecutor);
    const state = await dag.execute();

    expect(state.n1.status).toBe('success');
    expect(state.n1.output.computed).toBe(10);
  });
});
```

---

## Performance Monitoring

### Key Metrics to Track

```typescript
// 1. Registry lookup time (per node)
const startTime = performance.now();
const executor = registry.get(nodeType);
const lookupTime = performance.now() - startTime;

// 2. Total plugins registered
const pluginCount = registry.listExecutors().length;

// 3. Plugin registration time (on startup)
console.time('registerBuiltInExecutors');
registerBuiltInExecutors();
console.timeEnd('registerBuiltInExecutors');

// 4. Executor execution time (per node)
// Already tracked in DAGExecutor metrics.duration
```

### Expected Performance

| Operation | Time | Notes |
|-----------|------|-------|
| registry.get(nodeType) | < 1ms | O(1) Map lookup |
| registerBuiltInExecutors() | < 100ms | One-time initialization |
| executor.execute(node) | Varies | Depends on executor logic |

---

## Future Enhancement: Dynamic Plugin Loading

### Proposed Architecture

```typescript
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  nodeTypes: {
    name: string;
    type: 'class' | 'function';
    module: string;
    export: string;
    metadata?: PluginMetadata;
  }[];
  dependencies?: string[];
  compatibility: {
    minVersion: string;
    maxVersion: string;
  };
}

class PluginManager {
  private registry: NodeExecutorRegistry;
  private loadedPlugins: Map<string, PluginManifest> = new Map();

  async loadPlugin(manifest: PluginManifest): Promise<void> {
    // Validate compatibility
    if (!this.checkCompatibility(manifest)) {
      throw new Error(`Plugin ${manifest.id} incompatible`);
    }

    // Validate manifest
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      throw new Error(`Invalid manifest: ${validation.errors}`);
    }

    // Load and register
    for (const nodeType of manifest.nodeTypes) {
      const module = await import(nodeType.module);
      const executor = module[nodeType.export];
      this.registry.register(nodeType.name, executor);
    }

    this.loadedPlugins.set(manifest.id, manifest);
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const manifest = this.loadedPlugins.get(pluginId);
    if (!manifest) throw new Error(`Plugin not loaded: ${pluginId}`);

    for (const nodeType of manifest.nodeTypes) {
      this.registry.unregister(nodeType.name);
    }

    this.loadedPlugins.delete(pluginId);
  }

  private checkCompatibility(manifest: PluginManifest): boolean {
    const engineVersion = VERSION; // '3.0.0'
    return (
      compareVersions(engineVersion, manifest.compatibility.minVersion) >= 0 &&
      compareVersions(engineVersion, manifest.compatibility.maxVersion) <= 0
    );
  }
}
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Status**: Ready for Implementation
