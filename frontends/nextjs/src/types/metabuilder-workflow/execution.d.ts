declare module '@metabuilder/workflow' {
  export interface NodeResult {
    status:
      | 'pending'
      | 'running'
      | 'success'
      | 'error'
      | 'skipped'
      | 'timeout'
      | 'aborted'
      | 'cancelled'
    output?: unknown
    error?: string
    errorCode?: string
    inputData?: unknown
    startedAt?: string
    completedAt?: string
    duration?: number
    durationMs?: number
    retries?: number
    [key: string]: any
  }

  export interface ExecutionMetrics {
    startedAt?: string
    completedAt?: string
    durationMs?: number
    nodeCount?: number
    successCount?: number
    errorCount?: number
    memoryMb?: number
    nodesExecuted: number
    successNodes: number
    failedNodes: number
    retriedNodes: number
    totalRetries: number
    peakMemory: number
    validationFailures: number
    recoveryAttempts: number
    recoverySuccesses: number
    [key: string]: any
  }

  export interface LogEntry {
    timestamp: string | Date
    level: 'debug' | 'info' | 'warn' | 'error'
    message: string
    nodeId?: string
    [key: string]: any
  }

  export interface ExecutionState {
    [nodeId: string]: NodeResult
  }

  export interface ExecutionRecord {
    id: string
    workflowId: string
    tenantId: string
    status:
      | 'pending'
      | 'running'
      | 'success'
      | 'error'
      | 'cancelled'
      | 'timeout'
      | 'aborted'
    state: ExecutionState
    metrics: ExecutionMetrics
    logs: LogEntry[]
    startedAt?: string
    completedAt?: string
    startTime: Date
    duration?: number
    error?: { message: string; code: string; nodeId?: string }
    [key: string]: any
  }
}
