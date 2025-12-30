/**
 * Table to JS
 * Converts Lua tables to JavaScript arrays/objects
 */

import * as fengari from 'fengari-web'

import type { JsonValue } from '@/types/utility-types'
import type { LuaState } from '../types'

const lua = fengari.lua

/**
 * Convert a Lua table to JavaScript array or object
 * @param L - Lua state
 * @param index - Stack index of the table
 * @returns JavaScript array or object
 */
export const tableToJS = (L: LuaState, index: number): JsonValue => {
  const result: Record<string, JsonValue> = {}
  let isArray = true
  let arrayIndex = 1

  lua.lua_pushnil(L)

  while (lua.lua_next(L, index < 0 ? index - 1 : index) !== 0) {
    const keyType = lua.lua_type(L, -2)

    if (keyType === lua.LUA_TNUMBER) {
      const key = lua.lua_tonumber(L, -2)
      if (key !== arrayIndex) {
        isArray = false
      }
      arrayIndex++
    } else {
      isArray = false
    }

    const key = fromLuaValue(L, -2)
    const value = fromLuaValue(L, -1)
    result[key] = value

    lua.lua_pop(L, 1)
  }

  if (isArray && arrayIndex > 1) {
    return Object.values(result)
  }

  return result
}

/**
 * Helper to convert single Lua value (avoids circular dependency)
 */
const fromLuaValue = (L: LuaState, index: number): JsonValue => {
  const type = lua.lua_type(L, index)

  switch (type) {
    case lua.LUA_TNIL:
      return null
    case lua.LUA_TBOOLEAN:
      return lua.lua_toboolean(L, index)
    case lua.LUA_TNUMBER:
      return lua.lua_tonumber(L, index)
    case lua.LUA_TSTRING:
      return lua.lua_tojsstring(L, index)
    case lua.LUA_TTABLE:
      return tableToJS(L, index)
    default:
      return null
  }
}
