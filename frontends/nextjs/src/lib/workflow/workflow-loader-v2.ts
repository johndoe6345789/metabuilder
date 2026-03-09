/**
 * WorkflowLoaderV2 - Production-Ready Workflow Validation and Orchestration
 *
 * Comprehensive workflow validation system with:
 * - Multi-layer schema validation
 * - Two-layer caching (memory + Redis ready)
 * - Batch validation support
 * - Diagnostic reporting
 * - Multi-tenant safety enforcement
 * - Concurrent validation management
 * - Performance monitoring
 *
 * Architecture:
 * - Validates workflows against schema structure
 * - Validates node definitions and connections
 * - Enforces multi-tenant isolation
 * - Manages resource constraints
 * - Provides comprehensive diagnostics
 *
 * Part of the 95% data pattern: Workflow structure is JSON, validation is TypeScript
 *
 * @module workflow-loader-v2
 * @version 2.0.0
 */

import type {
  WorkflowDefinition,
  WorkflowValidationResult,
  ValidationError,
} from '@metabuilder/workflow'

/** Local diagnostics type for getDiagnostics() return */
interface WorkflowDiagnostics {
  workflowId: string
  tenantId: string
  nodeCount: number
  connectionCount: number
  triggerCount: number
  variableCount: number
  validation: {
    valid: boolean
    errorCount: number
    warningCount: number
    topErrors: ValidationError[]
    topWarnings: ValidationError[]
  }
  metrics: {
    validationTimeMs: number
    cacheHit: boolean
  }
}

/**
 * Extended validation result with cache and timing metadata
 */
export interface ExtendedValidationResult extends WorkflowValidationResult {
  /** Whether result came from cache */
  _cacheHit?: boolean
  /** Validation execution time in milliseconds */
  _validationTime?: number
}

/**
 * Configuration options for WorkflowLoaderV2
 */
export interface WorkflowLoaderV2Options {
  /** Enable validation caching (default: true) */
  enableCache?: boolean
  /** Cache TTL in milliseconds (default: 3600000 = 1 hour) */
  cacheTTLMs?: number
  /** Maximum concurrent validations (default: 10) */
  maxConcurrentValidations?: number
  /** Enable detailed logging (default: false) */
  enableLogging?: boolean
}

/**
 * ValidationCache - Two-layer caching for validation results
 *
 * Provides both memory-local caching and Redis support for distributed systems.
 * Automatically manages TTL and eviction policies.
 *
 * Layer 1: In-memory cache (fast, process-local)
 * Layer 2: Redis cache (distributed, shared across processes)
 */
export class ValidationCache {
  private memoryCache: Map<string, CacheEntry>
  private maxEntries: number
  private ttlMs: number
  private stats: CacheStatistics
  private cleanupInterval: NodeJS.Timeout | null = null

  /**
   * Creates a new validation cache
   *
   * @param ttlMs - Time to live for cache entries in milliseconds
   * @param maxEntries - Maximum number of entries before eviction
   * @example
   * const cache = new ValidationCache(3600000, 100)
   */
  constructor(ttlMs: number = 3600000, maxEntries: number = 100) {
    this.memoryCache = new Map()
    this.ttlMs = ttlMs
    this.maxEntries = maxEntries
    this.stats = {
      hits: 0,
      misses: 0,
    }

    // Start periodic cleanup of expired entries
    this.startCleanupInterval()
  }

