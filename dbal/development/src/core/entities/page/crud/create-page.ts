/**
 * @file create-page.ts
 * @description Create page operation
 */
import type { CreatePageInput, PageView, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validatePageCreate } from '../validation/validate-page-create'

/**
 * Create a new page in the store
 */
export const createPage = async (
  store: InMemoryStore,
  input: CreatePageInput
): Promise<Result<PageView>> => {
  const isActive = input.isActive ?? true
  const validationErrors = validatePageCreate({
    slug: input.slug,
    title: input.title,
    description: input.description,
    level: input.level,
    layout: input.layout,
    isActive
  })

  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  if (store.pageSlugs.has(input.slug)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Slug already exists' } }
  }

  const page: PageView = {
    id: store.generateId('page'),
    slug: input.slug,
    title: input.title,
    description: input.description,
    level: input.level,
    layout: input.layout,
    isActive,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  store.pages.set(page.id, page)
  store.pageSlugs.set(page.slug, page.id)

  return { success: true, data: page }
}
