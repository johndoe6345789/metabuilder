/**
 * From Lua
 * Converts Lua stack values to JavaScript values
 */

import * as fengari from 'fengari-web'

import { tableToJS } from './table-to-js'

const lua = fengari.lua

/**
 * Convert a Lua stack value to JavaScript
 * @param L - Lua state
 * @param index - Stack index (default: -1 for top of stack)
 * @returns JavaScript value
 */
export const fromLua = (L: any, index: number = -1): any => {
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
