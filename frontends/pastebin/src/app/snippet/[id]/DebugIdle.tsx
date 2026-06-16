'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import { DebugSandboxInfo } from './DebugSandboxInfo'
import styles from './DebugPanel.module.scss'

interface Props {
  language: string
  supported: boolean
  error: string | null
  onStart: () => void
}

/** Debug panel before a session starts: hint + Start + the sandbox card. */
export function DebugIdle({ language, supported, error, onStart }: Props) {
  return (
    <div className={styles.idle}>
      {supported ? (
        <>
          <p className={styles.idleHint}>
            Click the gutter to set breakpoints, then start the debugger.
          </p>
          <button className={styles.startBtn} onClick={onStart}>
            <MaterialIcon name="bug_report" size={16} />
            Start Debugging
          </button>
          <DebugSandboxInfo language={language} />
        </>
      ) : (
        <p className={styles.idleHint}>
          Debugger not supported for <strong>{language}</strong>. Supported:
          Python, JavaScript, TypeScript, Go.
        </p>
      )}
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}
