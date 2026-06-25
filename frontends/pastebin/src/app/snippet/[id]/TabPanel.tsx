import type { ReactNode } from 'react'
import styles from './snippet-view-page.module.scss'

interface Props {
  visible: boolean
  children: ReactNode
}

/** One tab's panel wrapper: shown/hidden by the active editor tab. */
export function TabPanel({ visible, children }: Props) {
  return (
    <div
      className={`${styles.editorPanel} ${
        visible ? styles.editorPanelVisible : styles.editorPanelHidden
      }`}
      role="tabpanel"
    >
      {children}
    </div>
  )
}
