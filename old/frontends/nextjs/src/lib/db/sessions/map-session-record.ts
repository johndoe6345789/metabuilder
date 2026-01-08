import type { Session } from './types'

export type SessionRecord = {
  id: string
  userId: string
  token: string
  expiresAt: number | string | Date | bigint
  createdAt: number | string | Date | bigint
  lastActivity: number | string | Date | bigint
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
