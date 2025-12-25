import { getAdapter } from '../dbal-client'

/**
 * Delete a CSS class category
 */
export async function deleteCssCategory(categoryName: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('CssCategory', categoryName)
}
