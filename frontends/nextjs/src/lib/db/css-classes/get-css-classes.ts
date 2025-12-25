import { getAdapter } from '../dbal-client'
import type { CssCategory } from '../types'

/**
 * Get all CSS class categories from database
 */
export async function getCssClasses(): Promise<CssCategory[]> {
  const adapter = getAdapter()
  const result = await adapter.list('CssCategory')
  return (result.data as any[]).map((c) => ({
    name: c.name,
    classes: typeof c.classes === 'string' ? JSON.parse(c.classes) : c.classes,
  }))
}
