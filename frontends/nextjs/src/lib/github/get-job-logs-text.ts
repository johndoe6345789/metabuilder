import type { Octokit } from 'octokit'
import { downloadJobLogsArchive } from './download-job-logs-archive'
import { extractJobLogs } from './extract-job-logs'

export async function getJobLogsText(options: {
  client: Octokit
  owner: string
  repo: string
  jobId: number
}) {
  const archive = await downloadJobLogsArchive({
    client: options.client,
    owner: options.owner,
    repo: options.repo,
    jobId: options.jobId,
  })

  return extractJobLogs(archive)
}
