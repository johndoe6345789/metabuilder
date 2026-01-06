import { getAdapter } from '../../core/dbal-client'
import type { ModelSchema } from '@/lib/types/schema-types'

/**
 * Set all schemas (replaces existing)
 */
export async function setSchemas(schemas: ModelSchema[]): Promise<void> {
  const adapter = getAdapter()

  // Delete existing schemas
  const existing = await adapter.list('ModelSchema')
  for (const s of existing.data as Array<{ name: string }>) {
    await adapter.delete('ModelSchema', s.name)
  }

  // Create new schemas
  for (const schema of schemas) {
    await adapter.create('ModelSchema', {
      name: schema.name,
      label: schema.label,
      labelPlural: schema.labelPlural,
      icon: schema.icon,
      fields: schema.fields,
      listDisplay: schema.listDisplay ?? null,
      listFilter: schema.listFilter ?? null,
      searchFields: schema.searchFields ?? null,
      ordering: schema.ordering ?? null,
    })
  }
}
