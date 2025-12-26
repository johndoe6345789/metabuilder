/**
 * @file list-sessions.ts
 * @description List sessions with filtering
 */
import type { Session, ListOptions, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * List sessions with filtering and pagination
 */
export async function listSessions(
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<Session[]>> {
  const { filter = {}, page = 1, limit = 20 } = options;
  const now = new Date();

  let sessions = Array.from(store.sessions.values());

  // Apply filters
  if (filter.userId !== undefined) {
    sessions = sessions.filter((s) => s.userId === filter.userId);
  }
  if (filter.activeOnly) {
    sessions = sessions.filter((s) => s.expiresAt > now);
  }

  // Sort by created_at descending (newest first)
  sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Apply pagination
  const start = (page - 1) * limit;
  const paginated = sessions.slice(start, start + limit);

  return { success: true, data: paginated };
}
