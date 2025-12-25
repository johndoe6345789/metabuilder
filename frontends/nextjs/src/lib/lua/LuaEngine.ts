/**
 * LuaEngine - Class wrapper for Lua execution operations
 * 
 * This class serves as a container for lambda functions related to Lua execution.
 * Each method delegates to an individual function file in the functions/ directory.
 * 
 * Pattern: "class is container for lambdas"
 * - Each lambda is defined in its own file under functions/
 * - This class wraps them for convenient stateful Lua execution
 * - Maintains Lua state across multiple executions
 */

import * as fengari from 'fengari-web'
import type { LuaExecutionContext, LuaExecutionResult } from './functions/types'
import { setupContextAPI } from './functions/setup/setup-context-api'
import { executeLuaCode } from './functions/execution/execute-lua-code'

const lua = fengari.lua
const lauxlib = fengari.lauxlib
const lualib = fengari.lualib

// Re-export types
export type { LuaExecutionContext, LuaExecutionResult }

/**
 * LuaEngine class wraps individual Lua execution lambdas
 */
export class LuaEngine {
  private L: any
  private logs: string[] = []

  constructor() {
    this.L = lauxlib.luaL_newstate()
    lualib.luaL_openlibs(this.L)
    setupContextAPI(this.L, this.logs)
  }

  /**
   * Execute Lua code with a context
   * @param code - Lua code to execute
   * @param context - Execution context
   * @returns Execution result
   */
  async execute(code: string, context: LuaExecutionContext = {}): Promise<LuaExecutionResult> {
    this.logs.length = 0
    return executeLuaCode(this.L, code, context, this.logs)
  }

  /**
   * Destroy the Lua state
   */
  destroy(): void {
    if (this.L) {
      lua.lua_close(this.L)
    }
  }
}

/**
 * Factory function to create a new LuaEngine instance
 * @returns New LuaEngine instance
 */
export const createLuaEngine = (): LuaEngine => {
  return new LuaEngine()
}

// Re-export individual functions for direct imports
export {
  setupContextAPI,
  executeLuaCode
} from './functions'

export {
  pushToLua,
  fromLua,
  tableToJS
} from './functions/converters'
