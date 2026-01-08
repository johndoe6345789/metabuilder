/**
 * @file extend-session.ts
 * @description Extend session expiration operation
 */
import type { Result, Session } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Extend a session's expiration time
 */
export const extendSession = async (
  store: InMemoryStore,
  id: string,
  additionalSeconds: number
): Promise<Result<Session>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] || 'Invalid ID' } }
  }

  if (additionalSeconds <= 0 || !Number.isInteger(additionalSeconds)) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Additional seconds must be a positive integer' } }
  }

  const session = store.sessions.get(id)
  if (!session) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Session not found: ${id}` } }
  }

  const now = BigInt(Date.now())
  if (session.expiresAt < now) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Cannot extend expired session' } }
  }

  session.expiresAt = session.expiresAt + BigInt(additionalSeconds) * 1000n
  return { success: true, data: session }
}
