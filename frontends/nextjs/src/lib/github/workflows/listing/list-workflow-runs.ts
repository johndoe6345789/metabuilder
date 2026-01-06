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

export interface ListWorkflowRunsOptions {
  client: unknown
  owner: string
  repo: string
  perPage?: number
}

export function listWorkflowRuns(_options: ListWorkflowRunsOptions): Promise<WorkflowRun[]> {
  // TODO: Implement workflow runs listing
  return Promise.resolve([])
}
