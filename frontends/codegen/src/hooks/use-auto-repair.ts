import { useState, useCallback } from 'react'
import { ProjectFile } from '@/types/project'
import { CodeError } from '@/types/errors'
import { ErrorRepairService } from '@/lib/error-repair-service'
import { scanRateLimiter } from '@/lib/rate-limiter'

export function useAutoRepair(
  files: ProjectFile[],
  enabled: boolean = false
) {
  const [errors, setErrors] = useState<CodeError[]>([])
  const [isScanning, setIsScanning] = useState(false)

  const scanFiles = useCallback(async () => {
    if (!enabled || !files || files.length === 0) return

    setIsScanning(true)
    try {
      const result = await scanRateLimiter.throttle(
        'error-scan',
        async () => {
          const allErrors: CodeError[] = []
          
          for (const file of files) {
            if (file && file.content) {
              const fileErrors = await ErrorRepairService.detectErrors(file)
              if (Array.isArray(fileErrors)) {
                allErrors.push(...fileErrors)
              }
            }
          }
          
          return allErrors
        },
        'low'
      )
      
      setErrors(result || [])
    } catch (error) {
      console.error('Auto-scan failed:', error)
      setErrors([])
    } finally {
      setIsScanning(false)
    }
  }, [files, enabled])

  return {
    errors: Array.isArray(errors) ? errors : [],
    isScanning,
    scanFiles,
  }
}
