import { getAdapter } from '../../core/dbal-client'
import type { LuaScript } from '@/lib/types/level-types'

/**
 * Update a Lua script by ID
 */
export async function updateLuaScript(
  scriptId: string,
  updates: Partial<LuaScript>
): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, unknown> = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.description !== undefined) data.description = updates.description
  if (updates.code !== undefined) data.code = updates.code
  if (updates.parameters !== undefined) data.parameters = updates.parameters
  if (updates.returnType !== undefined) data.returnType = updates.returnType
  if (updates.isSandboxed !== undefined) data.isSandboxed = updates.isSandboxed
  if (updates.allowedGlobals !== undefined) data.allowedGlobals = updates.allowedGlobals
  if (updates.timeoutMs !== undefined) data.timeoutMs = updates.timeoutMs

  await adapter.update('LuaScript', scriptId, data)
}
