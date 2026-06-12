'use client'

import { motion } from 'framer-motion'
import { Button, Card, MaterialIcon } from '@metabuilder/components/fakemui'
import { PythonTerminal } from './PythonTerminal'
import { usePythonOutput } from './hooks/usePythonOutput'
import styles from './PythonOutput.module.scss'

interface PythonOutputProps {
  code: string
}

export function PythonOutput({ code }: PythonOutputProps) {
  const vm = usePythonOutput(code)

  if (vm.hasInput) return <PythonTerminal code={code} />

  return (
    <div className={styles.container} data-testid="python-output">
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Python Output</h3>
        <Button
          onClick={vm.handleRun}
          disabled={vm.isRunning}
          size="sm"
          data-testid="run-python-code-btn"
          aria-label={vm.isRunning ? 'Running code' : 'Run Python code'}
          aria-busy={vm.isRunning}
        >
          {vm.isRunning ? (
            <>
              <MaterialIcon
                name="progress_activity"
                className={styles.spinIcon}
                size={16}
                aria-hidden="true"
              />{' '}
              Running...
            </>
          ) : (
            <>
              <MaterialIcon
                name="play_arrow"
                size={16}
                aria-hidden="true"
              />{' '}
              Run
            </>
          )}
        </Button>
      </div>

      <div className={styles.body} role="region" aria-label="Output content">
        {!vm.isRunning && !vm.output && !vm.error && (
          <div
            className={styles.emptyState}
            data-testid="empty-output"
            role="status"
          >
            Click &quot;Run&quot; to execute the Python code
          </div>
        )}

        {vm.output && (
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
                {vm.output || '(no output)'}
              </pre>
            </Card>
          </motion.div>
        )}

        {vm.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            data-testid="python-error-card"
            role="alert"
          >
            <Card className={styles.errorCard}>
              <div className={styles.errorRow}>
                <MaterialIcon
                  name="warning"
                  size={16}
                  className={styles.errorIcon}
                  aria-hidden="true"
                />
                <pre className={styles.errorPre}>{vm.error}</pre>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
