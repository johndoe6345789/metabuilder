/**
 * DBAL Client Singleton
 * 
 * Provides centralized access to the Database Abstraction Layer.
 * All db/ lambda functions should use this instead of importing Prisma directly.
 * 
 * This uses the PrismaClient directly but wraps it in a DBAL-compatible interface,
 * providing a migration path to the full DBAL when ready.
 */

import { prisma } from '../prisma'

export interface ListOptions {
  filter?: Record<string, unknown>
  sort?: Record<string, 'asc' | 'desc'>
  page?: number
  limit?: number
}

export interface ListResult<T> {
  data: T[]
  total?: number
  page?: number
  limit?: number
  hasMore?: boolean
}

export interface DBALAdapter {
  create(entity: string, data: Record<string, unknown>): Promise<unknown>
  read(entity: string, id: string): Promise<unknown | null>
  update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown>
  delete(entity: string, id: string): Promise<boolean>
  list(entity: string, options?: ListOptions): Promise<ListResult<unknown>>
  close(): Promise<void>
}

/**
 * Get the Prisma model by entity name
 */
const getModel = (entity: string): any => {
  const modelName = entity.charAt(0).toLowerCase() + entity.slice(1)
  const model = (prisma as any)[modelName]
  if (!model) {
    throw new Error(`Entity ${entity} not found in Prisma schema`)
  }
  return model
}

/**
 * Build where clause from filter
 */
const buildWhereClause = (filter: Record<string, unknown>): Record<string, unknown> => {
  const where: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined) {
      where[key] = value
    }
  }
  return where
}

/**
 * DBAL Adapter implementation using Prisma
 */
const prismaAdapter: DBALAdapter = {
  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    const model = getModel(entity)
    return model.create({ data })
  },

  async read(entity: string, id: string): Promise<unknown | null> {
    const model = getModel(entity)
    return model.findUnique({ where: { id } })
  },

  async update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    const model = getModel(entity)
    // Filter out undefined values
    const cleanData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanData[key] = value
      }
    }
    return model.update({ where: { id }, data: cleanData })
  },

  async delete(entity: string, id: string): Promise<boolean> {
    const model = getModel(entity)
    try {
      await model.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  },

  async list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
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
  },

  async close(): Promise<void> {
    await prisma.$disconnect()
  },
}

/**
 * Get the DBAL adapter singleton for database operations
 */
export const getAdapter = (): DBALAdapter => {
  return prismaAdapter
}

/**
 * Close the DBAL adapter connection
 */
export const closeAdapter = async (): Promise<void> => {
  await prismaAdapter.close()
}
