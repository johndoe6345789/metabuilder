/**
 * @file update-session.ts
 * @description Update session operation
 */
import type { Result, Session, UpdateSessionInput } from '../../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'
import { validateSessionUpdate } from '../../validation/validate-session-update'

/**
 * Update an existing session
 */
export const updateSession = async (
  store: InMemoryStore,
  id: string,
  input: UpdateSessionInput
): Promise<Result<Session>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const session = store.sessions.get(id)
  if (!session) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Session not found: ${id}` } }
  }

  const validationErrors = validateSessionUpdate(input)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] } }
  }

  if (input.userId !== undefined) {
    if (!store.users.has(input.userId)) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: `User not found: ${input.userId}` } }
    }
    session.userId = input.userId
  }

  if (input.token !== undefined && input.token !== session.token) {
    if (store.sessionTokens.has(input.token)) {
      return { success: false, error: { code: 'CONFLICT', message: 'Session token already exists' } }
    }
    store.sessionTokens.delete(session.token)
    store.sessionTokens.set(input.token, id)
    session.token = input.token
  }

  if (input.expiresAt !== undefined) {
    session.expiresAt = input.expiresAt
  }

  if (input.lastActivity !== undefined) {
    session.lastActivity = input.lastActivity
  }

  return { success: true, data: session }
}
