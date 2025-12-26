import { getAdapter } from '../../core/dbal-client'
import type { ModelSchema } from '../../types/schema-types'

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
    listDisplay: schema.listDisplay ? JSON.stringify(schema.listDisplay) : null,
    listFilter: schema.listFilter ? JSON.stringify(schema.listFilter) : null,
    searchFields: schema.searchFields ? JSON.stringify(schema.searchFields) : null,
    ordering: schema.ordering ? JSON.stringify(schema.ordering) : null,
  })
}
