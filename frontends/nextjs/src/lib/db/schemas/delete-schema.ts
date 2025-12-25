import { getAdapter } from '../dbal-client'

/**
 * Delete a schema by name
 */
export async function deleteSchema(schemaName: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('ModelSchema', schemaName)
}
