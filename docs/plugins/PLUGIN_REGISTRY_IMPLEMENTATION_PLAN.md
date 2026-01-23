# Plugin Registry Integration Implementation Plan

**Version**: 1.0
**Date**: 2026-01-22
**Status**: Ready for Development
**Complexity**: Medium
**Estimated Timeline**: 5-7 sprints

---

## Executive Summary

This document provides a comprehensive implementation plan for integrating a production-grade plugin registry system into the existing MetaBuilder workflow executor (v3.0.0). The plan addresses:

1. Dynamic plugin discovery and registration
2. Centralized registry management with caching
3. Multi-tenant safety and isolation
4. Graceful error handling for unknown node types
5. Performance optimization through intelligent caching
6. Comprehensive testing and rollback strategies

Current State: Basic registry exists in `workflow/executor/ts/registry/node-executor-registry.ts` with manual registration in `plugins/index.ts`.

Target State: Enterprise-grade registry with dynamic loading, discovery, validation, and multi-tenant awareness.

---

## 1. Architectural Overview

### Current Architecture

```
DAGExecutor
    ├── DAGExecutor._executeNodeWithRetry()
    │   └── NodeExecutor callback function
    │       └── registry.execute(nodeType, node, context, state)
    │
NodeExecutorRegistry
    ├── executors: Map<string, INodeExecutor>
    ├── plugins: Map<string, NodeExecutorPlugin>
    │
Built-in Executors
    ├── Class-based: dbal-read, dbal-write, http-request, etc.
    └── Function-based: string.*, math.*, logic.*, etc. (via adapter)
```

### Target Architecture

```
PluginRegistry (Enhanced)
    ├── Core Registry
    │   ├── executors: Map<string, INodeExecutor>
    │   ├── metadata: Map<string, PluginMetadata>
    │   ├── dependencies: Map<string, string[]>
    │   └── stats: RegistryStats
    │
    ├── Discovery Layer
    │   ├── PluginDiscovery
    │   ├── PluginLoader (async)
    │   └── PluginValidator
    │
    ├── Caching Layer
    │   ├── ExecutorCache (LRU)
    │   ├── MetadataCache
    │   └── ValidationCache
    │
    ├── Multi-Tenant Safety
    │   ├── TenantFilter
    │   ├── PermissionValidator
    │   └── IsolationManager
    │
    └── Error Handling
        ├── FallbackStrategy
        ├── ErrorRecovery
        └── ErrorMetrics

DAGExecutor (Enhanced)
    └── Registry Integration
        ├── Pre-execution validation
        ├── Fallback node type handling
        └── Error metric collection
```

---

## 2. File Modifications & New Files

### 2.1 New Files to Create

#### A. Enhanced Registry System

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/registry/plugin-registry.ts`
**Purpose**: Core registry with caching and discovery
**Size**: ~600 lines

```typescript
export interface PluginMetadata {
  nodeType: string;
  version: string;
  author?: string;
  category: string;
  description?: string;
  requiredFields?: string[];
  schema?: Record<string, any>;
  dependencies?: string[];
  supportedVersions?: string[];
  tags?: string[];
  icon?: string;
  experimental?: boolean;
}

export interface RegistryStats {
  totalExecutors: number;
  totalPlugins: number;
  cacheHits: number;
  cacheMisses: number;
  executionTime: number;
  errorCount: number;
}

export class PluginRegistry {
  private executors: Map<string, INodeExecutor>;
  private metadata: Map<string, PluginMetadata>;
  private cache: LRUCache<string, INodeExecutor>;
  private stats: RegistryStats;
  private tenantRestrictions: Map<string, Set<string>>;

  // Methods will be detailed in sections 2.2-2.8
}
```

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/registry/plugin-discovery.ts`
**Purpose**: Dynamic plugin discovery and loading
**Size**: ~400 lines

```typescript
export interface DiscoveryConfig {
  pluginDirs: string[];
  searchPatterns: string[];
  maxLoadTime?: number;
  validateOnLoad?: boolean;
}

export class PluginDiscovery {
  private config: DiscoveryConfig;
  private discoveredPlugins: Map<string, PluginMetadata>;

  async discoverPlugins(): Promise<PluginMetadata[]>;
  async loadPlugin(pluginPath: string): Promise<INodeExecutor>;
  private validatePlugin(meta: PluginMetadata): boolean;
}
```

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/cache/executor-cache.ts`
**Purpose**: LRU cache for executor instances
**Size**: ~200 lines

```typescript
export class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;
  private accessOrder: K[];

  get(key: K): V | undefined;
  set(key: K, value: V): void;
  clear(): void;
  stats(): CacheStats;
}
```

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/validation/plugin-validator.ts`
**Purpose**: Validate plugins before execution
**Size**: ~350 lines

