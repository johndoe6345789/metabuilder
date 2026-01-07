/**
 * @file create-page.ts
 * @description Create page operation
 */
import type { CreatePageInput, PageConfig, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validatePageCreate } from '../validation/validate-page-create'

/**
 * Create a new page config in the store
 */
export const createPage = async (
  store: InMemoryStore,
  input: CreatePageInput
): Promise<Result<PageConfig>> => {
  const now = BigInt(Date.now())
  const payload: PageConfig = {
    id: input.id ?? store.generateId('page'),
    tenantId: input.tenantId ?? null,
    packageId: input.packageId ?? null,
    path: input.path,
    title: input.title,
    description: input.description ?? null,
    icon: input.icon ?? null,
    component: input.component ?? null,
    componentTree: input.componentTree,
    level: input.level,
    requiresAuth: input.requiresAuth,
    requiredRole: input.requiredRole ?? null,
    parentPath: input.parentPath ?? null,
    sortOrder: input.sortOrder ?? 0,
    isPublished: input.isPublished ?? true,
    params: input.params ?? null,
    meta: input.meta ?? null,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now
  }

  const validationErrors = validatePageCreate(payload)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  const pathKey = `${payload.tenantId ?? 'global'}:${payload.path}`
  if (store.pagePaths.has(pathKey)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Path already exists' } }
  }

  store.pageConfigs.set(payload.id, payload)
  store.pagePaths.set(pathKey, payload.id)

  return { success: true, data: payload }
}
