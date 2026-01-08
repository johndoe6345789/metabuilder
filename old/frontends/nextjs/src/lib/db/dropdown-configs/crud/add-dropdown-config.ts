import { getAdapter } from '../../core/dbal-client'
import type { DropdownConfig } from '../types'

/**
 * Add a new dropdown configuration
 */
export async function addDropdownConfig(config: DropdownConfig): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('DropdownConfig', {
    id: config.id,
    name: config.name,
    label: config.label,
    options: JSON.stringify(config.options),
  })
}
