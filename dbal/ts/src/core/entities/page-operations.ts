/**
 * @file page-operations.ts
 * @description PageView entity CRUD operations for DBAL client
 * 
 * Single-responsibility module following the small-function-file pattern.
 */

import type { DBALAdapter } from '../../adapters/adapter'
import type { PageView, ListOptions, ListResult } from '../types'
import { DBALError } from '../errors'
import { validatePageCreate, validatePageUpdate, validateId } from '../validation'

/**
 * Create page operations object for the DBAL client
 */
export const createPageOperations = (adapter: DBALAdapter) => ({
  /**
   * Create a new page
   */
  create: async (data: Omit<PageView, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageView> => {
    const validationErrors = validatePageCreate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid page data',
        validationErrors.map(error => ({ field: 'page', error }))
      )
    }

    try {
      return adapter.create('PageView', data) as Promise<PageView>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict(`Page with slug '${data.slug}' already exists`)
      }
      throw error
    }
  },

  /**
   * Read a page by ID
   */
  read: async (id: string): Promise<PageView | null> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid page ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    const result = await adapter.read('PageView', id) as PageView | null
    if (!result) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    return result
  },

  /**
   * Read a page by slug
   */
  readBySlug: async (slug: string): Promise<PageView | null> => {
    if (!slug || slug.trim().length === 0) {
      throw DBALError.validationError('Slug cannot be empty', [
        { field: 'slug', error: 'Slug is required' }
      ])
    }

    const result = await adapter.list('PageView', { filter: { slug } })
    if (result.data.length === 0) {
      throw DBALError.notFound(`Page not found with slug: ${slug}`)
    }
    return result.data[0] as PageView
  },

  /**
   * Update an existing page
   */
  update: async (id: string, data: Partial<PageView>): Promise<PageView> => {
    const idErrors = validateId(id)
    if (idErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid page ID',
        idErrors.map(error => ({ field: 'id', error }))
      )
    }

    const validationErrors = validatePageUpdate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid page update data',
        validationErrors.map(error => ({ field: 'page', error }))
      )
    }

    try {
      return adapter.update('PageView', id, data) as Promise<PageView>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict(`Slug already exists`)
      }
      throw error
    }
  },

  /**
   * Delete a page by ID
   */
  delete: async (id: string): Promise<boolean> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid page ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    const result = await adapter.delete('PageView', id)
    if (!result) {
      throw DBALError.notFound(`Page not found: ${id}`)
    }
    return result
  },

  /**
   * List pages with filtering and pagination
   */
  list: async (options?: ListOptions): Promise<ListResult<PageView>> => {
    return adapter.list('PageView', options) as Promise<ListResult<PageView>>
  },
})