```typescript
export interface ValidationError {
  nodeType: string;
  error: string;
  severity: 'error' | 'warning';
  timestamp: number;
}

export class PluginValidator {
  validatePlugin(executor: INodeExecutor, metadata: PluginMetadata): ValidationResult;
  validateNodeType(nodeType: string): ValidationResult;
  validateDependencies(nodeType: string, registry: PluginRegistry): boolean;
}
```

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/multi-tenant/tenant-safety.ts`
**Purpose**: Multi-tenant isolation and safety checks
**Size**: ~300 lines

```typescript
export interface TenantPolicy {
  tenantId: string;
  allowedNodeTypes: string[];
  restrictedNodeTypes: string[];
  dataIsolation: 'strict' | 'relaxed';
  auditLogging: boolean;
}

export class TenantSafetyManager {
  isNodeTypeAllowed(tenantId: string, nodeType: string): boolean;
  enforceDataIsolation(context: WorkflowContext, filter: any): any;
  auditNodeExecution(tenantId: string, nodeType: string, result: NodeResult): void;
}
```

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/error-handling/error-recovery.ts`
**Purpose**: Error recovery and fallback strategies
**Size**: ~250 lines

```typescript
export interface ErrorRecoveryStrategy {
  strategy: 'fallback' | 'skip' | 'retry' | 'fail';
  fallbackNodeType?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export class ErrorRecoveryManager {
  handleUnknownNodeType(nodeType: string, strategy: ErrorRecoveryStrategy): INodeExecutor | null;
  recordError(nodeType: string, error: Error): void;
  getErrorMetrics(): ErrorMetrics;
}
```

---

### 2.2 Files to Modify

#### A. Registry Core Enhancement

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/registry/node-executor-registry.ts`

**Modifications**:
1. Add metadata management methods
2. Add cache integration
3. Add multi-tenant checks
4. Add error recovery hooks
5. Add statistics tracking

**Changes**:
```typescript
// NEW: Enhanced registry with caching and validation
export class NodeExecutorRegistry {
  private executors: Map<string, INodeExecutor>;
  private plugins: Map<string, NodeExecutorPlugin>;

  // NEW ADDITIONS:
  private metadata: Map<string, PluginMetadata>;      // Line ~22
  private cache: LRUCache<string, INodeExecutor>;     // Line ~23
  private stats: RegistryStats;                        // Line ~24
  private validator: PluginValidator;                  // Line ~25
  private tenantManager: TenantSafetyManager;          // Line ~26
  private errorRecovery: ErrorRecoveryManager;         // Line ~27

  // ENHANCED execute() method with error handling
  async execute(
    nodeType: string,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState,
    strategy?: ErrorRecoveryStrategy
  ): Promise<NodeResult> {
    // 1. Check cache first
    let executor = this.cache.get(nodeType);

    // 2. Multi-tenant safety check
    if (!this.tenantManager.isNodeTypeAllowed(context.tenantId, nodeType)) {
      throw new TenantSecurityError(`NodeType ${nodeType} not allowed for tenant ${context.tenantId}`);
    }

    // 3. Validation
    const validation = executor.validate(node);

    // 4. Execute with error handling
    try {
      return await executor.execute(node, context, state);
    } catch (error) {
      // 5. Error recovery
      return this.errorRecovery.handleError(nodeType, error, strategy);
    }
  }

  // NEW METHODS:
  registerWithMetadata(nodeType: string, executor: INodeExecutor, metadata: PluginMetadata): void;
  validateAllExecutors(): ValidationResult[];
  getRegistryStats(): RegistryStats;
  setTenantPolicy(policy: TenantPolicy): void;
  clearCache(): void;
}
```

**Lines to modify**: ~114 (execute method), add ~30 new methods

#### B. DAG Executor Integration

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/executor/dag-executor.ts`

**Modifications**:
1. Add error recovery strategy to executor callback
2. Add error metrics collection
3. Add pre-execution validation hook
4. Add fallback node type support

