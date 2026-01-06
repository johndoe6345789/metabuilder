import { getAdapter } from '../../core/dbal-client'

/**
 * Delete a CSS class category
 */
export async function deleteCssCategory(categoryName: string): Promise<void> {
  const adapter = getAdapter()
  const existing = await adapter.findFirst('CssCategory', { where: { name: categoryName } }) as { id: string | number } | null
  if (existing === null || existing === undefined) {
    return
  }
  await adapter.delete('CssCategory', existing.id)
}
