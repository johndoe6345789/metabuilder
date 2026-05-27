import { useState, useCallback } from 'react'
import { toast } from '@metabuilder/components/fakemui'
import { getDatabaseStats, validateDatabaseSchema } from '@/lib/db'
import { useTranslation } from '@/hooks/useTranslation'

interface DbStats {
  snippetCount: number
  templateCount: number
  storageType: 'indexeddb' | 'localstorage' | 'none' | 'dbal'
  namespaceCount?: number
  databaseSize: number
}

export function useDatabaseStats() {
  const t = useTranslation()
  const [stats, setStats] = useState<DbStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [schemaHealth, setSchemaHealth] = useState<
    'unknown' | 'healthy' | 'corrupted'
  >('unknown')
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
  }, [t])

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

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
      ' ' +
      sizes[i]
    )
  }, [])

  return {
    stats,
    loading,
    schemaHealth,
    checkingSchema,
    loadStats,
    checkSchemaHealth,
    formatBytes,
  }
}
