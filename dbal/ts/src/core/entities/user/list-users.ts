/**
 * @file list-users.ts
 * @description List users with filtering and pagination
 */
import type { ListOptions, Result, User } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'

/**
 * List users with filtering and pagination
 */
export const listUsers = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<User[]>> => {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let users = Array.from(store.users.values())

  if (filter.role !== undefined) {
    users = users.filter((user) => user.role === filter.role)
  }

  if (sort.username) {
    users.sort((a, b) =>
      sort.username === 'asc' ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username)
    )
  }

  const start = (page - 1) * limit
  const paginated = users.slice(start, start + limit)

  return { success: true, data: paginated }
}
