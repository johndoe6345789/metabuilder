/**
 * Lua Engine Types
 * Shared type definitions for Lua execution
 */

export interface LuaExecutionContext {
  data?: any
  user?: any
  kv?: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
  }
  log?: (...args: any[]) => void
}

export interface LuaExecutionResult {
  success: boolean
  result?: any
  error?: string
  logs: string[]
}

/**
 * Interface representing the Lua engine state
 * Used to avoid circular dependencies in engine method files
 */
export interface LuaEngineState {
  /** The Fengari Lua state */
  L: any
  /** Logs captured during execution */
  logs: string[]
}
