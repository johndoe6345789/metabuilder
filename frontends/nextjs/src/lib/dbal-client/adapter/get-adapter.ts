/**
 * Get the current DBAL adapter instance
 */

import { prisma } from '../../config/prisma'
import type { DBALAdapter, ListOptions, ListResult } from '../types'

// Simple Prisma-based adapter implementation
class PrismaAdapter implements DBALAdapter {
  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as  any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.create({ data })
  }

  async get(entity: string, id: string | number): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.findUnique({ where: { id } })
  }

  async read(entity: string, id: string | number): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.findUnique({ where: { id } })
  }

  async findFirst(entity: string, options: { where: Record<string, unknown> }): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.findFirst({ where: options.where })
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    
    const where = options?.filter || {}
    const orderBy = options?.orderBy ? { [options.orderBy]: options.orderDirection || 'asc' } : undefined
    
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        take: options?.limit,
        skip: options?.offset,
      }),
      model.count({ where }),
    ])
    
    return {
      data,
      total,
      hasMore: options?.limit ? (options.offset || 0) + data.length < total : false,
    }
  }

  async update(entity: string, id: string | number, data: Record<string, unknown>): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.update({ where: { id }, data })
  }

  async upsert(
    entity: string,
    uniqueFieldOrOptions: string | { where: Record<string, unknown>; update: Record<string, unknown>; create: Record<string, unknown> },
    uniqueValue?: unknown,
    createData?: Record<string, unknown>,
    updateData?: Record<string, unknown>
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    
    // Handle options object form
    if (typeof uniqueFieldOrOptions === 'object') {
      return await model.upsert({
        where: uniqueFieldOrOptions.where,
        create: uniqueFieldOrOptions.create,
        update: uniqueFieldOrOptions.update,
      })
    }
    
    // Handle 5-parameter form - validate data is present
    if (createData === null || createData === undefined) {
      throw new Error('createData is required for upsert')
    }
    if (updateData === null || updateData === undefined) {
      throw new Error('updateData is required for upsert')
    }

    return await model.upsert({
      where: { [uniqueFieldOrOptions]: uniqueValue },
      create: createData,
      update: updateData,
    })
  }

  async delete(entity: string, id: string | number): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    try {
      await model.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<unknown[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    await model.createMany({ data })
    return data
  }

  async updateMany(entity: string, ids: (string | number)[], data: Record<string, unknown>): Promise<unknown[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    
    const results = await Promise.all(
      ids.map(id => model.update({ where: { id }, data }))
    )
    return results
  }

  async deleteMany(entity: string, ids: (string | number)[]): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    await model.deleteMany({ where: { id: { in: ids } } })
  }

  async query(entity: string, filter: Record<string, unknown>, options?: ListOptions): Promise<ListResult> {
    return this.list(entity, { ...options, filter })
  }

  async count(entity: string, filter?: Record<string, unknown>): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.count({ where: filter || {} })
  }

  async transaction<T>(fn: (adapter: DBALAdapter) => Promise<T>): Promise<T> {
    return await prisma.$transaction(async () => fn(this))
  }

  async close(): Promise<void> {
    await prisma.$disconnect()
  }
}

let adapter: DBALAdapter | null = null

export function getAdapter(): DBALAdapter {
  if (!adapter) {
    adapter = new PrismaAdapter()
  }
  return adapter
}
