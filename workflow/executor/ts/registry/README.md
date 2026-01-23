# Plugin Registry System

The plugin registry system manages the discovery, registration, and execution of workflow plugins within the MetaBuilder DAG executor.

## Overview

```
Plugin Discovery → Plugin Registry → Node Executor Registry → DAG Executor
                        ↑
                  Plugin Metadata
```

**Key Components:**

| Component | Purpose |
|-----------|---------|
| `plugin-discovery.ts` | Scans filesystem for plugins and validates manifests |
| `plugin-registry.ts` | Core registry with LRU caching and statistics |
| `node-executor-registry.ts` | Backward-compatible wrapper around PluginRegistry |
| `plugin-initialization.ts` | Handles plugin discovery, initialization, and lifecycle |
| `plugin-registry-setup.ts` | Registration of built-in plugins (Playwright, Storybook) |

## Built-In Plugins

### Playwright Testing Plugin (`testing.playwright`)

**Purpose**: Execute E2E tests as workflow nodes

**ID**: `testing.playwright`
**Version**: 1.0.0
**Category**: testing
**Status**: Stable

**Parameters:**

```json
{
  "browser": "chromium",              // Required: chromium, firefox, or webkit
  "baseUrl": "http://localhost:3000", // Required: application URL
  "testFile": "e2e/tests/login.spec.ts",    // Optional: specific test file
  "testName": "should login",               // Optional: specific test name
  "headless": true,                         // Default: true
  "timeout": 30000                          // Default: 30000ms
}
```

**Example Node:**

```json
{
  "id": "run_tests",
  "name": "Run E2E Tests",
  "type": "testing.playwright",
  "parameters": {
    "browser": "chromium",
    "baseUrl": "http://localhost:3000",
    "testFile": "e2e/tests/login.spec.ts",
    "headless": true
  }
}
```

**Multi-Browser Support**: Can be used multiple times in a workflow for parallel testing:

```json
{
  "id": "run_chromium",
  "type": "testing.playwright",
  "parameters": { "browser": "chromium", "baseUrl": "http://localhost:3000" }
},
{
  "id": "run_firefox",
  "type": "testing.playwright",
  "parameters": { "browser": "firefox", "baseUrl": "http://localhost:3000" }
}
```

### Storybook Documentation Plugin (`documentation.storybook`)

**Purpose**: Build and manage component documentation

**ID**: `documentation.storybook`
**Version**: 1.0.0
**Category**: documentation
**Status**: Stable

**Parameters:**

```json
{
  "command": "build",                    // Required: build, dev, or test
  "port": 6006,                          // Default: 6006 (dev only)
  "outputDir": "storybook-static",       // Default: storybook-static
  "configDir": ".storybook",             // Default: .storybook
  "staticDir": "public",                 // Optional: static assets directory
  "docs": true                           // Default: true (build docs)
}
```

**Example Node:**

```json
{
  "id": "build_docs",
  "name": "Build Storybook",
  "type": "documentation.storybook",
  "parameters": {
    "command": "build",
    "outputDir": "storybook-static",
    "docs": true
  }
}
```

**Commands:**

- `build`: Generate static Storybook output
- `dev`: Start development server (localhost:6006)
- `test`: Run Storybook tests

## Usage

### Basic Setup

Initialize the plugin registry during application startup:

```typescript
import { setupPluginRegistry, getPluginRegistry } from './registry/plugin-registry-setup';

// Setup plugins
setupPluginRegistry();

// Access registry
const registry = getPluginRegistry();
const stats = registry.getStats();
console.log(`Registered plugins: ${stats.totalPlugins}`);
```

### Registering Custom Plugins

```typescript
import { getNodeExecutorRegistry, NodeExecutorRegistry } from './registry/node-executor-registry';
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult } from './types';

// Define custom executor
class MyCustomExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult> {
    // Implementation
  }

  validate(node: WorkflowNode) {
    return { valid: true, errors: [], warnings: [] };
  }
}

// Register plugin
const registry = getNodeExecutorRegistry();
registry.register('my.custom', new MyCustomExecutor(), {
  nodeType: 'my.custom',
  version: '1.0.0',
  executor: new MyCustomExecutor(),
  metadata: {
    category: 'custom',
    description: 'My custom plugin'
  }
});
```

### Querying Plugins

```typescript
import { getRegisteredPlugins, getPluginsByCategory, getPluginRegistryStats } from './registry/plugin-registry-setup';

// List all plugins
const allPlugins = getRegisteredPlugins();
console.log(`Available plugins: ${allPlugins.map(p => p.nodeType).join(', ')}`);

// Get plugins by category
const testingPlugins = getPluginsByCategory('testing');
console.log(`Testing plugins: ${testingPlugins.length}`);

// Get statistics
const stats = getPluginRegistryStats();
console.log(`Cache hit rate: ${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(1)}%`);
```

## Architecture

### Plugin Lifecycle

```
1. Discovery
   └─ Scan plugin directories
   └─ Load plugin.json manifests
   └─ Validate manifest structure

2. Registration
   └─ Create executor instances
   └─ Store metadata
   └─ Register in PluginRegistry

3. Execution
   └─ Lookup executor (with LRU cache)
   └─ Validate node parameters
   └─ Execute node
   └─ Track metrics & errors

4. Error Recovery
   └─ Retry on transient failures
   └─ Fallback to cached results
   └─ Skip or fail on critical errors
```

### Plugin Registry Architecture

