import { getAdapter } from '../../core/dbal-client'

/**
 * Delete a dropdown configuration
 */
export async function deleteDropdownConfig(id: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('DropdownConfig', id)
}
