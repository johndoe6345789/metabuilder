/**
 * Lua Engine Types
 * Shared type definitions for Lua execution
 */

import type { JsonValue } from '@/types/utility-types'

/** Fengari Lua state - opaque type from fengari-web */
export type LuaState = ReturnType<typeof import('fengari-web').lauxlib.luaL_newstate>

export interface LuaExecutionContext {
  data?: JsonValue
  user?: JsonValue
  kv?: {
    get: (key: string) => Promise<JsonValue>
    set: (key: string, value: JsonValue) => Promise<void>
  }
  log?: (...args: unknown[]) => void
}

export interface LuaExecutionResult {
  success: boolean
  result?: JsonValue
  error?: string
  logs: string[]
}

/**
 * Interface representing the Lua engine state
 * Used to avoid circular dependencies in engine method files
 */
export interface LuaEngineState {
  /** The Fengari Lua state */
  L: LuaState
  /** Logs captured during execution */
  logs: string[]
}
