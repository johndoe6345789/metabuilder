import { useMemo, useState, useEffect } from 'react'
import { CodeError } from '@/types/errors'
import { ProjectFile } from '@/types/project'
import { createScanForErrors } from '@/components/error-panel/error-panel-scan'
import { createRepairHandlers } from '@/components/error-panel/error-panel-repair'
import errorPanelCopy from '@/data/error-panel.json'

interface UseErrorPanelMainParams {
  files: ProjectFile[]
  onFileChange: (fileId: string, content: string) => void
  onFileSelect: (fileId: string) => void
}

export function useErrorPanelMain({ files, onFileChange, onFileSelect }: UseErrorPanelMainParams) {
  const [errors, setErrors] = useState<CodeError[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isRepairing, setIsRepairing] = useState(false)

  const scanForErrors = useMemo(
    () => createScanForErrors({ files, setErrors, setIsScanning }),
    [files]
  )

  const repairHandlers = useMemo(
    () =>
      createRepairHandlers({
        files,
        errors,
        onFileChange,
        scanForErrors,
        setErrors,
        setIsRepairing,
      }),
    [errors, files, onFileChange, scanForErrors]
  )

  const errorsByFile = errors.reduce((acc, error) => {
    if (!acc[error.fileId]) {
      acc[error.fileId] = []
    }
    acc[error.fileId].push(error)
    return acc
  }, {} as Record<string, CodeError[]>)

  const errorCount = errors.filter((error) => error.severity === 'error').length
  const warningCount = errors.filter((error) => error.severity === 'warning').length

  useEffect(() => {
    if (files.length > 0 && errors.length === 0) {
      scanForErrors()
    }
  }, [])

  return {
    errors,
    errorsByFile,
    errorCount,
    warningCount,
    isScanning,
    isRepairing,
    scanForErrors,
    repairAllErrors: repairHandlers.repairAllErrors,
    repairFileWithContext: repairHandlers.repairFileWithContext,
    repairSingleError: repairHandlers.repairSingleError,
    errorPanelCopy,
  }
}
