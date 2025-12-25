import type { Workflow } from '../types/level-types'
import type { WorkflowExecutionContext } from './workflow-execution-context'
import type { WorkflowExecutionResult } from './workflow-execution-result'
import { executeWorkflow } from './execute-workflow'

export const executeWorkflowInstance = (
  workflow: Workflow,
  context: WorkflowExecutionContext
): Promise<WorkflowExecutionResult> => executeWorkflow(workflow, context)
