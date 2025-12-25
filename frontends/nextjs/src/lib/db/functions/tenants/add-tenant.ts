import { prisma } from '../../prisma'
import type { Tenant } from '../../../types/level-types'

/**
 * Add a single tenant
 * @param tenant - The tenant to add
 */
export const addTenant = async (tenant: Tenant): Promise<void> => {
  await prisma.tenant.create({
    data: {
      id: tenant.id,
      name: tenant.name,
      ownerId: tenant.ownerId,
      createdAt: BigInt(tenant.createdAt),
      homepageConfig: tenant.homepageConfig ? JSON.stringify(tenant.homepageConfig) : null,
    },
  })
}
