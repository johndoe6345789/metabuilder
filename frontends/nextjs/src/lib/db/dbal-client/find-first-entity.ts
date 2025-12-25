import { buildWhereClause } from './build-where-clause'
import { getModel } from './get-model'

export async function findFirstEntity(
  entity: string,
  options?: { where?: Record<string, unknown> }
): Promise<unknown | null> {
  const model = getModel(entity)
  const where = options?.where ? buildWhereClause(options.where) : undefined
  return model.findFirst({ where })
}
