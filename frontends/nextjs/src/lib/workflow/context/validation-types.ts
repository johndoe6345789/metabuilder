/** What a dry-run validation reports. */

export type ContextErrorCode =
  | 'TENANT_MISMATCH'
  | 'UNAUTHORIZED_ACCESS'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_CREDENTIALS'
  | 'SCOPE_VIOLATION'
  | 'EXECUTION_LIMIT_EXCEEDED'
  | 'SECRET_EXPOSURE'

export interface ContextValidationError {
  path: string
  message: string
  code: ContextErrorCode
}

export interface ContextValidationWarning {
  path: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface ContextValidationResult {
  valid: boolean
  errors: ContextValidationError[]
  warnings: ContextValidationWarning[]
}
