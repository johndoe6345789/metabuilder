/**
 * @file list-workflows.ts
 * @description List workflows with filtering and pagination
 */
import type { ListOptions, Result, Workflow } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'

/**
 * List workflows with filtering and pagination
 */
export const listWorkflows = async (
  store: InMemoryStore,
  options: ListOptions = {}
): Promise<Result<Workflow[]>> => {
  const { filter = {}, sort = {}, page = 1, limit = 20 } = options

  let workflows = Array.from(store.workflows.values())

  if (filter.isActive !== undefined) {
    workflows = workflows.filter((workflow) => workflow.isActive === filter.isActive)
  }

  if (filter.trigger !== undefined) {
    workflows = workflows.filter((workflow) => workflow.trigger === filter.trigger)
  }

  if (filter.createdBy !== undefined) {
    workflows = workflows.filter((workflow) => workflow.createdBy === filter.createdBy)
  }

  if (sort.name) {
    workflows.sort((a, b) =>
      sort.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    )
  } else if (sort.createdAt) {
    workflows.sort((a, b) =>
      sort.createdAt === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  const start = (page - 1) * limit
  const paginated = workflows.slice(start, start + limit)

  return { success: true, data: paginated }
}
