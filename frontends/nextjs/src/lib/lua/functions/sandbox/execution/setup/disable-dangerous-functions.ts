import * as fengari from 'fengari-web'

import type { SandboxedLuaEngineState } from './types'

const lua = fengari.lua

/**
 * Disable dangerous global functions in the Lua sandbox
 */
export function disableDangerousFunctions(this: SandboxedLuaEngineState): void {
  if (!this.engine) return

  const { L } = this.engine

  lua.lua_pushnil(L)
  lua.lua_setglobal(L, fengari.to_luastring('os'))

  lua.lua_pushnil(L)
  lua.lua_setglobal(L, fengari.to_luastring('io'))

  lua.lua_pushnil(L)
  lua.lua_setglobal(L, fengari.to_luastring('loadfile'))

  lua.lua_pushnil(L)
  lua.lua_setglobal(L, fengari.to_luastring('dofile'))

  lua.lua_getglobal(L, fengari.to_luastring('package'))
  if (!lua.lua_isnil(L, -1)) {
    lua.lua_pushnil(L)
    lua.lua_setfield(L, -2, fengari.to_luastring('loadlib'))

    lua.lua_pushnil(L)
    lua.lua_setfield(L, -2, fengari.to_luastring('searchpath'))

    lua.lua_pushstring(L, fengari.to_luastring(''))
    lua.lua_setfield(L, -2, fengari.to_luastring('cpath'))
  }
  lua.lua_pop(L, 1)

  lua.lua_getglobal(L, fengari.to_luastring('debug'))
  if (!lua.lua_isnil(L, -1)) {
    lua.lua_pushnil(L)
    lua.lua_setfield(L, -2, fengari.to_luastring('getfenv'))

    lua.lua_pushnil(L)
    lua.lua_setfield(L, -2, fengari.to_luastring('setfenv'))
  }
  lua.lua_pop(L, 1)
}
