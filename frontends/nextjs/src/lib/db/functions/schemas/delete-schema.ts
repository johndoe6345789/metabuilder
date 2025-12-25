import { prisma } from '../../prisma'

/**
 * Delete a model schema by name
 * @param schemaName - The schema name
 */
export const deleteSchema = async (schemaName: string): Promise<void> => {
  await prisma.modelSchema.delete({ where: { name: schemaName } })
}
