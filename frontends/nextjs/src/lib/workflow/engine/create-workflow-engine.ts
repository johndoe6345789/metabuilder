import { WorkflowEngine } from './workflow-engine-class'

/**
 * @deprecated Use WorkflowEngine.execute() directly
 */
export function createWorkflowEngine(): WorkflowEngine {
  return new WorkflowEngine()
}
