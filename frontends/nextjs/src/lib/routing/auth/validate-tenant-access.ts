/**
 * Tenant access validation
 * Ensures users can only access data for tenants they belong to
 */

import { getAdapter } from '@/lib/db/dbal-client'

import type { SessionUser } from './get-session-user'

export interface TenantInfo {
  id: string
  name: string
  slug: string
  ownerId: string
}

export interface TenantAccessResult {
  allowed: boolean
  tenant: TenantInfo | null
  reason?: string
}

/**
 * Validate user has access to the specified tenant
 * 
 * Access rules:
 * - Level 5+ (God/Supergod) can access any tenant
 * - Tenant owner always has access
 * - Users with matching tenantId have access
 * - Public routes (level 1) allow anonymous access
 */
export const validateTenantAccess = async (
  user: SessionUser | null,
  tenantSlug: string,
  requiredLevel: number = 1
): Promise<TenantAccessResult> => {
  const adapter = getAdapter()

  // Look up tenant by slug
  const tenant = await adapter.findFirst('Tenant', {
    where: { slug: tenantSlug },
  }) as TenantInfo | null

  if (!tenant) {
    return {
      allowed: false,
      tenant: null,
      reason: `Tenant not found: ${tenantSlug}`,
    }
  }

  // Public routes (level 1) allow anonymous access
  if (requiredLevel <= 1) {
    return { allowed: true, tenant }
  }

  // All other routes require authentication
  if (!user) {
    return {
      allowed: false,
      tenant,
      reason: 'Authentication required',
    }
  }

  // God/Supergod (level 5+) can access any tenant
  if (user.level >= 5) {
    return { allowed: true, tenant }
  }

  // Tenant owner always has access
  if (tenant.ownerId === user.id) {
    return { allowed: true, tenant }
  }

  // Check if user belongs to this tenant
  if (user.tenantId === tenant.id) {
    // Verify user has required level
    if (user.level >= requiredLevel) {
      return { allowed: true, tenant }
    }
    return {
      allowed: false,
      tenant,
      reason: `Insufficient permission level (need ${requiredLevel}, have ${user.level})`,
    }
  }

  return {
    allowed: false,
    tenant,
    reason: 'Access denied to this tenant',
  }
}

/**
 * Get list of tenants a user can access
 */
export const getUserTenants = async (user: SessionUser): Promise<TenantInfo[]> => {
  const adapter = getAdapter()

  // God/Supergod can access all tenants
  if (user.level >= 5) {
    const result = await adapter.list('Tenant', { limit: 100 })
    return result.data as TenantInfo[]
  }

  // Regular users see their own tenant + any they own
  const tenants: TenantInfo[] = []

  if (user.tenantId) {
    const ownTenant = await adapter.read('Tenant', user.tenantId) as TenantInfo | null
    if (ownTenant) {
      tenants.push(ownTenant)
    }
  }

  // Add owned tenants
  const ownedResult = await adapter.list('Tenant', {
    filter: { ownerId: user.id },
    limit: 50,
  })
  
  for (const tenant of ownedResult.data as TenantInfo[]) {
    if (!tenants.some(t => t.id === tenant.id)) {
      tenants.push(tenant)
    }
  }

  return tenants
}
