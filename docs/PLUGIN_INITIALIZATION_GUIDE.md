# Plugin Initialization Guide

Complete guide to initializing, registering, and using workflow plugins in MetaBuilder.

## Quick Start

### 1. Application Startup

Initialize plugins during application startup:

```typescript
// src/lib/workflow-init.ts
import { setupPluginRegistry, getPluginRegistry } from '@/workflow/executor/ts/registry';

export async function initializeWorkflowPlugins() {
  // Setup and register built-in plugins (Playwright, Storybook)
  const registered = setupPluginRegistry();

  console.log(`✓ Workflow plugins initialized: ${registered.join(', ')}`);

  // Verify registry health
  const registry = getPluginRegistry();
  const stats = registry.getStats();
  console.log(`📊 Registry stats:
    - Plugins: ${stats.totalPlugins}
    - Cache size: 1000 entries (${stats.cacheHits} hits)
  `);
}

// Call during app initialization
initializeWorkflowPlugins().catch(error => {
  console.error('Failed to initialize workflow plugins:', error);
  process.exit(1);
});
```

### 2. Using Plugins in Workflows

Once initialized, plugins are available in workflow definitions:

```json
{
  "name": "Example Workflow",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "run_tests",
      "name": "Run E2E Tests",
      "type": "testing.playwright",
      "parameters": {
        "browser": "chromium",
        "baseUrl": "http://localhost:3000",
        "testFile": "e2e/tests/login.spec.ts"
      }
    },
    {
      "id": "build_docs",
      "name": "Build Documentation",
      "type": "documentation.storybook",
      "parameters": {
        "command": "build",
        "outputDir": "storybook-static"
      }
    }
  ],
  "connections": {
    "run_tests": {
      "main": {
        "0": [{"node": "build_docs", "type": "main", "index": 0}]
      }
    }
  }
}
```

### 3. Executing Workflows with Plugins

```typescript
// src/lib/execute-workflow.ts
import { DAGExecutor } from '@/workflow/executor/ts/executor';
import { getNodeExecutorRegistry } from '@/workflow/executor/ts/registry';

export async function executeWorkflow(workflowJson: any, tenantId: string) {
  const executor = new DAGExecutor(getNodeExecutorRegistry());

  const result = await executor.execute(workflowJson, {
    tenantId,
    timestamp: Date.now()
  });

  return result;
}
```

## Available Built-In Plugins

### Playwright Testing Plugin

**Type**: `testing.playwright`

Execute E2E tests with multi-browser support:

```json
{
  "type": "testing.playwright",
  "parameters": {
    "browser": "chromium",           // Required
    "baseUrl": "http://localhost:3000",  // Required
    "testFile": "e2e/tests/login.spec.ts",
    "testName": "should login successfully",
    "headless": true,
    "timeout": 30000
  }
}
```

**Multi-Browser Example:**

```json
{
  "name": "Multi-Browser Testing",
  "nodes": [
    {
      "id": "test_chromium",
      "type": "testing.playwright",
      "parameters": {"browser": "chromium", "baseUrl": "http://localhost:3000"}
    },
    {
      "id": "test_firefox",
      "type": "testing.playwright",
      "parameters": {"browser": "firefox", "baseUrl": "http://localhost:3000"}
    },
    {
      "id": "test_webkit",
      "type": "testing.playwright",
      "parameters": {"browser": "webkit", "baseUrl": "http://localhost:3000"}
    }
  ],
  "connections": {
    "test_chromium": {
      "main": {"0": [
        {"node": "test_firefox", "type": "main", "index": 0},
        {"node": "test_webkit", "type": "main", "index": 0}
      ]}
    }
  }
}
```

### Storybook Documentation Plugin

**Type**: `documentation.storybook`

Build and manage component documentation:

