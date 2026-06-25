export interface DBALHealthResponse {
  status: string
  uptime_seconds?: number
  adapter?: string
}

export interface DBALConfigResponse {
  adapter: string
  database_url: string
  status: string
  [key: string]: unknown
}

export interface DBALAdapterInfo {
  name: string
  description: string
  supported: boolean
  active: boolean
}

export interface DBALSeedResult {
  success: boolean
  totalInserted: number
  totalSkipped: number
  totalFailed: number
  results: Array<{
    entity: string
    inserted: number
    skipped: number
    failed: number
    errors: string[]
  }>
  errors: string[]
}
