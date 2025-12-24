import { PrismaClient } from '@prisma/client'
import type { DBALAdapter, AdapterCapabilities } from './adapter'
import type { ListOptions, ListResult } from '../core/types'
import { DBALError } from '../core/errors'

export class PrismaAdapter implements DBALAdapter {
  private prisma: PrismaClient
  private queryTimeout: number

  constructor(databaseUrl?: string, options?: { queryTimeout?: number }) {
    this.prisma = new PrismaClient({
      datasources: databaseUrl ? {
        db: { url: databaseUrl }
      } : undefined,
    })
    this.queryTimeout = options?.queryTimeout || 30000
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
      ])

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

  async getCapabilities(): Promise<AdapterCapabilities> {
    return {
      transactions: true,
      joins: true,
      fullTextSearch: false,
      ttl: false,
      jsonQueries: true,
      aggregations: true,
      relations: true,
    }
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect()
  }

  private getModel(entity: string): never {
    const modelName = entity.charAt(0).toLowerCase() + entity.slice(1)
    const model = (this.prisma as never)[modelName]
    
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
}
