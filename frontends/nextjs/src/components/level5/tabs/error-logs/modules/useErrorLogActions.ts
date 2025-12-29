import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Database } from '@/lib/database'

interface ErrorLogActionsConfig {
  onRefresh: () => Promise<void> | void
  username?: string
}

export const useErrorLogActions = ({ onRefresh, username }: ErrorLogActionsConfig) => {
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearOnlyResolved, setClearOnlyResolved] = useState(false)

  const handleMarkResolved = useCallback(
    async (id: string) => {
      try {
        await Database.updateErrorLog(id, {
          resolved: true,
          resolvedAt: Date.now(),
          resolvedBy: username || 'admin',
        })
        await onRefresh()
        toast.success('Error log marked as resolved')
      } catch (error) {
        toast.error('Failed to update error log')
      }
    },
    [onRefresh, username]
  )

  const handleDeleteLog = useCallback(
    async (id: string) => {
      try {
        await Database.deleteErrorLog(id)
        await onRefresh()
        toast.success('Error log deleted')
      } catch (error) {
        toast.error('Failed to delete error log')
      }
    },
    [onRefresh]
  )

  const handleClearLogs = useCallback(async () => {
    try {
      const count = await Database.clearErrorLogs(clearOnlyResolved)
      await onRefresh()
      toast.success(`Cleared ${count} error log${count !== 1 ? 's' : ''}`)
      setShowClearDialog(false)
    } catch (error) {
      toast.error('Failed to clear error logs')
    }
  }, [clearOnlyResolved, onRefresh])

  const openClearDialog = (onlyResolved: boolean) => {
    setClearOnlyResolved(onlyResolved)
    setShowClearDialog(true)
  }

  return {
    clearOnlyResolved,
    handleClearLogs,
    handleDeleteLog,
    handleMarkResolved,
    openClearDialog,
    setShowClearDialog,
    showClearDialog,
  }
}
