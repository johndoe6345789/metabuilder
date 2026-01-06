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
    fields: s.fields,
    listDisplay: s.listDisplay ?? undefined,
    listFilter: s.listFilter ?? undefined,
    searchFields: s.searchFields ?? undefined,
    ordering: s.ordering ?? undefined,
  }))
}
