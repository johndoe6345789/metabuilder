/**
 * @file component-operations.ts
 * @description ComponentHierarchy entity CRUD operations for DBAL client
 */

import type { DBALAdapter } from '../../../../adapters/adapter'
import type { ComponentHierarchy, ListResult, PageView } from '../../../foundation/types'
import { DBALError } from '../../../foundation/errors'
import { validateComponentHierarchyCreate, validateComponentHierarchyUpdate, validateId } from '../../../foundation/validation'

export interface ComponentOperations {
  create: (data: ComponentCreatePayload) => Promise<ComponentHierarchy>
  read: (id: string) => Promise<ComponentHierarchy | null>
  update: (id: string, data: Partial<ComponentHierarchy>) => Promise<ComponentHierarchy>
  delete: (id: string) => Promise<boolean>
  getTree: (pageId: string) => Promise<ComponentHierarchy[]>
}

type ComponentCreatePayload = Omit<ComponentHierarchy, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'> & { tenantId?: string }

const assertValidId = (id: string) => {
  const errors = validateId(id)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid component ID', errors.map(error => ({ field: 'id', error })))
  }
}

const assertValidCreate = (data: ComponentCreatePayload) => {
  const errors = validateComponentHierarchyCreate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid component data', errors.map(error => ({ field: 'component', error })))
  }
}

const assertValidUpdate = (data: Partial<ComponentHierarchy>) => {
  const errors = validateComponentHierarchyUpdate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid component update data', errors.map(error => ({ field: 'component', error })))
  }
}

const resolveTenantId = (configuredTenantId?: string, data?: Partial<ComponentHierarchy>): string | null => {
  if (configuredTenantId && configuredTenantId.length > 0) return configuredTenantId
  const candidate = data?.tenantId
  if (typeof candidate === 'string' && candidate.length > 0) return candidate
  return null
}

const assertPageTenant = async (adapter: DBALAdapter, tenantId: string, pageId: string) => {
  const page = await adapter.findFirst('PageView', { id: pageId, tenantId }) as PageView | null
  if (!page) {
    throw DBALError.notFound(`Page not found: ${pageId}`)
  }
}

export const createComponentOperations = (adapter: DBALAdapter, tenantId?: string): ComponentOperations => ({
  create: async data => {
    const resolvedTenantId = resolveTenantId(tenantId, data)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidCreate(data)
    await assertPageTenant(adapter, resolvedTenantId, data.pageId)
    const payload = { ...data, tenantId: resolvedTenantId }
    return adapter.create('ComponentHierarchy', payload) as Promise<ComponentHierarchy>
  },
  read: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const result = await adapter.findFirst('ComponentHierarchy', { id, tenantId: resolvedTenantId }) as ComponentHierarchy | null
    if (!result) {
      throw DBALError.notFound(`Component not found: ${id}`)
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
    if (data.pageId) {
      await assertPageTenant(adapter, resolvedTenantId, data.pageId)
    }
    const existing = await adapter.findFirst('ComponentHierarchy', { id, tenantId: resolvedTenantId }) as ComponentHierarchy | null
    if (!existing) {
      throw DBALError.notFound(`Component not found: ${id}`)
    }
    return adapter.update('ComponentHierarchy', id, data) as Promise<ComponentHierarchy>
  },
  delete: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const existing = await adapter.findFirst('ComponentHierarchy', { id, tenantId: resolvedTenantId }) as ComponentHierarchy | null
    if (!existing) {
      throw DBALError.notFound(`Component not found: ${id}`)
    }
    const result = await adapter.delete('ComponentHierarchy', id)
    if (!result) {
      throw DBALError.notFound(`Component not found: ${id}`)
    }
    return result
  },
  getTree: async pageId => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(pageId)
    await assertPageTenant(adapter, resolvedTenantId, pageId)
    const result = await adapter.list('ComponentHierarchy', {
      filter: { pageId, tenantId: resolvedTenantId },
      sort: { order: 'asc' },
    }) as ListResult<ComponentHierarchy>
    return result.data
  },
})
