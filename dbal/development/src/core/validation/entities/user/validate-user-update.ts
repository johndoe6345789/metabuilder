import type { User } from '../types'
import { isValidEmail } from './is-valid-email'
import { isValidUsername } from './is-valid-username'

export function validateUserUpdate(data: Partial<User>): string[] {
  const errors: string[] = []

  if (data.username !== undefined && !isValidUsername(data.username)) {
    errors.push('Invalid username format (alphanumeric, underscore, hyphen only, 3-50 chars)')
  }

  if (data.email !== undefined && !isValidEmail(data.email)) {
    errors.push('Invalid email format (max 255 chars)')
  }

  if (data.role !== undefined && !['user', 'admin', 'god', 'supergod'].includes(data.role)) {
    errors.push('Invalid role')
  }

  return errors
}
