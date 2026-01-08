import { getAdapter } from '../../core/dbal-client'
import type { ModelSchema } from '@/lib/types/schema-types'

/**
 * Add a schema
 */
export async function addSchema(schema: ModelSchema): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('ModelSchema', {
    name: schema.name,
    label: schema.label,
    labelPlural: schema.labelPlural,
    icon: schema.icon,
    fields: JSON.stringify(schema.fields),
    listDisplay: schema.listDisplay !== null && schema.listDisplay !== undefined ? JSON.stringify(schema.listDisplay) : null,
    listFilter: schema.listFilter !== null && schema.listFilter !== undefined ? JSON.stringify(schema.listFilter) : null,
    searchFields: schema.searchFields !== null && schema.searchFields !== undefined ? JSON.stringify(schema.searchFields) : null,
    ordering: schema.ordering !== null && schema.ordering !== undefined ? JSON.stringify(schema.ordering) : null,
  })
}
