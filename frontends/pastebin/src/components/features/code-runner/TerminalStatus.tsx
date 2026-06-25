import styles from './CodeTerminal.module.scss'

interface Props {
  isRunning: boolean
  waitingForInput: boolean
  lineCount: number
  hasErrors: boolean
}

/** Screen-reader live region announcing terminal run state. */
export function TerminalStatus({
  isRunning,
  waitingForInput,
  lineCount,
  hasErrors,
}: Props) {
  return (
    <div
      className={styles.srOnly}
      role="status"
      aria-live={hasErrors ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-testid="terminal-status"
    >
      {isRunning && 'Code is running'}
      {waitingForInput && 'Waiting for user input'}
      {!isRunning && lineCount > 0 && `${lineCount} lines of output`}
      {hasErrors && 'Errors detected in output'}
    </div>
  )
}
