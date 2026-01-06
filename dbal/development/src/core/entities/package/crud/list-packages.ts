/**
 * @file list-packages.ts
 * @description List packages with filtering and pagination
 */
import type { ListOptions, Package, Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'

/**
 * List packages with filtering and pagination
 */
export const listPackages = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<Package[]>> => {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let packages = Array.from(store.packages.values())

  if (filter.name !== undefined) {
    packages = packages.filter((pkg) => pkg.name === filter.name)
  }

  if (filter.version !== undefined) {
    packages = packages.filter((pkg) => pkg.version === filter.version)
  }

  if (filter.author !== undefined) {
    packages = packages.filter((pkg) => pkg.author === filter.author)
  }

  if (filter.isInstalled !== undefined) {
    packages = packages.filter((pkg) => pkg.isInstalled === filter.isInstalled)
  }

  if (sort.name) {
    packages.sort((a, b) =>
      sort.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    )
  } else if (sort.createdAt) {
    packages.sort((a, b) =>
      sort.createdAt === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  const start = (page - 1) * limit
  const paginated = packages.slice(start, start + limit)

  return { success: true, data: paginated }
}
