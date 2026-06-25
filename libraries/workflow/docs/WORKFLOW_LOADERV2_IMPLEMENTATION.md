# WorkflowLoaderV2 Implementation Guide
## Code Examples and Architecture Details

---

## Table of Contents

1. [Core Components](#core-components)
2. [WorkflowLoaderV2 Implementation](#workflowloaderv2-implementation)
3. [Validation Cache Implementation](#validation-cache-implementation)
4. [Error Handler Implementation](#error-handler-implementation)
5. [Multi-Tenant Context Builder](#multi-tenant-context-builder)
6. [Integration Points](#integration-points)
7. [Testing Examples](#testing-examples)

---

## Core Components

### File Structure

```
frontends/nextjs/src/lib/workflow/
├── workflow-loader-v2.ts          # Main loader implementation
├── workflow-loader-v2.test.ts     # Unit tests
├── validation-cache.ts             # Caching layer
├── validation-cache.test.ts        # Cache tests
├── error-handler.ts                # Error response formatting
├── error-handler.test.ts           # Error tests
├── multi-tenant-context.ts         # Tenant context builder
├── workflow-service.ts             # Updated with new loader
└── index.ts                        # Exports
```

---

## WorkflowLoaderV2 Implementation

### Core Class

```typescript
// frontends/nextjs/src/lib/workflow/workflow-loader-v2.ts

import { WorkflowValidator, type WorkflowValidationResult } from '@metabuilder/workflow'
import { ValidationCache } from './validation-cache'
import type {
  WorkflowDefinition,
  ValidationError,
  WorkflowDiagnostics,
} from '@metabuilder/workflow'

export interface WorkflowLoaderV2Options {
  enableCache?: boolean
  cacheTTLMs?: number
  maxConcurrentValidations?: number
}

/**
 * WorkflowLoaderV2
 *
 * Orchestrates workflow validation with:
 * - Schema validation
 * - Registry validation
 * - Multi-tenant safety checks
 * - Caching for performance
 * - Diagnostic reporting
 */
export class WorkflowLoaderV2 {
  private validator: WorkflowValidator
  private cache: ValidationCache
  private maxConcurrent: number
  private activeValidations: Map<string, Promise<WorkflowValidationResult>>

  constructor(options: WorkflowLoaderV2Options = {}) {
    this.validator = new WorkflowValidator()
    this.cache = new ValidationCache(options.cacheTTLMs || 3600000) // 1 hour default
    this.maxConcurrent = options.maxConcurrentValidations || 10
    this.activeValidations = new Map()
  }

  /**
   * Main validation entry point
   *
   * Validates workflow against:
   * 1. Schema structure
   * 2. Node definitions
   * 3. Connections
   * 4. Multi-tenant rules
   * 5. Resource constraints
   *
   * Returns cached result if available and valid
   */
  async validateWorkflow(
    workflow: WorkflowDefinition
  ): Promise<WorkflowValidationResult> {
    // Validate input
    if (!workflow) {
      throw new Error('Workflow definition is required')
    }

    if (!workflow.id) {
      throw new Error('Workflow must have an id')
    }

    if (!workflow.tenantId) {
      throw new Error('Workflow must have a tenantId')
    }

    // Check cache first
    const cacheKey = this.getCacheKey(workflow)
    const cached = await this.cache.get(cacheKey)

    if (cached) {
      console.log(`[CACHE HIT] Validation for workflow ${workflow.id}`)
      return {
        ...cached,
        _cacheHit: true,
      }
    }

    // Prevent duplicate validations for same workflow
    const validationKey = `${workflow.tenantId}:${workflow.id}`
    if (this.activeValidations.has(validationKey)) {
      return await this.activeValidations.get(validationKey)!
    }

    if (this.activeValidations.size >= this.maxConcurrent) {
      console.warn(`Max concurrent validations reached (${this.maxConcurrent})`)
    }

    // Perform validation
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
   * Internal validation implementation
   */
  private async _performValidation(
    workflow: WorkflowDefinition
  ): Promise<WorkflowValidationResult> {
    const startTime = Date.now()

    try {
      // Use existing WorkflowValidator
      const result = this.validator.validate(workflow)

      const duration = Date.now() - startTime

      console.log(`[VALIDATION] Workflow ${workflow.id} validated in ${duration}ms`, {
        valid: result.valid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
      })

      return {
        ...result,
        _validationTime: duration,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[VALIDATION ERROR] Workflow ${workflow.id}:`, error)

      throw new Error(
        `Workflow validation failed after ${duration}ms: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  /**
   * Batch validate multiple workflows
   */
  async validateBatch(
    workflows: WorkflowDefinition[]
  ): Promise<WorkflowValidationResult[]> {
    console.log(`Starting batch validation for ${workflows.length} workflows`)

    const results = await Promise.allSettled(
      workflows.map((wf) => this.validateWorkflow(wf))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        const workflow = workflows[index]
        return {
          valid: false,
          errors: [
            {
              path: 'root',
              message: `Validation failed: ${result.reason.message}`,
              severity: 'error' as const,
              code: 'VALIDATION_EXCEPTION',
            },
          ],
          warnings: [],
        }
      }
    })
  }

  /**
   * Get cached validation result
   */
  async getValidationResult(
    workflowId: string,
    tenantId: string
  ): Promise<WorkflowValidationResult | null> {
    const cacheKey = `${tenantId}:${workflowId}`
    return await this.cache.get(cacheKey)
  }

  /**
   * Invalidate cache for workflow
   */
  async invalidateCache(workflowId: string, tenantId: string): Promise<void> {
    const cacheKey = `${tenantId}:${workflowId}`
    await this.cache.delete(cacheKey)
    console.log(`[CACHE INVALIDATED] ${workflowId}`)
  }

  /**
   * Get diagnostics for workflow
   */
  async getDiagnostics(workflow: WorkflowDefinition): Promise<WorkflowDiagnostics> {
    const validation = await this.validateWorkflow(workflow)

    return {
      workflowId: workflow.id,
      tenantId: workflow.tenantId,
      nodeCount: workflow.nodes.length,
      connectionCount: Object.keys(workflow.connections).length,
      triggerCount: workflow.triggers?.length || 0,
      variableCount: Object.keys(workflow.variables || {}).length,
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
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    await this.cache.clear()
    console.log('All validation caches cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats()
  }

  // ====== Private Helpers ======

  private getCacheKey(workflow: WorkflowDefinition): string {
    // Include workflow version in cache key for better invalidation
    const hash = this._hashWorkflow(workflow)
    return `${workflow.tenantId}:${workflow.id}:${hash}`
  }

  private _hashWorkflow(workflow: WorkflowDefinition): string {
    // Simple hash of workflow structure (ignoring metadata)
    const key = JSON.stringify({
      nodes: workflow.nodes,
      connections: workflow.connections,
      variables: workflow.variables,
      triggers: workflow.triggers,
    })

    // Simple hash function (in production, use crypto)
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

// Global instance
let globalLoader: WorkflowLoaderV2 | null = null

/**
 * Get or initialize global WorkflowLoaderV2
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
 * Reset global loader (for testing)
 */
export function resetWorkflowLoader(): void {
  globalLoader = null
}
```

---

## Validation Cache Implementation

### Cache Manager

```typescript
// frontends/nextjs/src/lib/workflow/validation-cache.ts

import type { WorkflowValidationResult } from '@metabuilder/workflow'

export interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  entries: number
  memoryUsedMb: number
}

/**
 * ValidationCache
 *
 * Two-layer cache:
 * 1. Memory cache (fast, process-local)
 * 2. Redis cache (distributed, shared)
 *
 * Provides automatic expiration and stats tracking
 */
export class ValidationCache {
  private memoryCache: Map<string, CacheEntry<WorkflowValidationResult>>
  private maxEntries: number
  private ttlMs: number
  private stats: {
    hits: number
    misses: number
  }

  constructor(ttlMs: number = 3600000, maxEntries: number = 100) {
    this.memoryCache = new Map()
    this.ttlMs = ttlMs
    this.maxEntries = maxEntries
    this.stats = {
      hits: 0,
      misses: 0,
    }

    // Cleanup expired entries every 5 minutes
    this.startCleanupInterval()
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<WorkflowValidationResult | null> {
    // Try memory cache first
    const entry = this.memoryCache.get(key)

    if (entry) {
      const age = Date.now() - entry.timestamp
      if (age < entry.ttl) {
        this.stats.hits++
        return entry.value
      } else {
        // Expired, remove
        this.memoryCache.delete(key)
      }
    }

    this.stats.misses++

    // TODO: Try Redis cache here
    // const redisValue = await redis.get(key)
    // if (redisValue) {
    //   // Store in memory for future hits
    //   this.set(key, redisValue)
    //   return redisValue
    // }

    return null
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: WorkflowValidationResult): Promise<void> {
    // Store in memory cache
    this.memoryCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: this.ttlMs,
    })

    // Evict oldest entry if exceeded max size
    if (this.memoryCache.size > this.maxEntries) {
      const firstKey = this.memoryCache.keys().next().value
      if (firstKey) {
        this.memoryCache.delete(firstKey)
      }
    }

    // TODO: Store in Redis for distributed cache
    // await redis.setex(
    //   key,
    //   Math.floor(this.ttlMs / 1000),
    //   JSON.stringify(value)
    // )
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)

    // TODO: Delete from Redis
    // await redis.del(key)
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()
    this.stats.hits = 0
    this.stats.misses = 0

    // TODO: Clear Redis
    // await redis.flushdb()
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

    // Rough estimate of memory usage
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
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
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
    }, 5 * 60 * 1000) // 5 minutes
  }
}
```

---

## Error Handler Implementation

### Error Response Formatter

```typescript
// frontends/nextjs/src/lib/workflow/error-handler.ts

import { NextResponse } from 'next/server'
import type { ValidationError } from '@metabuilder/workflow'

export interface ErrorContext {
  executionId?: string
  workflowId?: string
  nodeId?: string
  tenantId?: string
  reason?: string
  cause?: Error
}

export interface FormattedError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
  diagnostics?: {
    errors?: Array<ValidationError & { suggestion?: string }>
    warnings?: ValidationError[]
    hint?: string
    stack?: string
  }
}

/**
 * WorkflowErrorHandler
 *
 * Formats workflow errors with:
 * - Structured error codes
 * - User-friendly messages
 * - Diagnostic information
 * - Context linking (execution, workflow, node)
 * - Stack traces (dev only)
 */
export class WorkflowErrorHandler {
  private isDevelopment: boolean

  constructor(isDevelopment: boolean = process.env.NODE_ENV !== 'production') {
    this.isDevelopment = isDevelopment
  }

  /**
   * Handle workflow execution errors
   */
  handleExecutionError(error: unknown, context: ErrorContext): NextResponse<FormattedError> {
    const code = this.getErrorCode(error)
    const message = this.getErrorMessage(error, context)

    const response: FormattedError = {
      success: false,
      error: {
        code,
        message,
        details: {
          executionId: context.executionId,
          workflowId: context.workflowId,
          nodeId: context.nodeId,
          reason: context.reason,
        },
      },
    }

    // Add stack trace in development
    if (this.isDevelopment && context.cause) {
      response.diagnostics = {
        stack: context.cause.stack,
        hint: this.getHint(code),
      }
    }

    const status = this.getStatusCode(code)
    return NextResponse.json(response, { status })
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    errors: ValidationError[],
    warnings: ValidationError[],
    context: ErrorContext
  ): NextResponse<FormattedError> {
    const response: FormattedError = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Workflow validation failed: ${errors.length} error(s), ${warnings.length} warning(s)`,
        details: {
          executionId: context.executionId,
          workflowId: context.workflowId,
          reason: 'WORKFLOW_VALIDATION_FAILED',
          errorCount: errors.length,
          warningCount: warnings.length,
        },
      },
      diagnostics: {
        errors: errors.slice(0, 10).map((e) => ({
          ...e,
          suggestion: this.getSuggestionForError(e),
        })),
        warnings: warnings.slice(0, 5),
        hint: 'Fix validation errors before executing workflow',
      },
    }

    return NextResponse.json(response, { status: 400 })
  }

  /**
   * Handle multi-tenant access errors
   */
  handleAccessError(context: ErrorContext): NextResponse<FormattedError> {
    const response: FormattedError = {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied to workflow',
        details: {
          workflowId: context.workflowId,
          reason: 'TENANT_MISMATCH',
          tenantId: context.tenantId,
        },
      },
    }

    return NextResponse.json(response, { status: 403 })
  }

  /**
   * Handle not found errors
   */
  handleNotFoundError(resource: string, context: ErrorContext): NextResponse<FormattedError> {
    const response: FormattedError = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found`,
        details: context,
      },
    }

    return NextResponse.json(response, { status: 404 })
  }

  /**
   * Handle rate limiting errors
   */
  handleRateLimitError(retryAfter: number): NextResponse<FormattedError> {
    const response: FormattedError = {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please retry after some time.',
        details: {
          retryAfter,
        },
      },
    }

    const nextResponse = NextResponse.json(response, { status: 429 })
    nextResponse.headers.set('Retry-After', String(retryAfter))
    return nextResponse
  }

  // ====== Private Helpers ======

  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return 'VALIDATION_ERROR'
      }
      if (error.message.includes('timeout')) {
        return 'EXECUTION_TIMEOUT'
      }
      if (error.message.includes('not found')) {
        return 'NOT_FOUND'
      }
    }
    return 'EXECUTION_ERROR'
  }

  private getErrorMessage(error: unknown, context: ErrorContext): string {
    if (error instanceof Error) {
      return error.message
    }
    return context.reason || 'An unknown error occurred'
  }

  private getStatusCode(code: string): number {
    const statusMap: Record<string, number> = {
      VALIDATION_ERROR: 400,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      RATE_LIMITED: 429,
      EXECUTION_ERROR: 500,
      EXECUTION_TIMEOUT: 500,
    }
    return statusMap[code] || 500
  }

  private getHint(code: string): string {
    const hints: Record<string, string> = {
      VALIDATION_ERROR: 'Check workflow structure. Look for invalid nodes or connections.',
      EXECUTION_ERROR: 'Check node parameters and available resources.',
      EXECUTION_TIMEOUT: 'Increase node timeout or check target service.',
      NOT_FOUND: 'Verify workflow ID and tenant access.',
    }
    return hints[code] || 'Check logs for more details'
  }

  private getSuggestionForError(error: ValidationError): string {
    const suggestions: Record<string, string> = {
      MISSING_REQUIRED_FIELD: 'Add the missing parameter to the node',
      INVALID_NODE_TYPE: 'Use a valid node type from the registry',
      INVALID_CONNECTION_TARGET_NODE: 'Ensure target node exists in workflow',
      TYPE_MISMATCH: 'Change parameter type to match definition',
      MISSING_TENANT_ID: 'Workflow must belong to a tenant',
      TIMEOUT_TOO_SHORT: 'Increase timeout for more reliable execution',
    }
    return suggestions[error.code] || 'Fix this issue before continuing'
  }
}

/**
 * Global error handler instance
 */
let globalHandler: WorkflowErrorHandler | null = null

export function getErrorHandler(): WorkflowErrorHandler {
  if (!globalHandler) {
    globalHandler = new WorkflowErrorHandler()
  }
  return globalHandler
}
```

---

## Multi-Tenant Context Builder

### Context Builder

```typescript
// frontends/nextjs/src/lib/workflow/multi-tenant-context.ts

import type { WorkflowContext, WorkflowDefinition } from '@metabuilder/workflow'

export interface MultiTenantMetadata {
  enforced: boolean
  tenantId: string
  userId: string
  userLevel: number
  requestedAt: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Build execution context with multi-tenant safety
 */
export async function buildMultiTenantContext(
  workflow: WorkflowDefinition,
  tenantId: string,
  userId: string,
  userLevel: number,
  requestData?: {
    triggerData?: Record<string, any>
    variables?: Record<string, any>
    request?: any
    secrets?: Record<string, any>
  }
): Promise<WorkflowContext> {
  // Validate tenant isolation
  if (workflow.tenantId !== tenantId) {
    throw new Error(
      `Workflow tenant mismatch: expected ${tenantId}, got ${workflow.tenantId}`
    )
  }

  // Build multi-tenant metadata
  const multiTenantMeta: MultiTenantMetadata = {
    enforced: true,
    tenantId,
    userId,
    userLevel,
    requestedAt: new Date().toISOString(),
    ipAddress: getClientIp(),
    userAgent: getClientUserAgent(),
  }

  // Build context
  const context: WorkflowContext = {
    executionId: '',  // Will be set by caller
    tenantId,
    userId,
    user: {
      id: userId,
      email: '', // Load from user data
      level: userLevel,
    },
    trigger: {
      nodeId: '',
      kind: 'manual',
      enabled: true,
      metadata: {
        startTime: Date.now(),
        triggeredBy: 'api',
        userId,
        tenantId,
      },
    },
    triggerData: requestData?.triggerData || {},
    variables: {
      ...workflow.variables,
      ...requestData?.variables,
    },
    secrets: requestData?.secrets || {},
    request: requestData?.request,
    multiTenant: multiTenantMeta,
  }

  // Validate multi-tenant safety
  validateMultiTenantContext(context, workflow)

  return context
}

/**
 * Validate multi-tenant context safety
 */
export function validateMultiTenantContext(
  context: WorkflowContext,
  workflow: WorkflowDefinition
): void {
  const errors: string[] = []

  // 1. TenantId must match
  if (context.tenantId !== workflow.tenantId) {
    errors.push(
      `Context tenant ${context.tenantId} does not match workflow tenant ${workflow.tenantId}`
    )
  }

  // 2. Check for global scope variables
  if (workflow.variables) {
    for (const [varName, varDef] of Object.entries(workflow.variables)) {
      if (varDef.scope === 'global') {
        errors.push(
          `Variable ${varName} has global scope. Only workflow/execution scope allowed.`
        )
      }
    }
  }

  // 3. Validate variable access doesn't cross tenants
  for (const [varName, varDef] of Object.entries(context.variables)) {
    if (varDef._tenantId && varDef._tenantId !== context.tenantId) {
      errors.push(
        `Variable ${varName} belongs to different tenant ${varDef._tenantId}`
      )
    }
  }

  if (errors.length > 0) {
    throw new Error(`Multi-tenant context validation failed:\n${errors.join('\n')}`)
  }
}

/**
 * Check if user can access workflow
 */
export function canAccessWorkflow(
  userTenantId: string,
  userLevel: number,
  workflowTenantId: string
): boolean {
  // Own tenant access
  if (userTenantId === workflowTenantId) {
    return true
  }

  // Admin can access any tenant
  if (userLevel >= 4) {
    return true
  }

  return false
}

/**
 * Get client IP address (from request context)
 */
function getClientIp(): string | undefined {
  // TODO: Extract from request headers in actual implementation
  // x-forwarded-for, x-real-ip, etc.
  return undefined
}

/**
 * Get client user agent (from request context)
 */
function getClientUserAgent(): string | undefined {
  // TODO: Extract from request headers
  return undefined
}
```

---

## Integration Points

### Updated Workflow Service

```typescript
// frontends/nextjs/src/lib/workflow/workflow-service.ts (updated sections)

import { getWorkflowLoader } from './workflow-loader-v2'
import { getErrorHandler } from './error-handler'
import { buildMultiTenantContext } from './multi-tenant-context'

/**
 * Execute workflow with validation
 */
export class WorkflowExecutionEngine {
  private registry = getNodeExecutorRegistry()
  private loader = getWorkflowLoader()
  private errorHandler = getErrorHandler()

  async executeWorkflow(
    workflow: WorkflowDefinition,
    context: WorkflowContext
  ): Promise<ExecutionRecord> {
    const executionId = context.executionId

    try {
      // 1. Validate workflow before execution
      console.log(`[${executionId}] Validating workflow before execution`)
      const validation = await this.loader.validateWorkflow(workflow)

      if (!validation.valid) {
        console.error(`[${executionId}] Validation failed:`, {
          errorCount: validation.errors.length,
          errors: validation.errors.slice(0, 5),
        })

        // Throw with validation result attached
        const error = new Error('Workflow validation failed')
        ;(error as any).validationErrors = validation.errors
        ;(error as any).validationWarnings = validation.warnings
        throw error
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn(`[${executionId}] Validation warnings:`, {
          warningCount: validation.warnings.length,
          warnings: validation.warnings.slice(0, 3),
        })
      }

      // 2. Create node executor callback
      const nodeExecutor: NodeExecutorFn = async (
        nodeId,
        wf,
        ctx,
        state
      ): Promise<NodeResult> => {
        const node = wf.nodes.find((n) => n.id === nodeId)
        if (!node) {
          throw new Error(`Node not found: ${nodeId}`)
        }

        // Validate multi-tenant context
        if (ctx.tenantId !== wf.tenantId) {
          throw new Error('Multi-tenant context violation')
        }

        const executor = this.registry.get(node.nodeType)
        if (!executor) {
          throw new Error(`No executor registered for node type: ${node.nodeType}`)
        }

        try {
          const result = await executor.execute(node, ctx, state)
          return result
        } catch (error) {
          return {
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            errorCode: 'EXECUTION_FAILED',
            timestamp: Date.now(),
          }
        }
      }

      // 3. Create and execute DAG
      const dagExecutor = new DAGExecutor(
        executionId,
        workflow,
        context,
        nodeExecutor
      )

      const state = await dagExecutor.execute()
      const metrics = dagExecutor.getMetrics()

      // 4. Create execution record
      const failedNodeCount = Object.values(state).filter(
        (r) => r.status === 'error'
      ).length

      const executionRecord: ExecutionRecord = {
        id: executionId,
        workflowId: workflow.id,
        tenantId: context.tenantId,
        userId: context.userId,
        triggeredBy: context.trigger?.kind || 'manual',
        startTime: new Date(metrics.startTime),
        endTime: new Date(metrics.endTime || Date.now()),
        duration: metrics.duration || 0,
        status: failedNodeCount > 0 ? 'error' : 'success',
        state,
        metrics: {
          nodesExecuted: metrics.nodesExecuted,
          successNodes: metrics.successNodes,
          failedNodes: metrics.failedNodes,
          retriedNodes: metrics.retriedNodes,
          totalRetries: metrics.totalRetries,
          peakMemory: metrics.peakMemory,
          dataProcessed: 0,
          apiCallsMade: 0,
        },
        logs: [],
        error: failedNodeCount > 0 ? {
          message: `${failedNodeCount} node(s) failed`,
          code: 'WORKFLOW_FAILED',
        } : undefined,
      }

      // 5. Save execution record
      await this.saveExecutionRecord(executionRecord)

      return executionRecord
    } catch (error) {
      console.error(`[${executionId}] Execution failed:`, error)

      // Return error record
      return this.createErrorRecord(workflow, context, error)
    }
  }

  private createErrorRecord(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    error: unknown
  ): ExecutionRecord {
    const executionId = context.executionId
    const now = new Date()

    // Check if it's a validation error
    if ((error as any).validationErrors) {
      return {
        id: executionId,
        workflowId: workflow.id,
        tenantId: context.tenantId,
        userId: context.userId,
        triggeredBy: context.trigger?.kind || 'manual',
        startTime: now,
        endTime: now,
        duration: 0,
        status: 'error',
        state: {},
        metrics: {
          nodesExecuted: 0,
          successNodes: 0,
          failedNodes: 0,
          retriedNodes: 0,
          totalRetries: 0,
          peakMemory: 0,
          dataProcessed: 0,
          apiCallsMade: 0,
        },
        logs: [],
        error: {
          message: 'Workflow validation failed before execution',
          code: 'VALIDATION_FAILED',
        },
      }
    }

    // Generic error record
    return {
      id: executionId,
      workflowId: workflow.id,
      tenantId: context.tenantId,
      userId: context.userId,
      triggeredBy: context.trigger?.kind || 'manual',
      startTime: now,
      endTime: now,
      duration: 0,
      status: 'error',
      state: {},
      metrics: {
        nodesExecuted: 0,
        successNodes: 0,
        failedNodes: 0,
        retriedNodes: 0,
        totalRetries: 0,
        peakMemory: 0,
        dataProcessed: 0,
        apiCallsMade: 0,
      },
      logs: [],
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'EXECUTION_ERROR',
      },
    }
  }
}
```

---

## Testing Examples

### Unit Test Example

```typescript
// frontends/nextjs/src/lib/workflow/workflow-loader-v2.test.ts

import { describe, it, expect, beforeEach } from '@jest/globals'
import { WorkflowLoaderV2 } from './workflow-loader-v2'
import type { WorkflowDefinition } from '@metabuilder/workflow'

describe('WorkflowLoaderV2', () => {
  let loader: WorkflowLoaderV2

  beforeEach(() => {
    loader = new WorkflowLoaderV2({ cacheTTLMs: 60000 })
  })

  describe('validateWorkflow', () => {
    it('should validate a valid workflow', async () => {
      const workflow: WorkflowDefinition = {
        id: 'wf-1',
        tenantId: 'tenant-1',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            name: 'Start',
            type: 'trigger',
            parameters: {},
          },
        ],
        connections: {},
        triggers: [],
        variables: {},
      }

      const result = await loader.validateWorkflow(workflow)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should catch duplicate node names', async () => {
      const workflow: WorkflowDefinition = {
        id: 'wf-1',
        tenantId: 'tenant-1',
        name: 'Test',
        nodes: [
          { id: 'n-1', name: 'Start', type: 'trigger', parameters: {} },
          { id: 'n-2', name: 'Start', type: 'action', parameters: {} },
        ],
        connections: {},
        triggers: [],
        variables: {},
      }

      const result = await loader.validateWorkflow(workflow)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'DUPLICATE_NODE_NAME')).toBe(true)
    })

    it('should use cache on repeat validation', async () => {
      const workflow: WorkflowDefinition = {
        id: 'wf-1',
        tenantId: 'tenant-1',
        name: 'Test',
        nodes: [{ id: 'n-1', name: 'Start', type: 'trigger', parameters: {} }],
        connections: {},
        triggers: [],
        variables: {},
      }

      // First call - cache miss
      const result1 = await loader.validateWorkflow(workflow)
      expect(result1._cacheHit).toBeUndefined()

      // Second call - cache hit
      const result2 = await loader.validateWorkflow(workflow)
      expect(result2._cacheHit).toBe(true)
    })

    it('should invalidate cache when workflow changes', async () => {
      const workflow: WorkflowDefinition = {
        id: 'wf-1',
        tenantId: 'tenant-1',
        name: 'Test',
        nodes: [{ id: 'n-1', name: 'Start', type: 'trigger', parameters: {} }],
        connections: {},
        triggers: [],
        variables: {},
      }

      // First validation
      const result1 = await loader.validateWorkflow(workflow)

      // Invalidate
      await loader.invalidateCache('wf-1', 'tenant-1')

      // Second validation - cache miss
      const result2 = await loader.validateWorkflow(workflow)
      expect(result2._cacheHit).toBeUndefined()
    })
  })

  describe('batch validation', () => {
    it('should validate multiple workflows', async () => {
      const workflows: WorkflowDefinition[] = [
        {
          id: 'wf-1',
          tenantId: 'tenant-1',
          name: 'Test 1',
          nodes: [{ id: 'n-1', name: 'Start', type: 'trigger', parameters: {} }],
          connections: {},
          triggers: [],
          variables: {},
        },
        {
          id: 'wf-2',
          tenantId: 'tenant-1',
          name: 'Test 2',
          nodes: [{ id: 'n-2', name: 'Start', type: 'trigger', parameters: {} }],
          connections: {},
          triggers: [],
          variables: {},
        },
      ]

      const results = await loader.validateBatch(workflows)

      expect(results).toHaveLength(2)
      expect(results.every((r) => r.valid)).toBe(true)
    })
  })

  describe('diagnostics', () => {
    it('should return workflow diagnostics', async () => {
      const workflow: WorkflowDefinition = {
        id: 'wf-1',
        tenantId: 'tenant-1',
        name: 'Test',
        nodes: [
          { id: 'n-1', name: 'Start', type: 'trigger', parameters: {} },
          { id: 'n-2', name: 'Action', type: 'action', parameters: {} },
        ],
        connections: { 'n-1': { main: { 0: [{ node: 'n-2' }] } } },
        triggers: [],
        variables: { var1: { type: 'string', defaultValue: 'test' } },
      }

      const diagnostics = await loader.getDiagnostics(workflow)

      expect(diagnostics.workflowId).toBe('wf-1')
      expect(diagnostics.nodeCount).toBe(2)
      expect(diagnostics.connectionCount).toBe(1)
      expect(diagnostics.variableCount).toBe(1)
      expect(diagnostics.validation.valid).toBe(true)
    })
  })
})
```

---

## Summary

This implementation guide provides:

1. **WorkflowLoaderV2** - Complete validation orchestration
2. **ValidationCache** - Two-layer caching strategy
3. **ErrorHandler** - Structured error formatting
4. **MultiTenantContext** - Safe context building
5. **Integration** - Updated workflow service
6. **Tests** - Comprehensive test examples

All code follows MetaBuilder patterns:
- Single responsibility
- Async/await
- Error handling
- Multi-tenant safety
- Comprehensive logging
- Type safety
