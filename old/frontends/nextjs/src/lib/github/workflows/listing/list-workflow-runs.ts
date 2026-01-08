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

export async function listWorkflowRuns(options: ListWorkflowRunsOptions): Promise<WorkflowRun[]> {
  const { client, owner, repo, perPage } = options

  if (client === null || typeof client !== 'object') {
    throw new Error('GitHub client is required')
  }

  const octokit = client as {
    rest: {
      actions: {
        listWorkflowRunsForRepo: (params: {
          owner: string
          repo: string
          per_page?: number
        }) => Promise<{
          data: {
            workflow_runs: Array<{
              id: number
              name?: string | null
              display_title?: string | null
              status: string
              conclusion?: string | null
              created_at: string
            }>
          }
        }>
      }
    }
  }

  const response = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    per_page: perPage,
  })

  return response.data.workflow_runs.map(run => ({
    id: run.id,
    name: run.name ?? run.display_title ?? 'Workflow Run',
    status: run.status,
    conclusion: run.conclusion ?? undefined,
    createdAt: run.created_at,
  }))
}
