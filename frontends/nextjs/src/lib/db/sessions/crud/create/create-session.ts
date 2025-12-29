import { randomBytes, randomUUID } from 'crypto'

import { getAdapter } from '../../../core/dbal-client'
import type { CreateSessionInput, Session } from './types'

const TOKEN_BYTES = 32

export async function createSession(input: CreateSessionInput): Promise<Session> {
  const adapter = getAdapter()
  const createdAt = input.createdAt ?? Date.now()
  const lastActivity = input.lastActivity ?? createdAt
  const sessionId = input.id ?? randomUUID()
  const token = input.token ?? randomBytes(TOKEN_BYTES).toString('hex')

  await adapter.create('Session', {
    id: sessionId,
    userId: input.userId,
    token,
    expiresAt: BigInt(input.expiresAt),
    createdAt: BigInt(createdAt),
    lastActivity: BigInt(lastActivity),
  })

  return {
    id: sessionId,
    userId: input.userId,
    token,
    expiresAt: input.expiresAt,
    createdAt,
    lastActivity,
  }
}
