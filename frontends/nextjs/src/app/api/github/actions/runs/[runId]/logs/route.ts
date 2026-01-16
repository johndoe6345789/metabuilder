import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createGitHubClient } from '@/lib/github/create-github-client'
import { fetchWorkflowRunLogs } from '@/lib/github/fetch-workflow-run-logs'
import { parseWorkflowRunLogsOptions } from '@/lib/github/parse-workflow-run-logs-options'
import { resolveGitHubRepo } from '@/lib/github/resolve-github-repo'
import { getSessionUser, STATUS } from '@/lib/routing'
import { getRoleLevel } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) => {
  const resolvedParams = await params
  // Require authentication - logs may contain sensitive info
  const session = await getSessionUser(request)
  
  if (session.user === null) {
    return NextResponse.json(
      { error: 'Authentication required', requiresAuth: true },
      { status: STATUS.UNAUTHORIZED }
    )
  }
  
  // Require at least user level (1)
  const userRole = (session.user as { role?: string }).role ?? 'public'
  if (getRoleLevel(userRole) < 1) {
    return NextResponse.json(
      { error: 'User access required', requiresAuth: false },
      { status: STATUS.FORBIDDEN }
    )
  }

  const runId = Number(resolvedParams.runId)
  if (!Number.isFinite(runId) || runId <= 0) {
    return NextResponse.json({ error: 'Invalid run id' }, { status: 400 })
  }

  try {
    const { owner, repo } = resolveGitHubRepo(request.nextUrl.searchParams)
    const { runName, includeLogs, jobLimit } = parseWorkflowRunLogsOptions(
      request.nextUrl.searchParams
    )
    const client = createGitHubClient()

    const result = await fetchWorkflowRunLogs({
      client,
      owner,
      repo,
      runId: Math.floor(runId),
      runName,
      includeLogs,
      jobLimit,
    })

    if (result === null) {
      return NextResponse.json({ error: 'Failed to fetch workflow logs' }, { status: 500 })
    }

    return NextResponse.json({
      jobs: result.jobs,
      logsText: result.logsText,
      truncated: result.truncated,
    })
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status?: number }).status)
        : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const requiresAuth = status === 401 || status === 403
    const safeStatus = Number.isFinite(status) && status >= 400 ? status : 500

    return NextResponse.json({ error: message, requiresAuth }, { status: safeStatus })
  }
}
