export interface LogContext {
  component?: string
  userId?: string
  action?: string
  [key: string]: unknown
}
