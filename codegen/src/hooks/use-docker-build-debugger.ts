import { useCallback, useState } from 'react'
import { useKV } from './use-kv'
import { DockerError } from '@/types/docker'
import { parseDockerLog } from '@/lib/docker-parser'
import { toast } from 'sonner'
import dockerBuildDebuggerText from '@/data/docker-build-debugger.json'

export function useDockerBuildDebugger() {
  const [logInput, setLogInput] = useKV<string>('docker-log-input', '')
  const [parsedErrors, setParsedErrors] = useState<DockerError[]>([])

  const handleParse = useCallback(() => {
    if (!logInput.trim()) {
      toast.error(dockerBuildDebuggerText.analyzer.emptyLogError)
      return
    }

    const errors = parseDockerLog(logInput)

    if (errors.length === 0) {
      toast.info(dockerBuildDebuggerText.analyzer.noErrorsToast)
    } else {
      setParsedErrors(errors)
      toast.success(
        dockerBuildDebuggerText.analyzer.errorsFoundToast
          .replace('{{count}}', String(errors.length))
          .replace('{{plural}}', errors.length > 1 ? 's' : '')
      )
    }
  }, [logInput])

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(dockerBuildDebuggerText.errors.copiedToast.replace('{{label}}', label))
  }, [])

  return {
    logInput,
    setLogInput,
    parsedErrors,
    setParsedErrors,
    handleParse,
    handleCopy,
    dockerBuildDebuggerText,
  }
}
