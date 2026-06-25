import type { MouseEvent } from 'react'
import { DebugPanel } from './DebugPanel'
import type { Debugger } from './snippetEditorPanels.types'
import styles from './snippet-view-page.module.scss'

interface Props {
  language: string
  dbg: Debugger
  height: number
  onResize: (e: MouseEvent) => void
  onStart: () => void
}

/** The resizable debugger docked beneath the editor on the Code tab. */
export function DebugDock({ language, dbg, height, onResize, onStart }: Props) {
  return (
    <div className={styles.debugDock} style={{ height }}>
      <div
        className={styles.debugDockHandle}
        onMouseDown={onResize}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize debug panel"
      />
      <div className={styles.debugDockBody}>
        <DebugPanel language={language} debugger={dbg} onStart={onStart} />
      </div>
    </div>
  )
}
