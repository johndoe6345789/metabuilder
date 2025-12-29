import { normalizeAllowedGlobals } from '../../../lua/functions/sandbox/globals/normalize-allowed-globals'
import type { LuaScript } from '../../../types/level-types'
import { parseJsonArray } from './parse-json-array'

export function deserializeLuaScript(raw: Record<string, unknown>): LuaScript {
  const parameters = parseJsonArray(raw.parameters)
  const allowedGlobals = parseJsonArray(raw.allowedGlobals)

  return {
    id: String(raw.id),
    name: String(raw.name),
    description: typeof raw.description === 'string' ? raw.description : undefined,
    code: String(raw.code),
    parameters: parameters as Array<{ name: string; type: string }>,
    returnType: typeof raw.returnType === 'string' ? raw.returnType : undefined,
    isSandboxed: typeof raw.isSandboxed === 'boolean' ? raw.isSandboxed : true,
    allowedGlobals: normalizeAllowedGlobals(allowedGlobals as string[]),
    timeoutMs: typeof raw.timeoutMs === 'number' ? raw.timeoutMs : 5000,
  }
}
