'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './snippet-view-page.module.scss'

interface SnippetTopBarProps {
  title: string
  description?: string
  onBack: () => void
  maximized?: boolean
  onToggleMaximize?: () => void
}

export function SnippetTopBar({
  title,
  description,
  onBack,
  maximized = false,
  onToggleMaximize,
}: SnippetTopBarProps) {
  return (
    <div className={styles.topBar}>
      <button
        className={styles.backBtn}
        onClick={onBack}
        aria-label="Back to snippets"
      >
        <MaterialIcon name="arrow_back" size={14} />
        <span>Back</span>
      </button>
      <div className={styles.titleGroup}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description && (
          <span className={styles.titleDescription} title={description}>
            {description}
          </span>
        )}
      </div>
      {onToggleMaximize && (
        <button
          className={styles.maximizeBtn}
          onClick={onToggleMaximize}
          title={maximized ? 'Restore' : 'Maximize IDE'}
          aria-label={maximized ? 'Restore IDE' : 'Maximize IDE'}
          aria-pressed={maximized}
        >
          <MaterialIcon
            name={maximized ? 'fullscreen_exit' : 'fullscreen'}
            size={16}
          />
        </button>
      )}
    </div>
  )
}
