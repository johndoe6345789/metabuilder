/**
 * @file session-operations.ts
 * @description Session entity CRUD operations for DBAL client
 * 
 * Single-responsibility module following the small-function-file pattern.
 */

import type { DBALAdapter } from '../../adapters/adapter'
import type { Session, ListOptions, ListResult } from '../types'
import { DBALError } from '../errors'
import { validateSessionCreate, validateSessionUpdate, validateId } from '../validation'

/**
 * Create session operations object for the DBAL client
 */
export const createSessionOperations = (adapter: DBALAdapter) => ({
  /**
   * Create a new session
   */
  create: async (data: Omit<Session, 'id' | 'createdAt' | 'lastActivity'>): Promise<Session> => {
    const validationErrors = validateSessionCreate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid session data',
        validationErrors.map(error => ({ field: 'session', error }))
      )
    }

    try {
      return adapter.create('Session', data) as Promise<Session>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict('Session token already exists')
      }
      throw error
    }
  },

  /**
   * Read a session by ID
   */
  read: async (id: string): Promise<Session | null> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid session ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    const result = await adapter.read('Session', id) as Session | null
    if (!result) {
      throw DBALError.notFound(`Session not found: ${id}`)
    }
    return result
  },

  /**
   * Update an existing session
   */
  update: async (id: string, data: Partial<Session>): Promise<Session> => {
    const idErrors = validateId(id)
    if (idErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid session ID',
        idErrors.map(error => ({ field: 'id', error }))
      )
    }

    const validationErrors = validateSessionUpdate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid session update data',
        validationErrors.map(error => ({ field: 'session', error }))
      )
    }

    try {
      return adapter.update('Session', id, data) as Promise<Session>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict('Session token already exists')
      }
      throw error
    }
  },

  /**
   * Delete a session by ID
   */
  delete: async (id: string): Promise<boolean> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid session ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

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
    return adapter.list('Session', options) as Promise<ListResult<Session>>
  },
})
