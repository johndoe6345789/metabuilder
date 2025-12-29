'use client'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { User } from '@/lib/level-types'
import { Broom, Warning } from '@phosphor-icons/react'
import { ErrorLogTable } from './modules/ErrorLogTable'
import { StatsGrid } from './modules/StatsGrid'
import { useErrorLogActions } from './modules/useErrorLogActions'
import { useErrorLogData } from './modules/useErrorLogData'
import { useErrorLogFilters } from './modules/useErrorLogFilters'
interface ErrorLogsTabProps {
  user?: User
}

export const ErrorLogsTab = ({ user }: ErrorLogsTabProps) => {
  const { logs, stats, loading, reload, isSuperGod, scopeDescription } = useErrorLogData(user)
  const { filterLevel, filterResolved, setFilterLevel, setFilterResolved, filteredLogs } =
    useErrorLogFilters(logs)
  const {
    clearOnlyResolved,
    handleClearLogs,
    handleDeleteLog,
    handleMarkResolved,
    openClearDialog,
    setShowClearDialog,
    showClearDialog,
  } = useErrorLogActions({ onRefresh: reload, username: user?.username })
  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />
      <Card className="bg-black/40 border-white/10 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Error Logs</CardTitle>
              <CardDescription className="text-gray-400">{scopeDescription}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={reload}
                disabled={loading}
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              {isSuperGod && (
                <>
                  <Button
                    onClick={() => openClearDialog(false)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <Broom className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    onClick={() => openClearDialog(true)}
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
          <div className="flex gap-2 mt-4">
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResolved} onValueChange={setFilterResolved}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ErrorLogTable
            logs={filteredLogs}
            isSuperGod={isSuperGod}
            loading={loading}
            onResolve={handleMarkResolved}
            onDelete={handleDeleteLog}
          />
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
              <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearLogs}
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
