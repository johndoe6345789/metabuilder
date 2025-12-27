import { PrismaClient } from '@prisma/client'
import type { DBALAdapter, AdapterCapabilities } from './adapter'
import type { ListOptions, ListResult } from '../core/types'
import { DBALError } from '../core/errors'

type PrismaAdapterDialect = 'postgres' | 'mysql' | 'sqlite' | 'generic'

export interface PrismaAdapterOptions {
  queryTimeout?: number
  dialect?: PrismaAdapterDialect
}

export class PrismaAdapter implements DBALAdapter {
  private prisma: PrismaClient
  private queryTimeout: number
  private dialect: PrismaAdapterDialect

  constructor(databaseUrl?: string, options?: PrismaAdapterOptions) {
    const inferredDialect = options?.dialect ?? PrismaAdapter.inferDialectFromUrl(databaseUrl)
    this.dialect = inferredDialect ?? 'generic'
    this.prisma = new PrismaClient({
      datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    })
    this.queryTimeout = options?.queryTimeout ?? 30000
  }

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    try {
      const model = this.getModel(entity)
      const result = await this.withTimeout(
        model.create({ data: data as never })
      )
      return result
    } catch (error) {
      throw this.handleError(error, 'create', entity)
    }
  }

  async read(entity: string, id: string): Promise<unknown | null> {
    try {
      const model = this.getModel(entity)
      const result = await this.withTimeout(
        model.findUnique({ where: { id } as never })
      )
      return result
    } catch (error) {
      throw this.handleError(error, 'read', entity)
    }
  }

  async update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    try {
      const model = this.getModel(entity)
      const result = await this.withTimeout(
        model.update({ 
          where: { id } as never,
          data: data as never
        })
      )
      return result
    } catch (error) {
      throw this.handleError(error, 'update', entity)
    }
  }

  async delete(entity: string, id: string): Promise<boolean> {
    try {
      const model = this.getModel(entity)
      await this.withTimeout(
        model.delete({ where: { id } as never })
      )
      return true
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false
      }
      throw this.handleError(error, 'delete', entity)
    }
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    try {
      const model = this.getModel(entity)
      const page = options?.page || 1
      const limit = options?.limit || 50
      const skip = (page - 1) * limit

      const where = options?.filter ? this.buildWhereClause(options.filter) : undefined
      const orderBy = options?.sort ? this.buildOrderBy(options.sort) : undefined

      const [data, total] = await Promise.all([
        this.withTimeout(
          model.findMany({
            where: where as never,
            orderBy: orderBy as never,
            skip,
            take: limit,
          })
        ),
        this.withTimeout(
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
      throw this.handleError(error, 'list', entity)
    }
  }

  async findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    try {
      const model = this.getModel(entity)
      const where = filter ? this.buildWhereClause(filter) : undefined
      const result = await this.withTimeout(
        model.findFirst({ where: where as never })
      )
      return result
    } catch (error) {
      throw this.handleError(error, 'findFirst', entity)
    }
  }

  async findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    try {
      const model = this.getModel(entity)
      const result = await this.withTimeout(
        model.findUnique({ where: { [field]: value } as never })
      )
      return result
    } catch (error) {
      throw this.handleError(error, 'findByField', entity)
    }
  }

  async upsert(
    entity: string, 
    uniqueField: string, 
    uniqueValue: unknown, 
    createData: Record<string, unknown>, 
    updateData: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const model = this.getModel(entity)
      const result = await this.withTimeout(
        model.upsert({
          where: { [uniqueField]: uniqueValue } as never,
          create: createData as never,
          update: updateData as never,
        })
      )
      return result
    } catch (error) {
      throw this.handleError(error, 'upsert', entity)
    }
  }

  async updateByField(entity: string, field: string, value: unknown, data: Record<string, unknown>): Promise<unknown> {
    try {
      const model = this.getModel(entity)
      const result = await this.withTimeout(
        model.update({
          where: { [field]: value } as never,
          data: data as never,
        })
      )
      return result
    } catch (error) {
      throw this.handleError(error, 'updateByField', entity)
    }
  }

  async deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    try {
      const model = this.getModel(entity)
      await this.withTimeout(
        model.delete({ where: { [field]: value } as never })
      )
      return true
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false
      }
      throw this.handleError(error, 'deleteByField', entity)
    }
  }

  async deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    try {
      const model = this.getModel(entity)
      const where = filter ? this.buildWhereClause(filter) : undefined
      const result = await this.withTimeout(
        model.deleteMany({ where: where as never })
      )
      return result.count
    } catch (error) {
      throw this.handleError(error, 'deleteMany', entity)
    }
  }

  async updateMany(entity: string, filter: Record<string, unknown>, data: Record<string, unknown>): Promise<number> {
    try {
      const model = this.getModel(entity)
      const where = this.buildWhereClause(filter)
      const result = await this.withTimeout(
        model.updateMany({ where: where as never, data: data as never })
      )
      return result.count
    } catch (error) {
      throw this.handleError(error, 'updateMany', entity)
    }
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    try {
      const model = this.getModel(entity)
      const result = await this.withTimeout(
        model.createMany({ data: data as never })
      )
      return result.count
    } catch (error) {
      throw this.handleError(error, 'createMany', entity)
    }
  }

  async getCapabilities(): Promise<AdapterCapabilities> {
    return this.buildCapabilities()
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect()
  }

  private getModel(entity: string): any {
    const modelName = entity.charAt(0).toLowerCase() + entity.slice(1)
    const model = (this.prisma as any)[modelName]
    
    if (!model) {
      throw DBALError.notFound(`Entity ${entity} not found`)
    }
    
    return model
  }

  private buildWhereClause(filter: Record<string, unknown>): Record<string, unknown> {
    const where: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(filter)) {
      if (value === null || value === undefined) {
        where[key] = null
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        where[key] = value
      } else {
        where[key] = value
      }
    }
    
    return where
  }

  private buildOrderBy(sort: Record<string, 'asc' | 'desc'>): Record<string, string> {
    return sort
  }

  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(DBALError.timeout()), this.queryTimeout)
      )
    ])
  }

  private isNotFoundError(error: unknown): boolean {
    return error instanceof Error && error.message.includes('not found')
  }

  private handleError(error: unknown, operation: string, entity: string): DBALError {
    if (error instanceof DBALError) {
      return error
    }

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return DBALError.conflict(`${entity} already exists`)
      }
      if (error.message.includes('Foreign key constraint')) {
        return DBALError.validationError('Related resource not found')
      }
      if (error.message.includes('not found')) {
        return DBALError.notFound(`${entity} not found`)
      }
      return DBALError.internal(`Database error during ${operation}: ${error.message}`)
    }

    return DBALError.internal(`Unknown error during ${operation}`)
  }

  private buildCapabilities(): AdapterCapabilities {
    const fullTextSearch = this.dialect === 'postgres' || this.dialect === 'mysql'

    return {
      transactions: true,
      joins: true,
      fullTextSearch,
      ttl: false,
      jsonQueries: true,
      aggregations: true,
      relations: true,
    }
  }

  private static inferDialectFromUrl(url?: string): PrismaAdapterDialect | undefined {
    if (!url) {
      return undefined
    }

    if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
      return 'postgres'
    }

    if (url.startsWith('mysql://')) {
      return 'mysql'
    }

    if (url.startsWith('file:') || url.startsWith('sqlite://')) {
      return 'sqlite'
    }

    return undefined
  }
}

export class PostgresAdapter extends PrismaAdapter {
  constructor(databaseUrl?: string, options?: PrismaAdapterOptions) {
    super(databaseUrl, { ...options, dialect: 'postgres' })
  }
}

export class MySQLAdapter extends PrismaAdapter {
  constructor(databaseUrl?: string, options?: PrismaAdapterOptions) {
    super(databaseUrl, { ...options, dialect: 'mysql' })
  }
}
