import { buildWhereClause } from '../../utils/build-where-clause'
import { getModel } from '../../utils/get-model'
import type { ListOptions, ListResult } from '../../types'

export async function listEntities(
  entity: string,
  options?: ListOptions
): Promise<ListResult<unknown>> {
  const model = getModel(entity)
  const page = options?.page || 1
  const limit = options?.limit || 1000
  const skip = (page - 1) * limit
  const where = options?.filter ? buildWhereClause(options.filter) : undefined
  const orderBy = options?.sort

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ])

  return {
    data,
    total,
    page,
    limit,
    hasMore: skip + limit < total,
  }
}
