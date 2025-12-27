import { useCallback, useEffect, useState } from 'react'
import { Database } from '@/lib/database'
import type { ErrorLog } from '@/lib/db/error-logs'
import type { User } from '@/lib/level-types'
import { toast } from 'sonner'

export interface ErrorLogStats {
  total: number
  errors: number
  warnings: number
  info: number
  resolved: number
  unresolved: number
}

interface UseErrorLogsReturn {
  logs: ErrorLog[]
  loading: boolean
  stats: ErrorLogStats
  reload: () => Promise<void>
  isSuperGod: boolean
}

export function useErrorLogs(user?: User): UseErrorLogsReturn {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<ErrorLogStats>({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    resolved: 0,
    unresolved: 0,
  })

  const isSuperGod = user?.role === 'supergod'
  const tenantId = user?.tenantId

  const calculateStats = useCallback((data: ErrorLog[]) => {
    setStats({
      total: data.length,
      errors: data.filter(l => l.level === 'error').length,
      warnings: data.filter(l => l.level === 'warning').length,
      info: data.filter(l => l.level === 'info').length,
      resolved: data.filter(l => l.resolved).length,
      unresolved: data.filter(l => !l.resolved).length,
    })
  }, [])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const options = isSuperGod ? {} : { tenantId }
      const data = await Database.getErrorLogs(options)
      setLogs(data)
      calculateStats(data)
    } catch (error) {
      toast.error('Failed to load error logs')
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }, [calculateStats, isSuperGod, tenantId])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  return {
    logs,
    loading,
    stats,
    reload: loadLogs,
    isSuperGod,
  }
}
