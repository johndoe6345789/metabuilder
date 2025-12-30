import type { Session } from './types'

type SessionRecord = {
  id: string
  userId: string
  token: string
  expiresAt: number | string | Date
  createdAt: number | string | Date
  lastActivity: number | string | Date
}

export function mapSessionRecord(record: SessionRecord): Session {
  return {
    id: record.id,
    userId: record.userId,
    token: record.token,
    expiresAt: Number(record.expiresAt),
    createdAt: Number(record.createdAt),
    lastActivity: Number(record.lastActivity),
  }
}
