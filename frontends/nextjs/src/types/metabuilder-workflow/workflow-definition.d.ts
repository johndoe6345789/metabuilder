declare module '@metabuilder/workflow' {
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
    metadata?: Record<string, unknown>
    executionLimits?: ExecutionLimits
    multiTenancy?: Record<string, unknown>
    versionHistory?: unknown[]
  }
}
