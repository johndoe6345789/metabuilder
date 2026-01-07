import type { ComponentNode } from '../types'
import { isValidJsonString } from '../../predicates/string/is-valid-json'

export function validateComponentHierarchyUpdate(data: Partial<ComponentNode>): string[] {
  const errors: string[] = []

  if (data.pageId !== undefined) {
    if (typeof data.pageId !== 'string' || data.pageId.trim().length === 0) {
      errors.push('pageId must be a non-empty string')
    }
  }

  if (data.parentId !== undefined) {
    if (data.parentId !== null && (typeof data.parentId !== 'string' || data.parentId.trim().length === 0)) {
      errors.push('parentId must be a non-empty string')
    }
  }

  if (data.type !== undefined) {
    if (typeof data.type !== 'string' || data.type.length === 0 || data.type.length > 100) {
      errors.push('type must be 1-100 characters')
    }
  }

  if (data.childIds !== undefined) {
    if (typeof data.childIds !== 'string' || !isValidJsonString(data.childIds)) {
      errors.push('childIds must be a JSON string')
    }
  }

  if (data.order !== undefined) {
    if (!Number.isInteger(data.order) || data.order < 0) {
      errors.push('order must be a non-negative integer')
    }
  }

  return errors
}
