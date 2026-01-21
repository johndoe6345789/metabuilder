import type { ConflictResolutionItem, ConflictResolveHandler } from '@/components/conflict-resolution/types'

import { ConflictDetailsDialog } from '@/components/ConflictDetailsDialog'

interface ConflictResolutionDetailsProps {
  conflict: ConflictResolutionItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: ConflictResolveHandler
  isResolving: boolean
}

export function ConflictResolutionDetails({
  conflict,
  open,
  onOpenChange,
  onResolve,
  isResolving,
}: ConflictResolutionDetailsProps) {
  return (
    <ConflictDetailsDialog
      conflict={conflict}
      open={open}
      onOpenChange={onOpenChange}
      onResolve={onResolve}
      isResolving={isResolving}
    />
  )
}
