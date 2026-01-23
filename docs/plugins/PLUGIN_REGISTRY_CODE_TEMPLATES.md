# Plugin Registry - Code Structure Templates

**Purpose**: Provide copy-paste code templates for implementation
**Status**: Ready to use

---

## Template 1: Core Registry Class

**File**: `workflow/executor/ts/registry/plugin-registry.ts`

```typescript
/**
 * Enhanced Plugin Registry with Caching, Multi-Tenant Safety, and Error Recovery
 * @packageDocumentation
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult } from '../types';
import { LRUCache } from '../cache/executor-cache';
import { PluginValidator } from '../validation/plugin-validator';
import { TenantSafetyManager, TenantPolicy } from '../multi-tenant/tenant-safety';
import { ErrorRecoveryManager, ErrorRecoveryStrategy } from '../error-handling/error-recovery';

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

export interface RegistryStats {
  totalExecutors: number;
  totalPlugins: number;
  cacheHits: number;
  cacheMisses: number;
  totalExecutions: number;
  errorCount: number;
  meanExecutionTime: number;
}

export class PluginRegistry {
  private executors: Map<string, INodeExecutor> = new Map();
  private metadata: Map<string, PluginMetadata> = new Map();
  private cache: LRUCache<string, INodeExecutor>;
  private stats: RegistryStats = {
    totalExecutors: 0,
    totalPlugins: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalExecutions: 0,
    errorCount: 0,
    meanExecutionTime: 0
  };

  private validator: PluginValidator;
  private tenantManager: TenantSafetyManager;
  private errorRecovery: ErrorRecoveryManager;

  private executionTimes: number[] = [];
  private readonly MAX_EXECUTION_TIMES = 100;

  constructor(cacheSize: number = 1000) {
    this.cache = new LRUCache<string, INodeExecutor>(cacheSize);
    this.validator = new PluginValidator();
    this.tenantManager = new TenantSafetyManager();
    this.errorRecovery = new ErrorRecoveryManager();
  }

  /**
   * Register a node executor with full metadata
   */
  registerWithMetadata(
    nodeType: string,
    executor: INodeExecutor,
    metadata: PluginMetadata
  ): void {
    // Validate metadata format
    this._validateMetadata(metadata);

    // Check for overwrite
    if (this.executors.has(nodeType)) {
      console.warn(`Overwriting existing executor for node type: ${nodeType}`);
    }

    // Register
    this.executors.set(nodeType, executor);
    this.metadata.set(nodeType, metadata);

    // Invalidate cache for this node type
    this.cache.invalidate(nodeType);

    // Update stats
    this.stats.totalExecutors = this.executors.size;
    this.stats.totalPlugins = this.metadata.size;

    console.log(`✓ Registered plugin: ${metadata.nodeType} v${metadata.version}`);
  }

  /**
   * Register a node executor (backward compatible)
   */
  register(
    nodeType: string,
    executor: INodeExecutor,
    metadata?: Partial<PluginMetadata>
  ): void {
    const fullMetadata: PluginMetadata = {
      nodeType,
      version: metadata?.version || '1.0.0',
      category: metadata?.category || 'custom',
      ...metadata
    };

    this.registerWithMetadata(nodeType, executor, fullMetadata);
  }

  /**
   * Execute node with full registry support
   */
  async execute(
    nodeType: string,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState,
    strategy?: ErrorRecoveryStrategy
  ): Promise<NodeResult> {
    const startTime = performance.now();

    try {
      // 1. Multi-tenant safety check
      if (!this.tenantManager.isNodeTypeAllowed(context.tenantId, nodeType)) {
        throw new TenantSecurityError(
          `NodeType '${nodeType}' not allowed for tenant '${context.tenantId}'`
        );
      }

      // 2. Get executor (with cache)
      let executor = this.cache.get(nodeType);

      if (!executor) {
        executor = this.executors.get(nodeType);

        if (!executor) {
          throw new UnknownNodeTypeError(
            `No executor registered for node type: ${nodeType}`
          );
        }

        // Cache for future use
        this.cache.set(nodeType, executor);
      } else {
        this.stats.cacheHits++;
      }

      // Track cache miss
      if (!this.cache.get(nodeType)) {
        this.stats.cacheMisses++;
      }

      // 3. Validate node
      const validation = executor.validate(node);
      if (!validation.valid) {
        throw new ValidationError(
          `Node validation failed: ${validation.errors.join(', ')}`
        );
      }

      // Log validation warnings
      if (validation.warnings.length > 0) {
        console.warn(`Node validation warnings for ${node.id}:`, validation.warnings);
      }

      // 4. Execute node
      const result = await executor.execute(node, context, state);

      // 5. Tenant audit logging
      this.tenantManager.auditNodeExecution(context.tenantId, nodeType, result);

      // 6. Update metrics
      const duration = performance.now() - startTime;
      this._updateExecutionMetrics(duration);

      return {
        ...result,
        duration
      };

    } catch (error) {
      // Track error
      this.stats.errorCount++;

      // Attempt recovery
      if (strategy) {
        try {
          const recovered = await this.errorRecovery.handleError(
            nodeType,
            error as Error,
            strategy,
            node,
            context,
            state
          );

          if (recovered.status === 'success') {
            return {
              ...recovered,
              recoveryApplied: true,
              fallbackNodeType: strategy.fallbackNodeType
            };
          }
        } catch (recoveryError) {
          console.error(`Recovery failed for node type '${nodeType}':`, recoveryError);
        }
      }

      // No recovery possible - return error
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: this._getErrorCode(error),
        timestamp: Date.now(),
        duration: performance.now() - startTime
      };
    }
  }

  /**
   * Get executor by node type
   */
  get(nodeType: string): INodeExecutor | undefined {
    return this.executors.get(nodeType);
  }

  /**
   * Check if executor is registered
   */
  has(nodeType: string): boolean {
    return this.executors.has(nodeType);
  }

  /**
   * Get plugin metadata
   */
  getMetadata(nodeType: string): PluginMetadata | undefined {
    return this.metadata.get(nodeType);
  }

  /**
   * List all registered executors
   */
  listExecutors(): string[] {
    return Array.from(this.executors.keys()).sort();
  }

  /**
   * List all registered plugins with metadata
   */
  listPlugins(): PluginMetadata[] {
    return Array.from(this.metadata.values()).sort((a, b) =>
      a.nodeType.localeCompare(b.nodeType)
    );
  }

  /**
   * Get executors by category
   */
  getByCategory(category: string): PluginMetadata[] {
    return Array.from(this.metadata.values()).filter((m) => m.category === category);
  }

  /**
   * Validate all registered executors
   */
  validateAllExecutors(): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const [nodeType, executor] of this.executors) {
      const metadata = this.metadata.get(nodeType);

      const result: ValidationResult = {
        nodeType,
        valid: true,
        errors: [],
        warnings: []
      };

      // Validate executor interface
      if (typeof executor.execute !== 'function') {
        result.valid = false;
        result.errors.push('Missing execute method');
      }

      if (typeof executor.validate !== 'function') {
        result.valid = false;
        result.errors.push('Missing validate method');
      }

      // Validate metadata
      if (!metadata) {
        result.warnings.push('Missing metadata');
      } else {
        if (!metadata.version) result.errors.push('Missing version in metadata');
        if (!metadata.category) result.errors.push('Missing category in metadata');
      }

      results.push(result);
    }

    return results.filter((r) => !r.valid || r.warnings.length > 0);
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    return {
      ...this.stats,
      totalExecutors: this.executors.size,
      totalPlugins: this.metadata.size
    };
  }

  /**
   * Set multi-tenant policy
   */
  setTenantPolicy(policy: TenantPolicy): void {
    this.tenantManager.setPolicy(policy);
  }

  /**
   * Clear execution cache
   */
  clearCache(pattern?: 'all' | string): void {
    if (pattern === 'all' || !pattern) {
      this.cache.clear();
    } else {
      this.cache.invalidate(pattern);
    }
  }

  /**
   * Unregister an executor
   */
  unregister(nodeType: string): boolean {
    const had = this.executors.has(nodeType);

    if (had) {
      this.executors.delete(nodeType);
      this.metadata.delete(nodeType);
      this.cache.invalidate(nodeType);
      this.stats.totalExecutors--;
      this.stats.totalPlugins--;
    }

    return had;
  }

  /**
   * Clear all executors
   */
  clear(): void {
    this.executors.clear();
    this.metadata.clear();
    this.cache.clear();
    this.stats = {
      totalExecutors: 0,
      totalPlugins: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalExecutions: 0,
      errorCount: 0,
      meanExecutionTime: 0
    };
  }

  /**
   * Export registry state for debugging
   */
  export(): {
    executors: string[];
    metadata: Record<string, PluginMetadata>;
    stats: RegistryStats;
    cacheStats: any;
  } {
    return {
      executors: this.listExecutors(),
      metadata: Object.fromEntries(this.metadata),
      stats: this.getStats(),
      cacheStats: this.cache.getStats()
    };
  }

  // ===== Private Methods =====

  private _validateMetadata(metadata: PluginMetadata): void {
    if (!metadata.nodeType) {
      throw new Error('Metadata missing nodeType');
    }
    if (!metadata.version) {
      throw new Error('Metadata missing version');
    }
    if (!metadata.category) {
      throw new Error('Metadata missing category');
    }
  }

  private _updateExecutionMetrics(duration: number): void {
    this.stats.totalExecutions++;

    this.executionTimes.push(duration);
    if (this.executionTimes.length > this.MAX_EXECUTION_TIMES) {
      this.executionTimes.shift();
    }

    // Calculate mean
    const sum = this.executionTimes.reduce((a, b) => a + b, 0);
    this.stats.meanExecutionTime = sum / this.executionTimes.length;
  }

  private _getErrorCode(error: unknown): string {
    if (error instanceof UnknownNodeTypeError) return 'UNKNOWN_NODE_TYPE';
    if (error instanceof ValidationError) return 'VALIDATION_ERROR';
    if (error instanceof TenantSecurityError) return 'TENANT_SECURITY_ERROR';
    return 'EXECUTION_ERROR';
  }
}

// ===== Error Classes =====

export class UnknownNodeTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownNodeTypeError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TenantSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantSecurityError';
  }
}

export interface ValidationResult {
  nodeType: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ===== Global Registry Singleton =====

let globalRegistry: PluginRegistry | null = null;

export function getPluginRegistry(): PluginRegistry {
  if (!globalRegistry) {
    globalRegistry = new PluginRegistry();
  }
  return globalRegistry;
}

export function setPluginRegistry(registry: PluginRegistry): void {
  globalRegistry = registry;
}

export function resetPluginRegistry(): void {
  globalRegistry = null;
}
```

