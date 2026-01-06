import { getAdapter } from '../../core/dbal-client'
import type { ModelSchema } from '@/lib/types/schema-types'

type DBALModelSchemaRecord = {
  id: string
  name: string
  label?: string | null
  labelPlural?: string | null
  icon?: string | null
  fields: string
  listDisplay?: string | null
  listFilter?: string | null
  searchFields?: string | null
  ordering?: string | null
}

/**
 * Get all schemas
 */
export async function getSchemas(): Promise<ModelSchema[]> {
  const adapter = getAdapter()
  const result = (await adapter.list('ModelSchema')) as { data: DBALModelSchemaRecord[] }
  return result.data.map(s => ({
    id: s.id,
    name: s.name,
    label: s.label ?? undefined,
    labelPlural: s.labelPlural ?? undefined,
    icon: s.icon ?? undefined,
    fields: JSON.parse(s.fields) as ModelSchema['fields'],
    listDisplay: (s.listDisplay !== null && s.listDisplay !== undefined) ? JSON.parse(s.listDisplay) as string[] : undefined,
    listFilter: (s.listFilter !== null && s.listFilter !== undefined) ? JSON.parse(s.listFilter) as string[] : undefined,
    searchFields: (s.searchFields !== null && s.searchFields !== undefined) ? JSON.parse(s.searchFields) as string[] : undefined,
    ordering: (s.ordering !== null && s.ordering !== undefined) ? JSON.parse(s.ordering) as string[] : undefined,
  }))
}
