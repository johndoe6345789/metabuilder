import type { LuaScript } from '../../types/level-types'
import { getAdapter } from '../core/dbal-client'
import { deserializeLuaScript } from './serialization/deserialize-lua-script'

/**
 * Get all Lua scripts
 */
export async function getLuaScripts(): Promise<LuaScript[]> {
  const adapter = getAdapter()
  const result = await adapter.list('LuaScript')
  return (result.data as Record<string, unknown>[]).map(deserializeLuaScript)
}
