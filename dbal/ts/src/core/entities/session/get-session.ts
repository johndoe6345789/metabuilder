/**
 * @file get-session.ts
 * @description Get session operations
 */
import type { Session, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Get a session by ID
 */
export async function getSession(store: InMemoryStore, id: string): Promise<Result<Session>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const session = store.sessions.get(id);
  if (!session) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Session not found: ${id}` } };
  }

  return { success: true, data: session };
}

/**
 * Get a session by token
 */
export async function getSessionByToken(store: InMemoryStore, token: string): Promise<Result<Session>> {
  if (!token) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Token required' } };
  }

  const id = store.sessionTokens.get(token);
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } };
  }

  return getSession(store, id);
}
