import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'

interface ErrorLogFiltersProps {
  filterLevel: string
  filterResolved: string
  onFilterLevelChange: (value: string) => void
  onFilterResolvedChange: (value: string) => void
}

export function ErrorLogFilters({
  filterLevel,
  filterResolved,
  onFilterLevelChange,
  onFilterResolvedChange,
}: ErrorLogFiltersProps) {
  return (
    <div className="flex gap-2 mt-4">
      <Select value={filterLevel} onValueChange={onFilterLevelChange}>
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

      <Select value={filterResolved} onValueChange={onFilterResolvedChange}>
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
  )
}
