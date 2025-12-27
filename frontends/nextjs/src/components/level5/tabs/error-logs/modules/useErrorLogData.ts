import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Database } from '@/lib/database'
import type { ErrorLog } from '@/lib/db/error-logs'
import type { User } from '@/lib/level-types'

interface ErrorLogStats {
  total: number
  errors: number
  warnings: number
  info: number
  resolved: number
  unresolved: number
}

const buildStats = (logs: ErrorLog[]): ErrorLogStats => ({
  total: logs.length,
  errors: logs.filter((log) => log.level === 'error').length,
  warnings: logs.filter((log) => log.level === 'warning').length,
  info: logs.filter((log) => log.level === 'info').length,
  resolved: logs.filter((log) => log.resolved).length,
  unresolved: logs.filter((log) => !log.resolved).length,
})

export const useErrorLogData = (user?: User) => {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [stats, setStats] = useState<ErrorLogStats>(buildStats([]))
  const [loading, setLoading] = useState(false)

  const isSuperGod = user?.role === 'supergod'
  const tenantId = user?.tenantId
  const scopeDescription = isSuperGod
    ? 'All error logs across all tenants'
    : 'Error logs for your tenant only'

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const options = isSuperGod ? {} : { tenantId }
      const data = await Database.getErrorLogs(options)
      setLogs(data)
      setStats(buildStats(data))
    } catch (error) {
      toast.error('Failed to load error logs')
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }, [isSuperGod, tenantId])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  return { logs, stats, loading, reload: loadLogs, isSuperGod, scopeDescription }
}
