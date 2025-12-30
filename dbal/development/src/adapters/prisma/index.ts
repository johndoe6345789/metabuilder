import type { DBALAdapter } from '../adapter'
import type { ListOptions, ListResult } from '../../core/foundation/types'
import { createPrismaContext } from './context'
import type { PrismaAdapterOptions, PrismaAdapterDialect, PrismaContext } from './types'
import {
  createRecord,
  deleteRecord,
  readRecord,
  updateRecord
} from './operations/crud'
import {
  createMany,
  deleteByField,
  deleteMany,
  updateByField,
  updateMany,
  upsertRecord
} from './operations/bulk'
import {
  findByField,
  findFirstRecord,
  listRecords
} from './operations/query'
import { buildCapabilities } from './operations/capabilities'

export class PrismaAdapter implements DBALAdapter {
  protected context: PrismaContext

  constructor(databaseUrl?: string, options?: PrismaAdapterOptions) {
    this.context = createPrismaContext(databaseUrl, options)
  }

  create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    return createRecord(this.context, entity, data)
  }

  read(entity: string, id: string): Promise<unknown | null> {
    return readRecord(this.context, entity, id)
  }

  update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    return updateRecord(this.context, entity, id, data)
  }

  delete(entity: string, id: string): Promise<boolean> {
    return deleteRecord(this.context, entity, id)
  }

  list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    return listRecords(this.context, entity, options)
  }

  findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    return findFirstRecord(this.context, entity, filter)
  }

  findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    return findByField(this.context, entity, field, value)
  }

  upsert(
    entity: string,
    uniqueField: string,
    uniqueValue: unknown,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown> {
    return upsertRecord(this.context, entity, uniqueField, uniqueValue, createData, updateData)
  }

  updateByField(
    entity: string,
    field: string,
    value: unknown,
    data: Record<string, unknown>
  ): Promise<unknown> {
    return updateByField(this.context, entity, field, value, data)
  }

  deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    return deleteByField(this.context, entity, field, value)
  }

  deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    return deleteMany(this.context, entity, filter)
  }

  updateMany(
    entity: string,
    filter: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<number> {
    return updateMany(this.context, entity, filter, data)
  }

  createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    return createMany(this.context, entity, data)
  }

  getCapabilities() {
    return Promise.resolve(buildCapabilities(this.context))
  }

  async close(): Promise<void> {
    await this.context.prisma.$disconnect()
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

export { PrismaAdapterOptions, PrismaAdapterDialect }
