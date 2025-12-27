/**
 * @file user-operations.ts
 * @description User entity CRUD operations for DBAL client
 * 
 * Single-responsibility module following the small-function-file pattern.
 */

import type { DBALAdapter } from '../../adapters/adapter'
import type { User, ListOptions, ListResult } from '../types'
import { DBALError } from '../errors'
import { validateUserCreate, validateUserUpdate, validateId } from '../validation'

/**
 * Create user operations object for the DBAL client
 */
export const createUserOperations = (adapter: DBALAdapter) => ({
  /**
   * Create a new user
   */
  create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const validationErrors = validateUserCreate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid user data',
        validationErrors.map(error => ({ field: 'user', error }))
      )
    }

    try {
      return adapter.create('User', data) as Promise<User>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict(`User with username or email already exists`)
      }
      throw error
    }
  },

  /**
   * Read a user by ID
   */
  read: async (id: string): Promise<User | null> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid user ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    const result = await adapter.read('User', id) as User | null
    if (!result) {
      throw DBALError.notFound(`User not found: ${id}`)
    }
    return result
  },

  /**
   * Update an existing user
   */
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const idErrors = validateId(id)
    if (idErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid user ID',
        idErrors.map(error => ({ field: 'id', error }))
      )
    }

    const validationErrors = validateUserUpdate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid user update data',
        validationErrors.map(error => ({ field: 'user', error }))
      )
    }

    try {
      return adapter.update('User', id, data) as Promise<User>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict(`Username or email already exists`)
      }
      throw error
    }
  },

  /**
   * Delete a user by ID
   */
  delete: async (id: string): Promise<boolean> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid user ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    const result = await adapter.delete('User', id)
    if (!result) {
      throw DBALError.notFound(`User not found: ${id}`)
    }
    return result
  },

  /**
   * List users with filtering and pagination
   */
  list: async (options?: ListOptions): Promise<ListResult<User>> => {
    return adapter.list('User', options) as Promise<ListResult<User>>
  },

  /**
   * Batch create multiple users
   */
  createMany: async (data: Array<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<number> => {
    if (!data || data.length === 0) {
      return 0
    }

    const validationErrors = data.flatMap((item, index) =>
      validateUserCreate(item).map(error => ({ field: `users[${index}]`, error }))
    )
    if (validationErrors.length > 0) {
      throw DBALError.validationError('Invalid user batch', validationErrors)
    }

    try {
      return adapter.createMany('User', data as Record<string, unknown>[])
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict('Username or email already exists')
      }
      throw error
    }
  },

  /**
   * Bulk update users matching a filter
   */
  updateMany: async (filter: Record<string, unknown>, data: Partial<User>): Promise<number> => {
    if (!filter || Object.keys(filter).length === 0) {
      throw DBALError.validationError('Bulk update requires a filter', [
        { field: 'filter', error: 'Filter is required' },
      ])
    }

    if (!data || Object.keys(data).length === 0) {
      throw DBALError.validationError('Bulk update requires data', [
        { field: 'data', error: 'Update data is required' },
      ])
    }

    const validationErrors = validateUserUpdate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid user update data',
        validationErrors.map(error => ({ field: 'user', error }))
      )
    }

    try {
      return adapter.updateMany('User', filter, data as Record<string, unknown>)
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict('Username or email already exists')
      }
      throw error
    }
  },

  /**
   * Bulk delete users matching a filter
   */
  deleteMany: async (filter: Record<string, unknown>): Promise<number> => {
    if (!filter || Object.keys(filter).length === 0) {
      throw DBALError.validationError('Bulk delete requires a filter', [
        { field: 'filter', error: 'Filter is required' },
      ])
    }

    return adapter.deleteMany('User', filter)
  },
})
