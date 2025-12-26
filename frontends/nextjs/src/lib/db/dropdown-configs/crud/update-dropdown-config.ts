import { getAdapter } from '../dbal-client'
import type { DropdownConfig } from '../types'

/**
 * Update an existing dropdown configuration
 */
export async function updateDropdownConfig(id: string, updates: DropdownConfig): Promise<void> {
  const adapter = getAdapter()
  await adapter.update('DropdownConfig', id, {
    name: updates.name,
    label: updates.label,
    options: JSON.stringify(updates.options),
  })
}
