export interface TenantValidationResult {
  allowed: boolean
  reason?: string
  tenant?: unknown
}

/** Whether a user may act within a tenant at the given minimum role
 *  level -- god/supergod can access any tenant (there's no "Tenant"
 *  entity lookup that would ever fail for them); everyone else must be
 *  a member of the tenant their route names. */
export async function validateTenantAccess(
  user: { id: string; role: string; tenantId?: string | null } | null,
  tenantSlug: string,
  minLevel: number = 1
): Promise<TenantValidationResult> {
  const { getRoleLevel, ROLE_LEVELS } = await import('@/lib/constants')

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

  if (userLevel >= ROLE_LEVELS.god) {
    return { allowed: true, tenant: { id: tenantSlug } }
  }

  try {
    const { db } = await import('@/lib/db-client')
    const tenantResult = await db
      .entity('Tenant')
      .list({ filter: { slug: tenantSlug } })
    const tenant = tenantResult.data.at(0) ?? null

    if (tenant == null) {
      return { allowed: false, reason: `Tenant not found: ${tenantSlug}` }
    }

    const tenantId = (tenant as { id: string }).id
    if (user.tenantId !== tenantId) {
      return { allowed: false, reason: 'Not a member of this tenant' }
    }

    return { allowed: true, tenant }
  } catch (error) {
    return {
      allowed: false,
      reason: error instanceof Error ? error.message : 'Validation failed',
    }
  }
}
