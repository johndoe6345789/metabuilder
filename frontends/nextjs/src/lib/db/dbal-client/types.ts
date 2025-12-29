export interface ListOptions {
  filter?: Record<string, unknown>
  sort?: Record<string, 'asc' | 'desc'>
  page?: number
  limit?: number
}

export interface ListResult<T> {
  data: T[]
  total?: number
  page?: number
  limit?: number
  hasMore?: boolean
}

export interface DBALAdapter {
  create(entity: string, data: Record<string, unknown>): Promise<unknown>
  read(entity: string, id: string): Promise<unknown | null>
  update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown>
  delete(entity: string, id: string): Promise<boolean>
  list(entity: string, options?: ListOptions): Promise<ListResult<unknown>>
  findFirst(entity: string, options?: { where?: Record<string, unknown> }): Promise<unknown | null>
  upsert(
    entity: string,
    options: {
      where: Record<string, unknown>
      update: Record<string, unknown>
      create: Record<string, unknown>
    }
  ): Promise<unknown>
  close(): Promise<void>
}
