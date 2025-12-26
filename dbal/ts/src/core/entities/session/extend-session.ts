/**
 * @file extend-session.ts
 * @description Extend session expiration operation
 */
import type { Session, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Extend a session's expiration time
 */
export async function extendSession(
  store: InMemoryStore,
  id: string,
  additionalSeconds: number
): Promise<Result<Session>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }
  if (additionalSeconds <= 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Additional seconds must be positive' } };
  }

  const session = store.sessions.get(id);
  if (!session) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Session not found: ${id}` } };
  }

  if (session.expiresAt < new Date()) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Cannot extend expired session' } };
  }

  session.expiresAt = new Date(session.expiresAt.getTime() + additionalSeconds * 1000);
  return { success: true, data: session };
}
