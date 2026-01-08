import type { Session } from '../types'
export function validateSessionCreate(data: Partial<Session>): string[] {
  const errors: string[] = []

  if (!data.userId) {
    errors.push('userId is required')
  } else if (typeof data.userId !== 'string' || data.userId.trim().length === 0) {
    errors.push('userId must be a non-empty string')
  }

  if (!data.token) {
    errors.push('token is required')
  } else if (typeof data.token !== 'string' || data.token.trim().length === 0) {
    errors.push('token must be a non-empty string')
  }

  if (data.expiresAt === undefined) {
    errors.push('expiresAt is required')
  } else if (typeof data.expiresAt !== 'bigint') {
    errors.push('expiresAt must be a bigint timestamp')
  }

  if (data.createdAt !== undefined && typeof data.createdAt !== 'bigint') {
    errors.push('createdAt must be a bigint timestamp')
  }

  if (data.lastActivity !== undefined && typeof data.lastActivity !== 'bigint') {
    errors.push('lastActivity must be a bigint timestamp')
  }

  if (data.ipAddress !== undefined && data.ipAddress !== null && typeof data.ipAddress !== 'string') {
    errors.push('ipAddress must be a string')
  }

  if (data.userAgent !== undefined && data.userAgent !== null && typeof data.userAgent !== 'string') {
    errors.push('userAgent must be a string')
  }

  return errors
}
