'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button, Card, MaterialIcon } from '@metabuilder/components/fakemui'
import { runPythonViaFlask } from '@/lib/flask-runner'
import { PythonTerminal } from '@/components/features/python-runner/PythonTerminal'
import styles from './PythonOutput.module.scss'

interface PythonOutputProps {
  code: string
}

export function PythonOutput({ code }: PythonOutputProps) {
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasInput, setHasInput] = useState(false)

  useEffect(() => {
    setHasInput(/\binput\s*\(/i.test(code))
  }, [code])

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')
    setError('')

    try {
      const result = await runPythonViaFlask(code)
      setOutput(result.output)
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
    <div className={styles.container} data-testid="python-output">
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Python Output</h3>
        <Button
          onClick={handleRun}
          disabled={isRunning}
          size="sm"
          data-testid="run-python-code-btn"
          aria-label={isRunning ? 'Running code' : 'Run Python code'}
          aria-busy={isRunning}
        >
          {isRunning ? (
            <>
              <MaterialIcon name="progress_activity" className={styles.spinIcon} size={16} aria-hidden="true" />
              Running...
            </>
          ) : (
            <>
              <MaterialIcon name="play_arrow" size={16} aria-hidden="true" />
              Run
            </>
          )}
        </Button>
      </div>

      <div className={styles.body} role="region" aria-label="Output content">
        {!isRunning && !output && !error && (
          <div
            className={styles.emptyState}
            data-testid="empty-output"
            role="status"
          >
            Click &quot;Run&quot; to execute the Python code
          </div>
        )}

        {output && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            data-testid="python-output-card"
            role="region"
            aria-label="Python output result"
          >
            <Card className={styles.outputCard}>
              <pre className={styles.outputPre}>
                {output || '(no output)'}
              </pre>
            </Card>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            data-testid="python-error-card"
            role="alert"
          >
            <Card className={styles.errorCard}>
              <div className={styles.errorRow}>
                <MaterialIcon name="warning" size={16} className={styles.errorIcon} aria-hidden="true" />
                <pre className={styles.errorPre}>
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
