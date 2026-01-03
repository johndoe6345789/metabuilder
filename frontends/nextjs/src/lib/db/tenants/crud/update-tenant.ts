import { getAdapter } from '../../core/dbal-client'
import type { Tenant } from '@/lib/level-types'

/**
 * Update an existing tenant
 */
export async function updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, any> = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.ownerId !== undefined) data.ownerId = updates.ownerId
  if (updates.homepageConfig !== undefined)
    data.homepageConfig = JSON.stringify(updates.homepageConfig)
  await adapter.update('Tenant', tenantId, data)
}