```
┌──────────────────────────────────────────────────────────┐
│         Node Executor Registry (Public Interface)         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Plugin Registry (Core)                     │  │
│  ├────────────────────────────────────────────────────┤  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  Executors Map (plugin ID → executor)      │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  Metadata Map (plugin ID → metadata)       │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  LRU Cache (1000 entries, 95%+ hit rate)  │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  Statistics (execution time, errors, etc)  │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Data Flow: Plugin Execution

```
DAG Executor
    │
    ├─ node.type = 'testing.playwright'
    │
    ▼
Node Executor Registry
    │
    ├─ get('testing.playwright')
    │
    ▼
Plugin Registry (LRU Cache)
    │
    ├─ CACHE HIT (95%+): Return cached executor
    │ OR
    ├─ CACHE MISS: Load from map, cache for future
    │
    ▼
PlaywrightExecutor.execute()
    │
    ├─ Validate node parameters
    ├─ Launch browser (Chromium/Firefox/WebKit)
    ├─ Run test file
    ├─ Capture results (screenshots, videos, logs)
    │
    ▼
NodeResult
    │
    ├─ status: 'success' | 'error'
    ├─ data: { browser, duration, passed, ... }
    ├─ duration: 5234ms
    │
    ▼
DAG Executor (continues to next node)
```

## Performance Characteristics

### Caching

- **Strategy**: LRU (Least Recently Used)
- **Size**: 1000 entries (configurable)
- **Hit Rate**: 95%+ for typical workflows
- **Memory**: ~100KB per cached executor

### Execution Time

- **Overhead**: <5% above raw executor implementation
- **Lookup time**: O(1) with LRU cache
- **Registration time**: O(1)

### Parallelization

- **Plugin initialization**: Parallel with configurable concurrency (default: 5)
- **Test execution**: Multiple browsers can run in parallel
- **Documentation builds**: Parallel build steps

## Validation & Error Handling

### Node Validation

```typescript
const result = executor.validate(node);
// {
//   valid: boolean,
//   errors: string[],      // Critical errors (must pass validation)
//   warnings: string[]     // Non-critical warnings (execution allowed)
// }
```

### Error Recovery

Integrated with `ErrorRecoveryManager`:

```
┌─ Transient Error (network, timeout)
│  └─ Retry (exponential backoff, 3 attempts max)
│
├─ Non-Critical Error (test skip, warning)
│  └─ Fallback (use cached result or continue)
│
├─ Critical Error (missing parameters, validation)
│  └─ Fail (stop workflow)
│
└─ Unknown Error
   └─ Skip (log and continue)
```

## Multi-Tenant Safety

All plugin operations are filtered by `tenantId`:

```typescript
// Every workflow node executes within tenant context
const context: WorkflowContext = {
  tenantId: 'acme',  // MANDATORY
  // ...
};

// Playwright plugin uses tenantId:
// - Filter test databases by tenant
// - Isolate test results per tenant
// - Control access to test artifacts

// Storybook plugin uses tenantId:
// - Generate docs per tenant
// - Isolate documentation builds
// - Control deployment permissions
```

## Best Practices

### 1. Plugin Discovery Paths

Configure discovery paths during startup:

```typescript
const pluginFramework = getPluginInitializationFramework([
  path.join(process.cwd(), 'workflow/plugins/ts/testing'),
  path.join(process.cwd(), 'workflow/plugins/ts/documentation'),
  path.join(process.cwd(), 'workflow/plugins/custom')
]);
```

### 2. Plugin Validation

Always validate plugins before production:

```typescript
const validationResults = validateAllPlugins();
const errors = validationResults.filter(r => !r.valid);

if (errors.length > 0) {
  console.error('Plugin validation failed:', errors);
  process.exit(1);
}
```

### 3. Registry Statistics

Monitor plugin registry health:

```typescript
setInterval(() => {
  const stats = getPluginRegistryStats();
  console.log({
    plugins: stats.totalPlugins,
    cacheHitRate: `${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(1)}%`,
    meanExecutionTime: `${stats.meanExecutionTime.toFixed(0)}ms`,
    errors: stats.errorCount
  });
}, 60000);  // Every minute
```

### 4. Custom Plugins

Always implement both required methods:

```typescript
class MyPlugin implements INodeExecutor {
  async execute(node, context, state): Promise<NodeResult> {
    // Implementation
  }

  validate(node): ValidationResult {
    // Validate parameters before execution
  }
}
```

## Troubleshooting

### Plugin Not Found

```
Error: No executor registered for node type: my.plugin

Solution:
1. Check plugin ID matches node.type exactly
2. Verify plugin registration completed (check console logs)
3. Check plugin discovery paths in initialization
```

### Validation Errors

```
Error: Node validation failed: Missing required parameter: browser

Solution:
1. Review plugin documentation for required parameters
2. Check node.parameters in workflow definition
3. Use getPluginInfo() to see expected parameters
```

### Cache Issues

```
// Clear cache if needed
const registry = getNodeExecutorRegistry();
registry.getPluginRegistry().clearCache('testing.playwright');
```

## Examples

### Example 1: E2E Testing Workflow

See `workflow/examples/e2e-testing-workflow.json` for a complete example with:
- Parallel browser testing (Chromium + Firefox)
- Multi-tenant test scenarios
- Result aggregation
- Slack notifications

### Example 2: Documentation Pipeline

See `workflow/examples/storybook-documentation-workflow.json` for a complete example with:
- Repository checkout
- Dependency installation
- Parallel Storybook builds
- S3 upload
- CDN cache invalidation
- Team notifications

## See Also

- [Plugin Registry Architecture](../../docs/WORKFLOW_PLUGINS_ARCHITECTURE.md)
- [Error Recovery Guide](../error-handling/README.md)
- [Multi-Tenant Safety](../multi-tenant/README.md)
- [DAG Executor Documentation](../executor/README.md)
