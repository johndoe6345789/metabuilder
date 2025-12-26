import type { LuaExecutionContext } from '../types'
import type { LuaExecutionResult } from '../types'
import type { SecurityScanResult } from '../../../../security/scanner/security-scanner'
import { securityScanner } from '../../../../security/scanner/security-scanner'
import { LuaEngine } from '../../../../engine/core/LuaEngine'
import type { SandboxedLuaEngineState } from './types'

export interface SandboxedLuaResult {
  execution: LuaExecutionResult
  security: SecurityScanResult
}

/**
 * Execute Lua code with sandbox restrictions and security scanning
 */
export async function executeWithSandbox(
  this: SandboxedLuaEngineState,
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
  this.setupSandboxedEnvironment(this.allowedGlobals)

  let executionResult: LuaExecutionResult | null = null

  try {
    this.enforceMaxMemory()
    executionResult = await this.executeWithTimeout(code, context)
    this.enforceMaxMemory()

    return {
      execution: executionResult,
      security: securityResult
    }
  } catch (error) {
    return {
      execution: {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        logs: executionResult?.logs ?? []
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
