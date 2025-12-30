import { prisma } from '../../../config/prisma'

type PrismaModel = {
  findMany: (...args: unknown[]) => Promise<unknown[]>
  findUnique: (...args: unknown[]) => Promise<unknown | null>
  create: (...args: unknown[]) => Promise<unknown>
  update: (...args: unknown[]) => Promise<unknown>
  delete: (...args: unknown[]) => Promise<unknown>
}

/**
 * Get the Prisma model by entity name
 */
export function getModel(entity: string): PrismaModel {
  const modelName = entity.charAt(0).toLowerCase() + entity.slice(1)
  const model = (prisma as Record<string, PrismaModel>)[modelName]
  if (!model) {
    throw new Error(`Entity ${entity} not found in Prisma schema`)
  }
  return model
}
