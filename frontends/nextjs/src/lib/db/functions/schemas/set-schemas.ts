import { prisma } from '../../prisma'
import type { ModelSchema } from '../../types/schema-types'

/**
 * Set all model schemas (replaces existing)
 * @param schemas - Array of model schemas
 */
export const setSchemas = async (schemas: ModelSchema[]): Promise<void> => {
  await prisma.modelSchema.deleteMany()
  for (const schema of schemas) {
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
}
