import { normalizeAllowedGlobals } from './normalize-allowed-globals'
import type { SandboxedLuaEngineState } from './types'

export function setAllowedGlobals(this: SandboxedLuaEngineState, allowedGlobals?: string[]): void {
  this.allowedGlobals = normalizeAllowedGlobals(allowedGlobals)
}
