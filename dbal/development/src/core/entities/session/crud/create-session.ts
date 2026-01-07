/**
 * @file create-session.ts
 * @description Create session operation
 */
import type { CreateSessionInput, Result, Session } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateSessionCreate } from '../validation/validate-session-create'

/**
 * Create a new session in the store
 */
export const createSession = async (
  store: InMemoryStore,
  input: CreateSessionInput
): Promise<Result<Session>> => {
  const createdAt = input.createdAt ?? BigInt(Date.now())
  const session: Session = {
    id: input.id ?? store.generateId('session'),
    userId: input.userId,
    token: input.token,
    expiresAt: input.expiresAt,
    createdAt,
    lastActivity: input.lastActivity ?? createdAt,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null
  }

  const validationErrors = validateSessionCreate(session)

  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  if (!store.users.has(input.userId)) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: `User not found: ${input.userId}` } }
  }

  if (store.sessionTokens.has(input.token)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Session token already exists' } }
  }

  store.sessions.set(session.id, session)
  store.sessionTokens.set(session.token, session.id)

  return { success: true, data: session }
}
