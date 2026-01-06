/**
 * @file list-sessions.ts
 * @description List sessions with filtering and pagination
 */
import type { ListOptions, Result, Session } from '../../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { cleanExpiredSessions } from './clean-expired'

/**
 * List sessions with filtering and pagination
 */
export const listSessions = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<Session[]>> => {
  await cleanExpiredSessions(store)

  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let sessions = Array.from(store.sessions.values())

  if (filter.userId !== undefined) {
    sessions = sessions.filter((session) => session.userId === filter.userId)
  }

  if (filter.token !== undefined) {
    sessions = sessions.filter((session) => session.token === filter.token)
  }

  if (sort.createdAt) {
    sessions.sort((a, b) =>
      sort.createdAt === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
    )
  } else if (sort.expiresAt) {
    sessions.sort((a, b) =>
      sort.expiresAt === 'asc' ? a.expiresAt.getTime() - b.expiresAt.getTime() : b.expiresAt.getTime() - a.expiresAt.getTime()
    )
  }

  const start = (page - 1) * limit
  const paginated = sessions.slice(start, start + limit)

  return { success: true, data: paginated }
}
