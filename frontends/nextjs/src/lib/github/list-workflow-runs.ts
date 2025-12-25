import type { Octokit } from 'octokit'

export async function listWorkflowRuns(options: {
  client: Octokit
  owner: string
  repo: string
  perPage: number
}) {
  const { data } = await options.client.rest.actions.listWorkflowRunsForRepo({
    owner: options.owner,
    repo: options.repo,
    per_page: options.perPage,
  })

  return data.workflow_runs
}
