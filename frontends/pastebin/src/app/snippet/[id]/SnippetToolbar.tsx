'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import { ToolBtn } from './ToolBtn'
import styles from './snippet-view-page.module.scss'

interface SnippetToolbarProps {
  isCopied: boolean
  wordWrap: 'on' | 'off'
  canPreview: boolean
  showPreview: boolean
  isRunning: boolean
  shareActive: boolean
  historyOpen: boolean
  onEdit: () => void
  onCopy: () => void
  onShare: () => void
  onFork: () => void
  onHistory: () => void
  onToggleWrap: () => void
  onTogglePreview: () => void
  onRun: () => void
  onStop: () => void
  onPalette: () => void
}

export function SnippetToolbar({
  isCopied, wordWrap, canPreview, showPreview,
  isRunning, shareActive, historyOpen,
  onEdit, onCopy, onShare, onFork, onHistory,
  onToggleWrap, onTogglePreview, onRun, onStop, onPalette,
}: SnippetToolbarProps) {
  return (
    <div
      className={styles.wordToolbar}
      role="toolbar"
      aria-label="Document toolbar"
    >
      <div className={styles.toolGroup}>
        <ToolBtn title="Edit" label="Edit snippet" icon="edit" onClick={onEdit} />
      </div>
      <div className={styles.toolSep} aria-hidden="true" />
      <div className={styles.toolGroup}>
        <button
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
        <ToolBtn title="Fork" label="Fork snippet" icon="call_split" onClick={onFork} />
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
      <div className={styles.toolSep} aria-hidden="true" />
      <div className={styles.toolGroup}>
        <button
          className={`${styles.toolBtn} ${styles.toolBtnRun}`}
          onClick={onRun}
          disabled={isRunning}
          title="Run code"
          data-testid="run-code-btn"
          aria-label={isRunning ? 'Running code' : 'Run code'}
        >
          <MaterialIcon name="play_arrow" size={14} />
          <span>{isRunning ? 'Running…' : 'Run'}</span>
        </button>
        <ToolBtn
          title="Stop"
          label="Stop execution"
          icon="stop"
          extra={styles.toolBtnStop}
          disabled={!isRunning}
          testId="stop-code-btn"
          onClick={onStop}
        />
      </div>
      <button
        className={styles.paletteTrigger}
        onClick={onPalette}
        title="Open command palette"
        aria-label="Open command palette"
      >
        <MaterialIcon name="keyboard" size={13} />
        <span>Commands</span>
        <kbd>⌘K</kbd>
      </button>
    </div>
  )
}