```json
{
  "type": "documentation.storybook",
  "parameters": {
    "command": "build",              // Required: build, dev, or test
    "port": 6006,
    "outputDir": "storybook-static",
    "configDir": ".storybook",
    "staticDir": "public",
    "docs": true
  }
}
```

**Documentation Pipeline Example:**

```json
{
  "name": "Build and Deploy Documentation",
  "nodes": [
    {
      "id": "build_storybook",
      "type": "documentation.storybook",
      "parameters": {"command": "build", "outputDir": "storybook-static"}
    },
    {
      "id": "upload_to_s3",
      "type": "aws.s3.upload",
      "parameters": {
        "bucket": "my-docs-bucket",
        "source": "storybook-static",
        "destination": "components/"
      }
    },
    {
      "id": "invalidate_cdn",
      "type": "aws.cloudfront.invalidate",
      "parameters": {
        "distributionId": "E123456789",
        "paths": ["/components/*"]
      }
    }
  ]
}
```

## Registering Custom Plugins

### Step 1: Create Plugin Executor

```typescript
// src/plugins/my-plugin.ts
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@/workflow/executor/ts/types';

export class MyCustomExecutor implements INodeExecutor {
  /**
   * Execute the plugin
   */
  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { parameters } = node;

      if (!parameters) {
        return {
          status: 'error',
          error: 'Missing parameters',
          errorCode: 'VALIDATION_ERROR',
          timestamp: Date.now()
        };
      }

      // Your implementation here
      const result = await this.performWork(parameters);

      return {
        status: 'success',
        data: result,
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'EXECUTION_ERROR',
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Validate node parameters
   */
  validate(node: WorkflowNode): ValidationResult {
    const { parameters } = node;

    if (!parameters) {
      return {
        valid: false,
        errors: ['Missing parameters'],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!parameters.requiredField) {
      errors.push('Missing required field: requiredField');
    }

    // Optional validation
    if (!parameters.optionalField) {
      warnings.push('optionalField not specified, using default');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Helper method for actual work
   */
  private async performWork(parameters: any): Promise<any> {
    // Implement your plugin logic
    return {
      message: 'Plugin executed successfully'
    };
  }
}
```

### Step 2: Register Plugin

```typescript
// src/lib/register-custom-plugins.ts
import { getNodeExecutorRegistry } from '@/workflow/executor/ts/registry';
import { MyCustomExecutor } from '@/plugins/my-plugin';

export function registerCustomPlugins() {
  const registry = getNodeExecutorRegistry();

  registry.register(
    'my.custom',  // Plugin ID
    new MyCustomExecutor(),  // Executor instance
    {
      nodeType: 'my.custom',
      version: '1.0.0',
      executor: new MyCustomExecutor(),
      metadata: {
        category: 'custom',
        description: 'My custom workflow plugin',
        author: 'My Team',
        icon: 'puzzle'
      }
    }
  );

  console.log('✓ Custom plugin registered: my.custom');
}

// Call during app initialization (after setupPluginRegistry)
registerCustomPlugins();
```

### Step 3: Use in Workflows

```json
{
  "id": "run_custom",
  "type": "my.custom",
  "parameters": {
    "requiredField": "value",
    "optionalField": "optional"
  }
}
```

## Plugin Metadata

### Required Fields

Every plugin must provide:

```json
{
  "nodeType": "my.plugin",      // Unique identifier
  "version": "1.0.0",            // Semantic version
  "category": "custom"            // Plugin category
}
```

### Optional Fields

Additional metadata helps with discovery and documentation:

```json
{
  "nodeType": "my.plugin",
  "version": "1.0.0",
  "category": "custom",
  "description": "What this plugin does",
  "tags": ["tag1", "tag2"],
  "author": "Author Name",
  "icon": "puzzle",
  "experimental": false,
  "requiredFields": ["field1", "field2"],
  "supportedVersions": ["1.x", "2.x"],
  "dependencies": {
    "some-package": ">=1.0.0"
  }
}
```

## Plugin Discovery and Initialization

