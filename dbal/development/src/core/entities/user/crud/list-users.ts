/**
 * @file list-users.ts
 * @description List users with filtering and pagination
 */
import type { ListOptions, Result, User } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'

/**
 * List users with filtering and pagination
 */
export const listUsers = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<User[]>> => {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let users = Array.from(store.users.values())

  if (filter && Object.keys(filter).length > 0) {
    users = users.filter((user) =>
      Object.entries(filter).every(([key, value]) => (user as Record<string, unknown>)[key] === value)
    )
  }

  const sortKey = Object.keys(sort)[0]
  if (sortKey) {
    const direction = sort[sortKey]
    users.sort((a, b) => {
      const left = (a as Record<string, unknown>)[sortKey]
      const right = (b as Record<string, unknown>)[sortKey]
      if (typeof left === 'string' && typeof right === 'string') {
        return direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left)
      }
      if (typeof left === 'bigint' && typeof right === 'bigint') {
        return direction === 'asc' ? Number(left - right) : Number(right - left)
      }
      if (typeof left === 'number' && typeof right === 'number') {
        return direction === 'asc' ? left - right : right - left
      }
      return 0
    })
  }

  const start = (page - 1) * limit
  const paginated = users.slice(start, start + limit)

  return { success: true, data: paginated }
}
