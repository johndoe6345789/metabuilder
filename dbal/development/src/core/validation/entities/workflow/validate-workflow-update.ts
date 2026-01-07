import type { Workflow } from '../types'
import { isValidJsonString } from '../../predicates/string/is-valid-json'

export function validateWorkflowUpdate(data: Partial<Workflow>): string[] {
  const errors: string[] = []

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.length === 0 || data.name.length > 255) {
      errors.push('name must be 1-255 characters')
    }
  }

  if (data.nodes !== undefined) {
    if (typeof data.nodes !== 'string' || !isValidJsonString(data.nodes)) {
      errors.push('nodes must be a JSON string')
    }
  }

  if (data.edges !== undefined) {
    if (typeof data.edges !== 'string' || !isValidJsonString(data.edges)) {
      errors.push('edges must be a JSON string')
    }
  }

  if (data.enabled !== undefined && typeof data.enabled !== 'boolean') {
    errors.push('enabled must be a boolean')
  }

  if (data.version !== undefined && (!Number.isInteger(data.version) || data.version < 1)) {
    errors.push('version must be a positive integer')
  }

  if (data.createdAt !== undefined && data.createdAt !== null && typeof data.createdAt !== 'bigint') {
    errors.push('createdAt must be a bigint timestamp')
  }

  if (data.updatedAt !== undefined && data.updatedAt !== null && typeof data.updatedAt !== 'bigint') {
    errors.push('updatedAt must be a bigint timestamp')
  }

  if (data.createdBy !== undefined && data.createdBy !== null) {
    if (typeof data.createdBy !== 'string' || data.createdBy.trim().length === 0) {
      errors.push('createdBy must be a non-empty string')
    }
  }

  if (data.tenantId !== undefined && data.tenantId !== null && typeof data.tenantId !== 'string') {
    errors.push('tenantId must be a string')
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('description must be a string')
  }

  return errors
}
