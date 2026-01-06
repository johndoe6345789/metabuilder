/**
 * @file list-pages.ts
 * @description List pages with filtering and pagination
 */
import type { ListOptions, PageView, Result } from '../../types'
import type { InMemoryStore } from '../store/in-memory-store'

/**
 * List pages with filtering and pagination
 */
export const listPages = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<PageView[]>> => {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let pages = Array.from(store.pages.values())

  if (filter.isActive !== undefined) {
    pages = pages.filter((p) => p.isActive === filter.isActive)
  }

  if (filter.level !== undefined) {
    pages = pages.filter((p) => p.level === filter.level)
  }

  if (sort.title) {
    pages.sort((a, b) =>
      sort.title === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    )
  } else if (sort.createdAt) {
    pages.sort((a, b) =>
      sort.createdAt === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  const start = (page - 1) * limit
  const paginated = pages.slice(start, start + limit)

  return { success: true, data: paginated }
}
