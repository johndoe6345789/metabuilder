import { getAdapter } from '../dbal-client'
import type { ModelSchema } from '../../types/schema-types'

/**
 * Set all schemas (replaces existing)
 */
export async function setSchemas(schemas: ModelSchema[]): Promise<void> {
  const adapter = getAdapter()
  
  // Delete existing schemas
  const existing = await adapter.list('ModelSchema')
  for (const s of existing.data as any[]) {
    await adapter.delete('ModelSchema', s.name)
  }
  
  // Create new schemas
  for (const schema of schemas) {
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
}
