import type { WorkflowNode } from '../level-types'
import type { WorkflowExecutionContext } from './workflow-execution-context'
import type { WorkflowState } from './workflow-state'
import { logToWorkflow } from './log-to-workflow'

/**
 * Execute a condition node
 */
export async function executeConditionNode(
  node: WorkflowNode,
  data: any,
  context: WorkflowExecutionContext,
  state: WorkflowState
): Promise<{ success: boolean; output?: any; error?: string }> {
  const condition = node.config.condition || 'true'

  try {
    const result = new Function('data', 'context', `return ${condition}`)(data, context)
    logToWorkflow(state, `Condition evaluated to: ${result}`)
    return { success: true, output: result }
  } catch (error) {
    return {
      success: false,
      error: `Condition evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
