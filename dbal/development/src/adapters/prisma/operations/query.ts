import type { ListOptions, ListResult } from '../../core/foundation/types'
import type { PrismaContext } from '../types'
import { handlePrismaError, buildWhereClause, buildOrderBy, getModel, withTimeout } from './utils'

export async function listRecords(
  context: PrismaContext,
  entity: string,
  options?: ListOptions
): Promise<ListResult<unknown>> {
  try {
    const model = getModel(context, entity)
    const page = options?.page || 1
    const limit = options?.limit || 50
    const skip = (page - 1) * limit

    const where = options?.filter ? buildWhereClause(options.filter) : undefined
    const orderBy = options?.sort ? buildOrderBy(options.sort) : undefined

    const [data, total] = await Promise.all([
      withTimeout(
        context,
        model.findMany({
          where: where as never,
          orderBy: orderBy as never,
          skip,
          take: limit,
        })
      ),
      withTimeout(
        context,
        model.count({ where: where as never })
      )
    ]) as [unknown[], number]

    return {
      data: data as unknown[],
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    }
  } catch (error) {
    throw handlePrismaError(error, 'list', entity)
  }
}

export async function findFirstRecord(
  context: PrismaContext,
  entity: string,
  filter?: Record<string, unknown>
): Promise<unknown | null> {
  try {
    const model = getModel(context, entity)
    const where = filter ? buildWhereClause(filter) : undefined
    return await withTimeout(
      context,
      model.findFirst({ where: where as never })
    )
  } catch (error) {
    throw handlePrismaError(error, 'findFirst', entity)
  }
}

export async function findByField(
  context: PrismaContext,
  entity: string,
  field: string,
  value: unknown
): Promise<unknown | null> {
  try {
    const model = getModel(context, entity)
    return await withTimeout(
      context,
      model.findUnique({ where: { [field]: value } as never })
    )
  } catch (error) {
    throw handlePrismaError(error, 'findByField', entity)
  }
}
