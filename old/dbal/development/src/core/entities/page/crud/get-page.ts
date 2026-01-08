/**
 * @file get-page.ts
 * @description Get page operations
 */
import type { PageConfig, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Get a page config by ID
 */
export const getPage = async (store: InMemoryStore, id: string): Promise<Result<PageConfig>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  const page = store.pageConfigs.get(id)
  if (!page) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found: ${id}` } }
  }

  return { success: true, data: page }
}

/**
 * Get a page config by path
 */
export const getPageByPath = async (
  store: InMemoryStore,
  path: string,
  tenantId?: string | null
): Promise<Result<PageConfig>> => {
  if (!path) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Path is required' } }
  }

  const pathKey = `${tenantId ?? 'global'}:${path}`
  const id = store.pagePaths.get(pathKey)
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found with path: ${path}` } }
  }

  return getPage(store, id)
}
