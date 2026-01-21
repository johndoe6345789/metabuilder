'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, CircleNotch, ArrowClockwise, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { runPythonCode, getPyodide, isPyodideReady, getPyodideError, resetPyodide } from '@/lib/pyodide-runner'
import { PythonTerminal } from '@/components/features/python-runner/PythonTerminal'
import { toast } from 'sonner'

interface PythonOutputProps {
  code: string
}

export function PythonOutput({ code }: PythonOutputProps) {
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(!isPyodideReady())
  const [initError, setInitError] = useState<string | null>(null)
  const [hasInput, setHasInput] = useState(false)

  const initializePyodide = useCallback(async () => {
    setIsInitializing(true)
    setInitError(null)

    try {
      await getPyodide()
      setIsInitializing(false)
      toast.success('Python environment ready!')
    } catch (err) {
      setIsInitializing(false)
      const errorMsg = err instanceof Error ? err.message : String(err)
      setInitError(errorMsg)
      toast.error('Failed to load Python environment')
      console.error(err)
    }
  }, [])

  const handleRetry = useCallback(() => {
    resetPyodide()
    setOutput('')
    setError('')
    setInitError(null)
    initializePyodide()
  }, [initializePyodide])

  useEffect(() => {
    // Check for existing initialization error
    const existingError = getPyodideError()
    if (existingError) {
      setInitError(existingError.message)
      setIsInitializing(false)
      return
    }

    if (!isPyodideReady()) {
      initializePyodide()
    }
  }, [initializePyodide])

  useEffect(() => {
    const hasInputCall = /\binput\s*\(/i.test(code)
    setHasInput(hasInputCall)
  }, [code])

  const statusTone = initError
    ? 'border-destructive/30 bg-destructive/10 text-destructive'
    : isInitializing
      ? 'border-border bg-primary/5 text-primary'
      : 'border-primary/30 bg-primary/10 text-primary'

  const statusLabel = initError
    ? 'Init failed'
    : isInitializing
      ? 'Loading'
      : 'Ready'

  const handleRun = async () => {
    if (initError) {
      toast.error('Python environment failed to start. Retry to load it again.')
      return
    }

    if (isInitializing) {
      toast.info('Python environment is still loading...')
      return
    }

    setIsRunning(true)
    setOutput('')
    setError('')

    try {
      const result = await runPythonCode(code)
      setOutput(result.output || '')
      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsRunning(false)
    }
  }

  if (hasInput) {
    return <PythonTerminal code={code} />
  }

  return (
    <div className="flex flex-col h-full bg-card" data-testid="python-output">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Python Output</h3>
          <span
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusTone}`}
            role="status"
            aria-live="polite"
            aria-label={`Python environment status: ${statusLabel}`}
          >
            <span
              className={`size-2.5 rounded-full ${initError ? 'bg-destructive' : 'bg-primary'}`}
              aria-hidden="true"
            />
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {initError && (
            <Button
              onClick={handleRetry}
              size="sm"
              variant="tonal"
              className="gap-2"
              data-testid="python-retry-btn"
              aria-label="Retry loading Python environment"
            >
              <ArrowClockwise size={16} aria-hidden="true" />
              Retry
            </Button>
          )}
          <Button
            onClick={handleRun}
            disabled={isRunning || isInitializing || Boolean(initError)}
            size="sm"
            className="gap-2"
            data-testid="run-python-code-btn"
            aria-label={isRunning ? 'Running code' : isInitializing ? 'Loading environment' : 'Run Python code'}
            aria-busy={isRunning || isInitializing}
          >
            {isRunning || isInitializing ? (
              <>
                <CircleNotch className="animate-spin" size={16} aria-hidden="true" />
                {isInitializing ? 'Loading...' : 'Running...'}
              </>
            ) : (
              <>
                <Play size={16} weight="fill" aria-hidden="true" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4" role="region" aria-label="Output content">
        {isInitializing && (
          <Card className="p-4 border border-border/60" data-testid="init-loading-card" role="status">
            <div className="flex items-start gap-3 text-sm text-foreground">
              <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                <CircleNotch className="animate-spin" size={18} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">Preparing Python environment</p>
                <p className="text-muted-foreground">
                  This takes a few seconds the first time while Pyodide downloads.
                </p>
              </div>
            </div>
          </Card>
        )}

        {initError && (
          <Card
            className="p-4 border-destructive/40 bg-destructive/5"
            data-testid="init-error-card"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-destructive/10 p-2 text-destructive">
                <Warning size={18} weight="fill" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-destructive">Python environment failed to start</p>
                  <p className="text-sm text-muted-foreground">{initError}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="tonal"
                    className="gap-2"
                    onClick={handleRetry}
                    data-testid="retry-init-btn"
                  >
                    <ArrowClockwise size={16} aria-hidden="true" />
                    Retry loading
                  </Button>
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => toast.info('Check your network connection or disable blockers that may block Pyodide.')}
                    data-testid="troubleshoot-btn"
                  >
                    Troubleshoot
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {!isInitializing && !initError && !output && !error && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm" data-testid="empty-output" role="status">
            Click "Run" to execute the Python code
          </div>
        )}

        {!isInitializing && !initError && output && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            data-testid="python-output-card"
            role="region"
            aria-label="Python output result"
          >
            <Card className="p-4 bg-background">
              <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
                {output}
              </pre>
            </Card>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
            data-testid="python-error-card"
            role="alert"
          >
            <Card className="p-4 bg-destructive/10 border-destructive/20">
              <div className="flex items-start gap-2">
                <div className="text-destructive font-semibold text-sm">Error:</div>
                <pre className="text-sm font-mono whitespace-pre-wrap text-destructive flex-1">
                  {error}
                </pre>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
