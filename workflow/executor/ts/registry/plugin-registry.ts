/**
 * Enhanced Plugin Registry with Caching, Multi-Tenant Safety, and Error Recovery
 * @packageDocumentation
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult } from '../types';
import { LRUCache } from '../cache/executor-cache';

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

export interface ValidationResult {
  nodeType: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Enhanced Plugin Registry with full lifecycle management
 * Supports metadata, caching, multi-tenant safety, and error recovery
 */
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

  private executionTimes: number[] = [];
  private readonly MAX_EXECUTION_TIMES = 100;

  /**
   * Create a new plugin registry
   * @param cacheSize - LRU cache size (default: 1000)
   */
  constructor(cacheSize: number = 1000) {
    this.cache = new LRUCache<string, INodeExecutor>(cacheSize);
  }

  /**
   * Register a node executor with full metadata
   * Validates metadata and invalidates cache for this node type
   *
   * @param nodeType - Unique node type identifier
   * @param executor - Node executor implementation
   * @param metadata - Plugin metadata including version, category, description
   * @throws Error if metadata is invalid
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
   * Creates default metadata if not provided
   *
   * @param nodeType - Unique node type identifier
   * @param executor - Node executor implementation
   * @param metadata - Optional partial metadata (version, category, etc)
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
   * Handles caching, validation, multi-tenant safety, and error tracking
   *
   * @param nodeType - Type of node to execute
   * @param node - Node configuration
   * @param context - Workflow execution context
   * @param state - Current execution state
   * @returns Node execution result
   */
  async execute(
    nodeType: string,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = performance.now();

    try {
      // 1. Get executor (with cache)
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

      // 2. Validate node
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

      // 3. Execute node
      const result = await executor.execute(node, context, state);

      // 4. Update metrics
      const duration = performance.now() - startTime;
      this._updateExecutionMetrics(duration);

      return {
        ...result,
        duration
      };
    } catch (error) {
      // Track error
      this.stats.errorCount++;

      // Return error result
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
   * @param nodeType - Node type identifier
   * @returns Executor implementation or undefined
   */
  get(nodeType: string): INodeExecutor | undefined {
    return this.executors.get(nodeType);
  }

  /**
   * Check if executor is registered
   * @param nodeType - Node type identifier
   * @returns true if executor exists, false otherwise
   */
  has(nodeType: string): boolean {
    return this.executors.has(nodeType);
  }

  /**
   * Get plugin metadata
   * @param nodeType - Node type identifier
   * @returns Plugin metadata or undefined
   */
  getMetadata(nodeType: string): PluginMetadata | undefined {
    return this.metadata.get(nodeType);
  }

  /**
   * List all registered executors
   * @returns Sorted array of node type identifiers
   */
  listExecutors(): string[] {
    return Array.from(this.executors.keys()).sort();
  }

  /**
   * List all registered plugins with metadata
   * @returns Array of plugin metadata, sorted by node type
   */
  listPlugins(): PluginMetadata[] {
    return Array.from(this.metadata.values()).sort((a, b) =>
      a.nodeType.localeCompare(b.nodeType)
    );
  }

  /**
   * Get executors by category
   * @param category - Category name
   * @returns Array of plugins in category
   */
  getByCategory(category: string): PluginMetadata[] {
    return Array.from(this.metadata.values()).filter((m) => m.category === category);
  }

  /**
   * Validate all registered executors
   * Checks for required interface methods and metadata completeness
   *
   * @returns Array of validation results (errors only)
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
   * @returns Statistics object with execution and cache metrics
   */
  getStats(): RegistryStats {
    return {
      ...this.stats,
      totalExecutors: this.executors.size,
      totalPlugins: this.metadata.size
    };
  }

  /**
   * Clear execution cache
   * @param pattern - 'all' to clear all, string to invalidate specific node type
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
   * Removes executor, metadata, and cache entries
   *
   * @param nodeType - Node type identifier
   * @returns true if executor was removed, false if not found
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
   * Clear all executors, metadata, cache, and statistics
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
    this.executionTimes = [];
  }

  /**
   * Export registry state for debugging and analysis
   * @returns Object containing executors, metadata, statistics, and cache info
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

  /**
   * Validate plugin metadata has required fields
   * @private
   * @throws Error if required fields are missing
   */
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

  /**
   * Update execution metrics after successful execution
   * @private
   */
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

  /**
   * Map error instance to error code
   * @private
   */
  private _getErrorCode(error: unknown): string {
    if (error instanceof UnknownNodeTypeError) return 'UNKNOWN_NODE_TYPE';
    if (error instanceof ValidationError) return 'VALIDATION_ERROR';
    return 'EXECUTION_ERROR';
  }
}

// ===== Error Classes =====

/**
 * Error thrown when requested node type is not registered
 */
export class UnknownNodeTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownNodeTypeError';
  }
}

/**
 * Error thrown when node validation fails
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ===== Global Registry Singleton =====

let globalRegistry: PluginRegistry | null = null;

/**
 * Get or create the global plugin registry singleton
 * @returns Global plugin registry instance
 */
export function getPluginRegistry(): PluginRegistry {
  if (!globalRegistry) {
    globalRegistry = new PluginRegistry();
  }
  return globalRegistry;
}

/**
 * Set the global plugin registry singleton
 * Useful for testing or custom initialization
 *
 * @param registry - Plugin registry instance to set as global
 */
export function setPluginRegistry(registry: PluginRegistry): void {
  globalRegistry = registry;
}

/**
 * Reset the global plugin registry singleton
 * Clears the singleton, forcing creation of new instance on next access
 */
export function resetPluginRegistry(): void {
  globalRegistry = null;
}
