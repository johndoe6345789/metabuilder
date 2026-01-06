import { getAdapter } from '../../core/dbal-client'
import type { DropdownConfig } from '../types'

/**
 * Get all dropdown configurations from database
 */
export async function getDropdownConfigs(): Promise<DropdownConfig[]> {
  const adapter = getAdapter()
  const result = await adapter.list('DropdownConfig')
  return (result.data as Array<{ id: string; name: string; label: string; options: string | Array<{ label: string; value: string }> }>).map(c => ({
    id: String(c.id),
    name: c.name,
    label: c.label,
    options: typeof c.options === 'string' ? JSON.parse(c.options) as Array<{ label: string; value: string }> : c.options,
  }))
}
