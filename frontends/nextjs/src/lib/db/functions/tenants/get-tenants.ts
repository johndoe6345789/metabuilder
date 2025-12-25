import { prisma } from '../../prisma'
import type { Tenant } from '../../../types/level-types'

/**
 * Get all tenants
 * @returns Array of tenants
 */
export const getTenants = async (): Promise<Tenant[]> => {
  const tenants = await prisma.tenant.findMany()
  return tenants.map(t => ({
    id: t.id,
    name: t.name,
    ownerId: t.ownerId,
    createdAt: Number(t.createdAt),
    homepageConfig: t.homepageConfig ? JSON.parse(t.homepageConfig) : undefined,
  }))
}
