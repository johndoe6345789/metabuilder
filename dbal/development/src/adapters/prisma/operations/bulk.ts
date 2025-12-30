import type { PrismaContext } from '../types'
import { handlePrismaError, buildWhereClause, getModel, withTimeout, isNotFoundError } from './utils'

export async function upsertRecord(
  context: PrismaContext,
  entity: string,
  uniqueField: string,
  uniqueValue: unknown,
  createData: Record<string, unknown>,
  updateData: Record<string, unknown>
): Promise<unknown> {
  try {
    const model = getModel(context, entity)
    return await withTimeout(
      context,
      model.upsert({
        where: { [uniqueField]: uniqueValue } as never,
        create: createData as never,
        update: updateData as never,
      })
    )
  } catch (error) {
    throw handlePrismaError(error, 'upsert', entity)
  }
}

export async function updateByField(
  context: PrismaContext,
  entity: string,
  field: string,
  value: unknown,
  data: Record<string, unknown>
): Promise<unknown> {
  try {
    const model = getModel(context, entity)
    return await withTimeout(
      context,
      model.update({
        where: { [field]: value } as never,
        data: data as never,
      })
    )
  } catch (error) {
    throw handlePrismaError(error, 'updateByField', entity)
  }
}

export async function deleteByField(
  context: PrismaContext,
  entity: string,
  field: string,
  value: unknown
): Promise<boolean> {
  try {
    const model = getModel(context, entity)
    await withTimeout(
      context,
      model.delete({ where: { [field]: value } as never })
    )
    return true
  } catch (error) {
    if (isNotFoundError(error)) {
      return false
    }
    throw handlePrismaError(error, 'deleteByField', entity)
  }
}

export async function deleteMany(
  context: PrismaContext,
  entity: string,
  filter?: Record<string, unknown>
): Promise<number> {
  try {
    const model = getModel(context, entity)
    const where = filter ? buildWhereClause(filter) : undefined
    const result: { count: number } = await withTimeout(
      context,
      model.deleteMany({ where: where as never })
    )
    return result.count
  } catch (error) {
    throw handlePrismaError(error, 'deleteMany', entity)
  }
}

export async function updateMany(
  context: PrismaContext,
  entity: string,
  filter: Record<string, unknown>,
  data: Record<string, unknown>
): Promise<number> {
  try {
    const model = getModel(context, entity)
    const where = buildWhereClause(filter)
    const result: { count: number } = await withTimeout(
      context,
      model.updateMany({ where: where as never, data: data as never })
    )
    return result.count
  } catch (error) {
    throw handlePrismaError(error, 'updateMany', entity)
  }
}

export async function createMany(
  context: PrismaContext,
  entity: string,
  data: Record<string, unknown>[]
): Promise<number> {
  try {
    const model = getModel(context, entity)
    const result: { count: number } = await withTimeout(
      context,
      model.createMany({ data: data as never })
    )
    return result.count
  } catch (error) {
    throw handlePrismaError(error, 'createMany', entity)
  }
}
