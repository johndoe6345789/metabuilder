/**
 * Who may run a workflow belonging to which tenant.
 *
 * Split out of multi-tenant-context.ts so the rule can be read and tested on
 * its own: it is the boundary between tenants, and it was buried at the
 * bottom of a 726-line file with no test.
 */

/** Level at or above which a user may cross tenant boundaries. */
export const CROSS_TENANT_LEVEL = 4

export function canUserAccessWorkflow(
  userTenantId: string,
  userLevel: number,
  workflowTenantId: string
): boolean {
  if (userTenantId === workflowTenantId) return true
  return userLevel >= CROSS_TENANT_LEVEL
}
