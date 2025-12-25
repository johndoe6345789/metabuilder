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
