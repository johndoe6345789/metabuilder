import { getAdapter } from '../../core/dbal-client'
import { mapSessionRecord } from '../map-session-record'
import type { ListSessionsOptions, Session } from '../types'

export async function listSessions(options?: ListSessionsOptions): Promise<Session[]> {
  const adapter = getAdapter()
  const result = options?.userId !== undefined
    ? await adapter.list('Session', { filter: { userId: options.userId } })
    : await adapter.list('Session')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessions = (result.data as any[]).map(mapSessionRecord)

  if (options?.includeExpired === true) {
    return sessions
  }

  const now = Date.now()
  return sessions.filter(session => session.expiresAt > now)
}
