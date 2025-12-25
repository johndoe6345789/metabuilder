import { WorkflowEngine } from './workflow-engine-class'

/**
 * @deprecated Use WorkflowEngine.execute() directly
 */
export const createWorkflowEngine = (): WorkflowEngine => new WorkflowEngine()
