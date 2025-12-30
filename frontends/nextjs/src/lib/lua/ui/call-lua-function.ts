import * as fengari from 'fengari-web'

import { fromLua } from '@/lib/lua/functions/converters/from-lua'
import type { LuaState } from '@/lib/lua/functions/types'
import type { JsonValue } from '@/types/utility-types'

const lua = fengari.lua

/**
 * Call a Lua function that's in a table on the stack
 * @param L - Lua state
 * @param tableIndex - Stack index of the table containing the function
 * @param functionName - Name of the function to call
 * @returns The result of the function call
 */
export function callLuaFunction(L: LuaState, tableIndex: number, functionName: string): JsonValue {
  // Get the function from the table
  lua.lua_getfield(L, tableIndex, fengari.to_luastring(functionName))

  // Check if it's a function
  if (!lua.lua_isfunction(L, -1)) {
    lua.lua_pop(L, 1)
    throw new Error(`${functionName} is not a function`)
  }

  // Call the function with 0 arguments, expecting 1 return value
  const callResult = lua.lua_pcall(L, 0, 1, 0)

  if (callResult !== lua.LUA_OK) {
    const errorMsg = lua.lua_tojsstring(L, -1)
    lua.lua_pop(L, 1)
    throw new Error(`Error calling ${functionName}: ${errorMsg}`)
  }

  // Convert the result to JavaScript
  const result = fromLua(L, -1)
  lua.lua_pop(L, 1)

  return result
}
