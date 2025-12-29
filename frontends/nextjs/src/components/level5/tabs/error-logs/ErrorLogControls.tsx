import {
  Badge,
  Button,
  CardDescription,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { ErrorLevelFilter, ResolutionFilter } from './useErrorLogFilters'
import type { User } from '@/lib/level-types'
import { Broom } from '@phosphor-icons/react'

interface ErrorLogControlsProps {
  filterLevel: ErrorLevelFilter
  filterResolution: ResolutionFilter
  setFilterLevel: (value: ErrorLevelFilter) => void
  setFilterResolution: (value: ResolutionFilter) => void
  onRefresh: () => void
  loading: boolean
  user?: User
  onRequestClear: (clearOnlyResolved: boolean) => void
}

export function ErrorLogControls({
  filterLevel,
  filterResolution,
  setFilterLevel,
  setFilterResolution,
  onRefresh,
  loading,
  user,
  onRequestClear,
}: ErrorLogControlsProps) {
  const isSuperGod = user?.role === 'supergod'
  const scopeDescription = isSuperGod
    ? 'All error logs across all tenants'
    : 'Error logs for your tenant only'

  return (
    <div className="flex items-start justify-between">
      <div>
        <CardTitle>System Error Logs</CardTitle>
        <CardDescription className="text-gray-400 flex items-center gap-2">
          {scopeDescription}
          {user?.tenantId && !isSuperGod && (
            <Badge
              variant="outline"
              className="bg-purple-500/20 text-purple-400 border-purple-500/50"
            >
              Tenant: {user.tenantId}
            </Badge>
          )}
        </CardDescription>
      </div>

      <div className="flex flex-col gap-2 items-end">
        <div className="flex items-center gap-2">
          <Button
            onClick={onRefresh}
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
                onClick={() => onRequestClear(false)}
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                <Broom className="w-4 h-4 mr-2" />
                Clear All
              </Button>
              <Button
                onClick={() => onRequestClear(true)}
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

        <div className="flex gap-2">
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

          <Select value={filterResolution} onValueChange={setFilterResolution}>
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
      </div>
    </div>
  )
}