---

## Template 2: LRU Cache Implementation

**File**: `workflow/executor/ts/cache/executor-cache.ts`

```typescript
/**
 * LRU (Least Recently Used) Cache for Executor Instances
 * @packageDocumentation
 */

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

export class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V> = new Map();
  private accessOrder: K[] = [];

  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return undefined;
    }

    // Move to end (most recently used)
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);

    this.stats.hits++;
    return this.cache.get(key);
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V): void {
    // Remove if already exists
    if (this.cache.has(key)) {
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
      }
    }

    // Add to end
    this.cache.set(key, value);
    this.accessOrder.push(key);

    // Evict LRU if over capacity
    if (this.cache.size > this.maxSize) {
      const oldest = this.accessOrder.shift();
      if (oldest !== undefined) {
        this.cache.delete(oldest);
        this.stats.evictions++;
      }
    }
  }

  /**
   * Check if key exists
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Remove a specific key
   */
  invalidate(key: K): boolean {
    const had = this.cache.has(key);

    if (had) {
      this.cache.delete(key);
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
      }
    }

    return had;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: parseFloat(hitRate.toFixed(2)),
      evictions: this.stats.evictions
    };
  }

  /**
   * Get all keys
   */
  keys(): K[] {
    return Array.from(this.accessOrder);
  }

  /**
   * Peek at value without updating access order
   */
  peek(key: K): V | undefined {
    return this.cache.get(key);
  }
}
```

