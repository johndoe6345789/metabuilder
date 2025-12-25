import type { SandboxedLuaEngine } from '../../sandboxed-lua-engine'

/**
 * Tear down the sandboxed engine
 */
export function destroy(this: SandboxedLuaEngine): void {
  if (this.engine) {
    this.engine.destroy()
    this.engine = null
  }
}
