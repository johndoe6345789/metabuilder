'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import type { ActiveTab } from './hooks/useSnippetViewPage'
import styles from './snippet-view-page.module.scss'

interface SnippetEditorTabBarProps {
  openFiles: string[]
  activeFile: string
  activeTab: ActiveTab
  isRunning: boolean
  onFileTabClick: (name: string) => void
  onCloseTab: (name: string) => void
  onTerminalClick: () => void
  onDebugClick: () => void
}

export function SnippetEditorTabBar({
  openFiles,
  activeFile,
  activeTab,
  isRunning,
  onFileTabClick,
  onCloseTab,
  onTerminalClick,
  onDebugClick,
}: SnippetEditorTabBarProps) {
  return (
    <div className={styles.editorTabBar} role="tablist">
      {openFiles.map(f => {
        const isActive = activeTab === 'code' && activeFile === f
        return (
          <button
            key={f}
            className={`${styles.editorTab} ${
              isActive ? styles.editorTabActive : ''
            }`}
            role="tab"
            aria-selected={isActive}
            onClick={() => onFileTabClick(f)}
          >
            <MaterialIcon
              name="insert_drive_file"
              size={12}
              aria-hidden="true"
            />
            <span>{f}</span>
            {openFiles.length > 1 && (
              <span
                className={styles.tabClose}
                role="button"
                aria-label={`Close ${f}`}
                onClick={e => { e.stopPropagation(); onCloseTab(f) }}
              >
                ×
              </span>
            )}
          </button>
        )
      })}

      <button
        className={`${styles.editorTab} ${
          activeTab === 'terminal' ? styles.editorTabActive : ''
        }`}
        role="tab"
        aria-selected={activeTab === 'terminal'}
        onClick={onTerminalClick}
      >
        <MaterialIcon name="terminal" size={12} aria-hidden="true" />
        <span>Terminal</span>
        {isRunning && (
          <span className={styles.runningDot} aria-hidden="true" />
        )}
      </button>

      <button
        className={`${styles.editorTab} ${
          activeTab === 'debug' ? styles.editorTabActive : ''
        }`}
        role="tab"
        aria-selected={activeTab === 'debug'}
        onClick={onDebugClick}
      >
        <MaterialIcon name="bug_report" size={12} aria-hidden="true" />
        <span>Debug</span>
      </button>

      <div className={styles.editorTabRail} aria-hidden="true" />
    </div>
  )
}
