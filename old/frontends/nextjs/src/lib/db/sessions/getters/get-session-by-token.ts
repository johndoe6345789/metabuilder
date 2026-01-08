import { getAdapter } from '../../core/dbal-client'
import { deleteSession } from '../crud/delete/delete-session'
import { mapSessionRecord, type SessionRecord } from '../map-session-record'
import type { Session } from '../types'

export async function getSessionByToken(token: string): Promise<Session | null> {
  const adapter = getAdapter()
  const result = await adapter.list('Session', { filter: { token } })
  if (result.data.length === 0) return null

  const session = mapSessionRecord(result.data[0] as SessionRecord)
  if (session.expiresAt <= Date.now()) {
    await deleteSession(session.id)
    return null
  }

  return session
}
