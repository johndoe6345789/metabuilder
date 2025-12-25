import { prisma } from '../prisma'
import type { ModelSchema } from '../../schema-types'

/**
 * Get all schemas
 */
export async function getSchemas(): Promise<ModelSchema[]> {
  const schemas = await prisma.modelSchema.findMany()
  return schemas.map((s) => ({
    name: s.name,
    label: s.label || undefined,
    labelPlural: s.labelPlural || undefined,
    icon: s.icon || undefined,
    fields: JSON.parse(s.fields),
    listDisplay: s.listDisplay ? JSON.parse(s.listDisplay) : undefined,
    listFilter: s.listFilter ? JSON.parse(s.listFilter) : undefined,
    searchFields: s.searchFields ? JSON.parse(s.searchFields) : undefined,
    ordering: s.ordering ? JSON.parse(s.ordering) : undefined,
  }))
}
