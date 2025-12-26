import type { SandboxedLuaEngineState } from './types'

/**
 * Tear down the sandboxed engine
 */
export function destroy(this: SandboxedLuaEngineState): void {
  if (this.engine) {
    this.engine.destroy()
    this.engine = null
  }
}
