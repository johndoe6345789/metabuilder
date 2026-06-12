'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './snippet-view-page.module.scss'

interface SnippetTopBarProps {
  title: string
  description?: string
  onBack: () => void
}

export function SnippetTopBar({
  title,
  description,
  onBack,
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
    </div>
  )
}