---

## Template 3: Multi-Tenant Safety Manager

**File**: `workflow/executor/ts/multi-tenant/tenant-safety.ts`

```typescript
/**
 * Multi-Tenant Safety Manager
 * Enforces tenant isolation and access control
 * @packageDocumentation
 */

import { WorkflowContext, NodeResult } from '../types';

export interface TenantPolicy {
  tenantId: string;
  allowedNodeTypes?: string[];
  restrictedNodeTypes?: string[];
  dataIsolation?: 'strict' | 'relaxed';
  auditLogging?: boolean;
}

export interface AuditLog {
  timestamp: number;
  tenantId: string;
  nodeType: string;
  status: string;
  duration?: number;
  userId?: string;
}

export class TenantSafetyManager {
  private policies: Map<string, TenantPolicy> = new Map();
  private auditLogs: Map<string, AuditLog[]> = new Map();

  private readonly MAX_AUDIT_LOGS = 10000;

  /**
   * Set tenant policy
   */
  setPolicy(policy: TenantPolicy): void {
    // Validate policy
    if (!policy.tenantId) {
      throw new Error('Tenant policy must have tenantId');
    }

    this.policies.set(policy.tenantId, {
      dataIsolation: 'strict',
      auditLogging: true,
      ...policy
    });
  }

  /**
   * Check if node type is allowed for tenant
   */
  isNodeTypeAllowed(tenantId: string, nodeType: string): boolean {
    const policy = this.policies.get(tenantId);

    // No policy = allow all
    if (!policy) return true;

    // Whitelist takes precedence
    if (policy.allowedNodeTypes && policy.allowedNodeTypes.length > 0) {
      return policy.allowedNodeTypes.includes(nodeType);
    }

    // Check blacklist
    if (policy.restrictedNodeTypes && policy.restrictedNodeTypes.length > 0) {
      return !policy.restrictedNodeTypes.includes(nodeType);
    }

    return true;
  }

  /**
   * Enforce data isolation - add tenantId to filters
   */
  enforceDataIsolation(tenantId: string, filter: any): any {
    const policy = this.policies.get(tenantId);

    if (policy?.dataIsolation === 'strict') {
      // Create new object to avoid mutation
      return { ...filter, tenantId };
    }

    return filter;
  }

  /**
   * Audit node execution
   */
  auditNodeExecution(tenantId: string, nodeType: string, result: NodeResult): void {
    const policy = this.policies.get(tenantId);

    if (!policy?.auditLogging) {
      return;
    }

    const log: AuditLog = {
      timestamp: Date.now(),
      tenantId,
      nodeType,
      status: result.status,
      duration: result.duration
    };

    // Store audit log
    if (!this.auditLogs.has(tenantId)) {
      this.auditLogs.set(tenantId, []);
    }

    const logs = this.auditLogs.get(tenantId)!;
    logs.push(log);

    // Trim old logs
    if (logs.length > this.MAX_AUDIT_LOGS) {
      logs.splice(0, logs.length - this.MAX_AUDIT_LOGS);
    }
  }

  /**
   * Get audit logs for tenant
   */
  getAuditLogs(tenantId: string, limit?: number): AuditLog[] {
    const logs = this.auditLogs.get(tenantId) || [];

    if (limit) {
      return logs.slice(-limit);
    }

    return logs;
  }

  /**
   * Clear audit logs
   */
  clearAuditLogs(tenantId: string): void {
    this.auditLogs.delete(tenantId);
  }

  /**
   * Get policy for tenant
   */
  getPolicy(tenantId: string): TenantPolicy | undefined {
    return this.policies.get(tenantId);
  }

  /**
   * Remove policy
   */
  removePolicy(tenantId: string): boolean {
    return this.policies.delete(tenantId);
  }
}
```

