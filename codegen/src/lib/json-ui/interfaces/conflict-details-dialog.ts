import { ConflictItem } from '@/types/conflicts'

export interface ConflictDetailsDialogProps {
  conflict: ConflictItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (conflictId: string, strategy: 'local' | 'remote' | 'merge') => void
  isResolving: boolean
}
