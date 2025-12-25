import { prisma } from '../../prisma'
import type { Tenant } from '../../../types/level-types'

/**
 * Set all tenants (replaces existing)
 * @param tenants - Array of tenants
 */
export const setTenants = async (tenants: Tenant[]): Promise<void> => {
  await prisma.tenant.deleteMany()
  for (const tenant of tenants) {
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
}