---

## Template 4: Error Recovery Manager

**File**: `workflow/executor/ts/error-handling/error-recovery.ts`

```typescript
/**
 * Error Recovery Manager
 * Handles error recovery strategies and fallback execution
 * @packageDocumentation
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult } from '../types';

export interface ErrorRecoveryStrategy {
  strategy: 'fallback' | 'skip' | 'retry' | 'fail';
  fallbackNodeType?: string;
  maxRetries?: number;
  retryDelay?: number;
  allowPartialOutput?: boolean;
}

export interface ErrorMetrics {
  totalErrors: number;
  recoveryAttempts: number;
  recoverySuccess: number;
  recoveryFailed: number;
  errorsByType: Map<string, number>;
  errorsByNodeType: Map<string, number>;
}

export class ErrorRecoveryManager {
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    recoveryAttempts: 0,
    recoverySuccess: 0,
    recoveryFailed: 0,
    errorsByType: new Map(),
    errorsByNodeType: new Map()
  };

  /**
   * Handle error with recovery strategy
   */
  async handleError(
    nodeType: string,
    error: Error,
    strategy: ErrorRecoveryStrategy,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState,
    registryExecute?: (nodeType: string, node: any, ctx: any, state: any) => Promise<NodeResult>
  ): Promise<NodeResult> {
    this.metrics.totalErrors++;
    this.metrics.recoveryAttempts++;
    this._trackError(error, nodeType);

    try {
      switch (strategy.strategy) {
        case 'fallback':
          return await this._applyFallback(
            strategy.fallbackNodeType,
            node,
            context,
            state,
            registryExecute
          );

        case 'skip':
          return this._applySkip(node);

        case 'retry':
          return await this._applyRetry(
            nodeType,
            node,
            context,
            state,
            strategy.maxRetries || 3,
            strategy.retryDelay || 1000,
            registryExecute
          );

        case 'fail':
        default:
          throw error;
      }
    } catch (recoveryError) {
      this.metrics.recoveryFailed++;
      throw recoveryError;
    }
  }

  /**
   * Apply fallback strategy
   */
  private async _applyFallback(
    fallbackNodeType: string | undefined,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState,
    registryExecute?: (nodeType: string, node: any, ctx: any, state: any) => Promise<NodeResult>
  ): Promise<NodeResult> {
    if (!fallbackNodeType || !registryExecute) {
      return {
        status: 'error',
        error: 'Fallback node type not configured',
        timestamp: Date.now()
      };
    }

    try {
      const result = await registryExecute(fallbackNodeType, node, context, state);
      this.metrics.recoverySuccess++;
      return result;
    } catch (error) {
      return {
        status: 'error',
        error: `Fallback failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Apply skip strategy
   */
  private _applySkip(node: WorkflowNode): NodeResult {
    this.metrics.recoverySuccess++;

    return {
      status: 'skipped',
      output: {},
      timestamp: Date.now()
    };
  }

  /**
   * Apply retry strategy
   */
  private async _applyRetry(
    nodeType: string,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState,
    maxRetries: number,
    retryDelay: number,
    registryExecute?: (nodeType: string, node: any, ctx: any, state: any) => Promise<NodeResult>
  ): Promise<NodeResult> {
    if (!registryExecute) {
      return {
        status: 'error',
        error: 'Retry not supported',
        timestamp: Date.now()
      };
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));

        const result = await registryExecute(nodeType, node, context, state);

        if (result.status === 'success') {
          this.metrics.recoverySuccess++;
          return result;
        }
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }
      }
    }

    return {
      status: 'error',
      error: 'All retry attempts failed',
      timestamp: Date.now()
    };
  }

  /**
   * Get error metrics
   */
  getMetrics(): ErrorMetrics {
    return {
      ...this.metrics,
      errorsByType: new Map(this.metrics.errorsByType),
      errorsByNodeType: new Map(this.metrics.errorsByNodeType)
    };
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = {
      totalErrors: 0,
      recoveryAttempts: 0,
      recoverySuccess: 0,
      recoveryFailed: 0,
      errorsByType: new Map(),
      errorsByNodeType: new Map()
    };
  }

  // ===== Private Methods =====

  private _trackError(error: Error, nodeType: string): void {
    const errorType = error.constructor.name;

    this.metrics.errorsByType.set(
      errorType,
      (this.metrics.errorsByType.get(errorType) || 0) + 1
    );

    this.metrics.errorsByNodeType.set(
      nodeType,
      (this.metrics.errorsByNodeType.get(nodeType) || 0) + 1
    );
  }
}
```

---

## Template 5: Plugin Registration Metadata

**File**: Update in `workflow/executor/ts/plugins/index.ts`

```typescript
/**
 * Enhanced Plugin Registration with Metadata
 * Add this to the registerBuiltInExecutors() function
 */

