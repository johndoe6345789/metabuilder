import { getAdapter } from '../dbal-client'
import type { LuaScript } from '../../types/level-types'

/**
 * Get all Lua scripts
 */
export async function getLuaScripts(): Promise<LuaScript[]> {
  const adapter = getAdapter()
  const result = await adapter.list('LuaScript')
  return (result.data as any[]).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description || undefined,
    code: s.code,
    parameters: JSON.parse(s.parameters),
    returnType: s.returnType || undefined,
  }))
}
