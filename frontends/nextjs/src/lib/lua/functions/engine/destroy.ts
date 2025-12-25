import * as fengari from 'fengari-web'
import type { LuaEngineState } from '../types'

const lua = fengari.lua

/**
 * Destroy the Lua state
 */
export function destroy(this: LuaEngineState): void {
  if (this.L) {
    lua.lua_close(this.L)
  }
}
