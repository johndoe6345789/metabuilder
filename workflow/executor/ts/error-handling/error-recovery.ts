/**
 * Error Recovery Manager - Handles workflow execution errors with multiple strategies
 * @packageDocumentation
 */

export type RecoveryStrategy = 'fallback' | 'skip' | 'retry' | 'fail'

export interface RetryConfig {
  maxAttempts: number
  initialDelay: number // milliseconds
  maxDelay: number
  backoffMultiplier: number
}

export interface RecoveryConfig {
  strategy: RecoveryStrategy
  fallbackValue?: any
  retryConfig?: RetryConfig
  onError?: (error: Error) => void
}

export interface ExecutionError {
  nodeId: string
  nodeName: string
  nodeType: string
  error: Error
  timestamp: number
  context: Record<string, any>
}

export class ErrorRecoveryManager {
  private errors: ExecutionError[] = []
  private retryAttempts: Map<string, number> = new Map()
  private readonly defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 100,
    maxDelay: 5000,
    backoffMultiplier: 2
  }

  /**
   * Execute with error recovery strategy
   */
  async executeWithRecovery<T>(
    nodeId: string,
    nodeName: string,
    nodeType: string,
    execution: () => Promise<T>,
    config: RecoveryConfig,
    context: Record<string, any> = {}
  ): Promise<T | any> {
    try {
      return await execution()
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))

      // Log error
      this.recordError({
        nodeId,
        nodeName,
        nodeType,
        error: err,
        timestamp: Date.now(),
        context
      })

      config.onError?.(err)

      // Apply recovery strategy
      switch (config.strategy) {
        case 'retry':
          return await this.retryExecution(
            nodeId,
            execution,
            config.retryConfig || this.defaultRetryConfig
          )

        case 'fallback':
          return config.fallbackValue !== undefined
            ? config.fallbackValue
            : null

        case 'skip':
          return null

        case 'fail':
          throw err

        default:
          throw new Error(`Unknown recovery strategy: ${config.strategy}`)
      }
    }
  }

  /**
   * Retry execution with exponential backoff
   */
  private async retryExecution<T>(
    nodeId: string,
    execution: () => Promise<T>,
    retryConfig: RetryConfig
  ): Promise<T> {
    const attempts = this.retryAttempts.get(nodeId) || 0
    this.retryAttempts.set(nodeId, attempts + 1)

    if (attempts >= retryConfig.maxAttempts) {
      throw new Error(
        `Node ${nodeId} failed after ${retryConfig.maxAttempts} attempts`
      )
    }

    const delay = Math.min(
      retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempts),
      retryConfig.maxDelay
    )

    await new Promise(resolve => setTimeout(resolve, delay))
    return execution()
  }

  /**
   * Record execution error
   */
  private recordError(error: ExecutionError): void {
    this.errors.push(error)

    // Keep only last 1000 errors in memory
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000)
    }
  }

  /**
   * Get all recorded errors
   */
  getErrors(nodeId?: string): ExecutionError[] {
    if (!nodeId) return [...this.errors]
    return this.errors.filter(e => e.nodeId === nodeId)
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byNode: new Map<string, number>(),
      byType: new Map<string, number>(),
      recent: this.errors.slice(-10)
    }

    this.errors.forEach(error => {
      stats.byNode.set(
        error.nodeId,
        (stats.byNode.get(error.nodeId) || 0) + 1
      )
      stats.byType.set(
        error.error.name,
        (stats.byType.get(error.error.name) || 0) + 1
      )
    })

    return stats
  }

  /**
   * Clear error history
   */
  clearErrors(nodeId?: string): void {
    if (nodeId) {
      this.errors = this.errors.filter(e => e.nodeId !== nodeId)
    } else {
      this.errors = []
    }
  }

  /**
   * Reset retry attempts for a node
   */
  resetRetryAttempts(nodeId?: string): void {
    if (nodeId) {
      this.retryAttempts.delete(nodeId)
    } else {
      this.retryAttempts.clear()
    }
  }

  /**
   * Check if node has exceeded retry limit
   */
  hasExceededRetries(nodeId: string, maxAttempts: number = 3): boolean {
    return (this.retryAttempts.get(nodeId) || 0) >= maxAttempts
  }
}
