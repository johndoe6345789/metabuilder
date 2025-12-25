import type { Workflow } from '../types/level-types'
import type { WorkflowExecutionContext } from './workflow-execution-context'
import type { WorkflowExecutionResult } from './workflow-execution-result'
import type { WorkflowState } from './workflow-state'
import { executeWorkflow } from './execute-workflow'
import { executeNode } from './execute-node'
import { executeActionNode } from './execute-action-node'
import { executeConditionNode } from './execute-condition-node'
import { executeLuaNode } from './execute-lua-node'
import { executeTransformNode } from './execute-transform-node'
import { executeLuaCode } from './execute-lua-code'
import { createWorkflowState } from './workflow-state'
import { logToWorkflow } from './log-to-workflow'

/**
 * Workflow execution functions grouped as static methods
 * Class is a namespace container - no instance state
 */
export class WorkflowEngine {
  static execute = executeWorkflow
  static executeNode = executeNode
  static executeActionNode = executeActionNode
  static executeConditionNode = executeConditionNode
  static executeLuaNode = executeLuaNode
  static executeTransformNode = executeTransformNode
  static executeLuaCode = executeLuaCode
  static createState = createWorkflowState
  static log = logToWorkflow

  // Convenience instance method for legacy compatibility
  async executeWorkflow(
    workflow: Workflow,
    context: WorkflowExecutionContext
  ): Promise<WorkflowExecutionResult> {
    return executeWorkflow(workflow, context)
  }
}

/**
 * @deprecated Use WorkflowEngine.execute() directly
 */
export function createWorkflowEngine(): WorkflowEngine {
  return new WorkflowEngine()
}
