import type { SandboxedLuaEngine } from '../../sandboxed-lua-engine'

/**
 * Update execution timeout for sandboxed runs
 */
export function setExecutionTimeout(this: SandboxedLuaEngine, timeout: number): void {
  this.executionTimeout = timeout
}
