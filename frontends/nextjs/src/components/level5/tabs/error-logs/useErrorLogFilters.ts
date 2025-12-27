import { useState } from 'react'
import type { ErrorLog } from '@/lib/db/error-logs'

export type ErrorLevelFilter = 'all' | 'error' | 'warning' | 'info'
export type ResolutionFilter = 'all' | 'resolved' | 'unresolved'

export interface ErrorLogFilters {
  level: ErrorLevelFilter
  resolution: ResolutionFilter
}

interface UseErrorLogFiltersReturn {
  filters: ErrorLogFilters
  setFilterLevel: (value: ErrorLevelFilter) => void
  setFilterResolution: (value: ResolutionFilter) => void
}

export function useErrorLogFilters(): UseErrorLogFiltersReturn {
  const [filterLevel, setFilterLevel] = useState<ErrorLevelFilter>('all')
  const [filterResolved, setFilterResolved] = useState<ResolutionFilter>('all')

  return {
    filters: {
      level: filterLevel,
      resolution: filterResolved,
    },
    setFilterLevel,
    setFilterResolution: setFilterResolved,
  }
}

export function filterLogs(logs: ErrorLog[], filters: ErrorLogFilters): ErrorLog[] {
  return logs.filter(log => {
    if (filters.level !== 'all' && log.level !== filters.level) return false
    if (filters.resolution === 'resolved' && !log.resolved) return false
    if (filters.resolution === 'unresolved' && log.resolved) return false
    return true
  })
}