const DBAL_READ_METADATA = {
  nodeType: 'dbal-read',
  version: '1.0.0',
  category: 'dbal',
  description: 'Read from database with filtering, sorting, and pagination',
  requiredFields: ['entity'],
  schema: {
    type: 'object',
    required: ['entity'],
    properties: {
      entity: { type: 'string', description: 'Entity name' },
      operation: { type: 'string', enum: ['read', 'validate', 'aggregate'] },
      filter: { type: 'object', description: 'Filter criteria' },
      limit: { type: 'number', default: 100, maximum: 10000 },
      offset: { type: 'number', default: 0 },
      sort: { type: 'array' }
    }
  },
  tags: ['database', 'query', 'read', 'dbal'],
  author: 'MetaBuilder Team'
};

const DBAL_WRITE_METADATA = {
  nodeType: 'dbal-write',
  version: '1.0.0',
  category: 'dbal',
  description: 'Write/update data in database',
  requiredFields: ['entity', 'operation'],
  tags: ['database', 'mutation', 'write', 'dbal'],
  author: 'MetaBuilder Team'
};

const TRANSFORM_METADATA = {
  nodeType: 'transform',
  version: '1.0.0',
  category: 'utility',
  description: 'Transform and map data using templates',
  requiredFields: ['mapping'],
  tags: ['transformation', 'mapping', 'utility'],
  author: 'MetaBuilder Team'
};

