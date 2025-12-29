import * as fengari from 'fengari-web'

import { normalizeAllowedGlobals } from '../../globals/normalize-allowed-globals'
import type { SandboxedLuaEngineState } from './types'

const lua = fengari.lua

/**
 * Replace globals with a safe sandbox environment
 */
export function setupSandboxedEnvironment(
  this: SandboxedLuaEngineState,
  allowedGlobals?: string[]
): void {
  if (!this.engine) return

  const { L } = this.engine

  lua.lua_newtable(L)

  const safeGlobals = normalizeAllowedGlobals(allowedGlobals)

  for (const funcName of safeGlobals) {
    lua.lua_getglobal(L, fengari.to_luastring(funcName))
    lua.lua_setfield(L, -2, fengari.to_luastring(funcName))
  }

  lua.lua_pushvalue(L, -1)
  lua.lua_setfield(L, -2, fengari.to_luastring('_G'))

  lua.lua_setglobal(L, fengari.to_luastring('_ENV'))
}
