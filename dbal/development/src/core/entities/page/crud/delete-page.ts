/**
 * @file delete-page.ts
 * @description Delete page operation
 */
import type { Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Delete a page by ID
 */
export const deletePage = async (store: InMemoryStore, id: string): Promise<Result<boolean>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  const page = store.pages.get(id)
  if (!page) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found: ${id}` } }
  }

  store.pages.delete(id)
  store.pageSlugs.delete(page.slug)

  return { success: true, data: true }
}
