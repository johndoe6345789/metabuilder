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
  _owner: string,
  _repo: string,
  _search?: string,
  _workflowId?: string
): Promise<WorkflowRun[]> {
  // TODO: Implement workflow runs listing
  return []
}
