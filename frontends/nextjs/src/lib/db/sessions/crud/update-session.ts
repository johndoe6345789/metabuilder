import { getAdapter } from '../../core/dbal-client'
import type { Session, UpdateSessionInput } from './types'
import { mapSessionRecord } from '../map-session-record'

export async function updateSession(sessionId: string, input: UpdateSessionInput): Promise<Session> {
  const adapter = getAdapter()
  const record = await adapter.update('Session', sessionId, {
    ...(input.token ? { token: input.token } : {}),
    ...(input.expiresAt !== undefined ? { expiresAt: BigInt(input.expiresAt) } : {}),
    ...(input.lastActivity !== undefined ? { lastActivity: BigInt(input.lastActivity) } : {}),
  })
  return mapSessionRecord(record)
}
