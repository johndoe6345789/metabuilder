/**
 * Execute Lua Code
 * Executes Lua code with a given context
 */

import * as fengari from 'fengari-web'

import type { JsonValue } from '@/types/utility-types'

import { fromLua } from '../converters/from-lua'
import { pushToLua } from '../converters/push-to-lua'
import type { LuaExecutionContext, LuaExecutionResult, LuaState } from '../types'

const lua = fengari.lua
const lauxlib = fengari.lauxlib

/**
 * Execute Lua code with a context
 * @param L - Lua state
 * @param code - Lua code to execute
 * @param context - Execution context with data, user, kv
 * @param logs - Array to collect log messages
 * @returns Execution result
 */
export const executeLuaCode = async (
  L: LuaState,
  code: string,
  context: LuaExecutionContext,
  logs: string[]
): Promise<LuaExecutionResult> => {
  try {
    // Create context table
    lua.lua_createtable(L, 0, 3)

    if (context.data !== undefined) {
      lua.lua_pushstring(L, fengari.to_luastring('data'))
      pushToLua(L, context.data)
      lua.lua_settable(L, -3)
    }

    if (context.user !== undefined) {
      lua.lua_pushstring(L, fengari.to_luastring('user'))
      pushToLua(L, context.user)
      lua.lua_settable(L, -3)
    }

    const kvMethods: Record<string, ((key: string) => Promise<JsonValue>) | ((key: string, value: JsonValue) => Promise<void>)> = {}
    if (context.kv) {
      kvMethods.get = context.kv.get
      kvMethods.set = context.kv.set
    }
    lua.lua_pushstring(L, fengari.to_luastring('kv'))
    pushToLua(L, kvMethods)
    lua.lua_settable(L, -3)

    lua.lua_setglobal(L, fengari.to_luastring('context'))

    // Load and execute code
    const loadResult = lauxlib.luaL_loadstring(L, fengari.to_luastring(code))

    if (loadResult !== lua.LUA_OK) {
      const errorMsg = lua.lua_tojsstring(L, -1)
      lua.lua_pop(L, 1)
      return {
        success: false,
        error: `Syntax error: ${errorMsg}`,
        logs,
      }
    }

    const execResult = lua.lua_pcall(L, 0, lua.LUA_MULTRET, 0)

    if (execResult !== lua.LUA_OK) {
      const errorMsg = lua.lua_tojsstring(L, -1)
      lua.lua_pop(L, 1)
      return {
        success: false,
        error: `Runtime error: ${errorMsg}`,
        logs,
      }
    }

    // Get results
    const nresults = lua.lua_gettop(L)
    let result: JsonValue = null

    if (nresults > 0) {
      if (nresults === 1) {
        result = fromLua(L, -1)
      } else {
        result = []
        for (let i = 1; i <= nresults; i++) {
          result.push(fromLua(L, -nresults + i - 1))
        }
      }
      lua.lua_pop(L, nresults)
    }

    return {
      success: true,
      result,
      logs,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      logs,
    }
  }
}
