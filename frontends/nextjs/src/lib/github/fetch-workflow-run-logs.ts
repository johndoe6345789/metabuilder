import type { Octokit } from 'octokit'
import { formatWorkflowRunLogs } from './format-workflow-run-logs'
import { getJobLogsText } from './get-job-logs-text'
import { listWorkflowRunJobs } from './list-workflow-run-jobs'

export async function fetchWorkflowRunLogs(options: {
  client: Octokit
  owner: string
  repo: string
  runId: number
  runName: string
  jobLimit?: number
  includeLogs?: boolean
}) {
  const jobs = await listWorkflowRunJobs({
    client: options.client,
    owner: options.owner,
    repo: options.repo,
    runId: options.runId,
  })
  const normalizedLimit = Number.isFinite(options.jobLimit)
    ? Math.max(1, Math.min(100, Math.floor(options.jobLimit as number)))
    : jobs.length
  const limitedJobs = jobs.slice(0, normalizedLimit)
  const truncated = jobs.length > limitedJobs.length
  const includeLogs = options.includeLogs ?? true
  const jobLogs: Array<{
    job: (typeof limitedJobs)[number]
    logsText?: string | null
    error?: string | null
  }> = []

  if (includeLogs) {
    for (const job of limitedJobs) {
      try {
        const logsText = await getJobLogsText({
          client: options.client,
          owner: options.owner,
          repo: options.repo,
          jobId: job.id,
        })
        jobLogs.push({ job, logsText })
      } catch (error) {
        jobLogs.push({
          job,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  const logsText = includeLogs
    ? formatWorkflowRunLogs({
        runId: options.runId,
        runName: options.runName,
        jobLogs,
      })
    : null

  return {
    jobs: limitedJobs,
    logsText,
    truncated,
  }
}
