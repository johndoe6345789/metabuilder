/**
 * Fetch workflow run logs
 */

import type { Octokit } from 'octokit'

export interface WorkflowJob {
  id: number
  name: string
  status: string
  conclusion?: string
}

export interface WorkflowRunLogs {
  logs: string
  runId: number
  jobs?: WorkflowJob[]
  logsText?: string
  truncated?: boolean
}

export interface FetchWorkflowRunLogsOptions {
  client?: Octokit
  owner: string
  repo: string
  runId: number
  runName?: string
  includeLogs?: boolean
  jobLimit?: number
  tailLines?: number
  failedOnly?: boolean
}

export async function fetchWorkflowRunLogs(
  options: FetchWorkflowRunLogsOptions
): Promise<WorkflowRunLogs | null>
export async function fetchWorkflowRunLogs(
  owner: string,
  repo: string,
  runId: number,
  options?: { tailLines?: number; failedOnly?: boolean }
): Promise<WorkflowRunLogs | null>
export async function fetchWorkflowRunLogs(
  ownerOrOptions: string | FetchWorkflowRunLogsOptions,
  repo?: string,
  runId?: number,
  options?: { tailLines?: number; failedOnly?: boolean }
): Promise<WorkflowRunLogs | null> {
  // Parse arguments
  let opts: FetchWorkflowRunLogsOptions
  if (typeof ownerOrOptions === 'string') {
    if (!repo || !runId) {
      throw new Error('repo and runId are required when using positional arguments')
    }
    opts = {
      owner: ownerOrOptions,
      repo,
      runId,
      tailLines: options?.tailLines,
      failedOnly: options?.failedOnly,
    }
  } else {
    opts = ownerOrOptions
  }

  const { client, owner, repo: repoName, runId: workflowRunId, includeLogs = true, jobLimit, failedOnly = false } = opts

  if (!client) {
    // Return stub data when no client is provided
    return {
      logs: '',
      runId: workflowRunId,
      jobs: [],
      logsText: '',
      truncated: false,
    }
  }

  try {
    // Fetch workflow jobs
    const { data: jobsData } = await client.rest.actions.listJobsForWorkflowRun({
      owner,
      repo: repoName,
      run_id: workflowRunId,
      per_page: jobLimit ?? 100,
    })

    const jobs = jobsData.jobs
      .filter((job) => !failedOnly || job.conclusion === 'failure')
      .map((job) => ({
        id: job.id,
        name: job.name,
        status: job.status,
        conclusion: job.conclusion ?? undefined,
      }))

    let logsText = ''
    const truncated = false

    if (includeLogs) {
      // Download logs for the workflow run
      try {
        const { data: logsData } = await client.rest.actions.downloadWorkflowRunLogs({
          owner,
          repo: repoName,
          run_id: workflowRunId,
        })
        
        // The logs are returned as a zip file URL or buffer
        // For simplicity, we'll just note that logs are available
        logsText = typeof logsData === 'string' ? logsData : '[Binary log data available]'
      } catch (error) {
        console.warn('Failed to download logs:', error)
        logsText = '[Logs not available]'
      }
    }

    return {
      logs: logsText,
      runId: workflowRunId,
      jobs,
      logsText,
      truncated,
    }
  } catch (error) {
    console.error('Failed to fetch workflow run logs:', error)
    return null
  }
}
