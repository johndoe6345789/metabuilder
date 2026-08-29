/**
 * Whether this request may run this workflow at all.
 *
 * The first gate in context building, and the one that decides tenant
 * isolation: everything downstream assumes it has already passed.
 */

import type { WorkflowDefinition } from '@metabuilder/workflow'
import type { ContextBuilderOptions, RequestContext } from './context-types'

/** The level at or above which a user may reach another tenant at all. */
export const SUPER_ADMIN_LEVEL = 4

export type AccessOutcome =
  | { allowed: true; crossTenant: boolean }
  | { allowed: false; reason: string }

/**
 * Decides, without throwing, so the same rule can answer both the build
 * (which throws) and `validate()` (which collects).
 */
export function checkTenantAccess(
  workflow: Pick<WorkflowDefinition, 'id' | 'tenantId'>,
  request: Pick<RequestContext, 'tenantId' | 'userId' | 'userLevel'>,
  options: Pick<ContextBuilderOptions, 'allowCrossTenantAccess'>
): AccessOutcome {
  if (request.tenantId === workflow.tenantId) {
    return { allowed: true, crossTenant: false }
  }

  if (request.userLevel >= SUPER_ADMIN_LEVEL) {
    if (options.allowCrossTenantAccess !== true) {
      return {
        allowed: false,
        reason:
          `Cross-tenant access disabled: User ${request.userId} ` +
          `cannot access workflow in tenant ${workflow.tenantId}`,
      }
    }
    return { allowed: true, crossTenant: true }
  }

  return {
    allowed: false,
    reason:
      `Forbidden: Workflow ${workflow.id} belongs to tenant ` +
      `${workflow.tenantId}, user is in tenant ${request.tenantId}`,
  }
}
