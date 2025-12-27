import type { ErrorLog } from '@/lib/db/error-logs'

export interface ErrorLogStats {
  total: number
  errors: number
  warnings: number
  info: number
  resolved: number
  unresolved: number
}

export interface ErrorLogFilters {
  filterLevel: string
  filterResolved: string
}

export const emptyStats: ErrorLogStats = {
  total: 0,
  errors: 0,
  warnings: 0,
  info: 0,
  resolved: 0,
  unresolved: 0,
}

export function calculateStats(logs: ErrorLog[]): ErrorLogStats {
  return {
    total: logs.length,
    errors: logs.filter((log) => log.level === 'error').length,
    warnings: logs.filter((log) => log.level === 'warning').length,
    info: logs.filter((log) => log.level === 'info').length,
    resolved: logs.filter((log) => log.resolved).length,
    unresolved: logs.filter((log) => !log.resolved).length,
  }
}

export function filterLogs(logs: ErrorLog[], filters: ErrorLogFilters): ErrorLog[] {
  return logs.filter((log) => {
    if (filters.filterLevel !== 'all' && log.level !== filters.filterLevel) return false
    if (filters.filterResolved === 'resolved' && !log.resolved) return false
    if (filters.filterResolved === 'unresolved' && log.resolved) return false
    return true
  })
}
