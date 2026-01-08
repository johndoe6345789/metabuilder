/**
 * @file list-workflows.ts
 * @description List workflows with filtering and pagination
 */
import type { ListOptions, Result, Workflow } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'

/**
 * List workflows with filtering and pagination
 */
export const listWorkflows = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<Workflow[]>> => {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let workflows = Array.from(store.workflows.values())

  if (filter && Object.keys(filter).length > 0) {
    workflows = workflows.filter((workflow) =>
      Object.entries(filter).every(([key, value]) => (workflow as Record<string, unknown>)[key] === value)
    )
  }

  const sortKey = Object.keys(sort)[0]
  if (sortKey) {
    const direction = sort[sortKey]
    workflows.sort((a, b) => {
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
      if (typeof left === 'boolean' && typeof right === 'boolean') {
        return direction === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
      }
      return 0
    })
  }

  const start = (page - 1) * limit
  const paginated = workflows.slice(start, start + limit)

  return { success: true, data: paginated }
}
