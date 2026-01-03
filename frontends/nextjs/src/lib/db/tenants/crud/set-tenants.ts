import { getAdapter } from '../../core/dbal-client'
import type { Tenant } from '@/lib/level-types'

/**
 * Set all tenants (replaces existing)
 */
export async function setTenants(tenants: Tenant[]): Promise<void> {
  const adapter = getAdapter()
  // Delete all existing
  const existing = await adapter.list('Tenant')
  for (const item of existing.data as any[]) {
    await adapter.delete('Tenant', item.id)
  }
  // Create new ones
  for (const tenant of tenants) {
    await adapter.create('Tenant', {
      id: tenant.id,
      name: tenant.name,
      ownerId: tenant.ownerId,
      createdAt: BigInt(tenant.createdAt),
      homepageConfig: tenant.homepageConfig ? JSON.stringify(tenant.homepageConfig) : null,
    })
  }
}
