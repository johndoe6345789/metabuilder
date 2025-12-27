import type { Credential } from '../types'
import { isValidUsername } from '../../predicates/string/is-valid-username'

export function validateCredentialCreate(data: Partial<Credential>): string[] {
  const errors: string[] = []

  if (!data.username) {
    errors.push('username is required')
  } else if (!isValidUsername(data.username)) {
    errors.push('username must be 3-50 characters (alphanumeric, underscore, hyphen)')
  }

  if (!data.passwordHash) {
    errors.push('passwordHash is required')
  } else if (typeof data.passwordHash !== 'string' || data.passwordHash.trim().length === 0) {
    errors.push('passwordHash must be a non-empty string')
  }

  if (data.firstLogin === undefined) {
    errors.push('firstLogin is required')
  } else if (typeof data.firstLogin !== 'boolean') {
    errors.push('firstLogin must be a boolean')
  }

  return errors
}
