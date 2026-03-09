import type {
  ConflictResolutionCopy,
  ConflictResolutionFilters,
} from '@/components/conflict-resolution/types'

import { Badge } from '@metabuilder/fakemui/data-display'
import { MagnifyingGlass } from '@metabuilder/fakemui/icons'

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
    <div>
      <div>
        <MagnifyingGlass size={20} />
        <span>{copy.filters.label}</span>
        <select
          value={filterType}
          onChange={(e) => onFilterChange(e.target.value as ConflictResolutionFilters)}
        >
          <option value="all">{copy.filters.allTypes}</option>
          <option value="files">{copy.filters.files}</option>
          <option value="models">{copy.filters.models}</option>
          <option value="components">{copy.filters.components}</option>
          <option value="workflows">{copy.filters.workflows}</option>
          <option value="lambdas">{copy.filters.lambdas}</option>
          <option value="componentTrees">{copy.filters.componentTrees}</option>
        </select>
      </div>

      <Badge>
        {copy.badges.conflictCount
          .replace('{count}', String(conflictCount))
          .replace('{label}', label)}
      </Badge>
    </div>
  )
}
