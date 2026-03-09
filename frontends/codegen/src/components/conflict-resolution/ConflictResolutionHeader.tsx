import type { ConflictResolutionCopy } from '@/components/conflict-resolution/types'

import { Button } from '@metabuilder/fakemui/inputs'
import { ArrowsClockwise, Trash } from '@metabuilder/fakemui/icons'

interface ConflictResolutionHeaderProps {
  copy: ConflictResolutionCopy
  hasConflicts: boolean
  detectingConflicts: boolean
  onDetect: () => void
  onClear: () => void
}

export function ConflictResolutionHeader({
  copy,
  hasConflicts,
  detectingConflicts,
  onDetect,
  onClear,
}: ConflictResolutionHeaderProps) {
  return (
    <div>
      <div>
        <h1>{copy.header.title}</h1>
        <p>{copy.header.description}</p>
      </div>

      <div>
        <Button size="small" variant="outlined" onClick={onDetect} disabled={detectingConflicts}>
          <ArrowsClockwise size={16} />
          {copy.buttons.detect}
        </Button>

        {hasConflicts && (
          <Button size="small" variant="outlined" onClick={onClear}>
            <Trash size={16} />
            {copy.buttons.clearAll}
          </Button>
        )}
      </div>
    </div>
  )
}
