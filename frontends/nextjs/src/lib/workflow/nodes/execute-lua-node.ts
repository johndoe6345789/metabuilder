import type { WorkflowNode } from '../types/level-types'
import type { WorkflowExecutionContext } from './workflow-execution-context'
import type { WorkflowState } from './workflow-state'
import { executeLuaCode } from './execute-lua-code'

/**
 * Execute a Lua script node
 */
export async function executeLuaNode(
  node: WorkflowNode,
  data: any,
  context: WorkflowExecutionContext,
  state: WorkflowState
): Promise<{ success: boolean; output?: any; error?: string }> {
  const scriptId = node.config.scriptId

  if (!scriptId || !context.scripts) {
    const luaCode = node.config.code || 'return context.data'
    return await executeLuaCode(luaCode, data, context, state)
  }

  const script = context.scripts.find((s) => s.id === scriptId)
  if (!script) {
    return {
      success: false,
      error: `Script not found: ${scriptId}`,
    }
  }

  return await executeLuaCode(script.code, data, context, state)
}
