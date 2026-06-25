import { useState, useEffect } from 'react'
import { runPythonViaFlask } from '@/lib/flask-runner'

export function usePythonOutput(code: string) {
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasInput, setHasInput] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasInput(/\binput\s*\(/i.test(code))
  }, [code])

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')
    setError('')
    try {
      const result = await runPythonViaFlask(code)
      setOutput(result.output)
      if (result.error) setError(result.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsRunning(false)
    }
  }

  return { output, error, isRunning, hasInput, handleRun }
}
