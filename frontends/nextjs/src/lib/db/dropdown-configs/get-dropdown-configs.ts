import { getAdapter } from '../dbal-client'
import type { DropdownConfig } from '../types'

/**
 * Get all dropdown configurations from database
 */
export async function getDropdownConfigs(): Promise<DropdownConfig[]> {
  const adapter = getAdapter()
  const result = await adapter.list('DropdownConfig')
  return (result.data as any[]).map((c) => ({
    id: c.id,
    name: c.name,
    label: c.label,
    options: typeof c.options === 'string' ? JSON.parse(c.options) : c.options,
  }))
}
