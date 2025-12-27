import type { AdapterCapabilities } from '../adapter'

export type PrismaAdapterDialect = 'postgres' | 'mysql' | 'sqlite' | 'generic'

export interface PrismaAdapterOptions {
  queryTimeout?: number
  dialect?: PrismaAdapterDialect
}

export interface PrismaContext {
  prisma: any
  queryTimeout: number
  dialect: PrismaAdapterDialect
}

export interface PrismaOperations {
  create(entity: string, data: Record<string, unknown>): Promise<unknown>
  read(entity: string, id: string): Promise<unknown | null>
  update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown>
  delete(entity: string, id: string): Promise<boolean>
  list(entity: string, options?: any): Promise<any>
  findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null>
  findByField(entity: string, field: string, value: unknown): Promise<unknown | null>
  upsert(
    entity: string,
    uniqueField: string,
    uniqueValue: unknown,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown>
  updateByField(entity: string, field: string, value: unknown, data: Record<string, unknown>): Promise<unknown>
  deleteByField(entity: string, field: string, value: unknown): Promise<boolean>
  deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number>
  createMany(entity: string, data: Record<string, unknown>[]): Promise<number>
  updateMany(entity: string, filter: Record<string, unknown>, data: Record<string, unknown>): Promise<number>
  getCapabilities(): Promise<AdapterCapabilities>
  close(): Promise<void>
}