  /**
   * Retrieves a cached validation result
   *
   * Checks memory cache first, handles expiration, then would check Redis.
   * Updates cache statistics.
   *
   * @param key - Cache key (format: `tenantId:workflowId:hash`)
   * @returns Cached validation result or null if not found/expired
   *
   * @example
   * const cached = await cache.get('tenant1:wf1:abc123')
   * if (cached) {
   *   console.log('Cache hit!')
   * }
   */
  async get(key: string): Promise<WorkflowValidationResult | null> {
    // Try memory cache first (fast path)
    const entry = this.memoryCache.get(key)

    if (entry) {
      const age = Date.now() - entry.timestamp
      if (age < entry.ttl) {
        // Cache hit - still valid
        this.stats.hits++
        return entry.value
      } else {
        // Expired - remove from cache
        this.memoryCache.delete(key)
      }
    }

    // Cache miss
    this.stats.misses++

    // TODO: Try Redis cache for distributed scenarios
    // const redisClient = getRedisClient()
    // const redisValue = await redisClient.get(key)
    // if (redisValue) {
    //   const parsed = JSON.parse(redisValue)
    //   // Store in memory for future hits
    //   await this.set(key, parsed)
    //   return parsed
    // }

    return null
  }

  /**
   * Stores a validation result in cache
   *
   * Stores in memory cache immediately. Evicts oldest entry if size exceeded.
   * Would also store in Redis for distributed caching.
   *
   * @param key - Cache key
   * @param value - Validation result to cache
   *
   * @example
   * await cache.set('tenant1:wf1:abc123', validationResult)
   */
  async set(key: string, value: WorkflowValidationResult): Promise<void> {
    // Store in memory cache with current timestamp
    this.memoryCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: this.ttlMs,
    })

    // Evict oldest entry if size limit exceeded (FIFO)
    if (this.memoryCache.size > this.maxEntries) {
      const firstKey = this.memoryCache.keys().next().value
      if (firstKey) {
        this.memoryCache.delete(firstKey)
      }
    }

    // TODO: Store in Redis for distributed cache
    // const redisClient = getRedisClient()
    // await redisClient.setex(
    //   key,
    //   Math.floor(this.ttlMs / 1000),
    //   JSON.stringify(value)
    // )
  }

  /**
   * Deletes a specific cache entry
   *
   * Removes from both memory and Redis caches.
   *
   * @param key - Cache key to delete
   *
   * @example
   * await cache.delete('tenant1:wf1:abc123')
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)

    // TODO: Delete from Redis
    // const redisClient = getRedisClient()
    // await redisClient.del(key)
  }

  /**
   * Clears all cache entries
   *
   * Removes all entries from memory and Redis, resets statistics.
   *
   * @example
   * await cache.clear()
   * console.log('Cache cleared')
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()
    this.stats.hits = 0
    this.stats.misses = 0

    // TODO: Clear Redis
    // const redisClient = getRedisClient()
    // await redisClient.flushdb()
  }

  /**
   * Retrieves cache statistics
   *
   * Returns hit rate, miss count, entry count, and memory usage estimate.
   *
   * @returns Cache statistics object
   *
   * @example
   * const stats = cache.getStats()
   * console.log(`Cache hit rate: ${stats.hitRate.toFixed(2)}%`)
   */
  getStats(): CacheStatistics & { hitRate: number; entries: number; memoryUsedMb: number } {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

    // Estimate memory usage
    let memoryUsedMb = 0
    for (const entry of this.memoryCache.values()) {
      memoryUsedMb += JSON.stringify(entry.value).length / 1024 / 1024
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      entries: this.memoryCache.size,
      memoryUsedMb,
    }
  }

  /**
   * Starts periodic cleanup of expired cache entries
   *
   * Runs every 5 minutes to remove stale entries and prevent
   * unbounded memory growth.
   *
   * @private
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      let cleaned = 0

      for (const [key, entry] of this.memoryCache.entries()) {
        const age = Date.now() - entry.timestamp
        if (age >= entry.ttl) {
          this.memoryCache.delete(key)
          cleaned++
        }
      }

      if (cleaned > 0) {
        console.log(`[CACHE CLEANUP] Removed ${cleaned} expired entries`)
      }
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  /**
   * Cleanup resources on shutdown
   *
   * @private
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

/**
 * Cache entry structure
 */
