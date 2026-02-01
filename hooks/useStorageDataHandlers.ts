import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { createJsonFileInput, downloadJson, formatStorageError } from './storageSettingsUtils'
import { storageSettingsCopy } from './storageSettingsConfig'

type DataHandlers = {
  exportData: () => Promise<unknown>
  importData: (data: unknown) => Promise<void>
  exportFilename: () => string
  importAccept: string
}

export const useStorageDataHandlers = ({
  exportData,
  importData,
  exportFilename,
  importAccept,
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
  }, [exportData, exportFilename])

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
  }, [importAccept, importData])

  return {
    isExporting,
    isImporting,
    handleExport,
    handleImport,
  }
}
