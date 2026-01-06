import { getAdapter } from '../../core/dbal-client'
import type { CssCategory } from '../types'

/**
 * Set all CSS class categories (replaces existing)
 */
export async function setCssClasses(classes: CssCategory[]): Promise<void> {
  const adapter = getAdapter()
  // Delete all existing
  const existing = await adapter.list('CssCategory')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const item of existing.data as any[]) {
    if (item?.id) {
      await adapter.delete('CssCategory', item.id)
    }
  }
  // Create new ones
  for (const category of classes) {
    await adapter.create('CssCategory', {
      name: category.name,
      classes: JSON.stringify(category.classes),
    })
  }
}
