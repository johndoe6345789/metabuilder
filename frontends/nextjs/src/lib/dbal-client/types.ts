// Stub types
export interface DBALAdapter {
  // Stub interface
}

export interface ListOptions {
  limit?: number
  offset?: number
}

export interface ListResult<T> {
  items: T[]
  total: number
}
