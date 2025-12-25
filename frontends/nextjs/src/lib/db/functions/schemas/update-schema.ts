import { prisma } from '../../prisma'
import type { ModelSchema } from '../../types/schema-types'

/**
 * Update a model schema by name
 * @param schemaName - The schema name
 * @param updates - Partial schema data
 */
export const updateSchema = async (schemaName: string, updates: Partial<ModelSchema>): Promise<void> => {
  const data: any = {}
  if (updates.label !== undefined) data.label = updates.label
  if (updates.labelPlural !== undefined) data.labelPlural = updates.labelPlural
  if (updates.icon !== undefined) data.icon = updates.icon
  if (updates.fields !== undefined) data.fields = JSON.stringify(updates.fields)
  if (updates.listDisplay !== undefined) data.listDisplay = JSON.stringify(updates.listDisplay)
  if (updates.listFilter !== undefined) data.listFilter = JSON.stringify(updates.listFilter)
  if (updates.searchFields !== undefined) data.searchFields = JSON.stringify(updates.searchFields)
  if (updates.ordering !== undefined) data.ordering = JSON.stringify(updates.ordering)

  await prisma.modelSchema.update({
    where: { name: schemaName },
    data,
  })
}
