import { LuaEngine } from '../core/LuaEngine'
import { executeWithSandbox, type SandboxedLuaResult } from '../../functions/sandbox/execute-with-sandbox'
import { disableDangerousFunctions } from '../../functions/sandbox/disable-dangerous-functions'
import { setupSandboxedEnvironment } from '../../functions/sandbox/setup-sandboxed-environment'
import { executeWithTimeout } from '../../functions/sandbox/execute-with-timeout'
import { getLuaMemoryUsageBytes } from '../../functions/sandbox/get-lua-memory-usage-bytes'
import { enforceMaxMemory } from '../../functions/sandbox/enforce-max-memory'
import { setAllowedGlobals } from '../../functions/sandbox/set-allowed-globals'
import { setExecutionTimeout } from '../../functions/sandbox/set-execution-timeout'
import { destroy } from '../../functions/sandbox/destroy'

// Re-export the result type
export type { SandboxedLuaResult }

export class SandboxedLuaEngine {
  engine: LuaEngine | null = null
  executionTimeout = 5000
  maxMemory = 10 * 1024 * 1024
  allowedGlobals: string[] | undefined

  constructor(timeout: number = 5000) {
    this.executionTimeout = timeout
  }

  setAllowedGlobals = setAllowedGlobals
  executeWithSandbox = executeWithSandbox
  disableDangerousFunctions = disableDangerousFunctions
  setupSandboxedEnvironment = setupSandboxedEnvironment
  executeWithTimeout = executeWithTimeout
  getLuaMemoryUsageBytes = getLuaMemoryUsageBytes
  enforceMaxMemory = enforceMaxMemory
  setExecutionTimeout = setExecutionTimeout
  destroy = destroy
}

// Note: createSandboxedLuaEngine is in a separate file to avoid circular deps
// Import it directly from './create-sandboxed-lua-engine' if needed
