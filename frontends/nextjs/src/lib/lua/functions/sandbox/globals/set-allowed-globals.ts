import type { SandboxedLuaEngineState } from './types'
import { normalizeAllowedGlobals } from './normalize-allowed-globals'

export function setAllowedGlobals(this: SandboxedLuaEngineState, allowedGlobals?: string[]): void {
  this.allowedGlobals = normalizeAllowedGlobals(allowedGlobals)
}
