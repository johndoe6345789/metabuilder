/**
 * Get the current DBAL adapter instance
 */

import { PrismaAdapter as DevelopmentPrismaAdapter, PostgresAdapter as DevelopmentPostgresAdapter, MySQLAdapter as DevelopmentMySQLAdapter } from '@/dbal/adapters/prisma'
import type { DBALAdapter as DevelopmentAdapterBase } from '@/dbal/adapters/adapter'
import type { ListOptions as DevelopmentListOptions } from '@/dbal/core/foundation/types/shared'
import { prisma } from '../../config/prisma'
import type { DBALAdapter, ListOptions, ListResult } from '../types'

const DEFAULT_DEV_PAGE_SIZE = 50

// Simple Prisma-based adapter implementation
class PrismaAdapter implements DBALAdapter {
  private getModel(entity: string): any {
    const prismaClient = prisma as Record<string, any>
    const direct = prismaClient[entity]
    if (direct !== undefined) return direct

    const firstChar = entity.charAt(0)
    const camel = firstChar.length > 0 ? `${firstChar.toLowerCase()}${entity.slice(1)}` : entity
    const camelMatch = prismaClient[camel]
    if (camelMatch !== undefined) return camelMatch

    const lower = entity.toLowerCase()
    const lowerMatch = prismaClient[lower]
    if (lowerMatch !== undefined) return lowerMatch

    throw new Error(`Unknown entity: ${entity}`)
  }

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    const model = this.getModel(entity)
    return await model.create({ data })
  }

  async get(entity: string, id: string | number): Promise<unknown> {
    const model = this.getModel(entity)
    return await model.findUnique({ where: { id } })
  }

  async read(entity: string, id: string | number): Promise<unknown> {
    const model = this.getModel(entity)
    return await model.findUnique({ where: { id } })
  }

  async findFirst(entity: string, options: { where: Record<string, unknown> }): Promise<unknown> {
    const model = this.getModel(entity)
    return await model.findFirst({ where: options.where })
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult> {
    const model = this.getModel(entity)
    
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
    const model = this.getModel(entity)
    return await model.update({ where: { id }, data })
  }

  async upsert(
    entity: string,
    uniqueFieldOrOptions: string | { where: Record<string, unknown>; update: Record<string, unknown>; create: Record<string, unknown> },
    uniqueValue?: unknown,
    createData?: Record<string, unknown>,
    updateData?: Record<string, unknown>
  ): Promise<unknown> {
    const model = this.getModel(entity)
    
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
    const model = this.getModel(entity)
    try {
      await model.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<unknown[]> {
    const model = this.getModel(entity)
    await model.createMany({ data })
    return data
  }

  async updateMany(entity: string, ids: (string | number)[], data: Record<string, unknown>): Promise<unknown[]> {
    const model = this.getModel(entity)
    
    const results = await Promise.all(
      ids.map(id => model.update({ where: { id }, data }))
    )
    return results
  }

  async deleteMany(entity: string, ids: (string | number)[]): Promise<void> {
    const model = this.getModel(entity)
    await model.deleteMany({ where: { id: { in: ids } } })
  }

  async query(entity: string, filter: Record<string, unknown>, options?: ListOptions): Promise<ListResult> {
    return this.list(entity, { ...options, filter })
  }

  async count(entity: string, filter?: Record<string, unknown>): Promise<number> {
    const model = this.getModel(entity)
    return await model.count({ where: filter || {} })
  }

  async transaction<T>(fn: (adapter: DBALAdapter) => Promise<T>): Promise<T> {
    return await prisma.$transaction(async () => fn(this))
  }

  async close(): Promise<void> {
    await prisma.$disconnect()
  }
}

class DevelopmentAdapter implements DBALAdapter {
  private readonly adapter: DevelopmentAdapterBase

  constructor(adapter: DevelopmentAdapterBase) {
    this.adapter = adapter
  }

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    return await this.adapter.create(entity, data)
  }

  async get(entity: string, id: string | number): Promise<unknown> {
    return await this.adapter.read(entity, normalizeId(id))
  }

  async read(entity: string, id: string | number): Promise<unknown> {
    return await this.adapter.read(entity, normalizeId(id))
  }

  async findFirst(entity: string, options: { where: Record<string, unknown> }): Promise<unknown> {
    return await this.adapter.findFirst(entity, options.where)
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult> {
    const offset = options?.offset ?? 0
    const limit = options?.limit

    if (limit === undefined) {
      const data: unknown[] = []
      const filter = options?.filter
      const sort = buildSort(options)
      let page = 1
      let total = 0
      let hasMore = true

      while (hasMore) {
        const result = await this.adapter.list(entity, {
          filter,
          sort,
          page,
          limit: DEFAULT_DEV_PAGE_SIZE,
        })
        if (page === 1) {
          total = result.total
        }
        data.push(...result.data)
        hasMore = result.hasMore
        page += 1
      }

      const sliced = offset > 0 ? data.slice(offset) : data
      return { data: sliced, total, hasMore: false }
    }

    const result = await this.adapter.list(entity, buildDevListOptions(options, limit))
    return { data: result.data, total: result.total, hasMore: result.hasMore }
  }

  async update(entity: string, id: string | number, data: Record<string, unknown>): Promise<unknown> {
    return await this.adapter.update(entity, normalizeId(id), data)
  }

  async upsert(
    entity: string,
    uniqueFieldOrOptions: string | { where: Record<string, unknown>; update: Record<string, unknown>; create: Record<string, unknown> },
    uniqueValue?: unknown,
    createData?: Record<string, unknown>,
    updateData?: Record<string, unknown>
  ): Promise<unknown> {
    if (typeof uniqueFieldOrOptions === 'object') {
      const whereKeys = Object.keys(uniqueFieldOrOptions.where)
      if (whereKeys.length !== 1) {
        throw new Error('upsert requires a single unique field')
      }
      const field = whereKeys[0] as string
      const value = uniqueFieldOrOptions.where[field]
      return await this.adapter.upsert(entity, field, value, uniqueFieldOrOptions.create, uniqueFieldOrOptions.update)
    }

    if (createData === null || createData === undefined) {
      throw new Error('createData is required for upsert')
    }
    if (updateData === null || updateData === undefined) {
      throw new Error('updateData is required for upsert')
    }

    return await this.adapter.upsert(entity, uniqueFieldOrOptions, uniqueValue, createData, updateData)
  }

  async delete(entity: string, id: string | number): Promise<boolean> {
    return await this.adapter.delete(entity, normalizeId(id))
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<unknown[]> {
    await this.adapter.createMany(entity, data)
    return data
  }

  async updateMany(entity: string, ids: (string | number)[], data: Record<string, unknown>): Promise<unknown[]> {
    if (ids.length === 0) return []

    const normalizedIds = ids.map(normalizeId)
    await this.adapter.updateMany(entity, { id: { in: normalizedIds } }, data)
    const result = await this.adapter.list(entity, {
      filter: { id: { in: normalizedIds } },
      limit: normalizedIds.length,
      page: 1,
    })
    return result.data
  }

  async deleteMany(entity: string, ids: (string | number)[]): Promise<void> {
    if (ids.length === 0) return
    const normalizedIds = ids.map(normalizeId)
    await this.adapter.deleteMany(entity, { id: { in: normalizedIds } })
  }

  async query(entity: string, filter: Record<string, unknown>, options?: ListOptions): Promise<ListResult> {
    return await this.list(entity, { ...options, filter })
  }

  async count(entity: string, filter?: Record<string, unknown>): Promise<number> {
    const result = await this.adapter.list(entity, {
      filter,
      limit: 1,
      page: 1,
    })
    return result.total
  }

  async transaction<T>(fn: (adapter: DBALAdapter) => Promise<T>): Promise<T> {
    return await fn(this)
  }

  async close(): Promise<void> {
    await this.adapter.close()
  }
}

let adapter: DBALAdapter | null = null

export function getAdapter(): DBALAdapter {
  if (!adapter) {
    adapter = shouldUseDevelopmentAdapter() ? createDevelopmentAdapter() : new PrismaAdapter()
  }
  return adapter
}

function shouldUseDevelopmentAdapter(): boolean {
  const mode = process.env.DBAL_MODE?.toLowerCase()
  if (mode === 'development' || mode === 'dev') {
    return true
  }
  return process.env.DBAL_DEV_MODE === 'true'
}

function createDevelopmentAdapter(): DBALAdapter {
  const adapterType = (process.env.DBAL_ADAPTER ?? 'prisma').toLowerCase()
  const databaseUrl = process.env.DBAL_DATABASE_URL ?? process.env.DATABASE_URL ?? 'file:./dev.db'
  const baseAdapter = buildDevelopmentBaseAdapter(adapterType, databaseUrl)
  return new DevelopmentAdapter(baseAdapter)
}

function buildDevelopmentBaseAdapter(adapterType: string, databaseUrl: string): DevelopmentAdapterBase {
  switch (adapterType) {
    case 'postgres':
      return new DevelopmentPostgresAdapter(databaseUrl)
    case 'mysql':
      return new DevelopmentMySQLAdapter(databaseUrl)
    case 'prisma':
    default:
      return new DevelopmentPrismaAdapter(databaseUrl)
  }
}

function buildDevListOptions(options: ListOptions | undefined, limit: number): DevelopmentListOptions {
  const offset = options?.offset ?? 0
  const page = limit > 0 ? Math.floor(offset / limit) + 1 : 1
  return {
    filter: options?.filter,
    sort: buildSort(options),
    page,
    limit,
  }
}

function buildSort(options?: ListOptions): DevelopmentListOptions['sort'] {
  if (options?.orderBy === undefined) return undefined
  return { [options.orderBy]: options.orderDirection ?? 'asc' }
}

function normalizeId(id: string | number): string {
  return typeof id === 'string' ? id : String(id)
}
