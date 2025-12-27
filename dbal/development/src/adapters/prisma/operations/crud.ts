import type { PrismaContext } from '../types'
import { handlePrismaError, getModel, withTimeout, isNotFoundError } from './utils'

export async function createRecord(
  context: PrismaContext,
  entity: string,
  data: Record<string, unknown>
): Promise<unknown> {
  try {
    const model = getModel(context, entity)
    return await withTimeout(context, model.create({ data: data as never }))
  } catch (error) {
    throw handlePrismaError(error, 'create', entity)
  }
}

export async function readRecord(
  context: PrismaContext,
  entity: string,
  id: string
): Promise<unknown | null> {
  try {
    const model = getModel(context, entity)
    return await withTimeout(
      context,
      model.findUnique({ where: { id } as never })
    )
  } catch (error) {
    throw handlePrismaError(error, 'read', entity)
  }
}

export async function updateRecord(
  context: PrismaContext,
  entity: string,
  id: string,
  data: Record<string, unknown>
): Promise<unknown> {
  try {
    const model = getModel(context, entity)
    return await withTimeout(
      context,
      model.update({
        where: { id } as never,
        data: data as never
      })
    )
  } catch (error) {
    throw handlePrismaError(error, 'update', entity)
  }
}

export async function deleteRecord(
  context: PrismaContext,
  entity: string,
  id: string
): Promise<boolean> {
  try {
    const model = getModel(context, entity)
    await withTimeout(
      context,
      model.delete({ where: { id } as never })
    )
    return true
  } catch (error) {
    if (isNotFoundError(error)) {
      return false
    }
    throw handlePrismaError(error, 'delete', entity)
  }
}
