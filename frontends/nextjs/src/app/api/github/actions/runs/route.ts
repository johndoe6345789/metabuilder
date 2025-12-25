import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createGitHubClient } from '@/lib/github/create-github-client'
import { resolveGitHubRepo } from '@/lib/github/resolve-github-repo'
import { listWorkflowRuns } from '@/lib/github/list-workflow-runs'

export async function GET(request: NextRequest) {
  try {
    const { owner, repo } = resolveGitHubRepo(request.nextUrl.searchParams)
    const perPageParam = request.nextUrl.searchParams.get('perPage')
    let perPage = 20

    if (perPageParam) {
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
