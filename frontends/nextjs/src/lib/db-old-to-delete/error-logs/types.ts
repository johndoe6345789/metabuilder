export interface ErrorLog {
  id: string
  timestamp: number
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  context?: string
  userId?: string
  username?: string
  tenantId?: string
  source?: string
  resolved: boolean
  resolvedAt?: number
  resolvedBy?: string
}
