/**
 * @file update-page.ts
 * @description Update page operation
 */
import type { PageConfig, Result, UpdatePageInput } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'
import { validatePageUpdate } from '../validation/validate-page-update'

/**
 * Update an existing page config
 */
export const updatePage = async (
  store: InMemoryStore,
  id: string,
  input: UpdatePageInput
): Promise<Result<PageConfig>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  if (input.tenantId !== undefined) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'tenantId is immutable' } }
  }

  const page = store.pageConfigs.get(id)
  if (!page) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found: ${id}` } }
  }

  const validationErrors = validatePageUpdate(input)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  if (input.path && input.path !== page.path) {
    const existingKey = `${page.tenantId ?? 'global'}:${page.path}`
    const nextKey = `${page.tenantId ?? 'global'}:${input.path}`
    if (store.pagePaths.has(nextKey)) {
      return { success: false, error: { code: 'CONFLICT', message: 'Path already exists' } }
    }
    store.pagePaths.delete(existingKey)
    store.pagePaths.set(nextKey, id)
    page.path = input.path
  }

  if (input.title !== undefined) {
    page.title = input.title
  }

  if (input.description !== undefined) {
    page.description = input.description ?? null
  }

  if (input.icon !== undefined) {
    page.icon = input.icon ?? null
  }

  if (input.component !== undefined) {
    page.component = input.component ?? null
  }

  if (input.componentTree !== undefined) {
    page.componentTree = input.componentTree
  }

  if (input.level !== undefined) {
    page.level = input.level
  }

  if (input.requiresAuth !== undefined) {
    page.requiresAuth = input.requiresAuth
  }

  if (input.requiredRole !== undefined) {
    page.requiredRole = input.requiredRole ?? null
  }

  if (input.parentPath !== undefined) {
    page.parentPath = input.parentPath ?? null
  }

  if (input.sortOrder !== undefined) {
    page.sortOrder = input.sortOrder
  }

  if (input.isPublished !== undefined) {
    page.isPublished = input.isPublished
  }

  if (input.params !== undefined) {
    page.params = input.params ?? null
  }

  if (input.meta !== undefined) {
    page.meta = input.meta ?? null
  }

  if (input.packageId !== undefined) {
    page.packageId = input.packageId ?? null
  }

  page.updatedAt = input.updatedAt ?? BigInt(Date.now())

  return { success: true, data: page }
}
