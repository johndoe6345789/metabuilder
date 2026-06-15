'use client'

import { useEffect } from 'react'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import type { useDebugger } from '@/hooks/useDebugger'
import { DebugControls } from './DebugControls'
import { DebugSandboxInfo } from './DebugSandboxInfo'
import {
  VariablesPanel,
  CallStackPanel,
  DebugOutput,
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
  const { state, isActive, isPaused, supportedLanguages } = dbg
  const langKey = language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const lang = language.toLowerCase()
  const supported = supportedLanguages.some(k => {
    const lk = k.toLowerCase()
    return lk === langKey || lang.startsWith(lk)
  })

  // PyCharm-style debug keys: F9 resume, F8 step over, F7 step into,
  // ⇧F8 step out, ⇧F5 stop. Active only while a session is live.
  useEffect(() => {
    if (!isActive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F5' && e.shiftKey) {
        e.preventDefault()
        void dbg.stopDebugging()
        return
      }
      if (!isPaused) return
      switch (e.key) {
        case 'F9':
          e.preventDefault()
          void dbg.resume()
          break
        case 'F8':
          e.preventDefault()
          if (e.shiftKey) void dbg.stepOut()
          else void dbg.stepOver()
          break
        case 'F7':
          e.preventDefault()
          void dbg.stepIn()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive, isPaused, dbg])

  if (!isActive) {
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
        <div className={styles.sandboxWrap}>
          <DebugSandboxInfo language={language} />
        </div>
      </div>
    </div>
  )
}
