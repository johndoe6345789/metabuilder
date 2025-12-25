import type { ListOptions, ListResult } from '../core/types'

export interface AdapterCapabilities {
  transactions: boolean
  joins: boolean
  fullTextSearch: boolean
  ttl: boolean
  jsonQueries: boolean
  aggregations: boolean
  relations: boolean
}

export interface DBALAdapter {
  // Core CRUD operations
  create(entity: string, data: Record<string, unknown>): Promise<unknown>
  read(entity: string, id: string): Promise<unknown | null>
  update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown>
  delete(entity: string, id: string): Promise<boolean>
  list(entity: string, options?: ListOptions): Promise<ListResult<unknown>>
  
  // Extended query operations
  findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null>
  findByField(entity: string, field: string, value: unknown): Promise<unknown | null>
  
  // Extended mutation operations
  upsert(entity: string, uniqueField: string, uniqueValue: unknown, createData: Record<string, unknown>, updateData: Record<string, unknown>): Promise<unknown>
  updateByField(entity: string, field: string, value: unknown, data: Record<string, unknown>): Promise<unknown>
  deleteByField(entity: string, field: string, value: unknown): Promise<boolean>
  deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number>
  createMany(entity: string, data: Record<string, unknown>[]): Promise<number>
  
  getCapabilities(): Promise<AdapterCapabilities>
  close(): Promise<void>
}
