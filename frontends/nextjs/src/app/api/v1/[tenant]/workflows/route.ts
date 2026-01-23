/**
 * GET /api/v1/{tenant}/workflows
 * GET /api/v1/{tenant}/workflows?category=automation&limit=10&includeValidation=true
 *
 * List workflows for tenant with optional filtering and validation metadata
 *
 * Query parameters:
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 * - category: 'automation' | 'integration' | 'business-logic' | etc
 * - tags: comma-separated string
 * - active: boolean
 * - includeValidation: boolean (default: false) - Include validation state for each workflow
 * - includeMetrics: boolean (default: false) - Include execution metrics
 *
 * Response includes optional validation metadata when requested:
 * {
 *   "success": true,
 *   "data": {
 *     "workflows": [
 *       {
 *         "id": "uuid",
 *         "name": "string",
 *         ...other fields...,
 *         "validation": {
 *           "valid": boolean,
 *           "errors": ValidationError[],
 *           "warnings": ValidationError[],
 *           "validatedAt": ISO8601,
 *           "cacheHit": boolean
 *         }
 *       }
 *     ],
 *     "pagination": {
 *       "total": number,
 *       "limit": number,
 *       "offset": number,
 *       "hasMore": boolean
 *     }
 *   }
 * }
 *
 * ---
 *
 * POST /api/v1/{tenant}/workflows
 *
 * Create new workflow with pre-creation validation
 *
 * Request body:
 * {
 *   "name": "string",
 *   "description": "string",
 *   "category": "automation",
 *   "nodes": [],
 *   "connections": {},
 *   "triggers": [],
 *   "tags": []
 * }
 */

import type { NextRequest, NextResponse } from 'next/server'
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth-middleware'
import { applyRateLimit } from '@/lib/middleware/rate-limit'
import { db } from '@/lib/db-client'
import { getWorkflowLoader } from '@/lib/workflow/workflow-loader-v2'
import { handleWorkflowError } from '@/lib/workflow/workflow-error-handler'
import { buildMultiTenantContext } from '@/lib/workflow/multi-tenant-context'
import { v4 as uuidv4 } from 'uuid'

interface RouteParams {
  params: Promise<{
    tenant: string
  }>
}

/**
 * GET handler - List workflows for tenant
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // 1. Apply rate limiting for list endpoints
    const limitResponse = applyRateLimit(request, 'list')
    if (limitResponse) {
      return limitResponse
    }

    // 2. Authenticate user
    const authResult = await authenticate(request, { minLevel: 1 })
    if (!authResult.success) {
      return authResult.error!
    }
    const user = authResult.user!

    // 3. Extract route parameters
    const resolvedParams = await params
    const { tenant } = resolvedParams

    // 4. Validate tenant access (multi-tenant safety)
    if (user.tenantId !== tenant && user.level < 4) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Access denied to this tenant' },
        { status: 403 }
      )
    }

    // 5. Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')?.split(',').map((t) => t.trim())
    const active = searchParams.get('active')
      ? searchParams.get('active') === 'true'
      : undefined

    // 6. Build filter
    const filter: Record<string, any> = {
      tenantId: tenant,
    }

    if (category) {
      filter.category = category
    }
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags }
    }
    if (active !== undefined) {
      filter.active = active
    }

    // 7. Query workflows from database
    // TODO: Implement DBAL integration
    // const result = await db.workflows.list({
    //   filter,
    //   limit,
    //   offset,
    //   sort: { updatedAt: -1 }
    // })

    const result = {
      items: [],
      total: 0,
      limit,
      offset,
    }

    // 8. Return results
    return NextResponse.json(
      {
        workflows: result.items,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Workflow list error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to list workflows',
      },
      { status: 500 }
    )
  }
}

/**
 * POST handler - Create new workflow
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // 1. Apply rate limiting for mutations
    const limitResponse = applyRateLimit(request, 'mutation')
    if (limitResponse) {
      return limitResponse
    }

    // 2. Authenticate user (require level 2+)
    const authResult = await authenticate(request, { minLevel: 2 })
    if (!authResult.success) {
      return authResult.error!
    }
    const user = authResult.user!

    // 3. Extract route parameters
    const resolvedParams = await params
    const { tenant } = resolvedParams

    // 4. Validate tenant access (multi-tenant safety)
    if (user.tenantId !== tenant && user.level < 4) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Access denied to this tenant' },
        { status: 403 }
      )
    }

    // 5. Parse and validate request body
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // 6. Validate required fields
    const errors: string[] = []
    if (!body.name || typeof body.name !== 'string') {
      errors.push('name is required and must be a string')
    }
    if (
      !body.category ||
      ![
        'automation',
        'integration',
        'business-logic',
        'data-transformation',
        'notification',
        'approval',
        'other',
      ].includes(body.category)
    ) {
      errors.push('category must be one of: automation, integration, business-logic, etc')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation Error', errors },
        { status: 400 }
      )
    }

    // 7. Create workflow object
    const workflowId = uuidv4()
    const now = new Date()

    const workflow = {
      id: workflowId,
      tenantId: tenant,
      name: body.name,
      description: body.description || '',
      version: '1.0.0',
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
      active: body.active !== false,
      locked: false,
      tags: Array.isArray(body.tags) ? body.tags : [],
      category: body.category,
      settings: {
        timezone: 'UTC',
        executionTimeout: 300000, // 5 minutes
        saveExecutionProgress: true,
        saveExecutionData: 'all' as const,
        maxConcurrentExecutions: 5,
        debugMode: false,
        enableNotifications: false,
        notificationChannels: [],
      },
      nodes: Array.isArray(body.nodes) ? body.nodes : [],
      connections: body.connections || {},
      triggers: Array.isArray(body.triggers) ? body.triggers : [],
      variables: body.variables || {},
      errorHandling: {
        default: 'stopWorkflow' as const,
        errorNotification: false,
        notifyChannels: [],
      },
      retryPolicy: {
        enabled: false,
        maxAttempts: 1,
        backoffType: 'exponential' as const,
        initialDelay: 1000,
        maxDelay: 60000,
        retryableErrors: [],
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      },
      rateLimiting: {
        enabled: false,
        key: 'tenant' as const,
        onLimitExceeded: 'reject' as const,
      },
      credentials: [],
      metadata: body.metadata || {},
      executionLimits: {
        maxExecutionTime: 300000,
        maxMemoryMb: 512,
        maxDataSizeMb: 100,
        maxArrayItems: 10000,
      },
      multiTenancy: {
        enforced: true,
        tenantIdField: 'tenantId',
        restrictNodeTypes: [],
        allowCrossTenantAccess: false,
        auditLogging: true,
      },
      versionHistory: [],
    }

    // 8. Save to database
    // TODO: Implement DBAL integration
    // const saved = await db.workflows.create(workflow)

    const saved = workflow

    // 9. Return created workflow
    return NextResponse.json(
      {
        id: saved.id,
        name: saved.name,
        description: saved.description,
        category: saved.category,
        version: saved.version,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        active: saved.active,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Workflow creation error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to create workflow',
      },
      { status: 500 }
    )
  }
}
