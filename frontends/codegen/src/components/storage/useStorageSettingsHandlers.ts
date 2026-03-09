import { useCallback, useState } from 'react'
import { useStorageBackend } from '@/hooks/use-unified-storage'
import { useStorageSwitchHandlers } from './useStorageSwitchHandlers'
import { useStorageDataHandlers } from './useStorageDataHandlers'

type StorageSettingsHandlersOptions = {
  defaultFlaskUrl: string
  exportFilename: () => string
  importAccept: string
}

const flaskUrlStorageKey = 'codeforge-flask-url'

export const useStorageSettingsHandlers = ({
  defaultFlaskUrl,
  exportFilename,
  importAccept,
}: StorageSettingsHandlersOptions) => {
  const {
    backend,
    isLoading,
    switchToFlask,
    switchToSQLite,
    switchToIndexedDB,
    exportData,
    importData,
  } = useStorageBackend()

  const [flaskUrl, setFlaskUrlState] = useState(
    () => localStorage.getItem(flaskUrlStorageKey) || defaultFlaskUrl
  )

  const setFlaskUrl = useCallback((value: string) => {
    setFlaskUrlState(value)
    localStorage.setItem(flaskUrlStorageKey, value)
  }, [])

  const { isSwitching, handleSwitchToFlask, handleSwitchToSQLite, handleSwitchToIndexedDB } =
    useStorageSwitchHandlers({
      backend,
      flaskUrl,
      switchToFlask,
      switchToSQLite,
      switchToIndexedDB,
    })

  const { isExporting, isImporting, handleExport, handleImport } = useStorageDataHandlers({
    exportData,
    importData,
    exportFilename,
    importAccept,
  })

  return {
    backend,
    isLoading,
    flaskUrl,
    setFlaskUrl,
    isSwitching,
    handleSwitchToFlask,
    handleSwitchToSQLite,
    handleSwitchToIndexedDB,
    isExporting,
    isImporting,
    handleExport,
    handleImport,
  }
}