**Changes**:
```typescript
// Line ~222: Enhance node execution
private async _executeNodeWithRetry(node: any): Promise<NodeResult> {
  // NEW: Pre-execution validation
  const validation = await this._validateNodeType(node.nodeType);
  if (!validation.valid) {
    return this._handleValidationFailure(node, validation);
  }

  // ... existing retry logic ...

  // NEW: Error recovery on final failure
  catch (error) {
    const recoveryStrategy = node.errorRecoveryStrategy || this.workflow.errorRecovery;
    return this._registry.execute(
      node.nodeType,
      node,
      this.context,
      this.state,
      recoveryStrategy  // NEW PARAMETER
    );
  }
}

// NEW: Pre-execution validation
private async _validateNodeType(nodeType: string): Promise<ValidationResult> {
  const registry = getNodeExecutorRegistry();
  const metadata = registry.getPluginInfo(nodeType);

  if (!metadata) {
    return { valid: false, errors: [`Unknown node type: ${nodeType}`] };
  }

  return metadata.schema ? validateAgainstSchema(node, metadata.schema) : { valid: true };
}

// NEW: Validation failure handler
private _handleValidationFailure(node: any, validation: ValidationResult): NodeResult {
  this.metrics.validationFailures++;
  return {
    status: 'error',
    error: validation.errors.join('; '),
    errorCode: 'VALIDATION_FAILED',
    timestamp: Date.now()
  };
}
```

**Lines to modify**: ~222, add ~40 new lines

#### C. Plugin Registration

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/plugins/index.ts`

**Modifications**:
1. Add metadata to all registrations
2. Add plugin discovery call
3. Add dynamic loading support
4. Add initialization validation

**Changes**:
```typescript
// Line ~59-82: Enhanced registration with metadata
export function registerBuiltInExecutors(): void {
  const registry = getNodeExecutorRegistry();

  // ENHANCED: Register with full metadata
  registry.registerWithMetadata('dbal-read', dbalReadExecutor, {
    nodeType: 'dbal-read',
    version: '1.0.0',
    category: 'dbal',
    description: 'Read from database with filtering and pagination',
    requiredFields: ['entity'],
    schema: DBAL_READ_SCHEMA,  // Reference to JSON schema
    tags: ['database', 'query', 'read'],
    author: 'MetaBuilder Team'
  });

  // ... repeat for all executors ...

  // NEW: Dynamic plugin discovery (optional, for extensibility)
  if (process.env.ENABLE_PLUGIN_DISCOVERY === 'true') {
    registerDynamicPlugins(registry);
  }

  // NEW: Validate all registered plugins
  const validationResults = registry.validateAllExecutors();
  logValidationResults(validationResults);

  console.log(`✓ Registered ${registry.listExecutors().length} node executors`);
}

// NEW: Dynamic plugin registration
async function registerDynamicPlugins(registry: NodeExecutorRegistry): Promise<void> {
  const discovery = new PluginDiscovery({
    pluginDirs: [process.env.PLUGIN_DIR || './plugins'],
    searchPatterns: ['**/*.plugin.ts', '**/*.executor.ts'],
    validateOnLoad: true
  });

  const plugins = await discovery.discoverPlugins();
  for (const plugin of plugins) {
    try {
      const executor = await discovery.loadPlugin(plugin.path);
      registry.registerWithMetadata(plugin.nodeType, executor, plugin);
    } catch (error) {
      console.error(`Failed to load plugin: ${plugin.nodeType}`, error);
    }
  }
}
```

**Lines to modify**: ~59-82, add ~50 new lines

#### D. Types Extension

**File**: `/Users/rmac/Documents/metabuilder/workflow/executor/ts/types.ts`

**Modifications**:
1. Add error recovery types
2. Add validation types
3. Add tenant policy types
4. Extend NodeExecutorPlugin

**Changes**:
```typescript
// Line ~250: Extend NodeResult
export interface NodeResult {
  status: 'success' | 'error' | 'skipped' | 'pending';
  output?: any;
  error?: string;
  errorCode?: string;
  timestamp: number;
  duration?: number;
  retries?: number;
  inputData?: any;
  outputData?: any;
  // NEW:
  recoveryApplied?: boolean;           // Was error recovery applied?
  fallbackNodeType?: string;           // Which fallback was used?
  validationErrors?: string[];         // Pre-execution validation errors
}

// NEW: Error recovery strategy
export interface ErrorRecoveryStrategy {
  strategy: 'fallback' | 'skip' | 'retry' | 'fail';
  fallbackNodeType?: string;
  maxRetries?: number;
  retryDelay?: number;
  allowPartialOutput?: boolean;
}

// NEW: Tenant policy for node types
export interface TenantPolicy {
  tenantId: string;
  allowedNodeTypes: string[];
  restrictedNodeTypes: string[];
  dataIsolation: 'strict' | 'relaxed';
  auditLogging: boolean;
}

// NEW: Plugin metadata
export interface PluginMetadata {
  nodeType: string;
  version: string;
  category: string;
  description?: string;
  requiredFields?: string[];
  schema?: Record<string, any>;
  dependencies?: string[];
  supportedVersions?: string[];
  tags?: string[];
  author?: string;
  icon?: string;
  experimental?: boolean;
}

