import type { SandboxedLuaEngineState } from './types'

/**
 * Update execution timeout for sandboxed runs
 */
export function setExecutionTimeout(this: SandboxedLuaEngineState, timeout: number): void {
  this.executionTimeout = timeout
}
