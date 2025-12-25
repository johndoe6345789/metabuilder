import { getAdapter } from '../dbal-client'

/**
 * Update classes in an existing CSS category
 */
export async function updateCssCategory(categoryName: string, classes: string[]): Promise<void> {
  const adapter = getAdapter()
  await adapter.update('CssCategory', categoryName, {
    classes: JSON.stringify(classes),
  })
}
