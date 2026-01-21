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
    flaskUrl,
    setFlaskUrl,
    flaskConnectionStatus,
    setFlaskConnectionStatus,
    testingConnection,
    envVarSet,
    loadConfig,
    handleTestConnection,
    handleSaveStorageConfig: saveConfig,
  } = useStorageConfig()

  const {
    handleMigrateToFlask: migrateToFlask,
    handleMigrateToIndexedDB,
  } = useStorageMigration()

  useEffect(() => {
    loadStats()
    checkSchemaHealth()
    loadConfig()
  }, [loadStats, checkSchemaHealth, loadConfig])

  const handleSaveStorageConfig = async () => {
    await saveConfig(loadStats)
  }

  const handleMigrateToFlask = async () => {
    await migrateToFlask(flaskUrl, loadStats)
  }

  const handleMigrateToIndexedDBWrapper = async () => {
    await handleMigrateToIndexedDB(flaskUrl)
  }

  return {
    stats,
    loading,
    storageBackend,
    setStorageBackend,
    flaskUrl,
    setFlaskUrl,
    flaskConnectionStatus,
    setFlaskConnectionStatus,
    testingConnection,
    envVarSet,
    schemaHealth,
    checkingSchema,
    handleExport,
    handleImport,
    handleClear,
    handleSeed,
    formatBytes,
    handleTestConnection,
    handleSaveStorageConfig,
    handleMigrateToFlask,
    handleMigrateToIndexedDB: handleMigrateToIndexedDBWrapper,
    checkSchemaHealth,
  }
}

