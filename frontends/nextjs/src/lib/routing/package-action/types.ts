export interface PackageActionResult {
  success: boolean
  data?: unknown
  error?: string
  code?: 'NOT_FOUND' | 'INVALID_CONFIG'
}

export interface PackageActionOptions {
  allowFallback?: boolean
}
