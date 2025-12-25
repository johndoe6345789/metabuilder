import { getAdapter } from '../dbal-client'
import type { LuaScript } from '../../types/level-types'

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
    await adapter.create('LuaScript', {
      id: script.id,
      name: script.name,
      description: script.description,
      code: script.code,
      parameters: JSON.stringify(script.parameters),
      returnType: script.returnType,
    })
  }
}
