/**
 * @file page-operations.ts
 * @description PageConfig entity CRUD operations for DBAL client
 */

import { randomUUID } from 'crypto'
import type { DBALAdapter } from '../../../../adapters/adapter'
import type { CreatePageInput, ListOptions, ListResult, PageConfig, UpdatePageInput } from '../../../foundation/types'
import { DBALError } from '../../../foundation/errors'
import { validateId, validatePageCreate, validatePageUpdate } from '../../../foundation/validation'

export interface PageConfigOperations {
  create: (data: CreatePageInput) => Promise<PageConfig>
  read: (id: string) => Promise<PageConfig | null>
  readByPath: (path: string) => Promise<PageConfig | null>
  update: (id: string, data: UpdatePageInput) => Promise<PageConfig>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<PageConfig>>
}

const assertValidId = (id: string) => {
  const errors = validateId(id)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid page ID', errors.map(error => ({ field: 'id', error })))
  }
}

const assertValidPath = (path: string) => {
  if (!path || typeof path !== 'string' || path.trim().length === 0) {
    throw DBALError.validationError('Invalid page path', [{ field: 'path', error: 'path is invalid' }])
  }
}

const assertValidCreate = (data: CreatePageInput) => {
  const errors = validatePageCreate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid page data', errors.map(error => ({ field: 'page', error })))
  }
}

const assertValidUpdate = (data: UpdatePageInput) => {
  const errors = validatePageUpdate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid page update data', errors.map(error => ({ field: 'page', error })))
  }
}

const resolveTenantId = (configuredTenantId?: string, data?: Partial<PageConfig>): string | null => {
  if (configuredTenantId && configuredTenantId.length > 0) return configuredTenantId
  const candidate = data?.tenantId
  if (typeof candidate === 'string' && candidate.length > 0) return candidate
  return null
}

const resolveTenantFilter = (
  configuredTenantId: string | undefined,
  filter?: Record<string, unknown>,
): Record<string, unknown> | null => {
  if (configuredTenantId && configuredTenantId.length > 0) {
    return { ...(filter ?? {}), tenantId: configuredTenantId }
  }
  const candidate = filter?.tenantId ?? filter?.tenant_id
  if (typeof candidate === 'string' && candidate.length > 0) {
    return { ...(filter ?? {}), tenantId: candidate }
  }
  return null
}

const withPageDefaults = (data: CreatePageInput): PageConfig => {
  const now = BigInt(Date.now())
  return {
    id: data.id ?? randomUUID(),
    tenantId: data.tenantId ?? null,
    packageId: data.packageId ?? null,
    path: data.path,
    title: data.title,
    description: data.description ?? null,
    icon: data.icon ?? null,
    component: data.component ?? null,
    componentTree: data.componentTree,
    level: data.level,
    requiresAuth: data.requiresAuth,
    requiredRole: data.requiredRole ?? null,
    parentPath: data.parentPath ?? null,
    sortOrder: data.sortOrder ?? 0,
    isPublished: data.isPublished ?? true,
    params: data.params ?? null,
    meta: data.meta ?? null,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  }
}

export const createPageConfigOperations = (adapter: DBALAdapter, tenantId?: string): PageConfigOperations => ({
  create: async data => {
    const resolvedTenantId = resolveTenantId(tenantId, data)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    const payload = withPageDefaults({ ...data, tenantId: resolvedTenantId })
    assertValidCreate(payload)
    try {
      return adapter.create('PageConfig', payload) as Promise<PageConfig>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict(`Page with path '${data.path}' already exists`)
      }
      throw error
    }
  },
  read: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const result = await adapter.findFirst('PageConfig', { id, tenantId: resolvedTenantId }) as PageConfig | null
    if (!result) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    return result
  },
  readByPath: async path => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidPath(path)
    const result = await adapter.findFirst('PageConfig', { path, tenantId: resolvedTenantId }) as PageConfig | null
    if (!result) {
      throw DBALError.notFound(`Page not found with path: ${path}`)
    }
    return result
  },
  update: async (id, data) => {
    if (data.tenantId !== undefined) {
      throw DBALError.validationError('Tenant ID cannot be updated', [{ field: 'tenantId', error: 'tenantId is immutable' }])
    }
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    assertValidUpdate(data)
    const existing = await adapter.findFirst('PageConfig', { id, tenantId: resolvedTenantId }) as PageConfig | null
    if (!existing) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    try {
      return adapter.update('PageConfig', id, data) as Promise<PageConfig>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict('Page path already exists')
      }
      throw error
    }
  },
  delete: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const existing = await adapter.findFirst('PageConfig', { id, tenantId: resolvedTenantId }) as PageConfig | null
    if (!existing) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    const result = await adapter.delete('PageConfig', id)
    if (!result) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    return result
  },
  list: options => {
    // For public pages, allow listing pages with tenantId: null
    const tenantFilter = resolveTenantFilter(tenantId, options?.filter)
    if (!tenantFilter && !tenantId) {
      // No configured tenant and no filter provided - allow listing public pages (tenantId: null)
      return adapter.list('PageConfig', { ...options, filter: { ...(options?.filter ?? {}), tenantId: null } }) as Promise<ListResult<PageConfig>>
    }
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return adapter.list('PageConfig', { ...options, filter: tenantFilter }) as Promise<ListResult<PageConfig>>
  },
})

export const createPageOperations = createPageConfigOperations
