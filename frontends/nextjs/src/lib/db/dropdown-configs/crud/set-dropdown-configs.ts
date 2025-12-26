import { getAdapter } from '../dbal-client'
import type { DropdownConfig } from '../types'

/**
 * Set all dropdown configurations (replaces existing)
 */
export async function setDropdownConfigs(configs: DropdownConfig[]): Promise<void> {
  const adapter = getAdapter()
  // Delete all existing
  const existing = await adapter.list('DropdownConfig')
  for (const item of existing.data as any[]) {
    await adapter.delete('DropdownConfig', item.id)
  }
  // Create new ones
  for (const config of configs) {
    await adapter.create('DropdownConfig', {
      id: config.id,
      name: config.name,
      label: config.label,
      options: JSON.stringify(config.options),
    })
  }
}
