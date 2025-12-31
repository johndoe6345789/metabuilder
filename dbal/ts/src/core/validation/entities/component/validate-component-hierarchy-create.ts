import type { ComponentHierarchy } from '../types'
import { isPlainObject } from './is-plain-object'
import { isValidUuid } from './is-valid-uuid'

export function validateComponentHierarchyCreate(data: Partial<ComponentHierarchy>): string[] {
  const errors: string[] = []

  if (!data.pageId) {
    errors.push('pageId is required')
  } else if (!isValidUuid(data.pageId)) {
    errors.push('pageId must be a valid UUID')
  }

  if (data.parentId !== undefined) {
    if (typeof data.parentId !== 'string' || !isValidUuid(data.parentId)) {
      errors.push('parentId must be a valid UUID')
    }
  }

  if (!data.componentType) {
    errors.push('componentType is required')
  } else if (data.componentType.length > 100) {
    errors.push('componentType must be 1-100 characters')
  }

  if (data.order === undefined) {
    errors.push('order is required')
  } else if (!Number.isInteger(data.order) || data.order < 0) {
    errors.push('order must be a non-negative integer')
  }

  if (data.props === undefined) {
    errors.push('props is required')
  } else if (!isPlainObject(data.props)) {
    errors.push('props must be an object')
  }

  return errors
}
