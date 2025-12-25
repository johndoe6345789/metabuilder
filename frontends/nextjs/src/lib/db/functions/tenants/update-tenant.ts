import { prisma } from '../../prisma'
import type { Tenant } from '../../../types/level-types'

/**
 * Update a tenant by ID
 * @param tenantId - The tenant ID
 * @param updates - Partial tenant data
 */
export const updateTenant = async (tenantId: string, updates: Partial<Tenant>): Promise<void> => {
  const data: any = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.ownerId !== undefined) data.ownerId = updates.ownerId
  if (updates.homepageConfig !== undefined) data.homepageConfig = JSON.stringify(updates.homepageConfig)

  await prisma.tenant.update({
    where: { id: tenantId },
    data,
  })
}
