import { logToWorkflow } from '../log-to-workflow'
import type { WorkflowNode } from '../types/level-types'
import type { WorkflowExecutionContext } from '../workflow-execution-context'
import type { WorkflowState } from '../workflow-state'

/**
 * Execute an action node
 */
export async function executeActionNode(
  node: WorkflowNode,
  data: any,
  _context: WorkflowExecutionContext,
  state: WorkflowState
): Promise<{ success: boolean; output?: any; error?: string }> {
  logToWorkflow(state, `Action: ${node.config.action || 'default'}`)
  return { success: true, output: data }
}
