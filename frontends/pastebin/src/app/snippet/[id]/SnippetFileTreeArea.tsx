'use client'

import { RefObject } from 'react'
import { SnippetFileTree } from './SnippetFileTree'

type FileList = { name: string; content: string }[]

interface Props {
  files: FileList
  activeFile: string
  langBgClass: string
  renaming: string | null
  renameValue: string
  addingFile: boolean
  newFileName: string
  menuFile: string | null
  snippetTitle: string
  newFileInputRef: RefObject<HTMLInputElement | null>
  onOpenInTab: (name: string) => void
  onSetRenameValue: (v: string) => void
  onCommitRename: () => void
  onCancelRename: () => void
  onNewFile: () => void
  onMenuToggle: (name: string, rect: DOMRect) => void
  onNewFileNameChange: (v: string) => void
  onCommitNewFile: () => void
  onCancelNewFile: () => void
}

export function SnippetFileTreeArea({
  files, activeFile, langBgClass, renaming, renameValue,
  addingFile, newFileName, menuFile, snippetTitle, newFileInputRef,
  onOpenInTab, onSetRenameValue, onCommitRename, onCancelRename,
  onNewFile, onMenuToggle, onNewFileNameChange,
  onCommitNewFile, onCancelNewFile,
}: Props) {
  return (
    <SnippetFileTree
      files={files} activeFile={activeFile} langBgClass={langBgClass}
      renaming={renaming} renameValue={renameValue}
      addingFile={addingFile} newFileName={newFileName}
      menuFile={menuFile} snippetTitle={snippetTitle}
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
  )
}
