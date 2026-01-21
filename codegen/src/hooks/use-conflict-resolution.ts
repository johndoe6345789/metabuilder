import { useAppDispatch, useAppSelector } from '@/store'
import {
  detectConflicts,
  resolveConflict,
  resolveAllConflicts,
  clearConflicts,
  setAutoResolveStrategy,
  removeConflict,
} from '@/store/slices/conflictsSlice'
import { ConflictResolutionStrategy, ConflictStats } from '@/types/conflicts'
import { useCallback, useMemo } from 'react'

export function useConflictResolution() {
  const dispatch = useAppDispatch()
  
  const conflicts = useAppSelector((state) => state.conflicts.conflicts)
  const autoResolveStrategy = useAppSelector((state) => state.conflicts.autoResolveStrategy)
  const detectingConflicts = useAppSelector((state) => state.conflicts.detectingConflicts)
  const resolvingConflict = useAppSelector((state) => state.conflicts.resolvingConflict)
  const error = useAppSelector((state) => state.conflicts.error)

  const stats: ConflictStats = useMemo(() => {
    const conflictsByType = conflicts.reduce((acc, conflict) => {
      acc[conflict.entityType] = (acc[conflict.entityType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalConflicts: conflicts.length,
      resolvedConflicts: 0,
      pendingConflicts: conflicts.length,
      conflictsByType: conflictsByType as any,
    }
  }, [conflicts])

  const detect = useCallback(() => {
    return dispatch(detectConflicts()).unwrap()
  }, [dispatch])

  const resolve = useCallback(
    (conflictId: string, strategy: ConflictResolutionStrategy, customVersion?: any) => {
      return dispatch(resolveConflict({ conflictId, strategy, customVersion })).unwrap()
    },
    [dispatch]
  )

  const resolveAll = useCallback(
    (strategy: ConflictResolutionStrategy) => {
      return dispatch(resolveAllConflicts(strategy)).unwrap()
    },
    [dispatch]
  )

  const clear = useCallback(() => {
    dispatch(clearConflicts())
  }, [dispatch])

  const setAutoResolve = useCallback(
    (strategy: ConflictResolutionStrategy | null) => {
      dispatch(setAutoResolveStrategy(strategy))
    },
    [dispatch]
  )

  const remove = useCallback(
    (conflictId: string) => {
      dispatch(removeConflict(conflictId))
    },
    [dispatch]
  )

  const hasConflicts = conflicts.length > 0

  return {
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
    remove,
  }
}
