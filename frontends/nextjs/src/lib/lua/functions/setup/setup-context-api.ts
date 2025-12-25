/**
 * Setup Context API
 * Sets up the Lua execution context with log/print functions
 */

import * as fengari from 'fengari-web'

const lua = fengari.lua

/**
 * Setup the context API functions (log, print) in Lua state
 * @param L - Lua state
 * @param logs - Array to collect log messages
 */
export const setupContextAPI = (L: any, logs: string[]): void => {
  // Create log function
  const logFunction = function(LState: any) {
    const nargs = lua.lua_gettop(LState)
    const messages: string[] = []
    
    for (let i = 1; i <= nargs; i++) {
      if (lua.lua_isstring(LState, i)) {
        messages.push(lua.lua_tojsstring(LState, i))
      } else if (lua.lua_isnumber(LState, i)) {
        messages.push(String(lua.lua_tonumber(LState, i)))
      } else if (lua.lua_isboolean(LState, i)) {
        messages.push(String(lua.lua_toboolean(LState, i)))
      } else {
        messages.push(lua.lua_typename(LState, lua.lua_type(LState, i)))
      }
    }
    
    logs.push(messages.join(' '))
    return 0
  }

  lua.lua_pushcfunction(L, logFunction)
  lua.lua_setglobal(L, fengari.to_luastring('log'))

  // Create print function (same behavior but tab-separated)
  const printFunction = function(LState: any) {
    const nargs = lua.lua_gettop(LState)
    const messages: string[] = []
    
    for (let i = 1; i <= nargs; i++) {
      if (lua.lua_isstring(LState, i)) {
        messages.push(lua.lua_tojsstring(LState, i))
      } else if (lua.lua_isnumber(LState, i)) {
        messages.push(String(lua.lua_tonumber(LState, i)))
      } else if (lua.lua_isboolean(LState, i)) {
        messages.push(String(lua.lua_toboolean(LState, i)))
      } else {
        messages.push(lua.lua_typename(LState, lua.lua_type(LState, i)))
      }
    }
    
    logs.push(messages.join('\t'))
    return 0
  }

  lua.lua_pushcfunction(L, printFunction)
  lua.lua_setglobal(L, fengari.to_luastring('print'))
}
