/**
 * DBAL Adapter types
 */

export interface ListOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  filter?: Record<string, unknown>
}

export interface ListResult<T = unknown> {
  data: T[]
  total: number
  hasMore: boolean
}

export interface DBALAdapter {
  // Create operations
  create(entity: string, data: Record<string, unknown>): Promise<unknown>
  
  // Read operations
  get(entity: string, id: string | number): Promise<unknown>
  list(entity: string, options?: ListOptions): Promise<ListResult>
  
  // Update operations
  update(entity: string, id: string | number, data: Record<string, unknown>): Promise<unknown>
  upsert(
    entity: string,
    uniqueField: string,
    uniqueValue: unknown,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown>
  
  // Delete operations
  delete(entity: string, id: string | number): Promise<void>
  
  // Batch operations
  createMany(entity: string, data: Record<string, unknown>[]): Promise<unknown[]>
  updateMany(entity: string, ids: (string | number)[], data: Record<string, unknown>): Promise<unknown[]>
  deleteMany(entity: string, ids: (string | number)[]): Promise<void>
  
  // Query operations
  query(entity: string, filter: Record<string, unknown>, options?: ListOptions): Promise<ListResult>
  count(entity: string, filter?: Record<string, unknown>): Promise<number>
  
  // Transaction support
  transaction<T>(fn: (adapter: DBALAdapter) => Promise<T>): Promise<T>
  
  // Lifecycle
  close(): Promise<void>
}
