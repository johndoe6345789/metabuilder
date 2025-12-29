/**
 * Result of workflow execution
 */
export interface WorkflowExecutionResult {
  success: boolean
  outputs: Record<string, unknown>
  logs: string[]
  error?: string
  securityWarnings?: string[]
}
