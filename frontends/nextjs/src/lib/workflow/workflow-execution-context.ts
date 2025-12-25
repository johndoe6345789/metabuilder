import type { LuaScript } from '../types/level-types'

/**
 * Context passed to workflow execution
 */
export interface WorkflowExecutionContext {
  data: any
  user?: any
  scripts?: LuaScript[]
}
