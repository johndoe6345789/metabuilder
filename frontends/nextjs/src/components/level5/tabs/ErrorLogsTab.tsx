"use client"

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { Broom, Warning } from '@phosphor-icons/react'
import type { User } from '@/lib/level-types'
import { ErrorLogFilters } from './error-logs/ErrorLogFilters'
import { ErrorLogList } from './error-logs/ErrorLogList'
import { ErrorLogsErrorState } from './error-logs/ErrorLogsErrorState'
import { ErrorLogsPagination } from './error-logs/ErrorLogsPagination'
import { useErrorLogsData } from './error-logs/useErrorLogsData'

interface ErrorLogsTabProps {
  user?: User
}

const PAGE_SIZE = 10

export function ErrorLogsTab({ user }: ErrorLogsTabProps) {
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterResolved, setFilterResolved] = useState('all')
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearOnlyResolved, setClearOnlyResolved] = useState(false)

  const {
    displayedLogs,
    stats,
    loading,
    error,
    isSuperGod,
    loadLogs,
    page,
    totalPages,
    setPage,
    handleMarkResolved,
    handleDeleteLog,
    handleClearLogs,
  } = useErrorLogsData({
    user,
    filters: { filterLevel, filterResolved },
    pageSize: PAGE_SIZE,
  })

  const scopeDescription = isSuperGod
    ? 'All error logs across all tenants'
    : 'Error logs for your tenant only'

  return (
    <div className="space-y-6">
      {error && <ErrorLogsErrorState message={error} onRetry={loadLogs} />}

      <Card className="bg-black/40 border-white/10 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Error Logs</CardTitle>
              <CardDescription className="text-gray-400">{scopeDescription}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadLogs} disabled={loading} size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              {isSuperGod && (
                <>
                  <Button
                    onClick={() => {
                      setClearOnlyResolved(false)
                      setShowClearDialog(true)
                    }}
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <Broom className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    onClick={() => {
                      setClearOnlyResolved(true)
                      setShowClearDialog(true)
                    }}
                    size="sm"
                    variant="outline"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                  >
                    <Broom className="w-4 h-4 mr-2" />
                    Clear Resolved
                  </Button>
                </>
              )}
            </div>
          </div>

          <ErrorLogFilters
            filterLevel={filterLevel}
            filterResolved={filterResolved}
            onFilterLevelChange={setFilterLevel}
            onFilterResolvedChange={setFilterResolved}
          />
        </CardHeader>
        <CardContent>
          <ErrorLogList
            logs={displayedLogs}
            stats={stats}
            isSuperGod={isSuperGod}
            loading={loading}
            onResolve={handleMarkResolved}
            onDelete={handleDeleteLog}
          />
          <ErrorLogsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>

      {isSuperGod && (
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-300">
                <Warning className="w-6 h-6" weight="fill" />
                Confirm Clear Error Logs
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                {clearOnlyResolved
                  ? 'This will permanently delete all resolved error logs. This action cannot be undone.'
                  : 'This will permanently delete ALL error logs. This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await handleClearLogs(clearOnlyResolved)
                  setShowClearDialog(false)
                }}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                Clear Logs
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
