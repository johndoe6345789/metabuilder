import type {
  ConflictResolutionCopy,
  ConflictResolutionFilters,
} from '@/components/conflict-resolution/types'

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface ConflictResolutionFiltersProps {
  copy: ConflictResolutionCopy
  hasConflicts: boolean
  filterType: ConflictResolutionFilters
  onFilterChange: (value: ConflictResolutionFilters) => void
  conflictCount: number
}

export function ConflictResolutionFilters({
  copy,
  hasConflicts,
  filterType,
  onFilterChange,
  conflictCount,
}: ConflictResolutionFiltersProps) {
  if (!hasConflicts) {
    return null
  }

  const label = conflictCount === 1 ? copy.labels.conflictSingular : copy.labels.conflictPlural

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MagnifyingGlass size={20} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{copy.filters.label}</span>
        <Select value={filterType} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.filters.allTypes}</SelectItem>
            <SelectItem value="files">{copy.filters.files}</SelectItem>
            <SelectItem value="models">{copy.filters.models}</SelectItem>
            <SelectItem value="components">{copy.filters.components}</SelectItem>
            <SelectItem value="workflows">{copy.filters.workflows}</SelectItem>
            <SelectItem value="lambdas">{copy.filters.lambdas}</SelectItem>
            <SelectItem value="componentTrees">{copy.filters.componentTrees}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Badge variant="secondary">
        {copy.badges.conflictCount
          .replace('{count}', String(conflictCount))
          .replace('{label}', label)}
      </Badge>
    </div>
  )
}
