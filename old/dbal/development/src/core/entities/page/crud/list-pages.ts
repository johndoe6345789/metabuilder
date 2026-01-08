/**
 * @file list-pages.ts
 * @description List pages with filtering and pagination
 */
import type { ListOptions, PageConfig, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'

/**
 * List pages with filtering and pagination
 */
export const listPages = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<PageConfig[]>> => {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let pages = Array.from(store.pageConfigs.values())

  if (filter && Object.keys(filter).length > 0) {
    pages = pages.filter((page) =>
      Object.entries(filter).every(([key, value]) => (page as Record<string, unknown>)[key] === value)
    )
  }

  const sortKey = Object.keys(sort)[0]
  if (sortKey) {
    const direction = sort[sortKey]
    pages.sort((a, b) => {
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
  const paginated = pages.slice(start, start + limit)

  return { success: true, data: paginated }
}
