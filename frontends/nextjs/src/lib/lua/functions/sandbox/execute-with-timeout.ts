import type { LuaExecutionContext, LuaExecutionResult } from '../types'
import type { SandboxedLuaEngine } from '../../sandboxed-lua-engine'

/**
 * Execute Lua code with a timeout guard
 */
export function executeWithTimeout(
  this: SandboxedLuaEngine,
  code: string,
  context: LuaExecutionContext
): Promise<LuaExecutionResult> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (this.engine) {
        this.engine.destroy()
        this.engine = null
      }
      reject(new Error(`Execution timeout: exceeded ${this.executionTimeout}ms limit`))
    }, this.executionTimeout)

    if (!this.engine) {
      clearTimeout(timeout)
      reject(new Error('Engine not initialized'))
      return
    }

    this.engine.execute(code, context)
      .then(result => {
        clearTimeout(timeout)
        resolve(result)
      })
      .catch(error => {
        clearTimeout(timeout)
        reject(error)
      })
  })
}
