import type { PageConfig } from '../types'
import { isValidLevel } from '../../predicates/is-valid-level'
import { isValidTitle } from '../../predicates/string/is-valid-title'
import { isValidJsonString } from '../../predicates/string/is-valid-json'

export function validatePageUpdate(data: Partial<PageConfig>): string[] {
  const errors: string[] = []

  if (data.path !== undefined) {
    if (typeof data.path !== 'string' || data.path.trim().length === 0 || data.path.length > 255) {
      errors.push('path must be 1-255 characters')
    }
  }

  if (data.title !== undefined && !isValidTitle(data.title)) {
    errors.push('Invalid title (must be 1-255 characters)')
  }

  if (data.componentTree !== undefined) {
    if (typeof data.componentTree !== 'string' || !isValidJsonString(data.componentTree)) {
      errors.push('componentTree must be a JSON string')
    }
  }

  if (data.level !== undefined && !isValidLevel(data.level)) {
    errors.push('level must be between 1 and 6')
  }

  if (data.requiresAuth !== undefined && typeof data.requiresAuth !== 'boolean') {
    errors.push('requiresAuth must be a boolean')
  }

  if (data.isPublished !== undefined && typeof data.isPublished !== 'boolean') {
    errors.push('isPublished must be a boolean')
  }

  if (data.sortOrder !== undefined && (!Number.isInteger(data.sortOrder) || data.sortOrder < 0)) {
    errors.push('sortOrder must be a non-negative integer')
  }

  if (data.params !== undefined && data.params !== null) {
    if (typeof data.params !== 'string' || !isValidJsonString(data.params)) {
      errors.push('params must be a JSON string')
    }
  }

  if (data.meta !== undefined && data.meta !== null) {
    if (typeof data.meta !== 'string' || !isValidJsonString(data.meta)) {
      errors.push('meta must be a JSON string')
    }
  }

  if (data.createdAt !== undefined && data.createdAt !== null && typeof data.createdAt !== 'bigint') {
    errors.push('createdAt must be a bigint timestamp')
  }

  if (data.updatedAt !== undefined && data.updatedAt !== null && typeof data.updatedAt !== 'bigint') {
    errors.push('updatedAt must be a bigint timestamp')
  }

  if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
    errors.push('Description must be a string')
  }

  if (data.icon !== undefined && data.icon !== null && typeof data.icon !== 'string') {
    errors.push('icon must be a string')
  }

  if (data.component !== undefined && data.component !== null && typeof data.component !== 'string') {
    errors.push('component must be a string')
  }

  if (data.requiredRole !== undefined && data.requiredRole !== null && typeof data.requiredRole !== 'string') {
    errors.push('requiredRole must be a string')
  }

  if (data.parentPath !== undefined && data.parentPath !== null && typeof data.parentPath !== 'string') {
    errors.push('parentPath must be a string')
  }

  if (data.packageId !== undefined && data.packageId !== null && typeof data.packageId !== 'string') {
    errors.push('packageId must be a string')
  }

  if (data.tenantId !== undefined && data.tenantId !== null && typeof data.tenantId !== 'string') {
    errors.push('tenantId must be a string')
  }

  return errors
}
