import type { PageView } from '../types'
import { isValidLevel } from './is-valid-level'
import { isValidSlug } from './is-valid-slug'
import { isValidTitle } from './is-valid-title'

// TODO: add tests for validatePageUpdate (optional field validation).
export function validatePageUpdate(data: Partial<PageView>): string[] {
  const errors: string[] = []

  if (data.slug !== undefined && !isValidSlug(data.slug)) {
    errors.push('Invalid slug format')
  }

  if (data.title !== undefined && !isValidTitle(data.title)) {
    errors.push('Invalid title (must be 1-200 characters)')
  }

  if (data.level !== undefined && !isValidLevel(data.level)) {
    errors.push('Invalid level (must be 0-5)')
  }

  return errors
}
