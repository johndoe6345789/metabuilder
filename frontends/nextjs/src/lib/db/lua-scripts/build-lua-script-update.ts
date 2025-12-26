import type { LuaScript } from '../../types/level-types'
import { normalizeAllowedGlobals } from '../../lua/functions/sandbox/normalize-allowed-globals'

export function buildLuaScriptUpdate(updates: Partial<LuaScript>): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  if (updates.name !== undefined) data.name = updates.name
  if (updates.description !== undefined) data.description = updates.description
  if (updates.code !== undefined) data.code = updates.code
  if (updates.parameters !== undefined) data.parameters = JSON.stringify(updates.parameters)
  if (updates.returnType !== undefined) data.returnType = updates.returnType
  if (updates.isSandboxed !== undefined) data.isSandboxed = updates.isSandboxed
  if (updates.allowedGlobals !== undefined) {
    data.allowedGlobals = JSON.stringify(normalizeAllowedGlobals(updates.allowedGlobals))
  }
  if (updates.timeoutMs !== undefined) data.timeoutMs = updates.timeoutMs

  return data
}
