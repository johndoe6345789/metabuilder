'use client'

import { Namespace } from '@/lib/types'
import styles from './snippet-view-page.module.scss'

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface SnippetStatusBarProps {
  language: string
  activeFile: string
  filename: string
  lineCount: number
  namespace?: Namespace
  isRunning: boolean
  saving: boolean
  updatedAt: number
}

export function SnippetStatusBar({
  language,
  activeFile,
  filename,
  lineCount,
  namespace,
  isRunning,
  saving,
  updatedAt,
}: SnippetStatusBarProps) {
  return (
    <div
      className={styles.statusBar}
      role="status"
      aria-label="File information"
    >
      <div className={styles.statusLeft}>
        <span className={styles.statusItem}>{language}</span>
        <span className={styles.statusSep} aria-hidden="true" />
        <span className={styles.statusItem}>{activeFile || filename}</span>
        <span className={styles.statusSep} aria-hidden="true" />
        <span className={styles.statusItem}>
          {lineCount} {lineCount === 1 ? 'line' : 'lines'}
        </span>
        {namespace && (
          <>
            <span className={styles.statusSep} aria-hidden="true" />
            <span className={styles.statusItem}>{namespace.name}</span>
          </>
        )}
      </div>
      <div className={styles.statusRight}>
        {isRunning && (
          <span
            className={`${styles.statusItem} ${styles.statusRunning}`}
          >
            ● Running
          </span>
        )}
        {saving && (
          <span className={styles.statusItem}>Saving…</span>
        )}
        <span className={styles.statusItem}>
          Updated {relativeTime(updatedAt)}
        </span>
      </div>
    </div>
  )
}
