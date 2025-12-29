import { useMemo, useState } from 'react'

import type { ErrorLog } from '@/lib/db/error-logs'

export const useErrorLogFilters = (logs: ErrorLog[]) => {
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterResolved, setFilterResolved] = useState('all')

  const filteredLogs = useMemo(
    () =>
      logs.filter(log => {
        if (filterLevel !== 'all' && log.level !== filterLevel) return false
        if (filterResolved === 'resolved' && !log.resolved) return false
        if (filterResolved === 'unresolved' && log.resolved) return false
        return true
      }),
    [logs, filterLevel, filterResolved]
  )

  return { filterLevel, filterResolved, setFilterLevel, setFilterResolved, filteredLogs }
}
