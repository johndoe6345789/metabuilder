/**
 * @file create-session.ts
 * @description Create session operation
 */
import type { Session, CreateSessionInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Create a new session in the store
 */
export async function createSession(
  store: InMemoryStore,
  input: CreateSessionInput
): Promise<Result<Session>> {
  if (!input.userId) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'User ID required' } };
  }
  if (!store.users.has(input.userId)) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };
  }
  if (input.ttlSeconds <= 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'TTL must be positive' } };
  }

  const session: Session = {
    id: store.generateId('session'),
    userId: input.userId,
    token: store.generateToken(),
    expiresAt: new Date(Date.now() + input.ttlSeconds * 1000),
    ipAddress: input.ipAddress ?? '',
    userAgent: input.userAgent ?? '',
    createdAt: new Date(),
  };

  store.sessions.set(session.id, session);
  store.sessionTokens.set(session.token, session.id);

  return { success: true, data: session };
}
