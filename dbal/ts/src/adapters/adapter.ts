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
  create(entity: string, data: Record<string, unknown>): Promise<unknown>
  read(entity: string, id: string): Promise<unknown | null>
  update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown>
  delete(entity: string, id: string): Promise<boolean>
  list(entity: string, options?: ListOptions): Promise<ListResult<unknown>>
  
  getCapabilities(): Promise<AdapterCapabilities>
  close(): Promise<void>
}
