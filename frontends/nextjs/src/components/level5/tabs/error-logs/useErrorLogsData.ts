import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Database } from '@/lib/database'
import type { ErrorLog } from '@/lib/db/error-logs'
import type { User } from '@/lib/level-types'

import { calculateStats, emptyStats, type ErrorLogStats, filterLogs } from './errorLogUtils'

export interface UseErrorLogsDataParams {
  user?: User
  filters: {
    filterLevel: string
    filterResolved: string
  }
  pageSize: number
}

export interface UseErrorLogsDataResult {
  logs: ErrorLog[]
  filteredLogs: ErrorLog[]
  displayedLogs: ErrorLog[]
  stats: ErrorLogStats
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  isSuperGod: boolean
  loadLogs: () => Promise<void>
  setPage: (page: number) => void
  handleMarkResolved: (id: string) => Promise<void>
  handleDeleteLog: (id: string) => Promise<void>
  handleClearLogs: (clearOnlyResolved: boolean) => Promise<void>
}

export function useErrorLogsData({
  user,
  filters,
  pageSize,
}: UseErrorLogsDataParams): UseErrorLogsDataResult {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [stats, setStats] = useState(emptyStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const isSuperGod = user?.role === 'supergod'
  const tenantId = user?.tenantId

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const options = isSuperGod ? {} : { tenantId }
      const data = await Database.getErrorLogs(options)
      setLogs(data)
      setStats(calculateStats(data))
      setPage(1)
    } catch (err) {
      console.error('Error loading logs:', err)
      setError('Failed to load error logs')
      toast.error('Failed to load error logs')
    } finally {
      setLoading(false)
    }
  }, [isSuperGod, tenantId])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const filteredLogs = useMemo(() => filterLogs(logs, filters), [filters, logs])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const displayedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredLogs.slice(start, end)
  }, [currentPage, filteredLogs, pageSize])

  const handleMarkResolved = useCallback(
    async (id: string) => {
      try {
        await Database.updateErrorLog(id, {
          resolved: true,
          resolvedAt: Date.now(),
          resolvedBy: user?.username || 'admin',
        })
        await loadLogs()
        toast.success('Error log marked as resolved')
      } catch (err) {
        console.error('Failed to update error log', err)
        toast.error('Failed to update error log')
      }
    },
    [loadLogs, user?.username]
  )

  const handleDeleteLog = useCallback(
    async (id: string) => {
      try {
        await Database.deleteErrorLog(id)
        await loadLogs()
        toast.success('Error log deleted')
      } catch (err) {
        console.error('Failed to delete error log', err)
        toast.error('Failed to delete error log')
      }
    },
    [loadLogs]
  )

  const handleClearLogs = useCallback(
    async (clearOnlyResolved: boolean) => {
      try {
        const count = await Database.clearErrorLogs(clearOnlyResolved)
        await loadLogs()
        toast.success(`Cleared ${count} error log${count !== 1 ? 's' : ''}`)
      } catch (err) {
        console.error('Failed to clear error logs', err)
        toast.error('Failed to clear error logs')
      }
    },
    [loadLogs]
  )

  return {
    logs,
    filteredLogs,
    displayedLogs,
    stats,
    loading,
    error,
    page: currentPage,
    totalPages,
    isSuperGod: Boolean(isSuperGod),
    loadLogs,
    setPage,
    handleMarkResolved,
    handleDeleteLog,
    handleClearLogs,
  }
}
