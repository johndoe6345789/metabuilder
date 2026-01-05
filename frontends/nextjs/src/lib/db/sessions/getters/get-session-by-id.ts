import { getAdapter } from '../../core/dbal-client'
import { mapSessionRecord } from '../map-session-record'
import type { Session } from '../types'

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const adapter = getAdapter()
  const record = await adapter.read('Session', sessionId)
  if (!record) return null
  return mapSessionRecord(record)
}
