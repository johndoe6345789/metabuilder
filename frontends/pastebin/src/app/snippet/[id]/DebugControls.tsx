'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import type { useDebugger } from '@/hooks/useDebugger'
import styles from './DebugPanel.module.scss'

type Debugger = ReturnType<typeof useDebugger>

export function DebugControls({ dbg }: { dbg: Debugger }) {
  const { state, isPaused, isActive } = dbg
  const isRunning = state.status === 'running'
  // Step/continue only make sense while paused; pause only while running.
  // Buttons stay visible at all times (PyCharm-style) and disable otherwise.
  return (
    <div className={styles.controls}>
      <button
        className={styles.ctrlBtn}
        onClick={() => void dbg.resume()}
        disabled={!isPaused}
        title="Resume program (F9)"
      >
        <MaterialIcon name="play_arrow" size={16} />
      </button>
      <button
        className={styles.ctrlBtn}
        onClick={() => void dbg.pause()}
        disabled={!isRunning}
        title="Pause program"
      >
        <MaterialIcon name="pause" size={16} />
      </button>
      <button
        className={`${styles.ctrlBtn} ${styles.ctrlStop}`}
        onClick={() => void dbg.stopDebugging()}
        disabled={!isActive}
        title="Stop (⇧F5)"
      >
        <MaterialIcon name="stop" size={16} />
      </button>
      <span className={styles.ctrlDivider} aria-hidden="true" />
      <button
        className={styles.ctrlBtn}
        onClick={() => void dbg.stepOver()}
        disabled={!isPaused}
        title="Step Over (F8)"
      >
        <MaterialIcon name="skip_next" size={16} />
      </button>
      <button
        className={styles.ctrlBtn}
        onClick={() => void dbg.stepIn()}
        disabled={!isPaused}
        title="Step Into (F7)"
      >
        <MaterialIcon name="arrow_downward" size={16} />
      </button>
      <button
        className={styles.ctrlBtn}
        onClick={() => void dbg.stepOut()}
        disabled={!isPaused}
        title="Step Out (⇧F8)"
      >
        <MaterialIcon name="arrow_upward" size={16} />
      </button>
      <span className={styles.statusBadge} data-status={state.status}>
        {state.status}
      </span>
    </div>
  )
}
