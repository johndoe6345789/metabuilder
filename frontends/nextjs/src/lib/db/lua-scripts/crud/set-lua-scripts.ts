import { getAdapter } from '../../core/dbal-client'
import type { LuaScript } from '@/lib/types/level-types'

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
  for (const script of existing.data) {
    await adapter.delete('LuaScript', script.id)
  }

  // Create new scripts
  for (const script of scripts) {
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
}
