/**
 * @file update-page.ts
 * @description Update page operation
 */
import type { PageView, Result, UpdatePageInput } from '../../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'
import { validatePageUpdate } from '../../validation/validate-page-update'

/**
 * Update an existing page
 */
export const updatePage = async (
  store: InMemoryStore,
  id: string,
  input: UpdatePageInput
): Promise<Result<PageView>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const page = store.pages.get(id)
  if (!page) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found: ${id}` } }
  }

  const validationErrors = validatePageUpdate(input)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] } }
  }

  if (input.slug && input.slug !== page.slug) {
    if (store.pageSlugs.has(input.slug)) {
      return { success: false, error: { code: 'CONFLICT', message: 'Slug already exists' } }
    }
    store.pageSlugs.delete(page.slug)
    store.pageSlugs.set(input.slug, id)
    page.slug = input.slug
  }

  if (input.title !== undefined) {
    page.title = input.title
  }

  if (input.description !== undefined) {
    page.description = input.description
  }

  if (input.level !== undefined) {
    page.level = input.level
  }

  if (input.layout !== undefined) {
    page.layout = input.layout
  }

  if (input.isActive !== undefined) {
    page.isActive = input.isActive
  }

  page.updatedAt = new Date()

  return { success: true, data: page }
}
