/**
 * Push to Lua
 * Converts JavaScript values to Lua stack values
 */

import * as fengari from 'fengari-web'

const lua = fengari.lua

/**
 * Push a JavaScript value onto the Lua stack
 * @param L - Lua state
 * @param value - JavaScript value to push
 */
export const pushToLua = (L: any, value: any): void => {
  if (value === null || value === undefined) {
    lua.lua_pushnil(L)
  } else if (typeof value === 'boolean') {
    lua.lua_pushboolean(L, value)
  } else if (typeof value === 'number') {
    lua.lua_pushnumber(L, value)
  } else if (typeof value === 'string') {
    lua.lua_pushstring(L, fengari.to_luastring(value))
  } else if (Array.isArray(value)) {
    lua.lua_createtable(L, value.length, 0)
    value.forEach((item, index) => {
      lua.lua_pushinteger(L, index + 1)
      pushToLua(L, item)
      lua.lua_settable(L, -3)
    })
  } else if (typeof value === 'object') {
    lua.lua_createtable(L, 0, Object.keys(value).length)
    for (const [key, val] of Object.entries(value)) {
      lua.lua_pushstring(L, fengari.to_luastring(key))
      pushToLua(L, val)
      lua.lua_settable(L, -3)
    }
  } else {
    lua.lua_pushnil(L)
  }
}
