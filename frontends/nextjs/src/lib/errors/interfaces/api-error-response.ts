export interface APIErrorResponse {
  error: string
  code?: number
  details?: Record<string, unknown>
  timestamp?: string
}