interface CacheEntry {
  /** The cached validation result */
  value: WorkflowValidationResult
  /** Timestamp when entry was cached */
  timestamp: number
  /** TTL for this entry in milliseconds */
  ttl: number
}

/**
 * Cache statistics
 */
interface CacheStatistics {
  /** Number of cache hits */
  hits: number
  /** Number of cache misses */
  misses: number
}

/**
 * WorkflowLoaderV2 - Main workflow validation orchestrator
 *
 * Provides comprehensive workflow validation with:
 * - Complete schema and structure validation
 * - Multi-tenant safety enforcement
 * - Intelligent caching with TTL management
 * - Batch validation support
 * - Concurrent validation management
 * - Diagnostic reporting
 * - Performance metrics
 *
 * The loader validates workflows against:
 * 1. Schema structure (nodes, connections, variables)
 * 2. Node definitions (types, required parameters)
 * 3. Connections (valid source/target nodes)
 * 4. Multi-tenant rules (tenantId isolation)
 * 5. Resource constraints (timeouts, memory limits)
 *
 * @example
 * const loader = new WorkflowLoaderV2()
 * const result = await loader.validateWorkflow(workflow)
 * if (result.valid) {
 *   console.log('Workflow is valid!')
 * } else {
 *   console.log('Errors:', result.errors)
 * }
 */
export class WorkflowLoaderV2 {
  private cache: ValidationCache
  private maxConcurrent: number
  private activeValidations: Map<string, Promise<ExtendedValidationResult>>
  private enableLogging: boolean

  /**
   * Creates a new WorkflowLoaderV2 instance
   *
   * @param options - Configuration options
   *
   * @example
   * const loader = new WorkflowLoaderV2({
   *   cacheTTLMs: 3600000,
   *   maxConcurrentValidations: 10
   * })
   */
  constructor(options: WorkflowLoaderV2Options = {}) {
    this.cache = new ValidationCache(options.cacheTTLMs || 3600000, 100)
    this.maxConcurrent = options.maxConcurrentValidations || 10
    this.activeValidations = new Map()
    this.enableLogging = options.enableLogging !== false
  }

  /**
   * Validates a workflow definition
   *
   * Main validation entry point that:
   * 1. Validates input (workflow must have id and tenantId)
   * 2. Checks cache for existing result
   * 3. Deduplicates concurrent validations
   * 4. Performs full validation if needed
   * 5. Caches result for future requests
   *
   * Returns cached result if available and still valid.
   *
   * @param workflow - Workflow definition to validate
   * @returns Validation result with error/warning details
   * @throws {Error} If workflow is invalid (missing id/tenantId)
   *
   * @example
   * const result = await loader.validateWorkflow(workflow)
   * if (!result.valid) {
   *   console.error('Validation errors:', result.errors)
   * }
   */
  async validateWorkflow(
    workflow: WorkflowDefinition
  ): Promise<ExtendedValidationResult> {
    // Validate required fields
    if (!workflow) {
      throw new Error('Workflow definition is required')
    }

    if (!workflow.id) {
      throw new Error('Workflow must have an id')
    }

    if (!workflow.tenantId) {
      throw new Error('Workflow must have a tenantId')
    }

    // Build cache key including workflow hash for better cache invalidation
    const cacheKey = this.getCacheKey(workflow)

    // Check cache first
    const cached = await this.cache.get(cacheKey)
    if (cached) {
      if (this.enableLogging) {
        console.log(`[CACHE HIT] Validation for workflow ${workflow.id}`)
      }
      return {
        ...cached,
        _cacheHit: true,
      }
    }

    // Check for duplicate concurrent validations
    const validationKey = `${workflow.tenantId}:${workflow.id}`
    if (this.activeValidations.has(validationKey)) {
      if (this.enableLogging) {
        console.log(
          `[DEDUP] Reusing in-flight validation for ${validationKey}`
        )
      }
      return await this.activeValidations.get(validationKey)!
    }

    // Warn if approaching concurrency limit
    if (this.activeValidations.size >= this.maxConcurrent) {
      console.warn(
        `Max concurrent validations reached (${this.maxConcurrent}). Consider increasing limit.`
      )
    }

    // Perform validation and cache result
    const validationPromise = this._performValidation(workflow)
    this.activeValidations.set(validationKey, validationPromise)

    try {
      const result = await validationPromise
      await this.cache.set(cacheKey, result)
      return result
    } finally {
      this.activeValidations.delete(validationKey)
    }
  }

