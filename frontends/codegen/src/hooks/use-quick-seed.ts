/**
 * useQuickSeed — dispatches seedDBALDatabase and shows toast feedback
 */

import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/sonner'
import { useAppDispatch } from '@/store'
import { seedDBALDatabase } from '@/store/slices/dbalSlice'

export function useQuickSeed() {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)

  const handleSeed = useCallback(async () => {
    setLoading(true)
    try {
      const result = await dispatch(seedDBALDatabase({}) as any).unwrap()
      if (result?.totalInserted !== undefined) {
        toast.success(`Seeded: ${result.totalInserted} inserted, ${result.totalSkipped} skipped`)
      } else {
        toast.success('Seed completed')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(`Seed failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // Derived for JSON condition bindings (condition only checks truthiness)
  const notLoading = !loading
  const seedLabel = loading ? 'Seeding...' : 'Seed'

  return { loading, notLoading, seedLabel, handleSeed }
}
