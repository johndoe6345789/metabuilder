declare module '@metabuilder/workflow' {
  type LooseRecord = Record<string, any>

  export interface ValidationError {
    path: string
    message: string
    severity?: 'error' | 'warning' | 'info'
    code: string
    [key: string]: any
  }

  export interface WorkflowValidationResult {
    valid: boolean
    errors: ValidationError[]
    warnings: ValidationError[]
  }

  export type ValidationResult = WorkflowValidationResult

  export interface WorkflowSettings {
    timezone?: string
    executionTimeout?: number
    saveExecutionProgress?: boolean
    saveExecutionData?: 'all' | 'errors-only' | 'none'
    maxConcurrentExecutions?: number
    debugMode?: boolean
    enableNotifications?: boolean
    notificationChannels?: string[]
    [key: string]: any
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

  export interface CredentialRef {
    id: string
    name?: string
    type?: string
  }

  export interface CredentialBinding {
    nodeId: string
    credentialId: string
    credentialName?: string
    credentialType?: string
    [key: string]: any
  }

  export interface ExecutionLimits {
    timeoutMs?: number
    maxExecutionTime: number
    maxMemoryMb?: number
    maxNodeExecutions?: number
    [key: string]: any
  }

  export interface WorkflowVariable {
    name: string
    description?: string
    type?: string
    defaultValue?: unknown
    required?: boolean
    scope?: string
    [key: string]: any
  }

  export interface ConnectionTarget {
    node: string
    type: 'main' | 'error' | 'condition'
    index: number
    conditional?: boolean
    condition?: string
  }

  export interface WorkflowNode {
    id: string
    name: string
    description?: string
    type?: string
    typeVersion?: number
    nodeType: string
    position: [number, number]
    size?: [number, number]
    parameters: Record<string, unknown>
    inputs?: unknown[]
    outputs?: unknown[]
    credentials?: Record<string, CredentialRef>
    disabled?: boolean
    notes?: string
    metadata?: Record<string, unknown>
    [key: string]: any
  }

  export interface WorkflowTrigger {
    nodeId: string
    kind: string
    enabled: boolean
    metadata: LooseRecord
    [key: string]: unknown
  }

  export interface WorkflowDefinition {
    id: string
    name: string
    description?: string
    version?: string
    tenantId: string
    createdBy?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    active?: boolean
    locked?: boolean
    tags?: string[]
    category?: string
    settings: WorkflowSettings
    nodes: WorkflowNode[]
    connections: Record<
      string,
      Record<string, Record<string, ConnectionTarget[]>>
    >
    triggers: WorkflowTrigger[]
    variables: Record<string, WorkflowVariable>
    errorHandling?: ErrorHandlingPolicy
    retryPolicy?: RetryPolicy
    rateLimiting?: RateLimitPolicy
    credentials: CredentialBinding[]
    metadata?: LooseRecord
    executionLimits?: ExecutionLimits
    multiTenancy?: Record<string, unknown>
    versionHistory?: unknown[]
  }

  export interface NodeResult {
    status: 'pending' | 'running' | 'success' | 'error' | 'skipped' | 'timeout' | 'aborted' | 'cancelled'
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
    status: 'pending' | 'running' | 'success' | 'error' | 'cancelled' | 'timeout' | 'aborted'
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

  export interface WorkflowContext {
    executionId: string
    tenantId: string
    userId: string
    trigger: WorkflowTrigger
    triggerData?: LooseRecord
    variables: LooseRecord
    secrets: Record<string, string>
    user: {
      id: string
      email: string
      level: number
      role?: string
      [key: string]: any
    }
    request?: LooseRecord
    metadata?: LooseRecord
    [key: string]: any
  }

  export type BuiltInNodeType = string
  export interface INodeExecutor {
    execute: (
      context: WorkflowContext,
      node: WorkflowNode
    ) => Promise<NodeResult>
  }
}
