import { prisma } from '../../prisma'
import type { ModelSchema } from '../../types/schema-types'

/**
 * Add a single model schema
 * @param schema - The schema to add
 */
export const addSchema = async (schema: ModelSchema): Promise<void> => {
  await prisma.modelSchema.create({
    data: {
      name: schema.name,
      label: schema.label,
      labelPlural: schema.labelPlural,
      icon: schema.icon,
      fields: JSON.stringify(schema.fields),
      listDisplay: schema.listDisplay ? JSON.stringify(schema.listDisplay) : null,
      listFilter: schema.listFilter ? JSON.stringify(schema.listFilter) : null,
      searchFields: schema.searchFields ? JSON.stringify(schema.searchFields) : null,
      ordering: schema.ordering ? JSON.stringify(schema.ordering) : null,
    },
  })
}
