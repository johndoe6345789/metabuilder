/**
 * Result of workflow execution
 */
export interface WorkflowExecutionResult {
  success: boolean
  outputs: Record<string, any>
  logs: string[]
  error?: string
  securityWarnings?: string[]
}
