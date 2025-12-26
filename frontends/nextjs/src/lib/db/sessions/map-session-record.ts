import type { Session } from './types'

export function mapSessionRecord(record: any): Session {
  return {
    id: record.id,
    userId: record.userId,
    token: record.token,
    expiresAt: Number(record.expiresAt),
    createdAt: Number(record.createdAt),
    lastActivity: Number(record.lastActivity),
  }
}
