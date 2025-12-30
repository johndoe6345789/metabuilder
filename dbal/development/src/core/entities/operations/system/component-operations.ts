/**
 * @file component-operations.ts
 * @description ComponentHierarchy entity CRUD operations for DBAL client
 * 
 * Single-responsibility module following the small-function-file pattern.
 */

import type { DBALAdapter } from '../../adapters/adapter'
import type { ComponentHierarchy } from '../types'
import { DBALError } from '../errors'
import { validateComponentHierarchyCreate, validateComponentHierarchyUpdate, validateId } from '../validation'

/**
 * Create component operations object for the DBAL client
 */
export const createComponentOperations = (adapter: DBALAdapter) => ({
  /**
   * Create a new component
   */
  create: async (data: Omit<ComponentHierarchy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComponentHierarchy> => {
    const validationErrors = validateComponentHierarchyCreate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid component data',
        validationErrors.map(error => ({ field: 'component', error }))
      )
    }

    return adapter.create('ComponentHierarchy', data) as Promise<ComponentHierarchy>
  },

  /**
   * Read a component by ID
   */
  read: async (id: string): Promise<ComponentHierarchy | null> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid component ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    return adapter.read('ComponentHierarchy', id) as Promise<ComponentHierarchy | null>
  },

  /**
   * Update an existing component
   */
  update: async (id: string, data: Partial<ComponentHierarchy>): Promise<ComponentHierarchy> => {
    const idErrors = validateId(id)
    if (idErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid component ID',
        idErrors.map(error => ({ field: 'id', error }))
      )
    }

    const validationErrors = validateComponentHierarchyUpdate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid component update data',
        validationErrors.map(error => ({ field: 'component', error }))
      )
    }

    return adapter.update('ComponentHierarchy', id, data) as Promise<ComponentHierarchy>
  },

  /**
   * Delete a component by ID
   */
  delete: async (id: string): Promise<boolean> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid component ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    return adapter.delete('ComponentHierarchy', id)
  },

  /**
   * Get component tree for a page
   */
  getTree: async (pageId: string): Promise<ComponentHierarchy[]> => {
    const validationErrors = validateId(pageId)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid page ID',
        validationErrors.map(error => ({ field: 'pageId', error }))
      )
    }

    const result = await adapter.list('ComponentHierarchy', { filter: { pageId } })
    return result.data as ComponentHierarchy[]
  },
})
