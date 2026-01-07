import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { CreateUserInput, ListOptions, ListResult, UpdateUserInput, User } from '../../../../../core/foundation/types'
import { DBALError } from '../../../../../core/foundation/errors'
import { createManyUsers, deleteManyUsers, updateManyUsers } from './batch'
import { createUser } from './create'
import { deleteUser } from './delete'
import { listUsers, readUser } from './reads'
import { updateUser } from './update'

export interface UserOperations {
  create: (data: CreateUserInput) => Promise<User>
  read: (id: string) => Promise<User | null>
  update: (id: string, data: UpdateUserInput) => Promise<User>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<User>>
  createMany: (data: CreateUserInput[]) => Promise<number>
  updateMany: (filter: Record<string, unknown>, data: UpdateUserInput) => Promise<number>
  deleteMany: (filter: Record<string, unknown>) => Promise<number>
}

const resolveTenantId = (configuredTenantId?: string, data?: Partial<User>): string | null => {
  if (configuredTenantId && configuredTenantId.length > 0) return configuredTenantId
  const tenantId = data?.tenantId
  if (typeof tenantId === 'string' && tenantId.length > 0) return tenantId
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

export const createUserOperations = (adapter: DBALAdapter, tenantId?: string): UserOperations => ({
  create: data => {
    const resolvedTenantId = resolveTenantId(tenantId, data)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return createUser(adapter, { ...data, tenantId: resolvedTenantId })
  },
  read: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    const result = await adapter.findFirst('User', { id, tenantId: resolvedTenantId }) as User | null
    if (!result) {
      throw DBALError.notFound(`User not found: ${id}`)
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
    const existing = await adapter.findFirst('User', { id, tenantId: resolvedTenantId }) as User | null
    if (!existing) {
      throw DBALError.notFound(`User not found: ${id}`)
    }
    return updateUser(adapter, id, data)
  },
  delete: async id => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    const existing = await adapter.findFirst('User', { id, tenantId: resolvedTenantId }) as User | null
    if (!existing) {
      throw DBALError.notFound(`User not found: ${id}`)
    }
    return deleteUser(adapter, id)
  },
  list: options => {
    const tenantFilter = resolveTenantFilter(tenantId, options?.filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return listUsers(adapter, { ...options, filter: tenantFilter })
  },
  createMany: data => {
    const payload = data.map((item, index) => {
      const resolvedTenantId = resolveTenantId(tenantId, item)
      if (!resolvedTenantId) {
        throw DBALError.validationError('Tenant ID is required', [
          { field: `users[${index}].tenantId`, error: 'tenantId is required' },
        ])
      }
      return { ...item, tenantId: resolvedTenantId }
    })
    return createManyUsers(adapter, payload)
  },
  updateMany: (filter, data) => {
    const tenantFilter = resolveTenantFilter(tenantId, filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    if (data.tenantId !== undefined) {
      throw DBALError.validationError('Tenant ID cannot be updated', [{ field: 'tenantId', error: 'tenantId is immutable' }])
    }
    return updateManyUsers(adapter, tenantFilter, data)
  },
  deleteMany: filter => {
    const tenantFilter = resolveTenantFilter(tenantId, filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return deleteManyUsers(adapter, tenantFilter)
  },
})
