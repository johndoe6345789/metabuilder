'use client'

import { MaterialIcon } from '@metabuilder/components/m3'
import { ToolBtn } from './ToolBtn'
import styles from './snippet-view-page.module.scss'

interface Props {
  isCopied: boolean
  wordWrap: 'on' | 'off'
  canPreview: boolean
  showPreview: boolean
  shareActive: boolean
  historyOpen: boolean
  onCopy: () => void
  onShare: () => void
  onFork: () => void
  onHistory: () => void
  onToggleWrap: () => void
  onTogglePreview: () => void
}

export function ToolbarDocGroup({
  isCopied,
  wordWrap,
  canPreview,
  showPreview,
  shareActive,
  historyOpen,
  onCopy,
  onShare,
  onFork,
  onHistory,
  onToggleWrap,
  onTogglePreview,
}: Props) {
  return (
    <>
      <div className={styles.toolGroup}>
        <button
          // eslint-disable-next-line max-len
          className={`${styles.toolBtn} ${isCopied ? styles.toolBtnPressed : ''}`}
          onClick={onCopy}
          title="Copy active file"
          aria-live="polite"
        >
          <MaterialIcon name={isCopied ? 'check' : 'content_copy'} size={14} />
          <span>{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className={styles.toolSep} aria-hidden="true" />
      <div className={styles.toolGroup}>
        <ToolBtn
          title="Share"
          label={shareActive ? 'Manage share link' : 'Share snippet'}
          icon="share"
          active={shareActive}
          onClick={onShare}
        />
        <ToolBtn
          title="Fork"
          label="Fork snippet"
          icon="call_split"
          onClick={onFork}
        />
        <ToolBtn
          title="History"
          label="Version history"
          icon="history"
          active={historyOpen}
          onClick={onHistory}
        />
      </div>
      <div className={styles.toolSep} aria-hidden="true" />
      <div className={styles.toolGroup}>
        <ToolBtn
          title="Wrap"
          label="Toggle word wrap"
          icon="wrap_text"
          active={wordWrap === 'on'}
          onClick={onToggleWrap}
        />
        {canPreview && (
          <ToolBtn
            title="Preview"
            label={showPreview ? 'Hide preview' : 'Show preview'}
            icon="vertical_split"
            active={showPreview}
            onClick={onTogglePreview}
          />
        )}
      </div>
    </>
  )
}
