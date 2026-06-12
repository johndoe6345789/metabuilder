'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import { ToolBtn } from './ToolBtn'
import { ToolbarExecGroup } from './ToolbarExecGroup'
import { ToolbarDocGroup } from './ToolbarDocGroup'
import styles from './snippet-view-page.module.scss'

interface SnippetToolbarProps {
  isCopied: boolean
  wordWrap: 'on' | 'off'
  canPreview: boolean
  showPreview: boolean
  isRunning: boolean
  isDebugging: boolean
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
  onDebug: () => void
  onPalette: () => void
}

export function SnippetToolbar({
  isCopied, wordWrap, canPreview, showPreview,
  isRunning, isDebugging, shareActive, historyOpen,
  onEdit, onCopy, onShare, onFork, onHistory,
  onToggleWrap, onTogglePreview, onRun, onStop, onDebug, onPalette,
}: SnippetToolbarProps) {
  return (
    <div className={styles.wordToolbar} role="toolbar"
      aria-label="Document toolbar">
      <div className={styles.toolGroup}>
        <ToolBtn title="Edit" label="Edit snippet" icon="edit"
          onClick={onEdit} />
      </div>
      <div className={styles.toolSep} aria-hidden="true" />
      <ToolbarDocGroup
        isCopied={isCopied} wordWrap={wordWrap}
        canPreview={canPreview} showPreview={showPreview}
        shareActive={shareActive} historyOpen={historyOpen}
        onCopy={onCopy} onShare={onShare} onFork={onFork}
        onHistory={onHistory} onToggleWrap={onToggleWrap}
        onTogglePreview={onTogglePreview}
      />
      <div className={styles.toolSep} aria-hidden="true" />
      <ToolbarExecGroup isRunning={isRunning} isDebugging={isDebugging}
        onRun={onRun} onStop={onStop} onDebug={onDebug} />
      <button className={styles.paletteTrigger} onClick={onPalette}
        title="Open command palette" aria-label="Open command palette">
        <MaterialIcon name="keyboard" size={13} />
        <span>Commands</span>
        <kbd>⌘K</kbd>
      </button>
    </div>
  )
}
