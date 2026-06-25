'use client'

import styles from '../QueryConsole.module.scss'

interface ModeBarProps {
  mode: 'gui' | 'cli'
  onCli: () => void
  onGui: () => void
  onDisconnect: () => void
}

export function ModeBar({
  mode, onCli, onGui, onDisconnect,
}: ModeBarProps) {
  return (
    <div className={styles.modeBar}>
      <div className={styles.modeTabs}>
        <button
          className={[
            styles.modeTab,
            mode === 'cli' ? styles.modeTabActive : '',
          ].join(' ')}
          onClick={onCli}
          type="button"
        >
          CLI
        </button>
        <button
          className={[
            styles.modeTab,
            mode === 'gui' ? styles.modeTabActive : '',
          ].join(' ')}
          onClick={onGui}
          type="button"
        >
          GUI
        </button>
      </div>
      <button
        className={styles.logoutBtn}
        onClick={onDisconnect}
        type="button"
      >
        Disconnect
      </button>
    </div>
  )
}
