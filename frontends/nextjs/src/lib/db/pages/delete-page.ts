import { getAdapter } from '../dbal-client'

/**
 * Delete a page by ID
 */
export async function deletePage(pageId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('PageConfig', pageId)
}
