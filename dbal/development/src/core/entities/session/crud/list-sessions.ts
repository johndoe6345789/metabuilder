/**
 * @file list-sessions.ts
 * @description List sessions with filtering and pagination
 */
import type { ListOptions, Result, Session } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { cleanExpiredSessions } from '../lifecycle/clean-expired'

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

  if (filter && Object.keys(filter).length > 0) {
    sessions = sessions.filter((session) =>
      Object.entries(filter).every(([key, value]) => (session as Record<string, unknown>)[key] === value)
    )
  }

  const sortKey = Object.keys(sort)[0]
  if (sortKey) {
    const direction = sort[sortKey]
    sessions.sort((a, b) => {
      const left = (a as Record<string, unknown>)[sortKey]
      const right = (b as Record<string, unknown>)[sortKey]
      if (typeof left === 'bigint' && typeof right === 'bigint') {
        return direction === 'asc' ? Number(left - right) : Number(right - left)
      }
      if (typeof left === 'string' && typeof right === 'string') {
        return direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left)
      }
      return 0
    })
  }

  const start = (page - 1) * limit
  const paginated = sessions.slice(start, start + limit)

  return { success: true, data: paginated }
}
