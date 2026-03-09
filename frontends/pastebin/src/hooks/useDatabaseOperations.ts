import { useState, useCallback } from 'react'
import { toast } from '@metabuilder/components/fakemui'
import {
  getDatabaseStats,
  exportDatabase,
  importDatabase,
  clearDatabase,
  seedDatabase,
  validateDatabaseSchema
} from '@/lib/db'
import { useTranslation } from '@/hooks/useTranslation'

export function useDatabaseOperations() {
  const t = useTranslation()
  const [stats, setStats] = useState<{
    snippetCount: number
    templateCount: number
    storageType: 'indexeddb' | 'localstorage' | 'none' | 'dbal'
    namespaceCount?: number
    databaseSize: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [schemaHealth, setSchemaHealth] = useState<'unknown' | 'healthy' | 'corrupted'>('unknown')
  const [checkingSchema, setCheckingSchema] = useState(false)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDatabaseStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
      toast.error(t.settings.database.failedToLoadStats)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkSchemaHealth = useCallback(async () => {
    setCheckingSchema(true)
    try {
      const result = await validateDatabaseSchema()
      setSchemaHealth(result ? 'healthy' : 'corrupted')
    } catch (error) {
      console.error('Schema check failed:', error)
      setSchemaHealth('corrupted')
    } finally {
      setCheckingSchema(false)
    }
  }, [])

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
  }, [])

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      await importDatabase(text)
      toast.success(t.settings.database.imported)
      await loadStats()
    } catch (error) {
      console.error('Failed to import:', error)
      toast.error(t.settings.database.failedToImport)
    }

    event.target.value = ''
  }, [loadStats])

  const handleClear = useCallback(async () => {
    if (!confirm(t.settings.database.clearConfirm)) {
      return
    }

    try {
      await clearDatabase()
      toast.success(t.settings.database.cleared)
      await loadStats()
      await checkSchemaHealth()
    } catch (error) {
      console.error('Failed to clear:', error)
      toast.error(t.settings.database.failedToClear)
    }
  }, [loadStats, checkSchemaHealth])

  const handleSeed = useCallback(async () => {
    try {
      await seedDatabase()
      toast.success(t.settings.database.seeded)
      await loadStats()
    } catch (error) {
      console.error('Failed to seed:', error)
      toast.error(t.settings.database.failedToSeed)
    }
  }, [loadStats])

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }, [])

  return {
    stats,
    loading,
    schemaHealth,
    checkingSchema,
    loadStats,
    checkSchemaHealth,
    handleExport,
    handleImport,
    handleClear,
    handleSeed,
    formatBytes,
  }
}
