import { ConflictItem } from '@/types/conflicts'

export interface ConflictCardProps {
  conflict: ConflictItem
  onResolve: (conflictId: string, strategy: 'local' | 'remote' | 'merge') => void
  onViewDetails: (conflict: ConflictItem) => void
  isResolving: boolean
}
