/**
 * From Lua
 * Converts Lua stack values to JavaScript values
 */

import * as fengari from 'fengari-web'

import type { JsonValue } from '@/types/utility-types'

import type { LuaState } from '../types'
import { tableToJS } from './table-to-js'

const lua = fengari.lua

/**
 * Convert a Lua stack value to JavaScript
 * @param L - Lua state
 * @param index - Stack index (default: -1 for top of stack)
 * @returns JavaScript value
 */
export const fromLua = (L: LuaState, index: number = -1): JsonValue => {
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
