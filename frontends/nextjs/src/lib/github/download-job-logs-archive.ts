import type { Octokit } from 'octokit'

export async function downloadJobLogsArchive(options: {
  client: Octokit
  owner: string
  repo: string
  jobId: number
}) {
  const response = await options.client.request(
    'GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs',
    {
      owner: options.owner,
      repo: options.repo,
      job_id: options.jobId,
      request: { redirect: 'manual' },
    }
  )

  const location = response.headers.location
  if (!location) {
    const error = new Error('GitHub did not return a log archive location')
    ;(error as Error & { status?: number }).status = 502
    throw error
  }

  const archiveResponse = await fetch(location)
  if (!archiveResponse.ok) {
    const error = new Error(`Failed to download log archive (${archiveResponse.status})`)
    ;(error as Error & { status?: number }).status = archiveResponse.status
    throw error
  }

  return archiveResponse.arrayBuffer()
}