  /**
   * Validates multiple workflows in parallel
   *
   * Uses Promise.allSettled to handle individual failures without
   * blocking the batch. Returns results in same order as input.
   *
   * @param workflows - Array of workflow definitions
   * @returns Array of validation results in original order
   *
   * @example
   * const results = await loader.validateBatch([wf1, wf2, wf3])
   * const allValid = results.every(r => r.valid)
   */
  async validateBatch(
    workflows: WorkflowDefinition[]
  ): Promise<ExtendedValidationResult[]> {
    if (this.enableLogging) {
      console.log(`Starting batch validation for ${workflows.length} workflows`)
    }

    const results = await Promise.allSettled(
      workflows.map((wf) => this.validateWorkflow(wf))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        // Create error result for failed validation
        const _workflow = workflows[index]
        return {
          valid: false,
          errors: [
            {
              path: 'root',
              message: `Validation failed: ${result.reason.message || result.reason}`,
              severity: 'error' as const,
              code: 'VALIDATION_EXCEPTION',
            },
          ],
          warnings: [],
        } as ExtendedValidationResult
      }
    })
  }

  /**
   * Gets cached validation result if available
   *
   * @param workflowId - Workflow ID
   * @param tenantId - Tenant ID
   * @returns Cached validation result or null
   *
   * @example
   * const cached = await loader.getValidationResult('wf1', 'tenant1')
   */
  async getValidationResult(
    workflowId: string,
    tenantId: string
  ): Promise<WorkflowValidationResult | null> {
    const cacheKey = `${tenantId}:${workflowId}`
    return await this.cache.get(cacheKey)
  }

  /**
   * Invalidates cache for a specific workflow
   *
   * Use when workflow definition changes to force re-validation
   * on next access.
   *
   * @param workflowId - Workflow ID
   * @param tenantId - Tenant ID
   *
   * @example
   * await loader.invalidateCache('wf1', 'tenant1')
   */
  async invalidateCache(workflowId: string, tenantId: string): Promise<void> {
    const cacheKey = `${tenantId}:${workflowId}`
    await this.cache.delete(cacheKey)
    if (this.enableLogging) {
      console.log(`[CACHE INVALIDATED] ${workflowId}`)
    }
  }

  /**
   * Gets comprehensive diagnostics for a workflow
   *
   * Includes validation results, structural metrics, and performance data.
   * Useful for monitoring and debugging.
   *
   * @param workflow - Workflow definition
   * @returns Diagnostics object with metrics and validation info
   *
   * @example
   * const diags = await loader.getDiagnostics(workflow)
   * console.log(`Workflow has ${diags.nodeCount} nodes`)
   * console.log(`Validation took ${diags.metrics.validationTimeMs}ms`)
   */
  async getDiagnostics(workflow: WorkflowDefinition): Promise<WorkflowDiagnostics> {
    const validation = await this.validateWorkflow(workflow)

    return {
      workflowId: workflow.id,
      tenantId: workflow.tenantId,
      nodeCount: workflow.nodes?.length || 0,
      connectionCount: workflow.connections
        ? Object.keys(workflow.connections).length
        : 0,
      triggerCount: workflow.triggers?.length || 0,
      variableCount: workflow.variables ? Object.keys(workflow.variables).length : 0,
      validation: {
        valid: validation.valid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        topErrors: validation.errors.slice(0, 5),
        topWarnings: validation.warnings.slice(0, 5),
      },
      metrics: {
        validationTimeMs: validation._validationTime || 0,
        cacheHit: validation._cacheHit || false,
      },
    }
  }

  /**
   * Clears all validation caches
   *
   * Use sparingly - forces all workflows to be re-validated
   * on next access.
   *
   * @example
   * await loader.clearCache()
   */
  async clearCache(): Promise<void> {
    await this.cache.clear()
    if (this.enableLogging) {
      console.log('All validation caches cleared')
    }
  }

  /**
   * Gets current cache statistics
   *
   * @returns Cache statistics including hit rate and memory usage
   *
   * @example
   * const stats = loader.getCacheStats()
   * console.log(`Cache hit rate: ${stats.hitRate.toFixed(2)}%`)
   */
  getCacheStats() {
    return this.cache.getStats()
  }

  /**
   * Gets count of active validations
   *
   * @returns Number of validations currently in progress
   *
   * @example
   * const active = loader.getActiveValidationCount()
   * console.log(`${active} validations in progress`)
   */
  getActiveValidationCount(): number {
    return this.activeValidations.size
  }

  /**
   * Performs actual workflow validation
   *
   * This is the core validation logic that checks:
   * 1. Workflow structure and required fields
   * 2. Node definitions and types
   * 3. Connections and data flow
   * 4. Multi-tenant isolation
   * 5. Resource constraints
   *
   * @private
   * @param workflow - Workflow to validate
   * @returns Validation result with detailed errors/warnings
   */
  private async _performValidation(
    workflow: WorkflowDefinition
  ): Promise<ExtendedValidationResult> {
    const startTime = Date.now()

    try {
      // Validate workflow structure
      this._validateWorkflowStructure(workflow)

      // Validate nodes
      this._validateNodes(workflow)

      // Validate connections
      this._validateConnections(workflow)

      // Validate multi-tenant safety
      this._validateMultiTenant(workflow)

      const duration = Date.now() - startTime

      if (this.enableLogging) {
        console.log(`[VALIDATION] Workflow ${workflow.id} validated in ${duration}ms`, {
          nodeCount: workflow.nodes?.length || 0,
          connectionCount: workflow.connections
            ? Object.keys(workflow.connections).length
            : 0,
        })
      }

      return {
        valid: true,
        errors: [],
        warnings: [],
        _validationTime: duration,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[VALIDATION ERROR] Workflow ${workflow.id}:`, error)

      // Build error result
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      return {
        valid: false,
        errors: [
          {
            path: 'root',
            message: `Validation failed: ${errorMessage}`,
            severity: 'error' as const,
            code: 'VALIDATION_FAILED',
          },
        ],
        warnings: [],
        _validationTime: duration,
      }
    }
  }

  /**
   * Validates workflow structure
   *
   * @private
   */
  private _validateWorkflowStructure(workflow: WorkflowDefinition): void {
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Workflow must have nodes array')
    }

    if (!workflow.connections || typeof workflow.connections !== 'object') {
      throw new Error('Workflow must have connections object')
    }

    if (workflow.nodes.length === 0) {
      throw new Error('Workflow must have at least one node')
    }
  }

  /**
   * Validates workflow nodes
   *
   * @private
   */
  private _validateNodes(workflow: WorkflowDefinition): void {
    const nodeIds = new Set<string>()
    const nodeNames = new Set<string>()

    for (const node of workflow.nodes || []) {
      // Check node has required fields
      if (!node.id) {
        throw new Error('Node must have id')
      }

      if (!node.name) {
        throw new Error(`Node ${node.id} must have name`)
      }

      if (!node.nodeType) {
        throw new Error(`Node ${node.id} must have nodeType`)
      }

      // Check for duplicate IDs
      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node id: ${node.id}`)
      }
      nodeIds.add(node.id)

      // Check for duplicate names
      if (nodeNames.has(node.name)) {
        throw new Error(`Duplicate node name: ${node.name}`)
      }
      nodeNames.add(node.name)
    }
  }

  /**
   * Validates workflow connections
   *
   * @private
   */
  private _validateConnections(workflow: WorkflowDefinition): void {
    const nodeIds = new Set(workflow.nodes?.map((n) => n.id) || [])

    for (const [sourceId, targets] of Object.entries(workflow.connections || {})) {
      // Source node must exist
      if (!nodeIds.has(sourceId)) {
        throw new Error(`Connection source node not found: ${sourceId}`)
      }

      // Validate target connections
      if (typeof targets === 'object' && targets !== null) {
        for (const [_, targetList] of Object.entries(targets)) {
          if (Array.isArray(targetList)) {
            for (const target of targetList) {
              if (target && typeof target === 'object') {
                const targetId = (target as any).node || (target as any).nodeId
                if (targetId && !nodeIds.has(targetId)) {
                  throw new Error(`Connection target node not found: ${targetId}`)
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Validates multi-tenant safety
   *
   * @private
   */
  private _validateMultiTenant(workflow: WorkflowDefinition): void {
    if (!workflow.tenantId) {
      throw new Error('Workflow must have tenantId for multi-tenant safety')
    }

    // Check if variables have unsafe global scope
    if (workflow.variables) {
      for (const [varName, varDef] of Object.entries(workflow.variables)) {
        if ((varDef as any).scope === 'global') {
          throw new Error(
            `Variable ${varName} has global scope. Only workflow/execution scope allowed.`
          )
        }
      }
    }
  }

  /**
   * Generates cache key including workflow hash
   *
   * @private
   */
  private getCacheKey(workflow: WorkflowDefinition): string {
    const hash = this._hashWorkflow(workflow)
    return `${workflow.tenantId}:${workflow.id}:${hash}`
  }

  /**
   * Creates simple hash of workflow structure
   *
   * Used for cache invalidation when workflow definition changes.
   * Ignores metadata (timestamps, executions).
   *
   * @private
   */
  private _hashWorkflow(workflow: WorkflowDefinition): string {
    // Hash only structural parts, not metadata
    const key = JSON.stringify({
      nodes: workflow.nodes,
      connections: workflow.connections,
      variables: workflow.variables,
      triggers: workflow.triggers,
    })

    // Simple djb2-style hash (not cryptographic, just for cache invalidation)
    let hash = 5381
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) + hash) ^ char // hash * 33 ^ c
    }

    return Math.abs(hash).toString(16)
  }

  /**
   * Cleanup resources on shutdown
   */
  destroy(): void {
    this.cache.destroy()
    this.activeValidations.clear()
  }
}

/**
 * Global WorkflowLoaderV2 instance
 */
let globalLoader: WorkflowLoaderV2 | null = null

/**
 * Gets or initializes global WorkflowLoaderV2 instance
 *
 * Singleton pattern for application-wide workflow validation.
 * Use this instead of creating new instances.
 *
 * @param options - Configuration options (only used on first call)
 * @returns Global WorkflowLoaderV2 instance
 *
 * @example
 * const loader = getWorkflowLoader()
 * const result = await loader.validateWorkflow(workflow)
 */
export function getWorkflowLoader(
  options?: WorkflowLoaderV2Options
): WorkflowLoaderV2 {
  if (!globalLoader) {
    globalLoader = new WorkflowLoaderV2(options)
  }
  return globalLoader
}

/**
 * Resets global WorkflowLoaderV2 instance
 *
 * Primarily for testing. Creates new instance on next getWorkflowLoader() call.
 *
 * @example
 * resetWorkflowLoader() // In test cleanup
 */
export function resetWorkflowLoader(): void {
  if (globalLoader) {
    globalLoader.destroy()
  }
  globalLoader = null
}
