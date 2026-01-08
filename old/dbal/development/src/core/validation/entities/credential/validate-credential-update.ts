import type { Credential } from '../types'
import { isValidUsername } from '../../predicates/string/is-valid-username'

export function validateCredentialUpdate(data: Partial<Credential>): string[] {
  const errors: string[] = []

  if (data.username !== undefined) {
    if (typeof data.username !== 'string' || !isValidUsername(data.username)) {
      errors.push('username must be 3-50 characters (alphanumeric, underscore, hyphen)')
    }
  }

  if (data.passwordHash !== undefined) {
    if (typeof data.passwordHash !== 'string' || data.passwordHash.trim().length === 0) {
      errors.push('passwordHash must be a non-empty string')
    }
  }

  return errors
}
