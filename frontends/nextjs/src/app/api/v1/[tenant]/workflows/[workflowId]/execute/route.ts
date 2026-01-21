/**
 * POST /api/v1/{tenant}/workflows/{workflowId}/execute
 *
 * Execute a workflow with provided context
 *
 * Request body:
 * {
 *   "triggerData": { ... },        // Trigger input data
 *   "variables": { ... },          // Optional: workflow variables
 *   "request": { ... }             // Optional: HTTP request context
 * }
 *
 * Returns:
 * {
 *   "executionId": "uuid",
 *   "workflowId": "uuid",
 *   "status": "running|success|error",
 *   "state": { ... },
 *   "metrics": { ... }
 * }
 */

import type { NextRequest, NextResponse } from 'next/server'
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth-middleware'
import { applyRateLimit } from '@/lib/middleware/rate-limit'
import { getWorkflowExecutionEngine, getWorkflowExecutionEngine as getEngine } from '@/lib/workflow/workflow-service'
import type {
  WorkflowContext,
  WorkflowTrigger,
} from '@metabuilder/workflow'
import { v4 as uuidv4 } from 'uuid'

interface ExecuteWorkflowRequest {
  triggerData?: Record<string, any>
  variables?: Record<string, any>
  request?: {
    method?: string
    headers?: Record<string, string>
    query?: Record<string, any>
    body?: Record<string, any>
  }
}

interface RouteParams {
  params: Promise<{
    tenant: string
    workflowId: string
  }>
}

/**
 * POST handler - Execute workflow
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

    // 2. Authenticate user
    const authResult = await authenticate(request, { minLevel: 1 })
    if (!authResult.success) {
      return authResult.error!
    }
    const user = authResult.user!

    // 3. Extract and validate route parameters
    const resolvedParams = await params
    const { tenant, workflowId } = resolvedParams

    // 4. Validate tenant access (multi-tenant safety)
    if (user.tenantId !== tenant && user.level < 4) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Access denied to this tenant' },
        { status: 403 }
      )
    }

    // 5. Parse and validate request body
    let requestBody: ExecuteWorkflowRequest
    try {
      requestBody = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // 6. Validate required fields
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'workflowId is required' },
        { status: 400 }
      )
    }

    // 7. Load workflow from database
    const engine = getWorkflowExecutionEngine()
    const workflow = await engine.loadWorkflow(workflowId, tenant)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Workflow not found' },
        { status: 404 }
      )
    }

    // 8. Build execution context
    const executionId = uuidv4()
    const trigger: WorkflowTrigger = {
      nodeId: '',
      kind: 'manual',
      enabled: true,
      metadata: {
        startTime: Date.now(),
        triggeredBy: 'api',
      },
    }

    const context: WorkflowContext = {
      executionId,
      tenantId: tenant,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email || '',
        level: user.level,
      },
      trigger,
      triggerData: requestBody.triggerData || {},
      variables: requestBody.variables || {},
      secrets: {}, // Load from secrets manager
      request: requestBody.request,
    }

    // 9. Execute workflow
    console.log(`[${executionId}] Starting workflow execution`, {
      workflowId,
      tenant,
      userId: user.id,
    })

    const executionRecord = await engine.executeWorkflow(workflow, context)

    // 10. Return execution result
    return NextResponse.json(
      {
        executionId: executionRecord.id,
        workflowId: executionRecord.workflowId,
        status: executionRecord.status,
        state: executionRecord.state,
        metrics: executionRecord.metrics,
        startTime: executionRecord.startTime,
        endTime: executionRecord.endTime,
        duration: executionRecord.duration,
        error: executionRecord.error,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Workflow execution error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Workflow execution failed',
      },
      { status: 500 }
    )
  }
}
