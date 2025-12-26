/**
 * @file clean-expired.ts
 * @description Clean expired sessions operation
 */
import type { Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Clean up expired sessions
 * @returns Number of sessions removed
 */
export async function cleanExpiredSessions(store: InMemoryStore): Promise<Result<number>> {
  const now = new Date();
  const expiredIds: string[] = [];

  for (const [id, session] of store.sessions) {
    if (session.expiresAt < now) {
      expiredIds.push(id);
    }
  }

  for (const id of expiredIds) {
    const session = store.sessions.get(id);
    if (session) {
      store.sessionTokens.delete(session.token);
      store.sessions.delete(id);
    }
  }

  return { success: true, data: expiredIds.length };
}