### Automatic Discovery

Plugins in standard directories are automatically discovered:

```
workflow/plugins/
├── ts/
│   ├── testing/
│   │   └── playwright/
│   │       ├── plugin.json
│   │       └── index.ts
│   └── documentation/
│       └── storybook/
│           ├── plugin.json
│           └── index.ts
└── python/
    └── custom/
        ├── plugin.json
        └── index.py
```

Each plugin directory must contain:
- `plugin.json` - Plugin manifest with metadata
- `index.ts` (or other language) - Plugin implementation

### Manual Plugin Initialization

For custom plugin discovery paths:

```typescript
import { getPluginInitializationFramework } from '@/workflow/executor/ts/registry';
import path from 'path';

const framework = getPluginInitializationFramework([
  path.join(process.cwd(), 'workflow/plugins/ts/testing'),
  path.join(process.cwd(), 'workflow/plugins/ts/documentation'),
  path.join(process.cwd(), 'workflow/plugins/custom')
]);

// Discover and initialize
const result = await framework.initializeAll({
  concurrency: 5,
  timeout: 30000,
  validateMetadata: true,
  failOnError: false
});

console.log(`Initialized: ${result.pluginsRegistered}/${result.pluginsLoaded}`);
if (result.errors.length > 0) {
  console.warn('Initialization errors:', result.errors);
}
```

## Querying Plugins

### Get All Registered Plugins

```typescript
import { getRegisteredPlugins } from '@/workflow/executor/ts/registry';

const plugins = getRegisteredPlugins();
plugins.forEach(plugin => {
  console.log(`${plugin.nodeType} (v${plugin.version}) - ${plugin.category}`);
});
```

### Get Plugins by Category

```typescript
import { getPluginsByCategory } from '@/workflow/executor/ts/registry';

const testingPlugins = getPluginsByCategory('testing');
console.log(`Found ${testingPlugins.length} testing plugins`);

const documentationPlugins = getPluginsByCategory('documentation');
console.log(`Found ${documentationPlugins.length} documentation plugins`);
```

### Check Plugin Registry Statistics

```typescript
import { getPluginRegistryStats } from '@/workflow/executor/ts/registry';

const stats = getPluginRegistryStats();
console.log({
  totalPlugins: stats.totalPlugins,
  cacheHits: stats.cacheHits,
  cacheMisses: stats.cacheMisses,
  meanExecutionTime: `${stats.meanExecutionTime.toFixed(1)}ms`
});
```

## Error Handling

### Plugin Validation Errors

```typescript
import { validateAllPlugins } from '@/workflow/executor/ts/registry';

const validationResults = validateAllPlugins();
const errors = validationResults.filter(r => !r.valid);

if (errors.length > 0) {
  errors.forEach(result => {
    console.error(`Plugin ${result.nodeType}:`);
    result.errors.forEach(err => console.error(`  - ${err}`));
  });
}
```

### Plugin Execution Errors

Handled by error recovery manager:

```typescript
import { ErrorRecoveryManager } from '@/workflow/executor/ts/error-handling';

const errorRecovery = new ErrorRecoveryManager({
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2
});

try {
  const result = await executor.execute(node, context, state);

  if (result.status === 'error') {
    const recovery = await errorRecovery.executeWithRecovery(
      async () => executor.execute(node, context, state),
      {
        strategy: 'retry'  // or 'fallback', 'skip', 'fail'
      }
    );
  }
} catch (error) {
  console.error('Plugin execution failed:', error);
}
```

## Multi-Tenant Support

All plugins automatically support multi-tenancy:

```typescript
// Execute workflow for specific tenant
const result = await executeWorkflow(workflowJson, {
  tenantId: 'customer-123'
});

// Plugin receives tenant context
// All operations are automatically filtered by tenantId
```

**Tenant-Aware Parameters:**

