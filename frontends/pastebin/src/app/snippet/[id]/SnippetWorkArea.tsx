'use client'

/**
 * Work area: file tree + editor column
 */

import { RefObject } from 'react'
import { Snippet } from '@/lib/types'
import { SnippetFileTree } from './SnippetFileTree'
import { SnippetEditorArea } from './SnippetEditorArea'
import styles from './snippet-view-page.module.scss'
import type { ActiveTab } from './hooks/useSnippetViewPage'

type FileList = { name: string; content: string }[]

interface Props {
  snippet: Snippet
  viewSnippet: Snippet
  files: FileList
  filename: string
  langBgClass: string
  activeFile: string
  activeTab: ActiveTab
  openFiles: string[]
  localCode: string | null
  canPreview: boolean
  showPreview: boolean
  wordWrap: 'on' | 'off'
  renaming: string | null
  renameValue: string
  addingFile: boolean
  newFileName: string
  menuFile: string | null
  newFileInputRef: RefObject<HTMLInputElement>
  terminal: { isRunning: boolean; handleStop: () => void; lastRunInfo: unknown }
  onOpenInTab: (name: string) => void
  onSetRenameValue: (v: string) => void
  onCommitRename: () => void
  onCancelRename: () => void
  onNewFile: () => void
  onMenuToggle: (name: string, rect: DOMRect) => void
  onNewFileNameChange: (v: string) => void
  onCommitNewFile: () => void
  onCancelNewFile: () => void
  onFileTabClick: (f: string) => void
  onCloseTab: (name: string) => void
  onTerminalClick: () => void
  onDebugClick: () => void
  onCodeChange: (v: string) => void
}

export function SnippetWorkArea({
  snippet, viewSnippet, files, filename, langBgClass,
  activeFile, activeTab, openFiles, canPreview, showPreview,
  wordWrap, renaming, renameValue, addingFile, newFileName,
  menuFile, newFileInputRef, terminal,
  onOpenInTab, onSetRenameValue, onCommitRename, onCancelRename,
  onNewFile, onMenuToggle, onNewFileNameChange, onCommitNewFile,
  onCancelNewFile, onFileTabClick, onCloseTab,
  onTerminalClick, onDebugClick, onCodeChange,
}: Props) {
  return (
    <div className={styles.workArea}>
      <SnippetFileTree
        files={files} activeFile={activeFile} langBgClass={langBgClass}
        renaming={renaming} renameValue={renameValue}
        addingFile={addingFile} newFileName={newFileName}
        menuFile={menuFile} snippetTitle={snippet.title}
        newFileInputRef={newFileInputRef}
        onOpenInTab={onOpenInTab}
        onSetRenameValue={onSetRenameValue}
        onRenameKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); onCommitRename() }
          if (e.key === 'Escape') { e.preventDefault(); onCancelRename() }
        }}
        onCommitRename={onCommitRename}
        onNewFile={onNewFile}
        onMenuToggle={onMenuToggle}
        onNewFileNameChange={onNewFileNameChange}
        onNewFileKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); onCommitNewFile() }
          if (e.key === 'Escape') { e.preventDefault(); onCancelNewFile() }
        }}
        onCommitNewFile={onCommitNewFile}
      />
      <SnippetEditorArea
        snippet={snippet} viewSnippet={viewSnippet}
        files={files} activeFile={activeFile} activeTab={activeTab}
        openFiles={openFiles} canPreview={canPreview}
        showPreview={showPreview} wordWrap={wordWrap} terminal={terminal}
        onFileTabClick={onFileTabClick}
        onCloseTab={onCloseTab}
        onTerminalClick={onTerminalClick}
        onDebugClick={onDebugClick}
        onCodeChange={onCodeChange}
      />
    </div>
  )
}
