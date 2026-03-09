/**
 * Multi-Tenant Context Builder - Real-World Examples
 *
 * Production-ready code examples showing how to use the context builder
 * in actual Next.js API routes, webhook handlers, and scheduled tasks.
 *
 * All examples follow MetaBuilder patterns:
 * - Multi-tenant by default
 * - DBAL for database access
 * - Type-safe with full TypeScript
 * - Comprehensive error handling
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import {
  MultiTenantContextBuilder,
  sanitizeContextForLogging,
  type RequestContext,
  type ExtendedWorkflowContext,
} from './multi-tenant-context'
import WorkflowService from './workflow-service'
import { db, type EntityOps } from '@/lib/db-client'
import type { WorkflowDefinition } from '@metabuilder/workflow'

/**
 * User info extracted from JWT or session
 */
interface AuthenticatedUser {
  id: string
  email: string
  tenantId: string
  level: number
  sessionId?: string
}

/**
 * Returns the workflow execution engine (WorkflowService)
 */
function getWorkflowExecutionEngine() {
  return WorkflowService
}

/**
 * Helper to find one entity by filter criteria using DBAL list + filter
 */
async function findOneEntity(
  ops: EntityOps,
  filter: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const result = await ops.list({ filter, limit: 1 })
  return result.data[0] ?? null
}

/**
 * Extract client IP from NextRequest headers
 */
function getClientIp(req: NextRequest): string | undefined {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? undefined
}

/**
 * ============================================================================
 * EXAMPLE 1: Manual Workflow Execution (API Route)
 * ============================================================================
 *
 * User triggers a workflow manually from the UI with custom variables
 */

