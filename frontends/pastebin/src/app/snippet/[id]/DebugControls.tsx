'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import type { useDebugger } from '@/hooks/useDebugger'
import styles from './DebugPanel.module.scss'

type Debugger = ReturnType<typeof useDebugger>

export function DebugControls({ dbg }: { dbg: Debugger }) {
  const { state, isPaused, isActive } = dbg
  return (
    <div className={styles.controls}>
      {isPaused && (
        <>
          <button
            className={styles.ctrlBtn}
            onClick={() => void dbg.resume()}
            title="Continue (F5)"
          >
            <MaterialIcon name="play_arrow" size={16} />
          </button>
          <button
            className={styles.ctrlBtn}
            onClick={() => void dbg.stepOver()}
            title="Step Over (F10)"
          >
            <MaterialIcon name="skip_next" size={16} />
          </button>
          <button
            className={styles.ctrlBtn}
            onClick={() => void dbg.stepIn()}
            title="Step Into (F11)"
          >
            <MaterialIcon name="arrow_downward" size={16} />
          </button>
          <button
            className={styles.ctrlBtn}
            onClick={() => void dbg.stepOut()}
            title="Step Out (⇧F11)"
          >
            <MaterialIcon name="arrow_upward" size={16} />
          </button>
        </>
      )}
      {state.status === 'running' && (
        <button
          className={styles.ctrlBtn}
          onClick={() => void dbg.pause()}
          title="Pause"
        >
          <MaterialIcon name="pause" size={16} />
        </button>
      )}
      {isActive && (
        <button
          className={`${styles.ctrlBtn} ${styles.ctrlStop}`}
          onClick={() => void dbg.stopDebugging()}
          title="Stop"
        >
          <MaterialIcon name="stop" size={16} />
        </button>
      )}
      <span className={styles.statusBadge} data-status={state.status}>
        {state.status}
      </span>
    </div>
  )
}
