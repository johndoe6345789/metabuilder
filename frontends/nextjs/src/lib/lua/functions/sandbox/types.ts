/**
 * Sandboxed Lua Engine Types
 * Shared interface to avoid circular dependencies
 */

import type { LuaEngine } from '../../LuaEngine'
import type { LuaExecutionContext, LuaExecutionResult } from '../types'

/**
 * Interface representing the sandboxed Lua engine state
 * Used to avoid circular dependencies in sandbox method files
 */
export interface SandboxedLuaEngineState {
  /** The underlying Lua engine */
  engine: LuaEngine | null
  /** Execution timeout in milliseconds */
  executionTimeout: number
  /** Maximum memory allowed */
  maxMemory: number
  /** Disable dangerous Lua functions */
  disableDangerousFunctions: () => void
  /** Setup sandboxed environment */
  setupSandboxedEnvironment: () => void
  /** Execute code with timeout */
  executeWithTimeout: (code: string, context?: LuaExecutionContext) => Promise<LuaExecutionResult>
}
