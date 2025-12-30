import type { LuaScript } from '../../types/level-types'
import { getAdapter } from '../core/dbal-client'
import { serializeLuaScript } from './serialization/serialize-lua-script'

type DBALLuaScriptRecord = {
  id: string
}

/**
 * Set all Lua scripts (replaces existing)
 */
export async function setLuaScripts(scripts: LuaScript[]): Promise<void> {
  const adapter = getAdapter()

  // Delete existing scripts
  const existing = (await adapter.list('LuaScript')) as { data: DBALLuaScriptRecord[] }
  for (const s of existing.data) {
    await adapter.delete('LuaScript', s.id)
  }

  // Create new scripts
  for (const script of scripts) {
    await adapter.create('LuaScript', serializeLuaScript(script))
  }
}
