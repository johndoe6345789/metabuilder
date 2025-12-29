import { getAdapter } from '../../core/dbal-client'
import { mapSessionRecord } from '../map-session-record'
import type { ListSessionsOptions, Session } from './types'

export async function listSessions(options?: ListSessionsOptions): Promise<Session[]> {
  const adapter = getAdapter()
  const result = options?.userId
    ? await adapter.list('Session', { filter: { userId: options.userId } })
    : await adapter.list('Session')

  const sessions = result.data.map(mapSessionRecord)

  if (options?.includeExpired) {
    return sessions
  }

  const now = Date.now()
  return sessions.filter(session => session.expiresAt > now)
}
