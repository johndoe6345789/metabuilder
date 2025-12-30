export interface ListOptions {
  filter?: Record<string, unknown>
  sort?: Record<string, 'asc' | 'desc'>
  page?: number
  limit?: number
}

export interface ListResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ResultError {
  code: string
  message: string
}

export type Result<T> = { success: true; data: T } | { success: false; error: ResultError }
