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
  tenantId?: string | null
}

export interface GetSchemasOptions {
  /** Filter by tenant ID for multi-tenancy */
  tenantId?: string
}

/**
 * Get all schemas, optionally filtered by tenant
 */
export async function getSchemas(options?: GetSchemasOptions): Promise<ModelSchema[]> {
  const adapter = getAdapter()
  const listOptions = options?.tenantId !== undefined
    ? { filter: { tenantId: options.tenantId } }
    : undefined
  const result = listOptions !== undefined
    ? (await adapter.list('ModelSchema', listOptions)) as { data: DBALModelSchemaRecord[] }
    : (await adapter.list('ModelSchema')) as { data: DBALModelSchemaRecord[] }
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
