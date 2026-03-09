import { useCallback, useState } from 'react'
import { createJsonFileInput, downloadJson, formatStorageError } from './storageSettingsUtils'
import { storageSettingsCopy } from './storageSettingsConfig'

/**
 * Toast notification interface - allows consumers to provide their own toast implementation
 */
export type ToastNotifier = {
  success: (message: string) => void
  error: (message: string) => void
}

/**
 * Default no-op toast implementation for environments without toast library
 */
const noopToast: ToastNotifier = {
  success: () => {},
  error: () => {},
}

type DataHandlers = {
  exportData: () => Promise<unknown>
  importData: (data: unknown) => Promise<void>
  exportFilename: () => string
  importAccept: string
  /** Optional toast notifier - if not provided, notifications are silently ignored */
  toast?: ToastNotifier
}

export const useStorageDataHandlers = ({
  exportData,
  importData,
  exportFilename,
  importAccept,
  toast = noopToast,
}: DataHandlers) => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const data = await exportData()
      downloadJson(data, exportFilename())
      toast.success(storageSettingsCopy.toasts.success.export)
    } catch (error) {
      toast.error(`${storageSettingsCopy.toasts.failure.export}: ${formatStorageError(error)}`)
    } finally {
      setIsExporting(false)
    }
  }, [exportData, exportFilename, toast])

  const handleImport = useCallback(() => {
    createJsonFileInput(importAccept, async (file) => {
      setIsImporting(true)
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        await importData(data)
        toast.success(storageSettingsCopy.toasts.success.import)
      } catch (error) {
        toast.error(`${storageSettingsCopy.toasts.failure.import}: ${formatStorageError(error)}`)
      } finally {
        setIsImporting(false)
      }
    })
  }, [importAccept, importData, toast])

  return {
    isExporting,
    isImporting,
    handleExport,
    handleImport,
  }
}