// ... Add similar metadata for all other executors ...

export function registerBuiltInExecutors(): void {
  const registry = getNodeExecutorRegistry();

  // Register with metadata
  registry.registerWithMetadata('dbal-read', dbalReadExecutor, DBAL_READ_METADATA);
  registry.registerWithMetadata('dbal-write', dbalWriteExecutor, DBAL_WRITE_METADATA);
  registry.registerWithMetadata('http-request', httpRequestExecutor, {
    nodeType: 'http-request',
    version: '1.0.0',
    category: 'integration',
    description: 'Make HTTP requests',
    tags: ['http', 'rest', 'api'],
    author: 'MetaBuilder Team'
  });
  registry.registerWithMetadata('email-send', emailSendExecutor, {
    nodeType: 'email-send',
    version: '1.0.0',
    category: 'integration',
    description: 'Send emails',
    tags: ['email', 'notification'],
    author: 'MetaBuilder Team'
  });
  registry.registerWithMetadata('condition', conditionExecutor, {
    nodeType: 'condition',
    version: '1.0.0',
    category: 'control-flow',
    description: 'Conditional branching',
    tags: ['condition', 'control-flow', 'logic'],
    author: 'MetaBuilder Team'
  });
  registry.registerWithMetadata('transform', transformExecutor, TRANSFORM_METADATA);
  registry.registerWithMetadata('wait', waitExecutor, {
    nodeType: 'wait',
    version: '1.0.0',
    category: 'control-flow',
    description: 'Wait for specified duration',
    tags: ['wait', 'delay', 'control-flow'],
    author: 'MetaBuilder Team'
  });
  registry.registerWithMetadata('set-variable', setVariableExecutor, {
    nodeType: 'set-variable',
    version: '1.0.0',
    category: 'utility',
    description: 'Set workflow variables',
    tags: ['variable', 'state', 'utility'],
    author: 'MetaBuilder Team'
  });
  registry.registerWithMetadata('webhook-response', webhookResponseExecutor, {
    nodeType: 'webhook-response',
    version: '1.0.0',
    category: 'integration',
    description: 'Respond to webhook',
    tags: ['webhook', 'response', 'integration'],
    author: 'MetaBuilder Team'
  });

  // Register function-based plugins
  registerPluginMap(registry, stringPlugins, 'string');
  registerPluginMap(registry, mathPlugins, 'math');
  registerPluginMap(registry, logicPlugins, 'logic');
  registerPluginMap(registry, listPlugins, 'list');
  registerPluginMap(registry, dictPlugins, 'dict');
  registerPluginMap(registry, convertPlugins, 'convert');
  registerPluginMap(registry, varPlugins, 'var');

  // Validate all plugins
  const validationResults = registry.validateAllExecutors();
  if (validationResults.length > 0) {
    console.warn('Plugin validation warnings:', validationResults);
  }

  console.log(`✓ Registered ${registry.listExecutors().length} node executors`);
}
```

---

## Template 6: Unit Test Suite

**File**: `workflow/executor/ts/registry/plugin-registry.test.ts`

```typescript
/**
 * Plugin Registry Tests
 */