// Enhanced NodeExecutorPlugin
export interface NodeExecutorPlugin {
  nodeType: string;
  version: string;
  executor: INodeExecutor;
  metadata?: PluginMetadata;           // ENHANCED: More detailed
}
```

**Lines to modify**: ~250, add ~60 new lines

---

## 3. Error Handling & Recovery Strategy

### 3.1 Error Classification

| Error Type | Severity | Recovery | Fallback |
|---|---|---|---|
| **NodeTypeNotFound** | Error | Log + Fail | none |
| **NodeTypeDisabledForTenant** | Error | Log + Fail | none |
| **ValidationFailed** | Error | Log + Fail | skip |
| **ExecutionTimeout** | Warn | Retry | fallback |
| **ExecutionError** | Error | Log + Fail | fallback |
| **InvalidParameters** | Error | Log + Fail | none |
| **CredentialMissing** | Error | Log + Fail | none |
| **DependencyNotLoaded** | Error | Retry Load | none |

### 3.2 Recovery Strategies

```typescript
// Strategy 1: FALLBACK - Use alternative node type
if (error instanceof ExecutionError && node.fallbackNodeType) {
  const fallback = registry.get(node.fallbackNodeType);
  return await fallback.execute(node, context, state);
}

// Strategy 2: SKIP - Continue with empty output
if (error instanceof WarningError && node.continueOnError) {
  return {
    status: 'skipped',
    output: {},
    timestamp: Date.now()
  };
}

// Strategy 3: RETRY - With exponential backoff
if (isRetryableError(error)) {
  const delay = calculateBackoff(attempt);
  await sleep(delay);
  return retry();
}

// Strategy 4: FAIL - Stop execution
throw new WorkflowExecutionError(error);
```

### 3.3 Error Metrics Collection

```typescript
interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Map<string, number>;
  errorsByNodeType: Map<string, number>;
  recoveryAttempts: number;
  recoverySuccess: number;
  recoveryFailed: number;
  meanRecoveryTime: number;
}
```

---

## 4. Multi-Tenant Safety Implementation

### 4.1 Safety Checks

**Check 1: Node Type Authorization**
```typescript
isNodeTypeAllowed(tenantId: string, nodeType: string): boolean {
  const policy = this.tenantPolicies.get(tenantId);
  if (!policy) return true; // Default allow

  // Whitelist > Blacklist
  if (policy.allowedNodeTypes.length > 0) {
    return policy.allowedNodeTypes.includes(nodeType);
  }

  return !policy.restrictedNodeTypes.includes(nodeType);
}
```

**Check 2: Data Isolation**
```typescript
enforceDataIsolation(context: WorkflowContext, filter: any): any {
  const policy = this.tenantPolicies.get(context.tenantId);

  if (policy?.dataIsolation === 'strict') {
    // Force tenantId filter at database level
    return { ...filter, tenantId: context.tenantId };
  }

  return filter;
}
```

**Check 3: Audit Logging**
```typescript
auditNodeExecution(tenantId: string, nodeType: string, result: NodeResult): void {
  const policy = this.tenantPolicies.get(tenantId);

  if (policy?.auditLogging) {
    logAuditEvent({
      tenantId,
      nodeType,
      status: result.status,
      timestamp: result.timestamp,
      duration: result.duration
    });
  }
}
```

### 4.2 Enforcement Points

| Layer | Check | Action |
|---|---|---|
| **Registry** | Node type allowed? | Throw TenantSecurityError |
| **Executor** | Data filter has tenantId? | Auto-inject tenantId |
| **Output** | Verify output doesn't leak? | Audit log |
| **Credentials** | Tenant has access? | Mask/deny credentials |

---

## 5. Performance Optimization - Caching Strategy

### 5.1 LRU Cache Implementation

```typescript
class LRUCache<K, V> {
  private maxSize: number = 1000;
  private cache: Map<K, V> = new Map();
  private accessOrder: K[] = [];

  stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    meanHitTime: 0
  };

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return undefined;
    }

    // Move to end (most recently used)
    this.accessOrder.splice(this.accessOrder.indexOf(key), 1);
    this.accessOrder.push(key);

    this.stats.hits++;
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.accessOrder.splice(this.accessOrder.indexOf(key), 1);
    }

    this.cache.set(key, value);
    this.accessOrder.push(key);

    // Evict if over max size
    if (this.cache.size > this.maxSize) {
      const oldest = this.accessOrder.shift()!;
      this.cache.delete(oldest);
      this.stats.evictions++;
    }
  }
}
```

### 5.2 Caching Layers

**Layer 1: Executor Instance Cache**
- Hit rate target: 95%+
- TTL: None (cache until invalidation)
- Size: 1000 executors

**Layer 2: Metadata Cache**
- Hit rate target: 98%+
- TTL: 1 hour
- Size: 2000 metadata entries
- Invalidation: On registry.registerWithMetadata()

**Layer 3: Validation Result Cache**
- Hit rate target: 90%+
- TTL: 30 minutes
- Size: 5000 results
- Key: `${nodeType}:${parameterHash}`

### 5.3 Cache Invalidation

```typescript
invalidateCache(pattern: 'all' | 'executors' | 'metadata' | 'validation'): void {
  switch (pattern) {
    case 'all':
      this.executorCache.clear();
      this.metadataCache.clear();
      this.validationCache.clear();
      break;
    case 'executors':
      this.executorCache.clear();
      break;
    // ... etc
  }
}
```

---

## 6. Implementation Phases

### Phase 1: Core Registry Enhancement (Sprint 1-2, ~10 days)

**Tasks**:
1. Create `plugin-registry.ts` with base functionality
2. Enhance `node-executor-registry.ts` with metadata support
3. Add types to `types.ts`
4. Create unit tests for core registry

**Deliverables**:
- Enhanced registry with metadata management
- Type definitions complete
- Unit test coverage: 80%+
- Documentation updated

**Review Checklist**:
- [ ] All new methods have JSDoc
- [ ] Type safety: no `any` types in public APIs
- [ ] Backward compatible with existing registration code

### Phase 2: Caching Layer (Sprint 2-3, ~7 days)

**Tasks**:
1. Create `executor-cache.ts` with LRU implementation
2. Integrate cache into registry
3. Add cache statistics collection
4. Create cache invalidation tests

**Deliverables**:
- Working LRU cache with <5ms lookup time
- Cache statistics tracking
- 100 unit tests for cache behavior
- Performance benchmarks

**Performance Targets**:
- Cache hit rate: 95%+
- Lookup latency: <1ms average
- Memory overhead: <50MB for 1000 executors

### Phase 3: Multi-Tenant Safety (Sprint 3-4, ~10 days)

**Tasks**:
1. Create `tenant-safety.ts` with isolation logic
2. Implement tenant policy system
3. Add audit logging hooks
4. Create integration tests

**Deliverables**:
- Tenant isolation enforced at 4 layers
- Audit logging for all node executions
- Configuration via policy objects
- Security test suite (30+ tests)

**Security Checklist**:
- [ ] No tenant data leakage possible
- [ ] All database queries have tenantId filter
- [ ] Audit logs immutable and comprehensive
- [ ] Policy enforcement can't be bypassed

### Phase 4: Error Handling & Recovery (Sprint 4-5, ~8 days)

**Tasks**:
1. Create `error-recovery.ts` with strategies
2. Create `plugin-validator.ts` for pre-execution validation
3. Enhance `dag-executor.ts` error handling
4. Create comprehensive error tests

**Deliverables**:
- Error recovery strategies working
- Pre-execution validation
- Error metrics collection
- Error handling test suite (50+ tests)

**Error Handling Test Cases**:
- [ ] Unknown node types handled gracefully
- [ ] Validation failures don't crash executor
- [ ] Recovery fallbacks work
- [ ] Error metrics are accurate

### Phase 5: Plugin Discovery (Sprint 5-6, ~7 days)

**Tasks**:
1. Create `plugin-discovery.ts` for dynamic loading
2. Add file system scanning
3. Create plugin loader
4. Integration tests with real plugins

**Deliverables**:
- Dynamic plugin discovery working
- Plugin validation before loading
- Async plugin loading
- Discovery integration tests

**Functionality**:
- [ ] Discover plugins from multiple directories
- [ ] Validate plugin before load
- [ ] Handle missing dependencies
- [ ] Report discovery metrics

### Phase 6: Testing & Optimization (Sprint 6-7, ~10 days)

**Tasks**:
1. Create comprehensive test suite (200+ tests)
2. Performance profiling and optimization
3. Load testing (1000+ concurrent executions)
4. Documentation and examples

**Deliverables**:
- 200+ unit tests (90%+ coverage)
- 50+ integration tests
- Performance benchmarks documented
- Complete API documentation
- 5+ code examples

**Testing Coverage**:
- [ ] Registry operations: 95%+
- [ ] Error handling: 95%+
- [ ] Multi-tenant safety: 100%
- [ ] Cache behavior: 95%+

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Test Suite 1: Registry Core**
```typescript
describe('PluginRegistry', () => {
  describe('register', () => {
    it('should register executor with metadata');
    it('should overwrite existing executor with warning');
    it('should validate metadata format');
    it('should reject invalid node types');
  });

  describe('execute', () => {
    it('should retrieve from cache on hit');
    it('should handle unknown node types');
    it('should enforce multi-tenant restrictions');
    it('should collect execution metrics');
  });

  describe('cache', () => {
    it('should maintain 95%+ hit rate');
    it('should evict LRU items when full');
    it('should invalidate on registration');
  });
});
```

**Test Suite 2: Error Recovery**
```typescript
describe('ErrorRecoveryManager', () => {
  describe('handleUnknownNodeType', () => {
    it('should apply fallback strategy');
    it('should skip on skip strategy');
    it('should retry on retry strategy');
    it('should fail on fail strategy');
  });
});
```

**Test Suite 3: Multi-Tenant Safety**
```typescript
describe('TenantSafetyManager', () => {
  describe('isNodeTypeAllowed', () => {
    it('should allow unrestricted types');
    it('should block restricted types');
    it('should respect whitelist');
    it('should respect blacklist');
  });

  describe('enforceDataIsolation', () => {
    it('should inject tenantId in strict mode');
    it('should not inject in relaxed mode');
    it('should handle nested filters');
  });
});
```

### 7.2 Integration Tests

**Test Scenario 1: Full Workflow Execution**
```typescript
test('should execute workflow with mixed executor types', async () => {
  const workflow = {
    nodes: [
      { id: 'n1', nodeType: 'dbal-read', ... },
      { id: 'n2', nodeType: 'transform', ... },
      { id: 'n3', nodeType: 'string.uppercase', ... }
    ],
    connections: { ... }
  };

  const executor = new DAGExecutor(...);
  const result = await executor.execute();

  expect(result).toHaveProperty('n1.output.items');
  expect(result).toHaveProperty('n2.output');
  expect(result).toHaveProperty('n3.output');
});
```

**Test Scenario 2: Error Recovery**
```typescript
test('should recover from unknown node type using fallback', async () => {
  const node = {
    nodeType: 'unknown-plugin',
    fallbackNodeType: 'transform',
    ...
  };

  const result = await registry.execute(node.nodeType, node, context, state);

  expect(result.status).toBe('success');
  expect(result.recoveryApplied).toBe(true);
  expect(result.fallbackNodeType).toBe('transform');
});
```

**Test Scenario 3: Multi-Tenant Isolation**
```typescript
test('should prevent cross-tenant data access', async () => {
  const context1 = { tenantId: 'tenant-1', ... };
  const context2 = { tenantId: 'tenant-2', ... };

  // Restrict 'dbal-write' for tenant-2
  registry.setTenantPolicy({
    tenantId: 'tenant-2',
    restrictedNodeTypes: ['dbal-write']
  });

  // Should succeed for tenant-1
  const result1 = await registry.execute('dbal-write', node, context1, state);
  expect(result1.status).not.toBe('error');

  // Should fail for tenant-2
  expect(() => registry.execute('dbal-write', node, context2, state))
    .toThrow(TenantSecurityError);
});
```

### 7.3 Performance Tests

**Benchmark 1: Cache Hit Performance**
```typescript
benchmark('cache hit lookup', (suite) => {
  // Add 1000 executors to cache
  for (let i = 0; i < 1000; i++) {
    cache.set(`executor-${i}`, mockExecutor);
  }

  suite.add('cache hit', () => {
    cache.get('executor-500'); // Access middle item
  });

  // Target: <0.1ms per lookup
});
```

**Benchmark 2: Registration Time**
```typescript
benchmark('bulk registration', (suite) => {
  suite.add('register 100 executors', () => {
    for (let i = 0; i < 100; i++) {
      registry.registerWithMetadata(...);
    }
  });

  // Target: <100ms for 100 registrations
});
```

**Benchmark 3: Execution Time**
```typescript
benchmark('node execution', (suite) => {
  suite.add('simple node', () => {
    registry.execute('transform', node, context, state);
  });

  // Target: <10ms per node execution
});
```

---

## 8. Rollback Strategy

### 8.1 Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, e2e)
- [ ] Performance benchmarks within targets
- [ ] Code review approved by 2+ reviewers
- [ ] Backward compatibility verified
- [ ] Documentation complete and reviewed
- [ ] Monitoring dashboards ready

### 8.2 Rollback Procedure

**If deployment fails:**

```bash
# Step 1: Identify failure
# Check error logs in CloudWatch/Datadog
# Alert: Look for "PluginRegistry" errors

