/**
 * @file get-page.ts
 * @description Get page operations
 */
import type { PageView, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Get a page by ID
 */
export const getPage = async (store: InMemoryStore, id: string): Promise<Result<PageView>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  const page = store.pages.get(id)
  if (!page) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found: ${id}` } }
  }

  return { success: true, data: page }
}

/**
 * Get a page by slug
 */
export const getPageBySlug = async (store: InMemoryStore, slug: string): Promise<Result<PageView>> => {
  if (!slug) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Slug is required' } }
  }

  const id = store.pageSlugs.get(slug)
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found with slug: ${slug}` } }
  }

  return getPage(store, id)
}
