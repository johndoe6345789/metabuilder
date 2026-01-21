import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useConflictResolution } from '@/hooks/use-conflict-resolution'
import { ConflictItem, ConflictResolutionStrategy } from '@/types/conflicts'
import type {
  ConflictResolutionCopy,
  ConflictResolutionFilters as ConflictResolutionFilterType,
} from '@/components/conflict-resolution/types'

export function useConflictResolutionPage(copy: ConflictResolutionCopy) {
  const {
    conflicts,
    stats,
    autoResolveStrategy,
    detectingConflicts,
    resolvingConflict,
    error,
    hasConflicts,
    detect,
    resolve,
    resolveAll,
    clear,
    setAutoResolve,
  } = useConflictResolution()

  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<ConflictResolutionFilterType>('all')

  useEffect(() => {
    detect().catch(() => {})
  }, [detect])

  const handleDetect = async () => {
    try {
      const detected = await detect()
      if (detected.length === 0) {
        toast.success(copy.toasts.noConflictsDetected)
      } else {
        const label =
          detected.length === 1 ? copy.labels.conflictSingular : copy.labels.conflictPlural
        toast.info(
          copy.toasts.foundConflicts
            .replace('{count}', String(detected.length))
            .replace('{label}', label)
        )
      }
    } catch (err: any) {
      toast.error(err.message || copy.toasts.detectFailed)
    }
  }

  const handleResolve = async (conflictId: string, strategy: ConflictResolutionStrategy) => {
    try {
      await resolve(conflictId, strategy)
      toast.success(copy.toasts.resolved.replace('{strategy}', strategy))
    } catch (err: any) {
      toast.error(err.message || copy.toasts.resolveFailed)
    }
  }

  const handleResolveAll = async (strategy: ConflictResolutionStrategy) => {
    try {
      await resolveAll(strategy)
      toast.success(copy.toasts.resolvedAll.replace('{strategy}', strategy))
    } catch (err: any) {
      toast.error(err.message || copy.toasts.resolveAllFailed)
    }
  }

  const handleViewDetails = (conflict: ConflictItem) => {
    setSelectedConflict(conflict)
    setDetailsDialogOpen(true)
  }

  return {
    conflicts,
    stats,
    autoResolveStrategy,
    detectingConflicts,
    resolvingConflict,
    error,
    hasConflicts,
    clear,
    setAutoResolve,
    filterType,
    setFilterType,
    selectedConflict,
    detailsDialogOpen,
    setDetailsDialogOpen,
    handleDetect,
    handleResolve,
    handleResolveAll,
    handleViewDetails,
  }
}
