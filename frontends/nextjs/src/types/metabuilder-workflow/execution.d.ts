// The index signatures below are `any`, not `unknown`, on purpose: this
// module's NodeResult/ExecutionMetrics/LogEntry/ExecutionRecord are a
// genuinely different, independently-maintained shape from the ones in
// ../../../libraries/types/workflow.ts (different field names entirely --
// `timestamp: number` vs `startedAt?: string`, `startTime: number` vs
// `startTime: Date`, extra fields like `dataProcessed`/`apiCallsMade` on one
// side only). ExecutionMonitor.tsx assigns the libraries/types version into
// this one, and TS only accepts that across an index signature when it's
// `any` -- `unknown` correctly re-exposes the structural mismatch (missing
// index signature on the source) as a hard error. Reconciling the two type
// families is a cross-repo change outside this file's scope; until then,
// `any` here is a documented, load-bearing escape hatch, not an oversight.
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
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
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
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  export interface LogEntry {
    timestamp: string | Date
    level: 'debug' | 'info' | 'warn' | 'error'
    message: string
    nodeId?: string
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
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
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
