import { prisma } from '../prisma'

/**
 * Delete a schema by name
 */
export async function deleteSchema(schemaName: string): Promise<void> {
  await prisma.modelSchema.delete({ where: { name: schemaName } })
}
