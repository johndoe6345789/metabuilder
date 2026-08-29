/**
 * WorkflowLoaderV2 -- validating workflows, and not doing it twice.
 *
 * Part of the 95%-data pattern: a workflow's structure is JSON and its
 * validation is TypeScript. The rules themselves are in ./loader, the
 * cache is in ./cache, and this is the orchestration around them --
 * caching, deduplicating concurrent requests for the same workflow,
 * batching, and reporting.
 */

import type {
  WorkflowDefinition,
  WorkflowValidationResult,
} from '@metabuilder/workflow'

// The cache, the structural rules, the result shapes and the diagnostics
// each live in their own module now. Re-exported below so existing
// importers of this file keep working.
import { buildDiagnostics } from './loader/diagnostics'
import type {
  ExtendedValidationResult,
  WorkflowDiagnostics,
  WorkflowLoaderV2Options,
} from './loader/loader-types'
import { performValidation } from './loader/perform-validation'
import { failedResult } from './loader/validation-result'
import { cacheKeyFor } from './loader/workflow-hash'
import { ValidationCache } from './cache/validation-cache'

export { ValidationCache }
export type {
  ExtendedValidationResult,
  WorkflowDiagnostics,
  WorkflowLoaderV2Options,
}
export type {
  CacheEntry,
  CacheReport,
  CacheStatistics,
} from './cache/cache-types'

/** Validates workflows, caches the answer, and never runs two at once. */
export class WorkflowLoaderV2 {
  private readonly cache: ValidationCache
  private readonly maxConcurrent: number
  private readonly activeValidations: Map<
    string,
    Promise<ExtendedValidationResult>
  >
  private readonly enableLogging: boolean


  constructor(options: WorkflowLoaderV2Options = {}) {
    this.cache = new ValidationCache(options.cacheTTLMs ?? 3600000, 100)
    this.maxConcurrent = options.maxConcurrentValidations ?? 10
    this.activeValidations = new Map()
    this.enableLogging = options.enableLogging !== false
  }

  /**
   * Validates a workflow, or hands back the answer it already has.
   *
   * Two workflows with the same definition share one cached result, and
   * two concurrent requests for the same workflow share one validation.
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
    const cacheKey = cacheKeyFor(workflow)

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
    const validationPromise = Promise.resolve(
      performValidation(workflow, this.enableLogging)
    )
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
   * Validates several workflows at once, in the order given.
   *
   * One workflow failing does not stop the rest: a rejection becomes a
   * failed result in that slot.
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
      if (result.status === 'fulfilled') return result.value
      return failedResult(result.reason, 'VALIDATION_EXCEPTION')
    })
  }

  /**
   * The cached result for this workflow, or null.
   *
   * Looked up by prefix for the same reason invalidation is: entries are
   * keyed `tenant:id:hash`, so asking for `tenant:id` matched nothing and
   * this method could only ever answer null.
   */
  getValidationResult(
    workflowId: string,
    tenantId: string
  ): WorkflowValidationResult | null {
    return this.cache.getByPrefix(`${tenantId}:${workflowId}:`)
  }

  /** Forces this workflow to be re-validated on next access. */
  invalidateCache(workflowId: string, tenantId: string): void {
    // Cache keys are `tenant:id:hash`, so deleting `tenant:id` matched
    // nothing and this method silently did no work at all. Every version of
    // this workflow has to go, whatever its hash.
    this.cache.deleteByPrefix(`${tenantId}:${workflowId}:`)
    if (this.enableLogging) {
      console.warn(`[CACHE INVALIDATED] ${workflowId}`)
    }
  }

  /** Structural metrics plus how the last validation went. */
  async getDiagnostics(
    workflow: WorkflowDefinition
  ): Promise<WorkflowDiagnostics> {
    return buildDiagnostics(workflow, await this.validateWorkflow(workflow))
  }

  /** Empties the cache. Every workflow is re-validated after this. */
  clearCache(): void {
    this.cache.clear()
    if (this.enableLogging) {
      console.warn('All validation caches cleared')
    }
  }

  /** Hit rate and memory usage. */
  getCacheStats() {
    return this.cache.getStats()
  }

  /** How many validations are in flight. */
  getActiveValidationCount(): number {
    return this.activeValidations.size
  }

  /** Stops the cache's sweep timer and drops any in-flight work. */
  destroy(): void {
    this.cache.destroy()
    this.activeValidations.clear()
  }
}

export { getWorkflowLoader, resetWorkflowLoader } from './loader/loader-instance'
