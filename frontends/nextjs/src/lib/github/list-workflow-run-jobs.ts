import type { Octokit } from 'octokit'

export async function listWorkflowRunJobs(options: {
  client: Octokit
  owner: string
  repo: string
  runId: number
}) {
  const { data } = await options.client.rest.actions.listJobsForWorkflowRun({
    owner: options.owner,
    repo: options.repo,
    run_id: options.runId,
    per_page: 100,
  })

  return data.jobs
}
