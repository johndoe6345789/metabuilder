declare module '@metabuilder/workflow' {
  export interface ValidationError {
    path: string
    message: string
    severity?: 'error' | 'warning' | 'info'
    code: string
    [key: string]: any
  }

  export interface WorkflowValidationResult {
    valid: boolean
    errors: ValidationError[]
    warnings: ValidationError[]
  }

  export type ValidationResult = WorkflowValidationResult
}