export async function manualWorkflowExecution(req: NextRequest) {
  const executionId = uuidv4()
  console.log(`[${executionId}] Manual workflow execution started`)

  try {
    // 1. Extract user from JWT or session
    const user = await verifyUserAuth(req)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const { workflowId, variables, secrets } = await req.json()

    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflowId is required' },
        { status: 400 }
      )
    }

    // 3. Load workflow (DBAL ensures tenant filtering)
    const workflow = await findOneEntity(db.workflows, {
      id: workflowId,
      tenantId: user.tenantId,
    }) as (Record<string, unknown> & WorkflowDefinition) | null

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    console.log(`[${executionId}] Workflow loaded: ${workflow.name}`)

    // 4. Build execution context
    const requestContext: RequestContext = {
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      userLevel: user.level,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent') || '',
      sessionId: user.sessionId,
    }

    const builder = new MultiTenantContextBuilder(workflow, requestContext, {
      enableAuditLogging: true,
      captureRequestData: true,
    })

    const context = await builder.build({
      triggerData: {
        source: 'manual-ui',
        timestamp: Date.now(),
      },
      variables,
      secrets,
    })

    console.log(`[${executionId}] Context built for user ${user.id}`)

    // 5. Execute workflow
    const engine = getWorkflowExecutionEngine()
    const record = await engine.executeWorkflow(
      workflow.id, user.tenantId, context as unknown as Record<string, unknown>
    )

    console.log(`[${executionId}] Execution completed: ${record.status}`)

    // 6. Return result
    return NextResponse.json({
      success: true,
      executionId: record.id,
      status: record.status,
      duration: record.duration,
    })
  } catch (error) {
    console.error(`[${executionId}] Execution failed:`, error)

    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Access denied to workflow' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

/**
 * ============================================================================
 * EXAMPLE 2: Webhook Trigger
 * ============================================================================
 *
 * External system sends data to webhook URL to trigger workflow
 * Webhook identity verified via HMAC signature
 */

export async function handleWebhookTrigger(req: NextRequest) {
  const executionId = uuidv4()

  try {
    // 1. Verify webhook signature
    const signature = req.headers.get('x-webhook-signature')
    const webhookId = req.headers.get('x-webhook-id')
    const tenantId = req.headers.get('x-tenant-id')

    if (!signature || !webhookId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing webhook headers' },
        { status: 400 }
      )
    }

    const isValid = await verifyWebhookSignature(webhookId, signature, await req.text())
    if (!isValid) {
      console.warn(`[${executionId}] Invalid webhook signature for ${webhookId}`)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    console.log(`[${executionId}] Valid webhook signature: ${webhookId}`)

    // 2. Load workflow from webhook metadata
    const webhookOps = db.entity('Webhook')
    const webhook = await findOneEntity(webhookOps, {
      id: webhookId,
      tenantId,
    })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    const workflow = await findOneEntity(db.workflows, {
      id: webhook.workflowId as string,
      tenantId,
    }) as (Record<string, unknown> & WorkflowDefinition) | null

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // 3. Build context with webhook metadata
    const requestContext: RequestContext = {
      tenantId,
      userId: 'webhook-system',
      userEmail: 'webhook@metabuilder.local',
      userLevel: 3, // Treat webhooks as admin for security
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent') || 'webhook-client',
    }

    const builder = new MultiTenantContextBuilder(workflow, requestContext, {
      enableAuditLogging: true,
      captureRequestData: true,
    })

    const bodyData = await req.json()

    const context = await builder.build(
      {
        triggerData: {
          webhook: {
            id: webhookId,
            timestamp: Date.now(),
            signature: signature.substring(0, 10) + '...', // Log truncated
          },
          ...bodyData,
        },
        request: {
          method: req.method,
          headers: Object.fromEntries(req.headers),
          query: Object.fromEntries(new URL(req.url).searchParams),
          body: bodyData,
        },
      },
      {
        nodeId: workflow.nodes[0]?.id || 'webhook',
        kind: 'webhook',
        enabled: true,
        metadata: {
          webhookId,
          signature: signature.substring(0, 10) + '...',
        },
      }
    )

    // 4. Execute asynchronously (don't wait for response)
    const engine = getWorkflowExecutionEngine()
    engine.executeWorkflow(
      workflow.id, tenantId, context as unknown as Record<string, unknown>
    ).catch((err: unknown) => {
      console.error(`[${executionId}] Webhook execution failed:`, err)
    })

    // 5. Return immediately
    return NextResponse.json({
      success: true,
      executionId: context.executionId,
    })
  } catch (error) {
    console.error(`[${executionId}] Webhook error:`, error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * ============================================================================
 * EXAMPLE 3: Scheduled Workflow Execution
 * ============================================================================
 *
 * Cron job or scheduler triggers workflow at scheduled time
 * Uses system identity for execution
 */

export async function executeScheduledWorkflow(
  workflow: WorkflowDefinition,
  tenantId: string
) {
  const executionId = uuidv4()
  console.log(`[${executionId}] Scheduled workflow: ${workflow.name}`)

  try {
    // 1. Build context with system identity
    const requestContext: RequestContext = {
      tenantId,
      userId: 'scheduler-system',
      userEmail: 'scheduler@metabuilder.local',
      userLevel: 3, // Admin for system-triggered workflows
    }

    const builder = new MultiTenantContextBuilder(workflow, requestContext, {
      enableAuditLogging: true,
      captureRequestData: false, // No request data for scheduled
    })

    // 2. Get schedule configuration
    const trigger = workflow.triggers?.find((t) => t.kind === 'schedule')
    const cronExpression = trigger?.schedule ?? '0 */6 * * *'

    const context = await builder.build(
      {
        triggerData: {
          scheduledAt: new Date(),
          timezone: workflow.settings.timezone,
          executionMode: 'scheduled',
        },
      },
      trigger || {
        nodeId: workflow.nodes[0]?.id || 'schedule',
        kind: 'schedule',
        enabled: true,
        metadata: {
          cronExpression,
        },
      }
    )

    console.log(`[${executionId}] Context built for scheduled execution`)

    // 3. Execute workflow
    const engine = getWorkflowExecutionEngine()
    const record = await engine.executeWorkflow(
      workflow.id, tenantId, context as unknown as Record<string, unknown>
    )

    console.log(`[${executionId}] Scheduled execution completed: ${record.status}`)

    // 4. Log to database
    const executionLogOps = db.entity('ExecutionLog')
    await executionLogOps.create({
      executionId: record.id,
      tenantId,
      workflowId: workflow.id,
      triggeredBy: 'schedule',
      status: record.status,
      duration: record.duration,
      createdAt: new Date(),
    })

    return record
  } catch (error) {
    console.error(`[${executionId}] Scheduled execution failed:`, error)

    // Log failure
    const executionLogOps = db.entity('ExecutionLog')
    await executionLogOps.create({
      executionId,
      tenantId,
      workflowId: workflow.id,
      triggeredBy: 'schedule',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      createdAt: new Date(),
    })

    throw error
  }
}

/**
 * ============================================================================
 * EXAMPLE 4: Pre-Execution Validation
 * ============================================================================
 *
 * Validate workflow can be executed before committing resources
 * Used by UI to show validation errors before user clicks "Run"
 */

export async function validateWorkflowExecution(req: NextRequest) {
  try {
    const user = await verifyUserAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workflowId } = await req.json()
    const workflow = await findOneEntity(db.workflows, {
      id: workflowId,
      tenantId: user.tenantId,
    }) as (Record<string, unknown> & WorkflowDefinition) | null

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Build validator
    const requestContext: RequestContext = {
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      userLevel: user.level,
    }

    const builder = new MultiTenantContextBuilder(workflow, requestContext)
    const result = await builder.validate()

    // Return validation result for UI
    return NextResponse.json({
      valid: result.valid,
      errors: result.errors.map((e) => ({
        code: e.code,
        message: e.message,
        path: e.path,
      })),
      warnings: result.warnings.map((w) => ({
        severity: w.severity,
        message: w.message,
        path: w.path,
      })),
    })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}

/**
 * ============================================================================
 * EXAMPLE 5: Cross-Tenant Admin Execution
 * ============================================================================
 *
 * Super-admin executes workflow in different tenant for debugging/support
 * Requires explicit allowCrossTenantAccess flag
 */

export async function adminExecuteWorkflow(req: NextRequest) {
  const executionId = uuidv4()

  try {
    const user = await verifyUserAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super-admin
    if (user.level !== 4) {
      console.warn(`[${executionId}] Non-admin ${user.id} attempted cross-tenant execution`)
      return NextResponse.json(
        { error: 'Only super-admins can execute cross-tenant' },
        { status: 403 }
      )
    }

    const { workflowId, targetTenantId } = await req.json()

    // Load workflow from target tenant
    const workflow = await findOneEntity(db.workflows, {
      id: workflowId,
      tenantId: targetTenantId,
    }) as (Record<string, unknown> & WorkflowDefinition) | null

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Build context as super-admin in different tenant
    const requestContext: RequestContext = {
      tenantId: targetTenantId, // Different tenant!
      userId: user.id,
      userEmail: user.email,
      userLevel: 4, // Super-admin
    }

    const builder = new MultiTenantContextBuilder(workflow, requestContext, {
      allowCrossTenantAccess: true, // Explicitly allow
      enableAuditLogging: true, // IMPORTANT: Always audit cross-tenant
    })

    const context = await builder.build({
      triggerData: {
        source: 'admin-support',
        adminId: user.id,
        adminEmail: user.email,
      },
    })

    console.log(
      `[${executionId}] Admin ${user.id} executing workflow in tenant ${targetTenantId}`
    )

    const engine = getWorkflowExecutionEngine()
    const record = await engine.executeWorkflow(
      workflow.id, targetTenantId, context as unknown as Record<string, unknown>
    )

    return NextResponse.json({
      success: true,
      executionId: record.id,
      status: record.status,
      note: 'Cross-tenant execution by super-admin',
    })
  } catch (error) {
    console.error(`[${executionId}] Admin execution failed:`, error)
    return NextResponse.json(
      { error: 'Execution failed' },
      { status: 500 }
    )
  }
}

/**
 * ============================================================================
 * EXAMPLE 6: Monitoring & Logging
 * ============================================================================
 *
 * Log execution context safely without exposing secrets
 */

export async function logExecutionContext(context: ExtendedWorkflowContext) {
  // Sanitize context for logging (removes secrets, truncates IPs, etc.)
  const sanitized = sanitizeContextForLogging(context)

  // Log safely
  console.log('[EXECUTION]', {
    executionId: sanitized.executionId,
    workflow: sanitized.workflowId,
    tenant: sanitized.tenantId,
    user: sanitized.userId,
    mode: sanitized.multiTenant.executionMode,
    timestamp: sanitized.multiTenant.requestedAt,
    // Variables listed as keys only, no values
    variables: sanitized.variables,
    // Limits included for monitoring
    limits: sanitized.executionLimits,
    // No secrets, credentials, or request body
  })

  // Send to monitoring system
  await sendToMonitoring({
    event: 'workflow_execution_started',
    executionId: context.executionId,
    tenantId: context.tenantId,
    workflowId: context.tenantId,
    userId: context.userId,
    executionMode: context.multiTenant.executionMode,
  })
}

/**
 * ============================================================================
 * EXAMPLE 7: Error Recovery & Retry
 * ============================================================================
 *
 * Handle execution failures with audit trail
 */

export async function retryFailedWorkflowExecution(
  originalContext: ExtendedWorkflowContext,
  workflow: WorkflowDefinition,
  retryCount: number = 1
) {
  const retryId = uuidv4()
  console.log(
    `[${retryId}] Retry ${retryCount} for execution ${originalContext.executionId}`
  )

  try {
    // Build new context based on original
    const requestContext: RequestContext = {
      tenantId: originalContext.tenantId,
      userId: originalContext.userId,
      userEmail: originalContext.user.email,
      userLevel: originalContext.user.level,
    }

    const builder = new MultiTenantContextBuilder(workflow, requestContext)

    const newContext = await builder.build(
      {
        triggerData: {
          ...originalContext.triggerData,
          retryOf: originalContext.executionId,
          retryCount,
          retryAt: new Date(),
        },
        variables: originalContext.variables,
        secrets: originalContext.secrets,
      },
      {
        ...originalContext.trigger,
        metadata: {
          ...originalContext.trigger.metadata,
          retryOf: originalContext.executionId,
          retryCount,
        },
      }
    )

    // Execute with new context
    const engine = getWorkflowExecutionEngine()
    const record = await engine.executeWorkflow(
      workflow.id, originalContext.tenantId, newContext as unknown as Record<string, unknown>
    )

    console.log(`[${retryId}] Retry execution completed: ${record.status}`)

    return record
  } catch (error) {
    console.error(`[${retryId}] Retry failed:`, error)
    throw error
  }
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Mock implementation - replace with actual auth service
 */
async function verifyUserAuth(req: NextRequest): Promise<AuthenticatedUser | null> {
  // In production, parse JWT and get user details
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  // TODO: Parse JWT token
  // const token = authHeader.substring(7)
  // const payload = await verifyJWT(token)
  // return payload.user

  return null
}

/**
 * Mock implementation - replace with actual webhook verification
 */
async function verifyWebhookSignature(
  _webhookId: string,
  _signature: string,
  _body: string
): Promise<boolean> {
  // In production, verify HMAC signature
  // const secret = await getWebhookSecret(webhookId)
  // const expectedSignature = hmac('sha256', secret, body)
  // return constantTimeEqual(signature, expectedSignature)

  return true
}

/**
 * Mock implementation - replace with actual monitoring
 */
async function sendToMonitoring(data: Record<string, any>) {
  // In production, send to monitoring system (DataDog, New Relic, etc.)
  console.log('[MONITORING]', data)
}

/**
 * ============================================================================
 * EXPORT SUMMARY
 * ============================================================================
 *
 * This file demonstrates 7 real-world patterns:
 *
 * 1. Manual execution - User triggers from UI
 * 2. Webhook triggers - External system integration
 * 3. Scheduled execution - Cron/scheduler integration
 * 4. Pre-execution validation - Validate before running
 * 5. Cross-tenant admin execution - Support & debugging
 * 6. Safe logging - Monitoring without exposing secrets
 * 7. Retry logic - Handle failures gracefully
 *
 * All examples follow MetaBuilder patterns:
 * ✅ Multi-tenant by default
 * ✅ Type-safe with full TypeScript
 * ✅ Comprehensive error handling
 * ✅ Audit logging
 * ✅ Security best practices
 */
