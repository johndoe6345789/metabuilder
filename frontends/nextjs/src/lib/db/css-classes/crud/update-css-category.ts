import { getAdapter } from '../../core/dbal-client'
import type { CssCategory } from '../types'

/**
 * Update classes in an existing CSS category
 */
export async function updateCssCategory(categoryName: string, updates: CssCategory): Promise<void> {
  const adapter = getAdapter()
  const existing = await adapter.findFirst('CssCategory', { where: { name: categoryName } })
  if (!existing) {
    throw new Error(`CssCategory not found: ${categoryName}`)
  }

  await adapter.update('CssCategory', (existing as any).id, {
    name: updates.name,
    classes: JSON.stringify(updates.classes),
  })
}
