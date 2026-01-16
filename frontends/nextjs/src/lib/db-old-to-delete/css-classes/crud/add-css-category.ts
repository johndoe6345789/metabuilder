import { getAdapter } from '../../core/dbal-client'
import type { CssCategory } from '../types'

/**
 * Add a new CSS class category
 */
export async function addCssCategory(category: CssCategory): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('CssCategory', {
    name: category.name,
    classes: JSON.stringify(category.classes),
  })
}
