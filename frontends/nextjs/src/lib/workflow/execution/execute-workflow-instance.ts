import type { Workflow } from '../types/level-types'
import { executeWorkflow } from './execute-workflow'
import type { WorkflowExecutionContext } from './workflow-execution-context'
import type { WorkflowExecutionResult } from './workflow-execution-result'

/**
 * Convenience instance method for legacy workflow execution
 * Note: this function doesn't use 'this' - it's a passthrough to executeWorkflow
 */
export async function executeWorkflowInstance(
  this: unknown,
  workflow: Workflow,
  context: WorkflowExecutionContext
): Promise<WorkflowExecutionResult> {
  return executeWorkflow(workflow, context)
}
