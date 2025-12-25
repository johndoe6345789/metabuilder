import * as fengari from 'fengari-web'
import type { LuaEngine } from '../../LuaEngine'

const lua = fengari.lua

/**
 * Destroy the Lua state
 */
export function destroy(this: LuaEngine): void {
  if (this.L) {
    lua.lua_close(this.L)
  }
}
