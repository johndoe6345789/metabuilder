import { useCallback } from 'react'
import { toast } from '@metabuilder/components/fakemui'
import {
  exportDatabase,
  importDatabase,
  clearDatabase,
  seedDatabase,
} from '@/lib/db'
import { useTranslation } from '@/hooks/useTranslation'
import { useDatabaseStats } from './useDatabaseStats'

export function useDatabaseOperations() {
  const t = useTranslation()
  const statsHook = useDatabaseStats()

  const handleExport = useCallback(async () => {
    try {
      const jsonData = await exportDatabase()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `codesnippet-backup-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(t.settings.database.exported)
    } catch (error) {
      console.error('Failed to export:', error)
      toast.error(t.settings.database.failedToExport)
    }
  }, [t])

  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        await importDatabase(text)
        toast.success(t.settings.database.imported)
        await statsHook.loadStats()
      } catch (error) {
        console.error('Failed to import:', error)
        toast.error(t.settings.database.failedToImport)
      }
      event.target.value = ''
    },
    [t, statsHook],
  )

  const handleClear = useCallback(async () => {
    if (!confirm(t.settings.database.clearConfirm)) return
    try {
      await clearDatabase()
      toast.success(t.settings.database.cleared)
      await statsHook.loadStats()
      await statsHook.checkSchemaHealth()
    } catch (error) {
      console.error('Failed to clear:', error)
      toast.error(t.settings.database.failedToClear)
    }
  }, [t, statsHook])

  const handleSeed = useCallback(async () => {
    try {
      await seedDatabase()
      toast.success(t.settings.database.seeded)
      await statsHook.loadStats()
    } catch (error) {
      console.error('Failed to seed:', error)
      toast.error(t.settings.database.failedToSeed)
    }
  }, [t, statsHook])

  return {
    ...statsHook,
    handleExport,
    handleImport,
    handleClear,
    handleSeed,
  }
}