```json
{
  "type": "testing.playwright",
  "parameters": {
    "browser": "chromium",
    "baseUrl": "http://localhost:3000",
    // Plugin automatically adds tenantId-specific test database
    // and isolates results to current tenant
  }
}
```

## Performance Optimization

### Plugin Caching

The registry uses LRU caching for 95%+ hit rates:

```
Execution 1: "testing.playwright" → MISS → Load executor → Cache (10ms)
Execution 2: "testing.playwright" → HIT  → Return cached (0.1ms)
Execution 3: "testing.playwright" → HIT  → Return cached (0.1ms)
```

### Parallel Plugin Initialization

Plugins initialize in parallel with concurrency control:

```typescript
const framework = getPluginInitializationFramework();
const result = await framework.initializeAll({
  concurrency: 5,  // Up to 5 parallel initializations
  timeout: 30000   // 30 second timeout per plugin
});
```

### Monitoring Plugin Performance

```typescript
setInterval(() => {
  const stats = getPluginRegistryStats();
  const hitRate = stats.cacheHits / (stats.cacheHits + stats.cacheMisses);

  console.log({
    cacheHitRate: `${(hitRate * 100).toFixed(1)}%`,
    avgExecutionTime: `${stats.meanExecutionTime.toFixed(1)}ms`,
    totalExecutions: stats.totalExecutions,
    errors: stats.errorCount
  });
}, 60000);  // Log every minute
```

## Best Practices

### 1. Initialize at App Startup

```typescript
// ✅ Correct
import { setupPluginRegistry } from '@/workflow/executor/ts/registry';

app.on('startup', async () => {
  setupPluginRegistry();
});

// ❌ Wrong - lazy initialization
async function executeWorkflow() {
  setupPluginRegistry();  // Too late!
}
```

### 2. Validate Plugin Implementations

```typescript
// ✅ Correct
class MyPlugin implements INodeExecutor {
  async execute(...): Promise<NodeResult> { }
  validate(...): ValidationResult { }
}

// ❌ Wrong - incomplete interface
class MyPlugin {
  async execute(...): Promise<NodeResult> { }
  // Missing validate method
}
```

### 3. Use Proper Error Codes

```typescript
// ✅ Correct
return {
  status: 'error',
  error: 'Browser not found',
  errorCode: 'MISSING_DEPENDENCY',
  timestamp: Date.now()
};

// ❌ Wrong
return {
  status: 'error',
  error: 'Something went wrong'
  // Missing structured error code
};
```

### 4. Cache Management

```typescript
// ✅ Correct - periodic health check
setInterval(() => {
  const stats = getPluginRegistryStats();
  if (stats.errorCount > 10) {
    console.warn('High error rate detected');
  }
}, 60000);

// ❌ Wrong - clearing cache unnecessarily
clearCache('all');  // Destroys performance!
```

## Troubleshooting

### Plugin Not Found

```
Error: No executor registered for node type: my.plugin

Solution:
1. Verify plugin was registered: getRegisteredPlugins()
2. Check exact plugin ID matches node.type
3. Ensure setupPluginRegistry() was called at startup
```

### Validation Errors

```
Error: Node validation failed: Missing required field: xyz

Solution:
1. Check node.parameters against plugin schema
2. Use getPluginInfo() to see required fields
3. Review plugin documentation
```

### Performance Issues

```
Symptom: Workflows executing slowly

Solution:
1. Check cache hit rate: getPluginRegistryStats()
2. Monitor plugin execution time
3. Reduce concurrent plugin initializations if CPU-bound
4. Profile individual plugin performance
```

## See Also

- [Workflow Plugins Architecture](./WORKFLOW_PLUGINS_ARCHITECTURE.md)
- [DAG Executor Documentation](./DAG_EXECUTOR_GUIDE.md)
- [Error Recovery Guide](./ERROR_RECOVERY_GUIDE.md)
- [Multi-Tenant Safety](./MULTI_TENANT_AUDIT.md)
