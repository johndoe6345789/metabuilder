import { getAdapter } from '../dbal-client'
import type { LuaScript } from '../../types/level-types'

/**
 * Add a Lua script
 */
export async function addLuaScript(script: LuaScript): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('LuaScript', {
    id: script.id,
    name: script.name,
    description: script.description,
    code: script.code,
    parameters: JSON.stringify(script.parameters),
    returnType: script.returnType,
  })
}
