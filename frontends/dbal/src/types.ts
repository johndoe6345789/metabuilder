export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface QueryHistoryEntry {
  id: string
  method: HttpMethod
  path: string
  status: number
  statusText: string
  timestamp: string
  body?: unknown
  queryParams?: string
  cli?: string
}

export interface QueryResponse {
  status: number
  statusText: string
  data: unknown
  url: string
  timestamp: string
}
