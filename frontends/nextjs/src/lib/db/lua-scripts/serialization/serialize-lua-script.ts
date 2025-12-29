import { normalizeAllowedGlobals } from '../../../lua/functions/sandbox/globals/normalize-allowed-globals'
import type { LuaScript } from '../../../types/level-types'

export function serializeLuaScript(script: LuaScript): Record<string, unknown> {
  const allowedGlobals = normalizeAllowedGlobals(script.allowedGlobals)

  return {
    id: script.id,
    name: script.name,
    description: script.description ?? null,
    code: script.code,
    parameters: JSON.stringify(script.parameters ?? []),
    returnType: script.returnType ?? null,
    isSandboxed: script.isSandboxed ?? true,
    allowedGlobals: JSON.stringify(allowedGlobals),
    timeoutMs: script.timeoutMs ?? 5000,
  }
}
