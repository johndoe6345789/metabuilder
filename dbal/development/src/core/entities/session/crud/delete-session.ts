/**
 * @file delete-session.ts
 * @description Delete session operation
 */
import type { Result } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'
import { validateId } from '../../validation/validate-id'

/**
 * Delete a session by ID
 */
export const deleteSession = async (store: InMemoryStore, id: string): Promise<Result<boolean>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const session = store.sessions.get(id)
  if (!session) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Session not found: ${id}` } }
  }

  store.sessions.delete(id)
  store.sessionTokens.delete(session.token)

  return { success: true, data: true }
}
