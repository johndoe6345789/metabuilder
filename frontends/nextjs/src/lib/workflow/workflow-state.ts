/**
 * Shared state for workflow execution
 */
export interface WorkflowState {
  logs: string[]
  securityWarnings: string[]
}

/**
 * Create initial workflow state
 */
export function createWorkflowState(): WorkflowState {
  return {
    logs: [],
    securityWarnings: [],
  }
}
