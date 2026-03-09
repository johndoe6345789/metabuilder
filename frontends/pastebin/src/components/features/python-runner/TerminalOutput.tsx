import { motion } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './TerminalOutput.module.scss'

interface TerminalLine {
  type: 'output' | 'error' | 'input-prompt' | 'input-value'
  content: string
  id: string
}

interface TerminalOutputProps {
  lines: TerminalLine[]
  isRunning: boolean
}

export function TerminalOutput({ lines, isRunning }: TerminalOutputProps) {
  const t = useTranslation()
  if (lines.length === 0 && !isRunning) {
    return (
      <div
        className={styles.emptyState}
        data-testid="terminal-empty-state"
        role="status"
        aria-live="polite"
        aria-label="Terminal output area"
      >
        {t.pythonTerminal.emptyState}
      </div>
    )
  }

  // Check if there are any error lines
  const hasErrors = lines.some((line) => line.type === 'error')
  const lastErrorLine = lines.findLast((line) => line.type === 'error')

  return (
    <div
      className={styles.container}
      data-testid="terminal-output-content"
      aria-label="Terminal output area"
      role="log"
    >
      {/* Aria-live region for error announcements */}
      {hasErrors && (
        <div
          className={styles.srOnly}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-testid="terminal-error-alert"
        >
          Error: {lastErrorLine?.content}
        </div>
      )}

      {lines.map((line) => (
        <motion.div
          key={line.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={styles.line}
          role={line.type === 'error' ? 'alert' : 'status'}
          aria-live={line.type === 'error' ? 'assertive' : 'off'}
        >
          {line.type === 'output' && (
            <div className={styles.output}>{line.content}</div>
          )}
          {line.type === 'error' && (
            <div className={styles.error} aria-label={`Error: ${line.content}`}>
              {line.content}
            </div>
          )}
          {line.type === 'input-prompt' && (
            <div className={styles.inputPrompt}>{line.content}</div>
          )}
          {line.type === 'input-value' && (
            <div className={styles.inputValue}>{'> ' + line.content}</div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
