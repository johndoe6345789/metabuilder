import type { Workflow } from '../types/level-types'
import type { WorkflowExecutionContext } from './workflow-execution-context'
import type { WorkflowExecutionResult } from './workflow-execution-result'
import type { WorkflowEngine } from './workflow-engine-class'
import { executeWorkflow } from './execute-workflow'

/**
 * Convenience instance method for legacy workflow execution
 */
export async function executeWorkflowInstance(
  this: WorkflowEngine,
  workflow: Workflow,
  context: WorkflowExecutionContext
): Promise<WorkflowExecutionResult> {
  return executeWorkflow(workflow, context)
}
