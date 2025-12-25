import type { PageView } from '../types'
import { isValidLevel } from './is-valid-level'
import { isValidSlug } from './is-valid-slug'
import { isValidTitle } from './is-valid-title'

/**
 * Validation rules for PageView entity
 */
export function validatePageCreate(data: Partial<PageView>): string[] {
  const errors: string[] = []

  if (!data.slug) {
    errors.push('Slug is required')
  } else if (!isValidSlug(data.slug)) {
    errors.push('Invalid slug format (lowercase alphanumeric with hyphens, 1-100 chars)')
  }

  if (!data.title) {
    errors.push('Title is required')
  } else if (!isValidTitle(data.title)) {
    errors.push('Invalid title (must be 1-200 characters)')
  }

  if (data.level === undefined) {
    errors.push('Level is required')
  } else if (!isValidLevel(data.level)) {
    errors.push('Invalid level (must be 0-5)')
  }

  return errors
}
