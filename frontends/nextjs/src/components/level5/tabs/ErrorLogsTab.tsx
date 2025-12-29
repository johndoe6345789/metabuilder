'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui'
import type { User } from '@/lib/level-types'
import { clearErrorLogs, deleteErrorLog, markErrorResolved } from './error-logs/errorLogActions'
import { ErrorLogControls } from './error-logs/ErrorLogControls'
import { ErrorLogList } from './error-logs/ErrorLogList'
import { ErrorLogStats } from './error-logs/ErrorLogStats'
import { ClearLogsDialog } from './error-logs/ClearLogsDialog'
import { filterLogs, useErrorLogFilters } from './error-logs/useErrorLogFilters'
import { useErrorLogs } from './error-logs/useErrorLogs'

interface ErrorLogsTabProps {
  user?: User
}

const PAGE_SIZE = 10

export function ErrorLogsTab({ user }: ErrorLogsTabProps) {
  const { logs, loading, stats, reload, isSuperGod } = useErrorLogs(user)
  const { filters, setFilterLevel, setFilterResolution } = useErrorLogFilters()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearOnlyResolved, setClearOnlyResolved] = useState(false)

  const filteredLogs = filterLogs(logs, filters)

  const handleMarkResolved = async (id: string) => {
    await markErrorResolved(id, reload, user)
  }

  const handleDeleteLog = async (id: string) => {
    await deleteErrorLog(id, reload)
  }

  const handleClearLogs = async () => {
    await clearErrorLogs(clearOnlyResolved, reload, () => setShowClearDialog(false))
  }

  const openClearDialog = (onlyResolved: boolean) => {
    setClearOnlyResolved(onlyResolved)
    setShowClearDialog(true)
  }

  return (
    <div className="space-y-6">
      <ErrorLogStats stats={stats} />

      <Card className="bg-black/40 border-white/10 text-white">
        <CardHeader>
          <ErrorLogControls
            filterLevel={filters.level}
            filterResolution={filters.resolution}
            setFilterLevel={setFilterLevel}
            setFilterResolution={setFilterResolution}
            onRefresh={reload}
            loading={loading}
            user={user}
            onRequestClear={openClearDialog}
          />
        </CardHeader>
        <CardContent>
          <ErrorLogList
            logs={filteredLogs}
            loading={loading}
            onResolve={handleMarkResolved}
            onDelete={handleDeleteLog}
            user={user}
          />
        </CardContent>
      </Card>

      {isSuperGod && (
        <ClearLogsDialog
          open={showClearDialog}
          onOpenChange={setShowClearDialog}
          clearOnlyResolved={clearOnlyResolved}
          onConfirm={handleClearLogs}
        />
      )}
    </div>
  )
}
