import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { CreatePackageInput, InstalledPackage, ListOptions, ListResult, UpdatePackageInput } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { createManyInstalledPackages, deleteManyInstalledPackages, updateManyInstalledPackages } from './batch'
import { createInstalledPackage, deleteInstalledPackage, updateInstalledPackage } from './mutations'
import { publishPackage } from './publish'
import { listInstalledPackages } from './reads'
import { unpublishPackage } from './unpublish'
import { validatePackage } from './validate'
import { validateId } from '../../../../foundation/validation'

export interface InstalledPackageOperations {
  validate: (data: Partial<InstalledPackage>) => string[]
  publish: (data: InstalledPackageCreatePayload) => Promise<InstalledPackage>
  unpublish: (id: string) => Promise<boolean>
  create: (data: InstalledPackageCreatePayload) => Promise<InstalledPackage>
  read: (id: string) => Promise<InstalledPackage | null>
  update: (id: string, data: UpdatePackageInput) => Promise<InstalledPackage>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<InstalledPackage>>
  createMany: (data: InstalledPackageCreatePayload[]) => Promise<number>
  updateMany: (filter: Record<string, unknown>, data: UpdatePackageInput) => Promise<number>
  deleteMany: (filter: Record<string, unknown>) => Promise<number>
}

type InstalledPackageCreatePayload = CreatePackageInput

const resolveTenantId = (configuredTenantId?: string, data?: Partial<InstalledPackage>): string | null => {
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

const withInstalledPackageDefaults = (data: CreatePackageInput): InstalledPackage => {
  const installedAt = data.installedAt ?? BigInt(Date.now())
  return {
    packageId: data.packageId,
    tenantId: data.tenantId ?? null,
    installedAt,
    version: data.version,
    enabled: data.enabled,
    config: data.config ?? null,
  }
}

export const createInstalledPackageOperations = (adapter: DBALAdapter, tenantId?: string): InstalledPackageOperations => ({
  validate: data => validatePackage(data),
  publish: data => {
    const resolvedTenantId = resolveTenantId(tenantId, data)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(data.packageId)
    return publishPackage(adapter, withInstalledPackageDefaults({ ...data, tenantId: resolvedTenantId }))
  },
  unpublish: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const existing = await adapter.findFirst('InstalledPackage', { packageId: id, tenantId: resolvedTenantId }) as InstalledPackage | null
    if (!existing) {
      throw DBALError.notFound(`Installed package not found: ${id}`)
    }
    return unpublishPackage(adapter, id)
  },
  create: data => {
    const resolvedTenantId = resolveTenantId(tenantId, data)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(data.packageId)
    const payload = withInstalledPackageDefaults({ ...data, tenantId: resolvedTenantId })
    return createInstalledPackage(adapter, payload)
  },
  read: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const result = await adapter.findFirst('InstalledPackage', { packageId: id, tenantId: resolvedTenantId }) as InstalledPackage | null
    if (!result) {
      throw DBALError.notFound(`Installed package not found: ${id}`)
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
    const existing = await adapter.findFirst('InstalledPackage', { packageId: id, tenantId: resolvedTenantId }) as InstalledPackage | null
    if (!existing) {
      throw DBALError.notFound(`Installed package not found: ${id}`)
    }
    return updateInstalledPackage(adapter, id, data)
  },
  delete: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const existing = await adapter.findFirst('InstalledPackage', { packageId: id, tenantId: resolvedTenantId }) as InstalledPackage | null
    if (!existing) {
      throw DBALError.notFound(`Installed package not found: ${id}`)
    }
    return deleteInstalledPackage(adapter, id)
  },
  list: options => {
    const tenantFilter = resolveTenantFilter(tenantId, options?.filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return listInstalledPackages(adapter, { ...options, filter: tenantFilter })
  },
  createMany: data => {
    const payload = data.map((item, index) => {
      const resolvedTenantId = resolveTenantId(tenantId, item)
      if (!resolvedTenantId) {
        throw DBALError.validationError('Tenant ID is required', [
          { field: `packages[${index}].tenantId`, error: 'tenantId is required' },
        ])
      }
      assertValidId(item.packageId)
      return withInstalledPackageDefaults({ ...item, tenantId: resolvedTenantId })
    })
    return createManyInstalledPackages(adapter, payload)
  },
  updateMany: (filter, data) => {
    const tenantFilter = resolveTenantFilter(tenantId, filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    if (data.tenantId !== undefined) {
      throw DBALError.validationError('Tenant ID cannot be updated', [{ field: 'tenantId', error: 'tenantId is immutable' }])
    }
    return updateManyInstalledPackages(adapter, tenantFilter, data)
  },
  deleteMany: filter => {
    const tenantFilter = resolveTenantFilter(tenantId, filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return deleteManyInstalledPackages(adapter, tenantFilter)
  },
})

export const createPackageOperations = createInstalledPackageOperations

export { publishPackage } from './publish'
export { unpublishPackage } from './unpublish'
export { validatePackage } from './validate'
