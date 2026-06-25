'use client'

import { MaterialIcon } from '@metabuilder/components/m3'
import { ToolBtn } from './ToolBtn'
import styles from './snippet-view-page.module.scss'

interface ToolbarExecGroupProps {
  isRunning: boolean
  isDebugging: boolean
  onRun: () => void
  onStop: () => void
  onDebug: () => void
}

export function ToolbarExecGroup({
  isRunning,
  isDebugging,
  onRun,
  onStop,
  onDebug,
}: ToolbarExecGroupProps) {
  return (
    <div className={styles.toolGroup}>
      <button
        className={`${styles.toolBtn} ${styles.toolBtnRun}`}
        onClick={onRun}
        disabled={isRunning}
        title="Run code"
        data-testid="run-code-btn"
        aria-label={isRunning ? 'Running code' : 'Run code'}
      >
        <MaterialIcon name="play_arrow" size={14} />
        <span>{isRunning ? 'Running…' : 'Run'}</span>
      </button>
      <ToolBtn
        title="Stop"
        label="Stop execution"
        icon="stop"
        extra={styles.toolBtnStop}
        disabled={!isRunning}
        testId="stop-code-btn"
        onClick={onStop}
      />
      <button
        className={`${styles.toolBtn} ${styles.toolBtnDebug}`}
        onClick={onDebug}
        disabled={isDebugging}
        title="Debug code"
        data-testid="debug-code-btn"
        aria-label={isDebugging ? 'Debugging' : 'Debug code'}
      >
        <MaterialIcon name="bug_report" size={14} />
        <span>{isDebugging ? 'Debugging…' : 'Debug'}</span>
      </button>
    </div>
  )
}
