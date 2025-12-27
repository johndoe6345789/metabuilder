/**
 * @file package-operations.ts
 * @description Package entity CRUD operations for DBAL client
 * 
 * Single-responsibility module following the small-function-file pattern.
 */

import type { DBALAdapter } from '../../adapters/adapter'
import type { Package, ListOptions, ListResult } from '../types'
import { DBALError } from '../errors'
import { validatePackageCreate, validatePackageUpdate, validateId } from '../validation'

/**
 * Create package operations object for the DBAL client
 */
export const createPackageOperations = (adapter: DBALAdapter) => ({
  /**
   * Create a new package
   */
  create: async (data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> => {
    const validationErrors = validatePackageCreate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid package data',
        validationErrors.map(error => ({ field: 'package', error }))
      )
    }

    try {
      return adapter.create('Package', data) as Promise<Package>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict(`Package ${data.name}@${data.version} already exists`)
      }
      throw error
    }
  },

  /**
   * Read a package by ID
   */
  read: async (id: string): Promise<Package | null> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid package ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    const result = await adapter.read('Package', id) as Package | null
    if (!result) {
      throw DBALError.notFound(`Package not found: ${id}`)
    }
    return result
  },

  /**
   * Update an existing package
   */
  update: async (id: string, data: Partial<Package>): Promise<Package> => {
    const idErrors = validateId(id)
    if (idErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid package ID',
        idErrors.map(error => ({ field: 'id', error }))
      )
    }

    const validationErrors = validatePackageUpdate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid package update data',
        validationErrors.map(error => ({ field: 'package', error }))
      )
    }

    try {
      return adapter.update('Package', id, data) as Promise<Package>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict('Package name+version already exists')
      }
      throw error
    }
  },

  /**
   * Delete a package by ID
   */
  delete: async (id: string): Promise<boolean> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid package ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    const result = await adapter.delete('Package', id)
    if (!result) {
      throw DBALError.notFound(`Package not found: ${id}`)
    }
    return result
  },

  /**
   * List packages with filtering and pagination
   */
  list: async (options?: ListOptions): Promise<ListResult<Package>> => {
    return adapter.list('Package', options) as Promise<ListResult<Package>>
  },

  /**
   * Batch create multiple packages
   */
  createMany: async (data: Array<Omit<Package, 'id' | 'createdAt' | 'updatedAt'>>): Promise<number> => {
    if (!data || data.length === 0) {
      return 0
    }

    const validationErrors = data.flatMap((item, index) =>
      validatePackageCreate(item).map(error => ({ field: `packages[${index}]`, error }))
    )
    if (validationErrors.length > 0) {
      throw DBALError.validationError('Invalid package batch', validationErrors)
    }

    try {
      return adapter.createMany('Package', data as Record<string, unknown>[])
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict('Package name+version already exists')
      }
      throw error
    }
  },

  /**
   * Bulk update packages matching a filter
   */
  updateMany: async (filter: Record<string, unknown>, data: Partial<Package>): Promise<number> => {
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

    const validationErrors = validatePackageUpdate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid package update data',
        validationErrors.map(error => ({ field: 'package', error }))
      )
    }

    try {
      return adapter.updateMany('Package', filter, data as Record<string, unknown>)
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict('Package name+version already exists')
      }
      throw error
    }
  },

  /**
   * Bulk delete packages matching a filter
   */
  deleteMany: async (filter: Record<string, unknown>): Promise<number> => {
    if (!filter || Object.keys(filter).length === 0) {
      throw DBALError.validationError('Bulk delete requires a filter', [
        { field: 'filter', error: 'Filter is required' },
      ])
    }

    return adapter.deleteMany('Package', filter)
  },
})
