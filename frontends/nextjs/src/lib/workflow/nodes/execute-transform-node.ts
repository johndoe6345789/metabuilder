import { logToWorkflow } from '../log-to-workflow'
import type { WorkflowNode } from '../types/level-types'
import type { WorkflowExecutionContext } from '../workflow-execution-context'
import type { WorkflowState } from '../workflow-state'

/**
 * Execute a transform node
 */
export async function executeTransformNode(
  node: WorkflowNode,
  data: unknown,
  context: WorkflowExecutionContext,
  state: WorkflowState
): Promise<{ success: boolean; output?: unknown; error?: string }> {
  const transform = node.config.transform || 'data'

  try {
    const result = new Function('data', 'context', `return ${transform}`)(data, context)
    logToWorkflow(state, `Transform result: ${JSON.stringify(result)}`)
    return { success: true, output: result }
  } catch (error) {
    return {
      success: false,
      error: `Transform failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
