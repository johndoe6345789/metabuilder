/** The audit block stamped onto every context. */

import type { WorkflowTrigger } from '@metabuilder/workflow'
import type { MultiTenantMetadata, RequestContext } from './context-types'
import { determineExecutionMode } from './execution-mode'

export function buildMultiTenantMetadata(
  request: RequestContext,
  trigger?: WorkflowTrigger,
  requestedAt: string = new Date().toISOString()
): MultiTenantMetadata {
  return {
    enforced: true,
    tenantId: request.tenantId,
    userId: request.userId,
    userLevel: request.userLevel,
    userEmail: request.userEmail,
    requestedAt,
    ipAddress: request.ipAddress,
    userAgent: request.userAgent,
    sessionId: request.sessionId,
    executionMode: determineExecutionMode(trigger),
  }
}
