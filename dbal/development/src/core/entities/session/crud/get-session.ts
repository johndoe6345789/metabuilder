/**
 * @file get-session.ts
 * @description Get session operations
 */
import type { Result, Session } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Get a session by ID
 */
export const getSession = async (store: InMemoryStore, id: string): Promise<Result<Session>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  const session = store.sessions.get(id)
  if (!session) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Session not found: ${id}` } }
  }

  if (session.expiresAt <= new Date()) {
    store.sessionTokens.delete(session.token)
    store.sessions.delete(id)
    return { success: false, error: { code: 'NOT_FOUND', message: `Session expired: ${id}` } }
  }

  return { success: true, data: session }
}

/**
 * Get a session by token
 */
export const getSessionByToken = async (store: InMemoryStore, token: string): Promise<Result<Session>> => {
  if (!token) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Token is required' } }
  }

  const id = store.sessionTokens.get(token)
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Session not found for token' } }
  }

  return getSession(store, id)
}
