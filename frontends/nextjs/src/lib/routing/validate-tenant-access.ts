export interface TenantValidationResult {
  allowed: boolean
  reason?: string
  tenant?: unknown
}

/**
 * Whether a user may act within a tenant at the given minimum role level.
 *
 * It used to answer "is this person a member" by listing a `Tenant` entity
 * -- which does not exist; tenant-exists.ts says so outright -- so the
 * request 404'd, listEntity swallowed that into an empty list, and the
 * empty list was indistinguishable from "no such tenant". Every caller
 * below god was refused with "Tenant not found" across the whole
 * /api/v1 surface. The test agreed, because it mocked the entity in.
 *
 * The question is answered without a lookup: the account already carries
 * the community it belongs to. The rule is the one the DBAL proxy and the
 * asset routes apply -- your own community, unless you are the instance
 * owner -- so all three now say the same thing, rather than this one
 * letting any god into any tenant.
 */
export async function validateTenantAccess(
  user: { id: string; role: string; tenantId?: string | null } | null,
  tenantSlug: string,
  minLevel: number = 1
): Promise<TenantValidationResult> {
  const { getRoleLevel } = await import('@/lib/constants')

  if (user === null) {
    if (minLevel <= 0) return { allowed: true }
    return { allowed: false, reason: 'Authentication required' }
  }

  const userLevel = getRoleLevel(user.role)
  if (userLevel < minLevel) {
    return {
      allowed: false,
      reason: `Insufficient permissions. Required level: ${minLevel}, your level: ${userLevel}`,
    }
  }

  const { ownsTenant } = await import('@/lib/auth/tenant-rule')
  if (!ownsTenant(user, tenantSlug)) {
    return { allowed: false, reason: 'Not a member of this tenant' }
  }

  return { allowed: true, tenant: { id: tenantSlug } }
}
