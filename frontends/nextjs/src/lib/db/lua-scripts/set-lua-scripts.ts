import { getAdapter } from '../../core/dbal-client'
import type { LuaScript } from '../../types/level-types'
import { serializeLuaScript } from './serialize-lua-script'

/**
 * Set all Lua scripts (replaces existing)
 */
export async function setLuaScripts(scripts: LuaScript[]): Promise<void> {
  const adapter = getAdapter()
  
  // Delete existing scripts
  const existing = await adapter.list('LuaScript')
  for (const s of existing.data as any[]) {
    await adapter.delete('LuaScript', s.id)
  }
  
  // Create new scripts
  for (const script of scripts) {
    await adapter.create('LuaScript', serializeLuaScript(script))
  }
}
