import { getAdapter } from '../../core/dbal-client'
import type { ModelSchema } from '../../types/schema-types'

/**
 * Update a schema by name
 */
export async function updateSchema(
  schemaName: string,
  updates: Partial<ModelSchema>
): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, unknown> = {}
  if (updates.label !== undefined) data.label = updates.label
  if (updates.labelPlural !== undefined) data.labelPlural = updates.labelPlural
  if (updates.icon !== undefined) data.icon = updates.icon
  if (updates.fields !== undefined) data.fields = JSON.stringify(updates.fields)
  if (updates.listDisplay !== undefined) data.listDisplay = JSON.stringify(updates.listDisplay)
  if (updates.listFilter !== undefined) data.listFilter = JSON.stringify(updates.listFilter)
  if (updates.searchFields !== undefined) data.searchFields = JSON.stringify(updates.searchFields)
  if (updates.ordering !== undefined) data.ordering = JSON.stringify(updates.ordering)

  await adapter.update('ModelSchema', schemaName, data)
}
