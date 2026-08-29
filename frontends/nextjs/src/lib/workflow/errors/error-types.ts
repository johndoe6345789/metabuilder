/** The shape every workflow error answer takes. */

import type { ValidationError } from '@metabuilder/workflow'

/** Context linking an error to the run, workflow, node and tenant. */
export interface ErrorContext {
  executionId?: string
  workflowId?: string
  nodeId?: string
  tenantId?: string
  userId?: string
  action?: string
  timestamp?: Date
  reason?: string
  cause?: Error
  statusCode?: number
  retryable?: boolean
}

export interface ErrorDiagnostics {
  errors?: Array<ValidationError & { suggestion?: string }>
  warnings?: ValidationError[]
  hint?: string
  stack?: string
  context?: Record<string, unknown>
  suggestions?: string[]
}

export interface FormattedError {
  success: false
  error: {
    code: string
    message: string
    statusCode?: number
    details?: Record<string, unknown>
  }
  context?: {
    executionId?: string
    workflowId?: string
    nodeId?: string
    tenantId?: string
  }
  diagnostics?: ErrorDiagnostics
}

/**
 * A plain response. Route handlers turn it into a real one with
 * `NextResponse.json(r.json, { status: r.status })`.
 */
export interface WorkflowApiResponse {
  status: number
  json: FormattedError
  headers?: Map<string, string>
}
