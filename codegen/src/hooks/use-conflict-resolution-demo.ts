import { useState, useMemo, useCallback } from 'react'
import { useConflictResolution } from './use-conflict-resolution'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import conflictCopy from '@/data/conflict-resolution-copy.json'

const demoCopy = conflictCopy.demo

export function useConflictResolutionDemo() {
  const { hasConflicts, stats, detect, resolveAll } = useConflictResolution()
  const [simulatingConflict, setSimulatingConflict] = useState(false)

  const conflictSummary = useMemo(() => {
    const count = stats.totalConflicts
    const label = count === 1 ? demoCopy.conflictSingular : demoCopy.conflictPlural
    return `${count} ${label} ${demoCopy.detectedSuffix}`
  }, [stats.totalConflicts])

  const simulateConflict = useCallback(async () => {
    setSimulatingConflict(true)
    try {
      const testFile = {
        id: 'demo-conflict-file',
        name: 'example.ts',
        path: '/src/example.ts',
        content: 'const local = "This is the local version"',
        language: 'typescript',
        updatedAt: Date.now(),
      }

      await db.put('files', testFile)
      toast.info(demoCopy.toastLocalCreated)

      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(demoCopy.toastSimulationComplete)
    } catch (err: any) {
      toast.error(err.message || demoCopy.toastSimulationError)
    } finally {
      setSimulatingConflict(false)
    }
  }, [])

  const handleQuickResolveAll = useCallback(async () => {
    try {
      await resolveAll('local')
      toast.success(demoCopy.toastResolveAllSuccess)
    } catch (err: any) {
      toast.error(err.message || demoCopy.toastResolveAllError)
    }
  }, [resolveAll])

  return {
    hasConflicts,
    stats,
    simulatingConflict,
    conflictSummary,
    simulateConflict,
    detect,
    handleQuickResolveAll,
  }
}
