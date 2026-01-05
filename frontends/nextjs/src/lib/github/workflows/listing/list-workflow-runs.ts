/**
 * List workflow runs (stub)
 */

export interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion?: string
  createdAt: string
}

export async function listWorkflowRuns(
  owner: string,
  repo: string,
  search?: string,
  workflowId?: string
): Promise<WorkflowRun[]> {
  // TODO: Implement workflow runs listing
  return []
}
