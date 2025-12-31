import type { PageView } from '../types'
import { isValidLevel } from './is-valid-level'
import { isValidSlug } from './is-valid-slug'
import { isValidTitle } from './is-valid-title'
import { isPlainObject } from './is-plain-object'

/**
 * Validation rules for PageView entity
 */
export function validatePageCreate(data: Partial<PageView>): string[] {
  const errors: string[] = []

  if (!data.slug) {
    errors.push('Slug is required')
  } else if (!isValidSlug(data.slug)) {
    errors.push('Invalid slug format (lowercase alphanumeric, hyphen, slash, 1-255 chars)')
  }

  if (!data.title) {
    errors.push('Title is required')
  } else if (!isValidTitle(data.title)) {
    errors.push('Invalid title (must be 1-255 characters)')
  }

  if (data.level === undefined) {
    errors.push('Level is required')
  } else if (!isValidLevel(data.level)) {
    errors.push('Invalid level (must be 1-5)')
  }

  if (data.layout === undefined) {
    errors.push('Layout is required')
  } else if (!isPlainObject(data.layout)) {
    errors.push('Layout must be an object')
  }

  if (data.isActive === undefined) {
    errors.push('isActive is required')
  } else if (typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean')
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('Description must be a string')
  }

  return errors
}
