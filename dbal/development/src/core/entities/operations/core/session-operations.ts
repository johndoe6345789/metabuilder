/**
 * @file session-operations.ts
 * @description Session entity CRUD operations for DBAL client
 */

import { randomUUID } from 'crypto'
import type { DBALAdapter } from '../../../../adapters/adapter'
import { DBALError } from '../../../foundation/errors'
import type { CreateSessionInput, ListOptions, ListResult, Session, UpdateSessionInput } from '../../../foundation/types'
import { validateId, validateSessionCreate, validateSessionUpdate } from '../../../foundation/validation'

/**
 * Create session operations object for the DBAL client
 */
export interface SessionOperations {
  create: (data: CreateSessionInput) => Promise<Session>
  read: (id: string) => Promise<Session | null>
  update: (id: string, data: UpdateSessionInput) => Promise<Session>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<Session>>
}

const assertValidId = (id: string) => {
  const errors = validateId(id)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid session ID', errors.map(error => ({ field: 'id', error })))
  }
}

const assertValidCreate = (data: CreateSessionInput | Session) => {
  const errors = validateSessionCreate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid session data', errors.map(error => ({ field: 'session', error })))
  }
}

const assertValidUpdate = (data: UpdateSessionInput) => {
  const errors = validateSessionUpdate(data)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid session update data', errors.map(error => ({ field: 'session', error })))
  }
}

const resolveTenantId = (configuredTenantId?: string): string | null => {
  if (configuredTenantId && configuredTenantId.length > 0) return configuredTenantId
  return null
}

const assertUserInTenant = async (adapter: DBALAdapter, userId: string, tenantId: string) => {
  const user = await adapter.findFirst('User', { id: userId, tenantId }) as { id?: string } | null
  if (!user) {
    throw DBALError.notFound(`User not found: ${userId}`)
  }
}

export const createSessionOperations = (adapter: DBALAdapter, tenantId?: string): SessionOperations => ({
  /**
   * Create a new session
   */
  create: async (data): Promise<Session> => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    const now = BigInt(Date.now())
    const payload: Session = {
      id: data.id ?? randomUUID(),
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt ?? now,
      lastActivity: data.lastActivity ?? now,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    }
    assertValidCreate(payload)
    await assertUserInTenant(adapter, payload.userId, resolvedTenantId)
    return adapter.create('Session', payload as unknown as Record<string, unknown>) as Promise<Session>
  },

  /**
   * Read a session by ID
   */
  read: async (id: string): Promise<Session | null> => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const result = await adapter.read('Session', id) as Session | null
    if (!result) {
      throw DBALError.notFound(`Session not found: ${id}`)
    }
    await assertUserInTenant(adapter, result.userId, resolvedTenantId)
    return result
  },

  /**
   * Update an existing session
   */
  update: async (id: string, data: UpdateSessionInput): Promise<Session> => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    assertValidUpdate(data)
    const existing = await adapter.read('Session', id) as Session | null
    if (!existing) {
      throw DBALError.notFound(`Session not found: ${id}`)
    }
    await assertUserInTenant(adapter, existing.userId, resolvedTenantId)
    return adapter.update('Session', id, data as unknown as Record<string, unknown>) as Promise<Session>
  },

  /**
   * Delete a session by ID
   */
  delete: async (id: string): Promise<boolean> => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    assertValidId(id)
    const existing = await adapter.read('Session', id) as Session | null
    if (!existing) {
      throw DBALError.notFound(`Session not found: ${id}`)
    }
    await assertUserInTenant(adapter, existing.userId, resolvedTenantId)
    const result = await adapter.delete('Session', id)
    if (!result) {
      throw DBALError.notFound(`Session not found: ${id}`)
    }
    return result
  },

  /**
   * List sessions with filtering and pagination
   */
  list: async (options?: ListOptions): Promise<ListResult<Session>> => {
    const resolvedTenantId = resolveTenantId(tenantId)
    if (!resolvedTenantId) {
      throw DBALError.validationError('Tenant ID is required', [{ field: 'tenantId', error: 'tenantId is required' }])
    }
    const userId = options?.filter?.userId
    if (typeof userId !== 'string' || userId.length === 0) {
      throw DBALError.validationError('userId filter is required for session listing', [
        { field: 'filter.userId', error: 'userId is required' },
      ])
    }
    await assertUserInTenant(adapter, userId, resolvedTenantId)
    return adapter.list('Session', options) as Promise<ListResult<Session>>
  },
})
