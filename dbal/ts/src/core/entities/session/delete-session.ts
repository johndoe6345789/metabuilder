/**
 * @file delete-session.ts
 * @description Delete session operation
 */
import type { Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Delete a session by ID (logout)
 */
export async function deleteSession(store: InMemoryStore, id: string): Promise<Result<boolean>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const session = store.sessions.get(id);
  if (!session) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Session not found: ${id}` } };
  }

  store.sessionTokens.delete(session.token);
  store.sessions.delete(id);

  return { success: true, data: true };
}
