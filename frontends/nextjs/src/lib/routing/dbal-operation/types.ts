export interface DbalOperationResult {
  success: boolean
  data?: unknown
  error?: string
  meta?: unknown
}

export interface DbalOperation {
  entity: string
  operation: string
  id?: string
  action?: string
}

export interface DbalOperationContext {
  tenantId?: string
  userId?: string
  tenant?: { id?: string | null }
  user?: { id?: string | null }
  body?: unknown
}
