import { LuaEngine } from './lua-engine'
import type { LuaExecutionResult } from './lua-engine'
import type { SecurityScanResult } from '../security-scanner'
import { executeWithSandbox } from './functions/sandbox/execute-with-sandbox'
import { disableDangerousFunctions } from './functions/sandbox/disable-dangerous-functions'
import { setupSandboxedEnvironment } from './functions/sandbox/setup-sandboxed-environment'
import { executeWithTimeout } from './functions/sandbox/execute-with-timeout'
import { setExecutionTimeout } from './functions/sandbox/set-execution-timeout'
import { destroy } from './functions/sandbox/destroy'

export interface SandboxedLuaResult {
  execution: LuaExecutionResult
  security: SecurityScanResult
}

export class SandboxedLuaEngine {
  engine: LuaEngine | null = null
  executionTimeout = 5000
  // TODO: Enforce maxMemory limit in sandbox execution.
  maxMemory = 10 * 1024 * 1024

  constructor(timeout: number = 5000) {
    this.executionTimeout = timeout
  }

  executeWithSandbox = executeWithSandbox
  disableDangerousFunctions = disableDangerousFunctions
  setupSandboxedEnvironment = setupSandboxedEnvironment
  executeWithTimeout = executeWithTimeout
  setExecutionTimeout = setExecutionTimeout
  destroy = destroy
}

export { createSandboxedLuaEngine } from './create-sandboxed-lua-engine'
