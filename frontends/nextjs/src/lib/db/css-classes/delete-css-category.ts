import { getAdapter } from '../dbal-client'

/**
 * Delete a CSS class category
 */
export async function deleteCssCategory(categoryName: string): Promise<void> {
  const adapter = getAdapter()
  const existing = await adapter.findFirst('CssCategory', { where: { name: categoryName } })
  if (!existing) {
    return
  }
  await adapter.delete('CssCategory', (existing as any).id)
}
