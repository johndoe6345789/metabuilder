import type { PageView } from '../types'
import { isValidLevel } from '../../predicates/is-valid-level'
import { isValidSlug } from '../../predicates/string/is-valid-slug'
import { isValidTitle } from '../../predicates/string/is-valid-title'
import { isPlainObject } from '../../predicates/is-plain-object'

export function validatePageUpdate(data: Partial<PageView>): string[] {
  const errors: string[] = []

  if (data.slug !== undefined && !isValidSlug(data.slug)) {
    errors.push('Invalid slug format (lowercase alphanumeric, hyphen, slash, 1-255 chars)')
  }

  if (data.title !== undefined && !isValidTitle(data.title)) {
    errors.push('Invalid title (must be 1-255 characters)')
  }

  if (data.level !== undefined && !isValidLevel(data.level)) {
    errors.push('Invalid level (must be 1-5)')
  }

  if (data.layout !== undefined && !isPlainObject(data.layout)) {
    errors.push('Layout must be an object')
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean')
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('Description must be a string')
  }

  return errors
}
