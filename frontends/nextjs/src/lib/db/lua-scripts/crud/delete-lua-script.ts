import { getAdapter } from '../../core/dbal-client'

/**
 * Delete a Lua script by ID
 */
export async function deleteLuaScript(scriptId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('LuaScript', scriptId)
}
