import { getAdapter } from '../dbal-client'
import type { LuaScript } from '../../types/level-types'

/**
 * Update a Lua script by ID
 */
export async function updateLuaScript(scriptId: string, updates: Partial<LuaScript>): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, unknown> = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.description !== undefined) data.description = updates.description
  if (updates.code !== undefined) data.code = updates.code
  if (updates.parameters !== undefined) data.parameters = JSON.stringify(updates.parameters)
  if (updates.returnType !== undefined) data.returnType = updates.returnType

  await adapter.update('LuaScript', scriptId, data)
}
