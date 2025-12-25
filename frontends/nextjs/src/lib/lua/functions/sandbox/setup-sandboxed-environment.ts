import * as fengari from 'fengari-web'
import type { SandboxedLuaEngine } from '../../sandboxed-lua-engine'

const lua = fengari.lua

/**
 * Replace globals with a safe sandbox environment
 */
export function setupSandboxedEnvironment(this: SandboxedLuaEngine): void {
  if (!this.engine) return

  const { L } = this.engine

  lua.lua_newtable(L)

  const safeFunctions = [
    'assert', 'error', 'ipairs', 'next', 'pairs', 'pcall', 'select',
    'tonumber', 'tostring', 'type', 'unpack', 'xpcall',
    'string', 'table', 'math', 'bit32'
  ]

  for (const funcName of safeFunctions) {
    lua.lua_getglobal(L, fengari.to_luastring(funcName))
    lua.lua_setfield(L, -2, fengari.to_luastring(funcName))
  }

  lua.lua_getglobal(L, fengari.to_luastring('print'))
  lua.lua_setfield(L, -2, fengari.to_luastring('print'))

  lua.lua_getglobal(L, fengari.to_luastring('log'))
  lua.lua_setfield(L, -2, fengari.to_luastring('log'))

  lua.lua_pushvalue(L, -1)
  lua.lua_setfield(L, -2, fengari.to_luastring('_G'))

  lua.lua_setglobal(L, fengari.to_luastring('_ENV'))
}
