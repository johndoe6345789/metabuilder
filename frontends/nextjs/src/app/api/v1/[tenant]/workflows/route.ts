/**
 * GET /api/v1/{tenant}/workflows
 *   ?category=automation&limit=10&tags=a,b&active=true
 *
 * List workflows for a tenant, filtered and paginated.
 *
 * POST /api/v1/{tenant}/workflows
 *
 * Create a new workflow. Requires level 2+; tenantId, id and createdBy are
 * always the route's own resolved values, never the caller's body -- see
 * buildWorkflowRecord.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { authenticate } from '@/lib/middleware/auth-middleware'
import { applyRateLimit } from '@/lib/middleware/rate-limit'
import { parseWorkflowListQuery } from './list-query'
import { buildWorkflowRecord, validateWorkflowInput } from './workflow-input'
import { createWorkflow, listWorkflows } from './workflows-store'

interface RouteParams {
  params: Promise<{ tenant: string }>
}

const unauthorized = (): NextResponse =>
  NextResponse.json(
    { error: 'Unauthorized', message: 'Authentication failed' },
    { status: 401 }
  )

const forbidden = (): NextResponse =>
  NextResponse.json(
    { error: 'Forbidden', message: 'Access denied to this tenant' },
    { status: 403 }
  )

/** True once rate limiting, auth and tenant access all pass. */
async function authorizeRequest(
  request: NextRequest,
  tenant: string,
  minLevel: number,
  limitKind: 'list' | 'mutation'
): Promise<
  { ok: true; userId: string } | { ok: false; response: Response }
> {
  const limitResponse = applyRateLimit(request, limitKind)
  if (limitResponse != null) return { ok: false, response: limitResponse }

  const authResult = await authenticate(request, { minLevel })
  if (!authResult.success || authResult.error != null) {
    return { ok: false, response: authResult.error ?? unauthorized() }
  }
  const user = authResult.user
  if (user == null) return { ok: false, response: unauthorized() }

  if (user.tenantId !== tenant && user.level < 4) {
    return { ok: false, response: forbidden() }
  }
  return { ok: true, userId: user.id }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { tenant } = await params
    const auth = await authorizeRequest(request, tenant, 1, 'list')
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const query = parseWorkflowListQuery(searchParams, tenant)
    const page = await listWorkflows(query)

    return NextResponse.json(
      {
        workflows: page.items,
        pagination: {
          total: page.total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < page.total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Workflow list error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to list workflows' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { tenant } = await params
    const auth = await authorizeRequest(request, tenant, 2, 'mutation')
    if (!auth.ok) return auth.response

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const errors = validateWorkflowInput(body)
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation Error', errors },
        { status: 400 }
      )
    }

    const record = buildWorkflowRecord(body, {
      tenant,
      createdBy: auth.userId,
      id: uuidv4(),
      now: new Date(),
    })
    const saved = await createWorkflow(record)

    return NextResponse.json(
      {
        id: saved.id ?? record.id,
        name: saved.name ?? record.name,
        description: saved.description ?? record.description,
        category: saved.category ?? record.category,
        version: saved.version ?? record.version,
        createdAt: saved.createdAt ?? record.createdAt,
        updatedAt: saved.updatedAt ?? record.updatedAt,
        active: saved.active ?? record.active,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Workflow creation error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to create workflow' },
      { status: 500 }
    )
  }
}
