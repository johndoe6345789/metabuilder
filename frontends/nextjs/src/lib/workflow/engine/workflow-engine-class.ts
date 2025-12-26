import { executeWorkflow } from '../execution/execute-workflow'
import { executeNode } from '../execution/execute-node'
import { executeActionNode } from '../nodes/execute-action-node'
import { executeConditionNode } from '../nodes/execute-condition-node'
import { executeLuaNode } from '../nodes/execute-lua-node'
import { executeTransformNode } from '../nodes/execute-transform-node'
import { executeLuaCode } from '../nodes/execute-lua-code'
import { executeWorkflowInstance } from '../execution/execute-workflow-instance'
import { createWorkflowState } from '../workflow-state'
import { logToWorkflow } from '../log-to-workflow'

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
