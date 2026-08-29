/** The audit line every built context leaves behind. */

import type { ExtendedWorkflowContext } from './context-types'

export function logContextCreation(
  context: ExtendedWorkflowContext,
  workflowId: string
): void {
  // eslint-disable-next-line no-console
  console.info('[AUDIT] Workflow execution context created', {
    executionId: context.executionId,
    workflowId,
    tenantId: context.tenantId,
    userId: context.userId,
    executionMode: context.multiTenant.executionMode,
    timestamp: context.multiTenant.requestedAt,
    ipAddress: context.multiTenant.ipAddress,
  })
}
