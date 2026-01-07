/**
 * @file lua-script-operations.ts
 * @description LuaScript entity CRUD operations for DBAL client
 */

import type { DBALAdapter } from '../../../../adapters/adapter'
import { DBALError } from '../../../foundation/errors'
import type { ListOptions, ListResult, LuaScript } from '../../../foundation/types'
import { validateId, validateLuaScriptCreate, validateLuaScriptUpdate } from '../../../foundation/validation'

export interface LuaScriptOperations {
  create: (data: LuaScriptCreatePayload) => Promise<LuaScript>
  read: (id: string) => Promise<LuaScript | null>
  update: (id: string, data: Partial<LuaScript>) => Promise<LuaScript>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<LuaScript>>
}

type LuaScriptCreatePayload = Omit<LuaScript, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'> & { tenantId?: string }

const assertValidId = (id: string) => {
  const errors = validateId(id)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid Lua script ID', errors.map(error => ({ field: 'id', error })))
  }
}

const assertValidCreate = (data: LuaScriptCreatePayload) => {
  const errors = validateLuaScriptCreate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid Lua script data', errors.map(error => ({ field: 'luaScript', error })))
  }
}

const assertValidUpdate = (data: Partial<LuaScript>) => {
  const errors = validateLuaScriptUpdate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid Lua script update data', errors.map(error => ({ field: 'luaScript', error })))
  }
}

const resolveTenantId = (configuredTenantId?: string, data?: Partial<LuaScript>): string | null => {
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

export const createLuaScriptOperations = (adapter: DBALAdapter, tenantId?: string): LuaScriptOperations => ({
  create: async data => {
    const resolvedTenantId = resolveTenantId(tenantId, data)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidCreate(data)
    const payload = { ...data, tenantId: resolvedTenantId }
    try {
      return adapter.create('LuaScript', payload) as Promise<LuaScript>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        const name = typeof data.name === 'string' ? data.name : 'unknown'
        throw DBALError.conflict(`Lua script with name '${name}' already exists`)
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
    const result = await adapter.findFirst('LuaScript', { id, tenantId: resolvedTenantId }) as LuaScript | null
    if (!result) {
      throw DBALError.notFound(`Lua script not found: ${id}`)
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
    const existing = await adapter.findFirst('LuaScript', { id, tenantId: resolvedTenantId }) as LuaScript | null
    if (!existing) {
      throw DBALError.notFound(`Lua script not found: ${id}`)
    }
    try {
      return adapter.update('LuaScript', id, data) as Promise<LuaScript>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        if (typeof data.name === 'string') {
          throw DBALError.conflict(`Lua script with name '${data.name}' already exists`)
        }
        throw DBALError.conflict('Lua script name already exists')
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
    const existing = await adapter.findFirst('LuaScript', { id, tenantId: resolvedTenantId }) as LuaScript | null
    if (!existing) {
      throw DBALError.notFound(`Lua script not found: ${id}`)
    }
    const result = await adapter.delete('LuaScript', id)
    if (!result) {
      throw DBALError.notFound(`Lua script not found: ${id}`)
    }
    return result
  },
  list: options => {
    const tenantFilter = resolveTenantFilter(tenantId, options?.filter)
    if (!tenantFilter) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    return adapter.list('LuaScript', { ...options, filter: tenantFilter }) as Promise<ListResult<LuaScript>>
  },
})
