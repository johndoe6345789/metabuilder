/**
 * @file component-operations.ts
 * @description ComponentNode entity CRUD operations for DBAL client
 */

import { randomUUID } from 'crypto'
import type { DBALAdapter } from '../../../../adapters/adapter'
import type {
  ComponentNode,
  CreateComponentNodeInput,
  ListResult,
  PageConfig,
  UpdateComponentNodeInput,
} from '../../../foundation/types'
import { DBALError } from '../../../foundation/errors'
import { validateComponentHierarchyCreate, validateComponentHierarchyUpdate, validateId } from '../../../foundation/validation'

export interface ComponentNodeOperations {
  create: (data: CreateComponentNodeInput) => Promise<ComponentNode>
  read: (id: string) => Promise<ComponentNode | null>
  update: (id: string, data: UpdateComponentNodeInput) => Promise<ComponentNode>
  delete: (id: string) => Promise<boolean>
  getTree: (pageId: string) => Promise<ComponentNode[]>
}

const assertValidId = (id: string) => {
  const errors = validateId(id)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid component ID', errors.map(error => ({ field: 'id', error })))
  }
}

const assertValidCreate = (data: CreateComponentNodeInput) => {
  const errors = validateComponentHierarchyCreate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid component data', errors.map(error => ({ field: 'component', error })))
  }
}

const assertValidUpdate = (data: UpdateComponentNodeInput) => {
  const errors = validateComponentHierarchyUpdate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid component update data', errors.map(error => ({ field: 'component', error })))
  }
}

const resolveTenantId = (configuredTenantId?: string, data?: { tenantId?: string | null }): string | null => {
  if (configuredTenantId && configuredTenantId.length > 0) return configuredTenantId
  const candidate = data?.tenantId
  if (typeof candidate === 'string' && candidate.length > 0) return candidate
  return null
}

const assertPageTenant = async (adapter: DBALAdapter, tenantId: string, pageId: string) => {
  const page = await adapter.findFirst('PageConfig', { id: pageId, tenantId }) as PageConfig | null
  if (!page) {
    throw DBALError.notFound(`Page not found: ${pageId}`)
  }
}

const withComponentDefaults = (data: CreateComponentNodeInput): ComponentNode => ({
  id: data.id ?? randomUUID(),
  type: data.type,
  parentId: data.parentId ?? null,
  childIds: data.childIds,
  order: data.order,
  pageId: data.pageId,
})

export const createComponentNodeOperations = (adapter: DBALAdapter, tenantId?: string): ComponentNodeOperations => ({
  create: async data => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidCreate(data)
    await assertPageTenant(adapter, resolvedTenantId, data.pageId)
    const payload = withComponentDefaults(data)
    return adapter.create('ComponentNode', payload) as Promise<ComponentNode>
  },
  read: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const result = await adapter.findFirst('ComponentNode', { id }) as ComponentNode | null
    if (!result) {
      throw DBALError.notFound(`Component not found: ${id}`)
    }
    await assertPageTenant(adapter, resolvedTenantId, result.pageId)
    return result
  },
  update: async (id, data) => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    assertValidUpdate(data)
    const existing = await adapter.findFirst('ComponentNode', { id }) as ComponentNode | null
    if (!existing) {
      throw DBALError.notFound(`Component not found: ${id}`)
    }
    await assertPageTenant(adapter, resolvedTenantId, existing.pageId)
    if (data.pageId) {
      await assertPageTenant(adapter, resolvedTenantId, data.pageId)
    }
    return adapter.update('ComponentNode', id, data) as Promise<ComponentNode>
  },
  delete: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const existing = await adapter.findFirst('ComponentNode', { id }) as ComponentNode | null
    if (!existing) {
      throw DBALError.notFound(`Component not found: ${id}`)
    }
    await assertPageTenant(adapter, resolvedTenantId, existing.pageId)
    const result = await adapter.delete('ComponentNode', id)
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
    const result = await adapter.list('ComponentNode', {
      filter: { pageId },
      sort: { order: 'asc' },
    }) as ListResult<ComponentNode>
    return result.data
  },
})

export const createComponentOperations = createComponentNodeOperations
