'use client'

import type { useDebugger } from '@/hooks/useDebugger'
import { useDebugKeyboard } from '@/hooks/useDebugKeyboard'
import { DebugControls } from './DebugControls'
import { DebugSandboxInfo } from './DebugSandboxInfo'
import { DebugIdle } from './DebugIdle'
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

function isSupported(language: string, supportedLanguages: string[]) {
  const langKey = language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const lang = language.toLowerCase()
  return supportedLanguages.some(k => {
    const lk = k.toLowerCase()
    return lk === langKey || lang.startsWith(lk)
  })
}

export function DebugPanel({ language, debugger: dbg, onStart }: Props) {
  const { state, isActive, isPaused, supportedLanguages } = dbg
  useDebugKeyboard(dbg, isActive, isPaused)

  if (!isActive) {
    return (
      <DebugIdle
        language={language}
        supported={isSupported(language, supportedLanguages)}
        error={state.status === 'error' ? state.error : null}
        onStart={onStart}
      />
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
