import type { Session } from '../types'
import { isValidDate } from '../../predicates/is-valid-date'
import { isValidUuid } from '../../predicates/is-valid-uuid'

export function validateSessionCreate(data: Partial<Session>): string[] {
  const errors: string[] = []

  if (!data.userId) {
    errors.push('userId is required')
  } else if (!isValidUuid(data.userId)) {
    errors.push('userId must be a valid UUID')
  }

  if (!data.token) {
    errors.push('token is required')
  } else if (typeof data.token !== 'string' || data.token.trim().length === 0) {
    errors.push('token must be a non-empty string')
  }

  if (data.expiresAt === undefined) {
    errors.push('expiresAt is required')
  } else if (!isValidDate(data.expiresAt)) {
    errors.push('expiresAt must be a valid date')
  }

  return errors
}
