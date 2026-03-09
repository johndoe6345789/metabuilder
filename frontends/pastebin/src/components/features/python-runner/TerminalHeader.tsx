import { Button, MaterialIcon } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './TerminalHeader.module.scss'

interface TerminalHeaderProps {
  onRun: () => void
  isRunning: boolean
  isInitializing: boolean
  waitingForInput: boolean
}

export function TerminalHeader({
  onRun,
  isRunning,
  isInitializing,
  waitingForInput
}: TerminalHeaderProps) {
  const t = useTranslation()
  return (
    <div className={styles.header} data-testid="terminal-header">
      <div className={styles.titleGroup}>
        <MaterialIcon name="terminal" size={18} className={styles.terminalIcon} aria-hidden="true" />
        <h3 className={styles.title}>{t.pythonTerminal.title}</h3>
      </div>
      <Button
        onClick={onRun}
        disabled={isRunning || isInitializing || waitingForInput}
        size="sm"
        data-testid="run-python-btn"
        aria-label={isRunning ? t.pythonTerminal.runningAria : isInitializing ? t.pythonTerminal.loadingAria : t.pythonTerminal.runAria}
        aria-busy={isRunning || isInitializing}
      >
        {isRunning || isInitializing ? (
          <>
            <MaterialIcon name="progress_activity" className={styles.spinIcon} size={16} aria-hidden="true" />
            {isInitializing ? t.pythonTerminal.loading : t.pythonTerminal.running}
          </>
        ) : (
          <>
            <MaterialIcon name="play_arrow" size={16} aria-hidden="true" />
            {t.pythonTerminal.run}
          </>
        )}
      </Button>
    </div>
  )
}
