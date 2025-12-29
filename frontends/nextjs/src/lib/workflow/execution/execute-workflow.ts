import { logToWorkflow } from '../log-to-workflow'
import type { Workflow } from '../types/level-types'
import type { WorkflowExecutionContext } from '../workflow-execution-context'
import type { WorkflowExecutionResult } from '../workflow-execution-result'
import { createWorkflowState } from '../workflow-state'
import { executeNode } from './execute-node'

/**
 * Execute a complete workflow
 */
export async function executeWorkflow(
  workflow: Workflow,
  context: WorkflowExecutionContext
): Promise<WorkflowExecutionResult> {
  const state = createWorkflowState()
  const outputs: Record<string, any> = {}
  let currentData = context.data

  try {
    logToWorkflow(state, `Starting workflow: ${workflow.name}`)

    for (let i = 0; i < workflow.nodes.length; i++) {
      const node = workflow.nodes[i]
      logToWorkflow(state, `Executing node ${i + 1}: ${node.label} (${node.type})`)

      const nodeResult = await executeNode(node, currentData, context, state)

      if (!nodeResult.success) {
        return {
          success: false,
          outputs,
          logs: state.logs,
          error: `Node "${node.label}" failed: ${nodeResult.error}`,
          securityWarnings: state.securityWarnings,
        }
      }

      outputs[node.id] = nodeResult.output
      currentData = nodeResult.output

      if (node.type === 'condition' && nodeResult.output === false) {
        logToWorkflow(state, `Condition node returned false, stopping workflow`)
        break
      }
    }

    logToWorkflow(state, `Workflow completed successfully`)

    return {
      success: true,
      outputs,
      logs: state.logs,
      securityWarnings: state.securityWarnings,
    }
  } catch (error) {
    return {
      success: false,
      outputs,
      logs: state.logs,
      error: error instanceof Error ? error.message : String(error),
      securityWarnings: state.securityWarnings,
    }
  }
}
