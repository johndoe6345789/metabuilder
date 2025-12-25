import type { LuaExecutionContext, LuaExecutionResult } from '../types'
import type { LuaEngine } from '../../LuaEngine'
import { executeLuaCode } from '../execution/execute-lua-code'

/**
 * Execute Lua code with a context
 * @param code - Lua code to execute
 * @param context - Execution context
 * @returns Execution result
 */
export async function execute(
  this: LuaEngine,
  code: string,
  context: LuaExecutionContext = {}
): Promise<LuaExecutionResult> {
  this.logs.length = 0
  return executeLuaCode(this.L, code, context, this.logs)
}