# Step 2: Immediate rollback
git revert <deployment-commit>
npm run build
npm run test:critical
npm run deploy

# Step 3: Verification
curl https://api/health  # Should return 200
npm run test:smoke       # Run smoke tests

# Step 4: Post-mortem
# Document root cause
# Add regression tests
# Schedule follow-up
```

### 8.3 Gradual Rollout (Recommended)

**Phase 1: Canary (5% of traffic)**
```typescript
// Feature flag: ENABLE_NEW_REGISTRY
if (process.env.USE_NEW_REGISTRY === 'canary') {
  return new PluginRegistry(...);  // New implementation
} else {
  return new NodeExecutorRegistry(...);  // Current implementation
}
```

**Phase 2: Shadow Mode (50% of traffic)**
- New registry processes requests
- Results compared to old registry
- Differences logged for analysis
- No user-facing impact

**Phase 3: Full Rollout (100% of traffic)**
- New registry handles all requests
- Old registry removed in next release

---

## 9. Monitoring & Observability

### 9.1 Key Metrics

| Metric | Target | Alert Threshold |
|---|---|---|
| Cache Hit Rate | 95%+ | <90% |
| Execution Time (p95) | <10ms | >50ms |
| Error Rate | <0.1% | >1% |
| Multi-tenant Violations | 0 | >0 |
| Plugin Load Time | <100ms | >500ms |
| Memory Usage | <100MB | >500MB |

### 9.2 Logging

**Structured Logs**:
```json
{
  "timestamp": "2026-01-22T14:30:00Z",
  "level": "info",
  "service": "workflow-engine",
  "component": "plugin-registry",
  "event": "node_execution",
  "nodeType": "dbal-read",
  "tenantId": "acme",
  "executionId": "exec-123",
  "duration": 8,
  "cacheHit": true,
  "status": "success"
}
```

### 9.3 Dashboards

**Dashboard 1: Registry Health**
- Executor count: 150+
- Plugin load status
- Cache hit rate trend
- Error rate trend

**Dashboard 2: Performance**
- Execution latency (p50, p95, p99)
- Cache performance (hits/misses)
- Memory usage

**Dashboard 3: Security**
- Multi-tenant violations
- Audit log volume
- Node type access by tenant

---

## 10. Documentation

### 10.1 Developer Guide

**Sections**:
1. Architecture overview
2. How to register a plugin
3. Plugin interface (INodeExecutor)
4. Multi-tenant safety best practices
5. Error handling patterns
6. Performance optimization tips
7. Troubleshooting guide

### 10.2 API Reference

Document all new public methods:
- `registry.registerWithMetadata()`
- `registry.execute()`
- `registry.validateAllExecutors()`
- `registry.getRegistryStats()`
- `registry.setTenantPolicy()`

### 10.3 Examples

**Example 1: Create a Simple Plugin**
```typescript
export class MyPlugin implements INodeExecutor {
  nodeType = 'my-plugin';

