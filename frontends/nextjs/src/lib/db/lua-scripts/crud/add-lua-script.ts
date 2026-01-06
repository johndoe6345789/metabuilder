import { getAdapter } from '../../core/dbal-client'
import type { LuaScript } from '@/lib/types/level-types'

/**
 * Add a Lua script
 */
export async function addLuaScript(script: LuaScript): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('LuaScript', {
    id: script.id,
    tenantId: script.tenantId,
    name: script.name,
    description: script.description,
    code: script.code,
    parameters: script.parameters,
    returnType: script.returnType,
    isSandboxed: script.isSandboxed ?? true,
    allowedGlobals: script.allowedGlobals ?? '[]',
    timeoutMs: script.timeoutMs ?? 5000,
  })
}
