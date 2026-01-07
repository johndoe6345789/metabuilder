/**
 * @file page-operations.ts
 * @description PageView entity CRUD operations for DBAL client
 */

import type { DBALAdapter } from '../../../../adapters/adapter'
import type { ListOptions, ListResult, PageView } from '../../../foundation/types'
import { DBALError } from '../../../foundation/errors'
import { isValidSlug, validateId, validatePageCreate, validatePageUpdate } from '../../../foundation/validation'

export interface PageOperations {
  create: (data: PageCreatePayload) => Promise<PageView>
  read: (id: string) => Promise<PageView | null>
  readBySlug: (slug: string) => Promise<PageView | null>
  update: (id: string, data: Partial<PageView>) => Promise<PageView>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<PageView>>
}

type PageCreatePayload = Omit<PageView, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'> & { tenantId?: string }

const assertValidId = (id: string) => {
  const errors = validateId(id)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid page ID', errors.map(error => ({ field: 'id', error })))
  }
}

const assertValidSlug = (slug: string) => {
  if (!slug || !isValidSlug(slug)) {
    throw DBALError.validationError('Invalid page slug', [{ field: 'slug', error: 'slug is invalid' }])
  }
}

const assertValidCreate = (data: PageCreatePayload) => {
  const errors = validatePageCreate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid page data', errors.map(error => ({ field: 'page', error })))
  }
}

const assertValidUpdate = (data: Partial<PageView>) => {
  const errors = validatePageUpdate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid page update data', errors.map(error => ({ field: 'page', error })))
  }
}

const resolveTenantId = (configuredTenantId?: string, data?: Partial<PageView>): string | null => {
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

export const createPageOperations = (adapter: DBALAdapter, tenantId?: string): PageOperations => ({
  create: async data => {
    const resolvedTenantId = resolveTenantId(tenantId, data)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    const isActive = data.isActive ?? true
    const payload = { ...data, tenantId: resolvedTenantId, isActive }
    assertValidCreate(payload)
    try {
      return adapter.create('PageView', payload) as Promise<PageView>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        const slug = typeof data.slug === 'string' ? data.slug : 'unknown'
        throw DBALError.conflict(`Page with slug '${slug}' already exists`)
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
    const result = await adapter.findFirst('PageView', { id, tenantId: resolvedTenantId }) as PageView | null
    if (!result) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    return result
  },
  readBySlug: async slug => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidSlug(slug)
    const result = await adapter.findFirst('PageView', { slug, tenantId: resolvedTenantId }) as PageView | null
    if (!result) {
      throw DBALError.notFound(`Page not found with slug: ${slug}`)
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
    const existing = await adapter.findFirst('PageView', { id, tenantId: resolvedTenantId }) as PageView | null
    if (!existing) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    try {
      return adapter.update('PageView', id, data) as Promise<PageView>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        if (typeof data.slug === 'string') {
          throw DBALError.conflict(`Page with slug '${data.slug}' already exists`)
        }
        throw DBALError.conflict('Page slug already exists')
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
    const existing = await adapter.findFirst('PageView', { id, tenantId: resolvedTenantId }) as PageView | null
    if (!existing) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    const result = await adapter.delete('PageView', id)
    if (!result) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    return result
  },
  list: options => {
    const tenantFilter = resolveTenantFilter(tenantId, options?.filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return adapter.list('PageView', { ...options, filter: tenantFilter }) as Promise<ListResult<PageView>>
  },
})
