import type { WorkflowState } from './workflow-state'

/**
 * Log a message to workflow state
 */
export function logToWorkflow(state: WorkflowState, ...args: unknown[]): void {
  state.logs.push(args.map(arg => String(arg)).join(' '))
}
