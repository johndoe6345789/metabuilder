import { getAdapter } from '../dbal-client'
import type { ModelSchema } from '../../types/schema-types'

/**
 * Get all schemas
 */
export async function getSchemas(): Promise<ModelSchema[]> {
  const adapter = getAdapter()
  const result = await adapter.list('ModelSchema')
  return (result.data as any[]).map((s) => ({
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
