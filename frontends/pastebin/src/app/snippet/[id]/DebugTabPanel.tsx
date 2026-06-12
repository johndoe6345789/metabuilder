'use client'

import { DebugPanel } from './DebugPanel'
import styles from './snippet-view-page.module.scss'
import type { useDebugger } from '@/hooks/useDebugger'

type Debugger = ReturnType<typeof useDebugger>

interface Props {
  visible: boolean
  language: string
  debugger: Debugger
  onStart: () => void
}

export function DebugTabPanel({
  visible,
  language,
  debugger: dbg,
  onStart,
}: Props) {
  const cls = visible ? styles.editorPanelVisible : styles.editorPanelHidden
  return (
    <div
      className={`${styles.editorPanel} ${styles.debugPanel} ${cls}`}
      role="tabpanel"
    >
      <div className={styles.debugContent}>
        <DebugPanel language={language} debugger={dbg} onStart={onStart} />
      </div>
    </div>
  )
}
