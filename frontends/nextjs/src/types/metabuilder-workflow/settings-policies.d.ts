declare module '@metabuilder/workflow' {
  export interface WorkflowSettings {
    timezone?: string
    executionTimeout?: number
    saveExecutionProgress?: boolean
    saveExecutionData?: 'all' | 'errors-only' | 'none'
    maxConcurrentExecutions?: number
    debugMode?: boolean
    enableNotifications?: boolean
    notificationChannels?: string[]
    [key: string]: unknown
  }

  export interface RetryPolicy {
    enabled?: boolean
    maxAttempts?: number
    delayMs?: number
    backoffMultiplier?: number
  }

  export interface RateLimitPolicy {
    enabled?: boolean
    maxRequests?: number
    windowMs?: number
  }

  export interface ErrorHandlingPolicy {
    strategy?: string
    retryPolicy?: RetryPolicy
  }

  export interface ExecutionLimits {
    timeoutMs?: number
    maxExecutionTime: number
    maxMemoryMb?: number
    maxNodeExecutions?: number
    [key: string]: unknown
  }
}
