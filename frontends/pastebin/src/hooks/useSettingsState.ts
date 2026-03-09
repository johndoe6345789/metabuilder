import { useEffect } from 'react'
import { useDatabaseOperations } from './useDatabaseOperations'
import { useStorageConfig } from './useStorageConfig'
import { useStorageMigration } from './useStorageMigration'

export function useSettingsState() {
  const {
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
  } = useDatabaseOperations()

  const {
    storageBackend,
    setStorageBackend,
    envVarSet,
    loadConfig,
    handleSaveStorageConfig: saveConfig,
  } = useStorageConfig()

  useStorageMigration()

  useEffect(() => {
    loadStats()
    checkSchemaHealth()
    loadConfig()
  }, [loadStats, checkSchemaHealth, loadConfig])

  const handleSaveStorageConfig = async () => {
    await saveConfig(loadStats)
  }

  return {
    stats,
    loading,
    storageBackend,
    setStorageBackend,
    envVarSet,
    schemaHealth,
    checkingSchema,
    handleExport,
    handleImport,
    handleClear,
    handleSeed,
    formatBytes,
    handleSaveStorageConfig,
    checkSchemaHealth,
  }
}
