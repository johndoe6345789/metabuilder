import * as fengari from 'fengari-web'

import type { SandboxedLuaEngineState } from './types'

const lua = fengari.lua

export function getLuaMemoryUsageBytes(this: SandboxedLuaEngineState): number {
  if (!this.engine) return 0
  if (typeof lua.lua_gc !== 'function') return 0

  const { L } = this.engine
  const kbytes = lua.lua_gc(L, lua.LUA_GCCOUNT, 0)
  const bytes = lua.lua_gc(L, lua.LUA_GCCOUNTB, 0)

  if (!Number.isFinite(kbytes) || !Number.isFinite(bytes)) return 0

  return kbytes * 1024 + bytes
}
