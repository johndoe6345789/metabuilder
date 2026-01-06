import { getAdapter } from '../../core/dbal-client'
import type { LuaScript } from '@/lib/types/level-types'

type DBALLuaScriptRecord = {
  id: string
  tenantId?: string | null
  name: string
  description?: string | null
  code: string
  parameters: string
  returnType?: string | null
  isSandboxed: boolean
  allowedGlobals: string
  timeoutMs: number
}

/**
 * Get all Lua scripts
 */
export async function getLuaScripts(): Promise<LuaScript[]> {
  const adapter = getAdapter()
  const result = (await adapter.list('LuaScript')) as { data: DBALLuaScriptRecord[] }
  return result.data.map(script => ({
    id: script.id,
    tenantId: script.tenantId,
    name: script.name,
    description: script.description,
    code: script.code,
    parameters: script.parameters,
    returnType: script.returnType,
    isSandboxed: script.isSandboxed,
    allowedGlobals: script.allowedGlobals,
    timeoutMs: script.timeoutMs,
  }))
}
