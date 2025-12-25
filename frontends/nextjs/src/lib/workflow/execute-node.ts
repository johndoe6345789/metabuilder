import type { WorkflowNode } from '../types/level-types'
import type { WorkflowExecutionContext } from './workflow-execution-context'
import type { WorkflowState } from './workflow-state'
import { executeActionNode } from './execute-action-node'
import { executeConditionNode } from './execute-condition-node'
import { executeLuaNode } from './execute-lua-node'
import { executeTransformNode } from './execute-transform-node'

/**
 * Execute a single workflow node
 */
export async function executeNode(
  node: WorkflowNode,
  data: any,
  context: WorkflowExecutionContext,
  state: WorkflowState
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    switch (node.type) {
      case 'trigger':
        return { success: true, output: data }

      case 'action':
        return await executeActionNode(node, data, context, state)

      case 'condition':
        return await executeConditionNode(node, data, context, state)

      case 'lua':
        return await executeLuaNode(node, data, context, state)

      case 'transform':
        return await executeTransformNode(node, data, context, state)

      default:
        return {
          success: false,
          error: `Unknown node type: ${node.type}`,
        }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
