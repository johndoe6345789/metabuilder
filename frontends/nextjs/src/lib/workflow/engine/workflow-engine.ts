/**
 * Workflow Engine Module
 * @deprecated Import from '@/lib/workflow' instead
 */

export {
  executeWorkflow,
  executeNode,
  createWorkflowState,
  logToWorkflow,
  WorkflowEngine,
  createWorkflowEngine,
} from './index'

export type {
  WorkflowExecutionContext,
  WorkflowExecutionResult,
  WorkflowState,
} from './index'
