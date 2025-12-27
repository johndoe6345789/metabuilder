/**
 * @file workflow-operations.ts
 * @description Workflow entity CRUD operations for DBAL client
 * 
 * Single-responsibility module following the small-function-file pattern.
 */

import type { DBALAdapter } from '../../adapters/adapter'
import type { Workflow, ListOptions, ListResult } from '../types'
import { DBALError } from '../errors'
import { validateWorkflowCreate, validateWorkflowUpdate, validateId } from '../validation'

/**
 * Create workflow operations object for the DBAL client
 */
export const createWorkflowOperations = (adapter: DBALAdapter) => ({
  /**
   * Create a new workflow
   */
  create: async (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> => {
    const validationErrors = validateWorkflowCreate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid workflow data',
        validationErrors.map(error => ({ field: 'workflow', error }))
      )
    }

    try {
      return adapter.create('Workflow', data) as Promise<Workflow>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict(`Workflow with name '${data.name}' already exists`)
      }
      throw error
    }
  },

  /**
   * Read a workflow by ID
   */
  read: async (id: string): Promise<Workflow | null> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid workflow ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    const result = await adapter.read('Workflow', id) as Workflow | null
    if (!result) {
      throw DBALError.notFound(`Workflow not found: ${id}`)
    }
    return result
  },

  /**
   * Update an existing workflow
   */
  update: async (id: string, data: Partial<Workflow>): Promise<Workflow> => {
    const idErrors = validateId(id)
    if (idErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid workflow ID',
        idErrors.map(error => ({ field: 'id', error }))
      )
    }

    const validationErrors = validateWorkflowUpdate(data)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid workflow update data',
        validationErrors.map(error => ({ field: 'workflow', error }))
      )
    }

    try {
      return adapter.update('Workflow', id, data) as Promise<Workflow>
    } catch (error) {
      if (error instanceof DBALError && error.code === 409) {
        throw DBALError.conflict('Workflow name already exists')
      }
      throw error
    }
  },

  /**
   * Delete a workflow by ID
   */
  delete: async (id: string): Promise<boolean> => {
    const validationErrors = validateId(id)
    if (validationErrors.length > 0) {
      throw DBALError.validationError(
        'Invalid workflow ID',
        validationErrors.map(error => ({ field: 'id', error }))
      )
    }

    const result = await adapter.delete('Workflow', id)
    if (!result) {
      throw DBALError.notFound(`Workflow not found: ${id}`)
    }
    return result
  },

  /**
   * List workflows with filtering and pagination
   */
  list: async (options?: ListOptions): Promise<ListResult<Workflow>> => {
    return adapter.list('Workflow', options) as Promise<ListResult<Workflow>>
  },
})
