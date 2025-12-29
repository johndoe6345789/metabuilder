import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createGitHubClient } from '@/lib/github/create-github-client'
import { fetchWorkflowRunLogs } from '@/lib/github/fetch-workflow-run-logs'
import { parseWorkflowRunLogsOptions } from '@/lib/github/parse-workflow-run-logs-options'
import { resolveGitHubRepo } from '@/lib/github/resolve-github-repo'

interface RouteParams {
  params: {
    runId: string
  }
}

export const GET = async (request: NextRequest, { params }: RouteParams) => {
  const runId = Number(params.runId)
  if (!Number.isFinite(runId) || runId <= 0) {
    return NextResponse.json({ error: 'Invalid run id' }, { status: 400 })
  }

  try {
    const { owner, repo } = resolveGitHubRepo(request.nextUrl.searchParams)
    const { runName, includeLogs, jobLimit } = parseWorkflowRunLogsOptions(
      request.nextUrl.searchParams
    )
    const client = createGitHubClient()

    const { jobs, logsText, truncated } = await fetchWorkflowRunLogs({
      client,
      owner,
      repo,
      runId: Math.floor(runId),
      runName,
      includeLogs,
      jobLimit,
    })

    return NextResponse.json({
      jobs,
      logsText,
      truncated,
    })
  } catch (error) {
    const status =
      typeof error === 'object' && error && 'status' in error
        ? Number((error as { status?: number }).status)
        : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const requiresAuth = status === 401 || status === 403
    const safeStatus = Number.isFinite(status) && status >= 400 ? status : 500

    return NextResponse.json({ error: message, requiresAuth }, { status: safeStatus })
  }
}
