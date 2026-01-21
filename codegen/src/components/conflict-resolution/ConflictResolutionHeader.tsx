import type { ConflictResolutionCopy } from '@/components/conflict-resolution/types'

import { Button } from '@/components/ui/button'
import { ArrowsClockwise, Trash } from '@phosphor-icons/react'

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
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight">{copy.header.title}</h1>
        <p className="text-muted-foreground mt-1">{copy.header.description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onDetect} disabled={detectingConflicts}>
          <ArrowsClockwise size={16} className={detectingConflicts ? 'animate-spin' : ''} />
          {copy.buttons.detect}
        </Button>

        {hasConflicts && (
          <Button size="sm" variant="outline" onClick={onClear}>
            <Trash size={16} />
            {copy.buttons.clearAll}
          </Button>
        )}
      </div>
    </div>
  )
}