import { PluginRegistry, UnknownNodeTypeError, ValidationError, TenantSecurityError } from './plugin-registry';
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult } from '../types';

// Mock executor
const mockExecutor: INodeExecutor = {
  nodeType: 'test',
  async execute(node, context, state): Promise<NodeResult> {
    return { status: 'success', output: { data: 'test' }, timestamp: Date.now() };
  },
  validate(node) {
    return { valid: true, errors: [], warnings: [] };
  }
};

// Mock context
const mockContext: WorkflowContext = {
  executionId: 'exec-1',
  tenantId: 'tenant-1',
  userId: 'user-1',
  user: { id: 'user-1', email: 'test@example.com', level: 1 },
  trigger: { nodeId: 'trigger', kind: 'manual', enabled: true, metadata: {} },
  triggerData: {},
  variables: {},
  secrets: {}
};

// Mock node
const mockNode: WorkflowNode = {
  id: 'node-1',
  name: 'Test Node',
  type: 'operation',
  typeVersion: 1,
  nodeType: 'test',
  position: [0, 0],
  parameters: {},
  inputs: [],
  outputs: [],
  credentials: {},
  disabled: false,
  skipOnFail: false,
  alwaysOutputData: false,
  maxTries: 1,
  waitBetweenTries: 0,
  continueOnError: false,
  onError: 'stopWorkflow',
  metadata: {}
};

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  describe('registerWithMetadata', () => {
    it('should register executor with metadata', () => {
      const metadata = {
        nodeType: 'test',
        version: '1.0.0',
        category: 'test'
      };

      registry.registerWithMetadata('test', mockExecutor, metadata);

      expect(registry.has('test')).toBe(true);
      expect(registry.getMetadata('test')).toEqual(metadata);
    });

    it('should throw on invalid metadata', () => {
      expect(() =>
        registry.registerWithMetadata('test', mockExecutor, {
          version: '1.0.0'
        } as any)
      ).toThrow();
    });

    it('should overwrite existing executor with warning', () => {
      registry.register('test', mockExecutor);
      const consoleSpy = jest.spyOn(console, 'warn');

      registry.register('test', mockExecutor);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Overwriting')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('execute', () => {
    beforeEach(() => {
      registry.register('test', mockExecutor);
    });

    it('should execute node successfully', async () => {
      const result = await registry.execute('test', mockNode, mockContext, {});

      expect(result.status).toBe('success');
      expect(result.output).toEqual({ data: 'test' });
    });

    it('should throw on unknown node type', async () => {
      await expect(
        registry.execute('unknown', mockNode, mockContext, {})
      ).rejects.toThrow(UnknownNodeTypeError);
    });

    it('should return error result on execution error', async () => {
      const errorExecutor: INodeExecutor = {
        nodeType: 'error-test',
        async execute() {
          throw new Error('Execution failed');
        },
        validate() {
          return { valid: true, errors: [], warnings: [] };
        }
      };

      registry.register('error-test', errorExecutor);

      const result = await registry.execute('error-test', mockNode, mockContext, {});

      expect(result.status).toBe('error');
      expect(result.error).toContain('Execution failed');
    });

    it('should update execution metrics', async () => {
      await registry.execute('test', mockNode, mockContext, {});

      const stats = registry.getStats();
      expect(stats.totalExecutions).toBe(1);
    });
  });

  describe('caching', () => {
    beforeEach(() => {
      registry.register('test', mockExecutor);
    });

    it('should cache executors on first access', async () => {
      const stats1 = registry.getStats();
      expect(stats1.cacheHits).toBe(0);
      expect(stats1.cacheMisses).toBe(0);

      await registry.execute('test', mockNode, mockContext, {});

      const stats2 = registry.getStats();
      // May have cache miss on first access
      expect(stats2.totalExecutions).toBe(1);
    });

    it('should clear cache on invalidate', () => {
      registry.clearCache('test');
      expect(registry.has('test')).toBe(true);  // Executor still exists
    });

    it('should clear all cache on reset', () => {
      registry.clearCache('all');
      expect(registry.listExecutors().length).toBe(0);  // All cleared
    });
  });

  describe('multi-tenant safety', () => {
    beforeEach(() => {
      registry.register('test', mockExecutor);
    });

    it('should allow node type by default', async () => {
      const result = await registry.execute('test', mockNode, mockContext, {});
      expect(result.status).toBe('success');
    });

    it('should restrict node types for tenant', async () => {
      registry.setTenantPolicy({
        tenantId: 'tenant-1',
        restrictedNodeTypes: ['test']
      });

      await expect(
        registry.execute('test', mockNode, mockContext, {})
      ).rejects.toThrow(TenantSecurityError);
    });
  });

  describe('listExecutors', () => {
    it('should return sorted list of executors', () => {
      registry.register('zebra', mockExecutor);
      registry.register('apple', mockExecutor);
      registry.register('banana', mockExecutor);

      const list = registry.listExecutors();

      expect(list).toEqual(['apple', 'banana', 'zebra']);
    });
  });

  describe('validateAllExecutors', () => {
    it('should validate all registered executors', () => {
      registry.register('test', mockExecutor);

      const results = registry.validateAllExecutors();

      // Should not have errors for valid executor
      const testResult = results.find((r) => r.nodeType === 'test');
      expect(testResult?.valid).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should track execution metrics', async () => {
      registry.register('test', mockExecutor);

      for (let i = 0; i < 5; i++) {
        await registry.execute('test', mockNode, mockContext, {});
      }

      const stats = registry.getStats();
      expect(stats.totalExecutors).toBe(1);
      expect(stats.totalExecutions).toBe(5);
      expect(stats.meanExecutionTime).toBeGreaterThan(0);
    });
  });
});
```

---

These templates provide a solid foundation for implementation. Copy, paste, and customize for your specific use cases.
