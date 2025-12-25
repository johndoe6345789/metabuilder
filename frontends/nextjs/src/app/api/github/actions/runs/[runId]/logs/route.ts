import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createGitHubClient } from '@/lib/github/create-github-client'
import { fetchWorkflowRunLogs } from '@/lib/github/fetch-workflow-run-logs'
import { resolveGitHubRepo } from '@/lib/github/resolve-github-repo'

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const runId = Number(params.runId)
    if (!Number.isFinite(runId)) {
      return NextResponse.json({ error: 'Invalid run id' }, { status: 400 })
    }

    const { owner, repo } = resolveGitHubRepo(request.nextUrl.searchParams)
    const runName = request.nextUrl.searchParams.get('runName')?.trim() || `Run ${runId}`
    const includeLogsParam = request.nextUrl.searchParams.get('includeLogs')
    const includeLogs = includeLogsParam
      ? !['false', '0', 'no'].includes(includeLogsParam.toLowerCase())
      : true
    const jobLimitParam = request.nextUrl.searchParams.get('jobLimit')
    let jobLimit = 20

    if (jobLimitParam) {
      const parsed = Number(jobLimitParam)
      if (!Number.isNaN(parsed)) {
        jobLimit = Math.max(1, Math.min(100, Math.floor(parsed)))
      }
    }

    const client = createGitHubClient()
    const { jobs, logsText, truncated } = await fetchWorkflowRunLogs({
      client,
      owner,
      repo,
      runId,
      runName,
      jobLimit,
      includeLogs,
    })

    return NextResponse.json({
      owner,
      repo,
      runId,
      runName,
      jobs,
      logsText,
      truncated,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error
      ? Number((error as { status?: number }).status)
      : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const requiresAuth = status === 401 || status === 403
    const safeStatus = Number.isFinite(status) && status >= 400 ? status : 500

    return NextResponse.json(
      { error: message, requiresAuth },
      { status: safeStatus }
    )
  }
}
