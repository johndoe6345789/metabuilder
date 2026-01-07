import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { Package, ListOptions, ListResult } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { createManyPackages, deleteManyPackages, updateManyPackages } from './batch'
import { createPackage, deletePackage, updatePackage } from './mutations'
import { publishPackage } from './publish'
import { listPackages } from './reads'
import { unpublishPackage } from './unpublish'
import { validatePackage } from './validate'
import { validateId } from '../../../../foundation/validation'

export interface PackageOperations {
  validate: (data: Partial<Package>) => string[]
  publish: (data: PackageCreatePayload) => Promise<Package>
  unpublish: (id: string) => Promise<boolean>
  create: (data: PackageCreatePayload) => Promise<Package>
  read: (id: string) => Promise<Package | null>
  update: (id: string, data: Partial<Package>) => Promise<Package>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<Package>>
  createMany: (data: PackageCreatePayload[]) => Promise<number>
  updateMany: (filter: Record<string, unknown>, data: Partial<Package>) => Promise<number>
  deleteMany: (filter: Record<string, unknown>) => Promise<number>
}

type PackageCreatePayload = Omit<Package, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'> & { tenantId?: string }

const resolveTenantId = (configuredTenantId?: string, data?: Partial<Package>): string | null => {
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

const assertValidId = (id: string) => {
  const errors = validateId(id)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid package ID', errors.map(error => ({ field: 'id', error })))
  }
}

export const createPackageOperations = (adapter: DBALAdapter, tenantId?: string): PackageOperations => ({
  validate: data => validatePackage(data),
  publish: data => {
    const resolvedTenantId = resolveTenantId(tenantId, data)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return publishPackage(adapter, { ...data, tenantId: resolvedTenantId })
  },
  unpublish: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const existing = await adapter.findFirst('Package', { id, tenantId: resolvedTenantId }) as Package | null
    if (!existing) {
      throw DBALError.notFound(`Package not found: ${id}`)
    }
    return unpublishPackage(adapter, id)
  },
  create: data => {
    const resolvedTenantId = resolveTenantId(tenantId, data)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return createPackage(adapter, { ...data, tenantId: resolvedTenantId })
  },
  read: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const result = await adapter.findFirst('Package', { id, tenantId: resolvedTenantId }) as Package | null
    if (!result) {
      throw DBALError.notFound(`Package not found: ${id}`)
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
    const existing = await adapter.findFirst('Package', { id, tenantId: resolvedTenantId }) as Package | null
    if (!existing) {
      throw DBALError.notFound(`Package not found: ${id}`)
    }
    return updatePackage(adapter, id, data)
  },
  delete: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const existing = await adapter.findFirst('Package', { id, tenantId: resolvedTenantId }) as Package | null
    if (!existing) {
      throw DBALError.notFound(`Package not found: ${id}`)
    }
    return deletePackage(adapter, id)
  },
  list: options => {
    const tenantFilter = resolveTenantFilter(tenantId, options?.filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return listPackages(adapter, { ...options, filter: tenantFilter })
  },
  createMany: data => {
    const payload = data.map((item, index) => {
      const resolvedTenantId = resolveTenantId(tenantId, item)
      if (!resolvedTenantId) {
        throw DBALError.validationError('Tenant ID is required', [
          { field: `packages[${index}].tenantId`, error: 'tenantId is required' },
        ])
      }
      return { ...item, tenantId: resolvedTenantId }
    })
    return createManyPackages(adapter, payload)
  },
  updateMany: (filter, data) => {
    const tenantFilter = resolveTenantFilter(tenantId, filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    if (data.tenantId !== undefined) {
      throw DBALError.validationError('Tenant ID cannot be updated', [{ field: 'tenantId', error: 'tenantId is immutable' }])
    }
    return updateManyPackages(adapter, tenantFilter, data)
  },
  deleteMany: filter => {
    const tenantFilter = resolveTenantFilter(tenantId, filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return deleteManyPackages(adapter, tenantFilter)
  },
})

export { publishPackage } from './publish'
export { unpublishPackage } from './unpublish'
export { validatePackage } from './validate'
