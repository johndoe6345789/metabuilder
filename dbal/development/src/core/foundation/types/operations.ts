export interface OperationContext {
  tenantId?: string
  userId?: string
  correlationId?: string
  traceId?: string
  metadata?: Record<string, unknown>
}

export interface OperationOptions {
  timeoutMs?: number
  retryCount?: number
  dryRun?: boolean
}

export interface OperationAuditTrail {
  performedAt: Date
  performedBy?: string
  context?: OperationContext
}
