import { prisma } from '../../prisma'

/**
 * Delete a tenant by ID
 * @param tenantId - The tenant ID
 */
export const deleteTenant = async (tenantId: string): Promise<void> => {
  await prisma.tenant.delete({ where: { id: tenantId } })
}
