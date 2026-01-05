import { getAdapter } from '../../core/dbal-client'
import type { Tenant } from '@/lib/types/level-types'

/**
 * Add a new tenant
 */
export async function addTenant(tenant: Tenant): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('Tenant', {
    id: tenant.id,
    name: tenant.name,
    ownerId: tenant.ownerId,
    createdAt: BigInt(tenant.createdAt),
    homepageConfig: tenant.homepageConfig ? JSON.stringify(tenant.homepageConfig) : null,
  })
}
