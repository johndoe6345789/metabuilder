import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createGitHubClient } from '@/lib/github/create-github-client'
import { resolveGitHubRepo } from '@/lib/github/resolve-github-repo'
import { listWorkflowRuns } from '@/lib/github/workflows/listing/list-workflow-runs'
import { getSessionUser, STATUS } from '@/lib/routing'
import { getRoleLevel } from '@/lib/constants'

export const GET = async (request: NextRequest) => {
  try {
    // Require authentication - GitHub data should not be public
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

    const { owner, repo } = resolveGitHubRepo(request.nextUrl.searchParams)
    const perPageParam = request.nextUrl.searchParams.get('perPage')
    let perPage = 20

    if (perPageParam !== null && perPageParam.length > 0) {
      const parsed = Number(perPageParam)
      if (!Number.isNaN(parsed)) {
        perPage = Math.max(1, Math.min(100, Math.floor(parsed)))
      }
    }

    const client = createGitHubClient()
    const runs = await listWorkflowRuns({ client, owner, repo, perPage })

    return NextResponse.json({
      owner,
      repo,
      runs,
      fetchedAt: new Date().toISOString(),
      hasToken: Boolean(process.env.GITHUB_TOKEN),
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
