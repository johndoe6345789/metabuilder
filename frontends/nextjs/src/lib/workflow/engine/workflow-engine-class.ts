import { executeNode } from '../execution/execute-node'
import { executeWorkflow } from '../execution/execute-workflow'
import { executeWorkflowInstance } from '../execution/execute-workflow-instance'
import { logToWorkflow } from '../log-to-workflow'
import { executeActionNode } from '../nodes/execute-action-node'
import { executeConditionNode } from '../nodes/execute-condition-node'
import { executeLuaCode } from '../nodes/execute-lua-code'
import { executeLuaNode } from '../nodes/execute-lua-node'
import { executeTransformNode } from '../nodes/execute-transform-node'
import { createWorkflowState } from '../workflow-state'

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
  executeWorkflow = executeWorkflowInstance
}
