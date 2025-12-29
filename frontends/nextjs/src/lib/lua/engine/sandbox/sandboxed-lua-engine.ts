import { destroy } from '../../functions/sandbox/execution/destroy'
import {
  executeWithSandbox,
  type SandboxedLuaResult,
} from '../../functions/sandbox/execution/execute-with-sandbox'
import { executeWithTimeout } from '../../functions/sandbox/execution/execute-with-timeout'
import { setExecutionTimeout } from '../../functions/sandbox/execution/set-execution-timeout'
import { disableDangerousFunctions } from '../../functions/sandbox/execution/setup/disable-dangerous-functions'
import { setupSandboxedEnvironment } from '../../functions/sandbox/execution/setup/setup-sandboxed-environment'
import { setAllowedGlobals } from '../../functions/sandbox/globals/set-allowed-globals'
import { enforceMaxMemory } from '../../functions/sandbox/memory/enforce-max-memory'
import { getLuaMemoryUsageBytes } from '../../functions/sandbox/memory/get-lua-memory-usage-bytes'
import { LuaEngine } from '../core/LuaEngine'

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
