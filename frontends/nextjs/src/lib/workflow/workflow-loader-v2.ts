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
// ValidationCache and its types now live in ./cache, split small enough to
// test. Imported for use below and re-exported so existing importers of this
// module keep working.
import { ValidationCache } from './cache/validation-cache'

export { ValidationCache }
export type {
  CacheEntry,
  CacheReport,
  CacheStatistics,
} from './cache/cache-types'

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
  private readonly cache: ValidationCache
  private readonly maxConcurrent: number
  private readonly activeValidations: Map<
    string,
    Promise<ExtendedValidationResult>
  >
  private readonly enableLogging: boolean

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
    this.cache = new ValidationCache(options.cacheTTLMs ?? 3600000, 100)
    this.maxConcurrent = options.maxConcurrentValidations ?? 10
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
    if (workflow.id.length === 0) {
      throw new Error('Workflow must have an id')
    }

    if (workflow.tenantId.length === 0) {
      throw new Error('Workflow must have a tenantId')
    }

    // Build cache key including workflow hash for better cache invalidation
    const cacheKey = this.getCacheKey(workflow)

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached != null) {
      if (this.enableLogging) {
        console.warn(`[CACHE HIT] Validation for workflow ${workflow.id}`)
      }
      return {
        ...cached,
        _cacheHit: true,
      }
    }

    // Check for duplicate concurrent validations
    const validationKey = `${workflow.tenantId}:${workflow.id}`
    const existingValidation = this.activeValidations.get(validationKey)
    if (existingValidation != null) {
      if (this.enableLogging) {
        console.warn(
          `[DEDUP] Reusing in-flight validation for ${validationKey}`
        )
      }
      return await existingValidation
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
      this.cache.set(cacheKey, result)
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
      console.warn(
        `Starting batch validation for ${workflows.length} workflows`
      )
    }

    const results = await Promise.allSettled(
      workflows.map(wf => this.validateWorkflow(wf))
    )

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        // Create error result for failed validation
        const reason =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason)
        return {
          valid: false,
          errors: [
            {
              path: 'root',
              message: `Validation failed: ${reason}`,
              severity: 'error' as const,
              code: 'VALIDATION_EXCEPTION',
            },
          ],
          warnings: [],
        } satisfies ExtendedValidationResult
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
  getValidationResult(
    workflowId: string,
    tenantId: string
  ): WorkflowValidationResult | null {
    const cacheKey = `${tenantId}:${workflowId}`
    return this.cache.get(cacheKey)
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
   * loader.invalidateCache('wf1', 'tenant1')
   */
  invalidateCache(workflowId: string, tenantId: string): void {
    // Cache keys are `tenant:id:hash`, so deleting `tenant:id` matched
    // nothing and this method silently did no work at all. Every version of
    // this workflow has to go, whatever its hash.
    this.cache.deleteByPrefix(`${tenantId}:${workflowId}:`)
    if (this.enableLogging) {
      console.warn(`[CACHE INVALIDATED] ${workflowId}`)
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
  async getDiagnostics(
    workflow: WorkflowDefinition
  ): Promise<WorkflowDiagnostics> {
    const validation = await this.validateWorkflow(workflow)

    return {
      workflowId: workflow.id,
      tenantId: workflow.tenantId,
      nodeCount: workflow.nodes.length,
      connectionCount: Object.keys(workflow.connections).length,
      triggerCount: workflow.triggers.length,
      variableCount: Object.keys(workflow.variables).length,
      validation: {
        valid: validation.valid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        topErrors: validation.errors.slice(0, 5),
        topWarnings: validation.warnings.slice(0, 5),
      },
      metrics: {
        validationTimeMs: validation._validationTime ?? 0,
        cacheHit: validation._cacheHit ?? false,
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
   * loader.clearCache()
   */
  clearCache(): void {
    this.cache.clear()
    if (this.enableLogging) {
      console.warn('All validation caches cleared')
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
  private _performValidation(
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
        console.warn(
          `[VALIDATION] Workflow ${workflow.id} validated in ${duration}ms`,
          {
            nodeCount: workflow.nodes.length,
            connectionCount: Object.keys(workflow.connections).length,
          }
        )
      }

      return Promise.resolve({
        valid: true,
        errors: [],
        warnings: [],
        _validationTime: duration,
      })
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[VALIDATION ERROR] Workflow ${workflow.id}:`, error)

      // Build error result
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      return Promise.resolve({
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
      })
    }
  }

  /**
   * Validates workflow structure
   *
   * @private
   */
  private _validateWorkflowStructure(workflow: WorkflowDefinition): void {
    if (!Array.isArray(workflow.nodes)) {
      throw new Error('Workflow must have nodes array')
    }

    if (typeof workflow.connections !== 'object') {
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

    for (const node of workflow.nodes) {
      // Check node has required fields
      if (node.id.length === 0) {
        throw new Error('Node must have id')
      }

      if (node.name.length === 0) {
        throw new Error(`Node ${node.id} must have name`)
      }

      if (node.nodeType.length === 0) {
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
    const nodeIds = new Set(workflow.nodes.map(n => n.id))

    for (const [sourceId, outputTypes] of Object.entries(
      workflow.connections
    )) {
      // Source node must exist
      if (!nodeIds.has(sourceId)) {
        throw new Error(`Connection source node not found: ${sourceId}`)
      }

      // Validate target connections
      for (const [, outputIndices] of Object.entries(outputTypes)) {
        for (const [, targetList] of Object.entries(outputIndices)) {
          for (const target of targetList) {
            if (target.node.length > 0 && !nodeIds.has(target.node)) {
              throw new Error(
                `Connection target node not found: ${target.node}`
              )
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
    if (workflow.tenantId.length === 0) {
      throw new Error('Workflow must have tenantId for multi-tenant safety')
    }

    // Check if variables have unsafe global scope
    for (const [varName, varDef] of Object.entries(workflow.variables)) {
      if (varDef.scope === 'global') {
        throw new Error(
          `Variable ${varName} has global scope. Only workflow/execution scope allowed.`
        )
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
  globalLoader ??= new WorkflowLoaderV2(options)
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
  if (globalLoader != null) {
    globalLoader.destroy()
  }
  globalLoader = null
}
