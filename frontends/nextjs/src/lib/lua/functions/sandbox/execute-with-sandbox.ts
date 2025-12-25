import type { LuaExecutionContext } from '../types'
import { securityScanner } from '../../../security-scanner'
import { LuaEngine } from '../../LuaEngine'
import type { SandboxedLuaEngine, SandboxedLuaResult } from '../../sandboxed-lua-engine'

/**
 * Execute Lua code with sandbox restrictions and security scanning
 */
export async function executeWithSandbox(
  this: SandboxedLuaEngine,
  code: string,
  context: LuaExecutionContext = {}
): Promise<SandboxedLuaResult> {
  const securityResult = securityScanner.scanLua(code)

  if (securityResult.severity === 'critical') {
    return {
      execution: {
        success: false,
        error: 'Code blocked due to critical security issues. Please review the security warnings.',
        logs: []
      },
      security: securityResult
    }
  }

  this.engine = new LuaEngine()

  this.disableDangerousFunctions()
  this.setupSandboxedEnvironment()

  const executionPromise = this.executeWithTimeout(code, context)

  try {
    const result = await executionPromise

    return {
      execution: result,
      security: securityResult
    }
  } catch (error) {
    return {
      execution: {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        logs: []
      },
      security: securityResult
    }
  } finally {
    if (this.engine) {
      this.engine.destroy()
      this.engine = null
    }
  }
}
