import type { User } from '../types'
import { isValidEmail } from '../../predicates/string/is-valid-email'
import { isValidUsername } from '../../predicates/string/is-valid-username'

export function validateUserUpdate(data: Partial<User>): string[] {
  const errors: string[] = []

  if (data.username !== undefined && !isValidUsername(data.username)) {
    errors.push('Invalid username format (alphanumeric, underscore, hyphen only, 3-50 chars)')
  }

  if (data.email !== undefined && !isValidEmail(data.email)) {
    errors.push('Invalid email format (max 255 chars)')
  }

  if (data.role !== undefined && !['public', 'user', 'moderator', 'admin', 'god', 'supergod'].includes(data.role)) {
    errors.push('Invalid role')
  }

  if (data.profilePicture !== undefined && data.profilePicture !== null && typeof data.profilePicture !== 'string') {
    errors.push('profilePicture must be a string')
  }

  if (data.bio !== undefined && data.bio !== null && typeof data.bio !== 'string') {
    errors.push('bio must be a string')
  }

  if (data.createdAt !== undefined && typeof data.createdAt !== 'bigint') {
    errors.push('createdAt must be a bigint timestamp')
  }

  if (data.tenantId !== undefined && data.tenantId !== null && typeof data.tenantId !== 'string') {
    errors.push('tenantId must be a string')
  }

  if (data.isInstanceOwner !== undefined && typeof data.isInstanceOwner !== 'boolean') {
    errors.push('isInstanceOwner must be a boolean')
  }

  if (data.passwordChangeTimestamp !== undefined && data.passwordChangeTimestamp !== null && typeof data.passwordChangeTimestamp !== 'bigint') {
    errors.push('passwordChangeTimestamp must be a bigint timestamp')
  }

  if (data.firstLogin !== undefined && typeof data.firstLogin !== 'boolean') {
    errors.push('firstLogin must be a boolean')
  }

  return errors
}
