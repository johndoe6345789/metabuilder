'use client'

import { RefObject } from 'react'
import { Snippet } from '@/lib/types'
import { SnippetFileTreeArea } from './SnippetFileTreeArea'
import { SnippetEditorArea } from './SnippetEditorArea'
import styles from './snippet-view-page.module.scss'
import type { ActiveTab } from './hooks/useSnippetViewPage'
import type { useDebugger } from '@/hooks/useDebugger'
import type { UseCodeTerminalReturn } from '@/hooks/useCodeTerminal'

type FileList = { name: string; content: string }[]
type Debugger = ReturnType<typeof useDebugger>

interface Props {
  snippet: Snippet; viewSnippet: Snippet; files: FileList
  langBgClass: string; activeFile: string
  activeTab: ActiveTab; openFiles: string[]; localCode: string | null
  canPreview: boolean; showPreview: boolean; wordWrap: 'on' | 'off'
  renaming: string | null; renameValue: string; addingFile: boolean
  newFileName: string; menuFile: string | null
  newFileInputRef: RefObject<HTMLInputElement | null>
  terminal: UseCodeTerminalReturn; debugger: Debugger
  onDebugStart: () => void; onOpenInTab: (name: string) => void
  onSetRenameValue: (v: string) => void
  onCommitRename: () => void; onCancelRename: () => void
  onNewFile: () => void
  onMenuToggle: (name: string, rect: DOMRect) => void
  onNewFileNameChange: (v: string) => void
  onCommitNewFile: () => void; onCancelNewFile: () => void
  onFileTabClick: (f: string) => void; onCloseTab: (name: string) => void
  onTerminalClick: () => void; onDebugClick: () => void
  onCodeChange: (v: string) => void
}

export function SnippetWorkArea({
  snippet, viewSnippet, files, langBgClass,
  activeFile, activeTab, openFiles, canPreview, showPreview,
  wordWrap, renaming, renameValue, addingFile, newFileName,
  menuFile, newFileInputRef, terminal, debugger: dbg, onDebugStart,
  onOpenInTab, onSetRenameValue, onCommitRename, onCancelRename,
  onNewFile, onMenuToggle, onNewFileNameChange, onCommitNewFile,
  onCancelNewFile, onFileTabClick, onCloseTab,
  onTerminalClick, onDebugClick, onCodeChange,
}: Props) {
  return (
    <div className={styles.workArea}>
      <SnippetFileTreeArea
        files={files} activeFile={activeFile} langBgClass={langBgClass}
        renaming={renaming} renameValue={renameValue}
        addingFile={addingFile} newFileName={newFileName}
        menuFile={menuFile} snippetTitle={snippet.title}
        newFileInputRef={newFileInputRef}
        onOpenInTab={onOpenInTab}
        onSetRenameValue={onSetRenameValue}
        onCommitRename={onCommitRename}
        onCancelRename={onCancelRename}
        onNewFile={onNewFile}
        onMenuToggle={onMenuToggle}
        onNewFileNameChange={onNewFileNameChange}
        onCommitNewFile={onCommitNewFile}
        onCancelNewFile={onCancelNewFile}
      />
      <SnippetEditorArea
        snippet={snippet} viewSnippet={viewSnippet}
        files={files} activeFile={activeFile} activeTab={activeTab}
        openFiles={openFiles} canPreview={canPreview}
        showPreview={showPreview} wordWrap={wordWrap} terminal={terminal}
        debugger={dbg} onDebugStart={onDebugStart}
        onFileTabClick={onFileTabClick} onCloseTab={onCloseTab}
        onTerminalClick={onTerminalClick} onDebugClick={onDebugClick}
        onCodeChange={onCodeChange}
      />
    </div>
  )
}