  async execute(node, context, state) {
    return {
      status: 'success',
      output: { message: 'Hello' },
      timestamp: Date.now()
    };
  }

  validate(node) {
    return { valid: true, errors: [] };
  }
}
```

**Example 2: Configure Multi-Tenant Policy**
```typescript
registry.setTenantPolicy({
  tenantId: 'acme',
  allowedNodeTypes: ['dbal-read', 'transform'],
  restrictedNodeTypes: ['dbal-write'],
  dataIsolation: 'strict',
  auditLogging: true
});
```

---

## 11. Code Quality Standards

### 11.1 TypeScript Strictness

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 11.2 Code Style

- 2-space indentation
- Max 120 characters per line
- JSDoc on all public methods
- Descriptive variable names (no `x`, `i` except in loops)
- No console.log in production code (use logger)

### 11.3 Testing Standards

- Minimum 80% code coverage
- All edge cases tested
- Parameterized tests for multiple scenarios
- Descriptive test names (what, given, when, then)
- Mock external dependencies

---

## 12. Timeline & Resource Allocation

### 12.1 Sprint Breakdown

| Sprint | Phase | Tasks | Days | Lead |
|---|---|---|---|---|
| 1-2 | Core Registry | Registry + Types | 10 | Dev A |
| 2-3 | Caching | LRU + Integration | 7 | Dev B |
| 3-4 | Multi-Tenant | Isolation + Policies | 10 | Dev A |
| 4-5 | Error Handling | Recovery + Validation | 8 | Dev B |
| 5-6 | Discovery | Dynamic Loading | 7 | Dev C |
| 6-7 | Testing | Tests + Optimization | 10 | Dev A, B |

### 12.2 Resource Requirements

- 3 Senior Engineers (Devs A, B, C)
- 1 QA Engineer (Test automation)
- 1 DevOps Engineer (Monitoring setup)
- 1 Tech Lead (Code review)

**Total Effort**: 52 person-days (~10 weeks)

---

## 13. Success Criteria

### 13.1 Functional Requirements

- [ ] All plugins registered with metadata
- [ ] Dynamic plugin discovery working
- [ ] Error recovery strategies implemented
- [ ] Multi-tenant safety enforced at 4+ layers
- [ ] Cache hit rate 95%+
- [ ] Pre-execution validation working

### 13.2 Performance Requirements

- [ ] Node execution time: <10ms (p95)
- [ ] Cache lookup: <0.1ms
- [ ] Plugin registration: <1ms
- [ ] Memory overhead: <100MB
- [ ] Zero performance regression vs current

### 13.3 Quality Requirements

- [ ] Test coverage: 90%+
- [ ] Code review approved
- [ ] Documentation complete
- [ ] Backward compatible
- [ ] No breaking changes

### 13.4 Security Requirements

- [ ] Multi-tenant violations: 0
- [ ] Audit logging comprehensive
- [ ] All dependencies scanned
- [ ] OWASP top 10 not vulnerable
- [ ] Penetration test passed

---

## 14. Risk Mitigation

### 14.1 Identified Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Cache invalidation issues | Medium | High | Comprehensive cache tests, gradual rollout |
| Multi-tenant data leakage | Low | Critical | 100% security test coverage, code review |
| Performance regression | Medium | Medium | Benchmarking at each phase, shadow mode |
| Plugin compatibility | Medium | Medium | Version pinning, compatibility matrix |
| Deployment complexity | Low | Medium | Infrastructure-as-code, automated deployment |

### 14.2 Contingency Plans

**If cache hits <90%**:
- Increase cache size
- Implement warming strategy
- Review eviction algorithm
- Consider persistent cache

**If performance regresses**:
- Profile with Flamegraph
- Optimize hot paths
- Consider caching layers
- Rollback if needed

**If multi-tenant issues found**:
- Pause rollout
- Audit all data flows
- Add additional checks
- Retest extensively

---

## 15. Sign-Off

| Role | Name | Date | Status |
|---|---|---|---|
| Technical Lead | [TBD] | [TBD] | Pending |
| Engineering Manager | [TBD] | [TBD] | Pending |
| Product Manager | [TBD] | [TBD] | Pending |
| Security Lead | [TBD] | [TBD] | Pending |

---

## Appendix A: File Checklist

### New Files to Create

- [ ] `/workflow/executor/ts/registry/plugin-registry.ts` (~600 lines)
- [ ] `/workflow/executor/ts/registry/plugin-discovery.ts` (~400 lines)
- [ ] `/workflow/executor/ts/cache/executor-cache.ts` (~200 lines)
- [ ] `/workflow/executor/ts/validation/plugin-validator.ts` (~350 lines)
- [ ] `/workflow/executor/ts/multi-tenant/tenant-safety.ts` (~300 lines)
- [ ] `/workflow/executor/ts/error-handling/error-recovery.ts` (~250 lines)
- [ ] `/workflow/executor/ts/registry/plugin-registry.test.ts` (~600 lines)
- [ ] `/workflow/executor/ts/cache/executor-cache.test.ts` (~400 lines)
- [ ] `/docs/PLUGIN_REGISTRY_API.md` (comprehensive API reference)
- [ ] `/docs/PLUGIN_REGISTRY_EXAMPLES.md` (code examples)

### Files to Modify

- [ ] `/workflow/executor/ts/registry/node-executor-registry.ts` (enhance)
- [ ] `/workflow/executor/ts/executor/dag-executor.ts` (integrate)
- [ ] `/workflow/executor/ts/plugins/index.ts` (add metadata)
- [ ] `/workflow/executor/ts/types.ts` (extend interfaces)
- [ ] `/workflow/executor/ts/index.ts` (export new types)
- [ ] `/package.json` (add test scripts)

### Configuration Files

- [ ] `tsconfig.json` (strict mode if not already)
- [ ] `jest.config.js` (test configuration)
- [ ] `.env.example` (environment variables)

---

## Appendix B: Schema Example

```typescript
// Example: DBAL_READ_SCHEMA
const DBAL_READ_SCHEMA = {
  type: 'object',
  required: ['entity'],
  properties: {
    entity: {
      type: 'string',
      description: 'Entity to query',
      enum: ['users', 'posts', 'comments', ...]
    },
    operation: {
      type: 'string',
      enum: ['read', 'validate', 'aggregate'],
      default: 'read'
    },
    filter: {
      type: 'object',
      description: 'Filter criteria'
    },
    limit: {
      type: 'number',
      default: 100,
      maximum: 10000
    },
    sort: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          direction: { enum: ['asc', 'desc'] }
        }
      }
    }
  }
};
```

---

**Document Status**: READY FOR DEVELOPMENT
**Version**: 1.0
**Last Updated**: 2026-01-22
**Next Review**: Start of Sprint 1
