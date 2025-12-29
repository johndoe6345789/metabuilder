import type { LuaScript } from '../types/level-types'

/**
 * Context passed to workflow execution
 */
export interface WorkflowExecutionContext {
  data: unknown
  user?: Record<string, unknown> | null
  scripts?: LuaScript[]
}
