import { getAdapter } from '../../core/dbal-client'
import type { LuaScript } from '../../types/level-types'
import { serializeLuaScript } from './serialize-lua-script'

/**
 * Add a Lua script
 */
export async function addLuaScript(script: LuaScript): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('LuaScript', serializeLuaScript(script))
}
