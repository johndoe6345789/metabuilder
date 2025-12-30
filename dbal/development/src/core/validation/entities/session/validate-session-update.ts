import type { Session } from '../types'
import { isValidDate } from '../../predicates/is-valid-date'
import { isValidUuid } from '../../predicates/is-valid-uuid'

export function validateSessionUpdate(data: Partial<Session>): string[] {
  const errors: string[] = []

  if (data.userId !== undefined) {
    if (typeof data.userId !== 'string' || !isValidUuid(data.userId)) {
      errors.push('userId must be a valid UUID')
    }
  }

  if (data.token !== undefined) {
    if (typeof data.token !== 'string' || data.token.trim().length === 0) {
      errors.push('token must be a non-empty string')
    }
  }

  if (data.expiresAt !== undefined && !isValidDate(data.expiresAt)) {
    errors.push('expiresAt must be a valid date')
  }

  if (data.lastActivity !== undefined && !isValidDate(data.lastActivity)) {
    errors.push('lastActivity must be a valid date')
  }

  return errors
}
