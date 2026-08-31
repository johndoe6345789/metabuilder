export type ErrorCategory =
  | 'network'
  | 'authentication'
  | 'permission'
  | 'validation'
  | 'not-found'
  | 'conflict'
  | 'rate-limit'
  | 'server'
  | 'timeout'
  | 'unknown'

export interface ErrorReportContext {
  component?: string
  userId?: string
  tenantId?: string
  action?: string
  timestamp?: Date
  retryable?: boolean
  retryCount?: number
  [key: string]: unknown
}

export interface ErrorReport {
  id: string
  message: string
  code?: string
  statusCode?: number
  category: ErrorCategory
  stack?: string
  context: ErrorReportContext
  timestamp: Date
  isDevelopment: boolean
  isRetryable: boolean
  suggestedAction?: string
}
