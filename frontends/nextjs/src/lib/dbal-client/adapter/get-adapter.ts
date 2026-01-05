/**
 * Get the current DBAL adapter instance
 */

import { prisma } from '../../config/prisma'
import type { DBALAdapter, ListOptions, ListResult } from '../types'

// Simple Prisma-based adapter implementation
class PrismaAdapter implements DBALAdapter {
  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    const model = (prisma as  any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.create({ data })
  }

  async get(entity: string, id: string | number): Promise<unknown> {
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.findUnique({ where: { id } })
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult> {
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
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.update({ where: { id }, data })
  }

  async upsert(
    entity: string,
    uniqueField: string,
    uniqueValue: unknown,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown> {
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    return await model.upsert({
      where: { [uniqueField]: uniqueValue },
      create: createData,
      update: updateData,
    })
  }

  async delete(entity: string, id: string | number): Promise<void> {
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    await model.delete({ where: { id } })
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<unknown[]> {
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    await model.createMany({ data })
    return data
  }

  async updateMany(entity: string, ids: (string | number)[], data: Record<string, unknown>): Promise<unknown[]> {
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    
    const results = await Promise.all(
      ids.map(id => model.update({ where: { id }, data }))
    )
    return results
  }

  async deleteMany(entity: string, ids: (string | number)[]): Promise<void> {
    const model = (prisma as any)[entity.toLowerCase()]
    if (!model) throw new Error(`Unknown entity: ${entity}`)
    await model.deleteMany({ where: { id: { in: ids } } })
  }

  async query(entity: string, filter: Record<string, unknown>, options?: ListOptions): Promise<ListResult> {
    return this.list(entity, { ...options, filter })
  }

  async count(entity: string, filter?: Record<string, unknown>): Promise<number> {
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
