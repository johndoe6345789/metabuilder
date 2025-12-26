import { getAdapter } from '../../core/dbal-client'
import type { LuaScript } from '../../types/level-types'
import { buildLuaScriptUpdate } from './build-lua-script-update'

/**
 * Update a Lua script by ID
 */
export async function updateLuaScript(scriptId: string, updates: Partial<LuaScript>): Promise<void> {
  const adapter = getAdapter()
  await adapter.update('LuaScript', scriptId, buildLuaScriptUpdate(updates))
}
