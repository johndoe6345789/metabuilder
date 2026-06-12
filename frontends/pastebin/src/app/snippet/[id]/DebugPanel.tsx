'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import type { useDebugger } from '@/hooks/useDebugger'
import { DebugControls } from './DebugControls'
import {
  VariablesPanel, CallStackPanel, DebugOutput,
} from './DebugPanelSections'
import { DebugWatchPanel } from './DebugWatchPanel'
import styles from './DebugPanel.module.scss'

type Debugger = ReturnType<typeof useDebugger>

interface Props {
  language: string
  debugger: Debugger
  onStart: () => void
}

export function DebugPanel({ language, debugger: dbg, onStart }: Props) {
  const { state, isActive, supportedLanguages } = dbg
  const langKey = language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const supported = supportedLanguages.some(
    k => k === langKey || language.toLowerCase().startsWith(k),
  )

  if (!isActive) {
    return (
      <div className={styles.idle}>
        {supported ? (
          <>
            <p className={styles.idleHint}>
              Click the gutter to set breakpoints, then start the
              debugger.
            </p>
            <button className={styles.startBtn} onClick={onStart}>
              <MaterialIcon name="bug_report" size={16} />
              Start Debugging
            </button>
          </>
        ) : (
          <p className={styles.idleHint}>
            Debugger not supported for <strong>{language}</strong>.
            Supported: Python, JavaScript, TypeScript, Go.
          </p>
        )}
        {state.status === 'error' && state.error && (
          <p className={styles.errorMsg}>{state.error}</p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <DebugControls dbg={dbg} />
      <div className={styles.panels}>
        <VariablesPanel dbg={dbg} />
        <CallStackPanel frames={state.callStack} />
        <DebugWatchPanel dbg={dbg} />
        <DebugOutput output={state.output} />
      </div>
    </div>
  )
}
