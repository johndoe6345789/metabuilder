import { prisma } from '../prisma'

/**
 * Get the Prisma model by entity name
 */
export function getModel(entity: string): any {
  const modelName = entity.charAt(0).toLowerCase() + entity.slice(1)
  const model = (prisma as any)[modelName]
  if (!model) {
    throw new Error(`Entity ${entity} not found in Prisma schema`)
  }
  return model
}
