import type { User } from '../types'
import { isValidEmail } from '../../predicates/string/is-valid-email'
import { isValidUsername } from '../../predicates/string/is-valid-username'

/**
 * Validation rules for User entity
 */
export function validateUserCreate(data: Partial<User>): string[] {
  const errors: string[] = []

  if (!data.username) {
    errors.push('Username is required')
  } else if (!isValidUsername(data.username)) {
    errors.push('Invalid username format (alphanumeric, underscore, hyphen only, 3-50 chars)')
  }

  if (!data.email) {
    errors.push('Email is required')
  } else if (!isValidEmail(data.email)) {
    errors.push('Invalid email format (max 255 chars)')
  }

  if (!data.role) {
    errors.push('Role is required')
  } else if (!['user', 'admin', 'god', 'supergod'].includes(data.role)) {
    errors.push('Invalid role')
  }

  return errors
}
