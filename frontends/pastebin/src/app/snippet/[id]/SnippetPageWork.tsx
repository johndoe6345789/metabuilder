'use client'

import { Snippet, Namespace } from '@/lib/types'
import { SnippetWorkArea } from './SnippetWorkArea'
import { SnippetStatusBar } from './SnippetStatusBar'
import type { useSnippetViewPage } from './hooks/useSnippetViewPage'
import type { useDebugger } from '@/hooks/useDebugger'
import type { UseCodeTerminalReturn } from '@/hooks/useCodeTerminal'

type VM = ReturnType<typeof useSnippetViewPage>
type Debugger = ReturnType<typeof useDebugger>
type FileList = { name: string; content: string }[]

interface Props {
  vm: VM
  snippet: Snippet
  files: FileList
  filename: string
  viewSnippet: Snippet
  canPreview: boolean
  lineCount: number
  namespace: Namespace | undefined
  langBgClass: string
  dbg: Debugger
  terminal: UseCodeTerminalReturn
  onCommitNewFile: () => void
  onDebugStart: () => void
}

export function SnippetPageWork({
  vm,
  snippet,
  files,
  filename,
  viewSnippet,
  canPreview,
  lineCount,
  namespace,
  langBgClass,
  dbg,
  terminal,
  onCommitNewFile,
  onDebugStart,
}: Props) {
  const {
    showPreview,
    wordWrap,
    activeFile,
    activeTab,
    openFiles,
    menuFile,
    renaming,
    renameValue,
    addingFile,
    newFileName,
    newFileInputRef,
    saving,
  } = vm
  return (
    <>
      <SnippetWorkArea
        snippet={snippet}
        viewSnippet={viewSnippet}
        files={files}
        langBgClass={langBgClass}
        activeFile={activeFile}
        activeTab={activeTab}
        openFiles={openFiles}
        canPreview={canPreview}
        showPreview={showPreview}
        wordWrap={wordWrap}
        localCode={null}
        renaming={renaming}
        renameValue={renameValue}
        addingFile={addingFile}
        newFileName={newFileName}
        menuFile={menuFile}
        newFileInputRef={newFileInputRef}
        terminal={terminal}
        debugger={dbg}
        onDebugStart={onDebugStart}
        onOpenInTab={vm.openInTab}
        onSetRenameValue={vm.setRenameValue}
        onCommitRename={() =>
          vm.commitRename(files, activeFile, (_, n) => vm.setActiveFile(n))
        }
        onCancelRename={() => vm.setRenaming(null)}
        onNewFile={vm.handleNewFile}
        onMenuToggle={(name, rect) => {
          if (menuFile === name) {
            vm.setMenuFile(null)
            return
          }
          vm.setMenuFile(name)
          vm.setMenuRect(rect)
        }}
        onNewFileNameChange={vm.setNewFileName}
        onCommitNewFile={onCommitNewFile}
        onCancelNewFile={() => vm.setAddingFile(false)}
        onFileTabClick={f => {
          vm.setActiveFile(f)
          vm.setActiveTab('code')
        }}
        onCloseTab={vm.closeTab}
        onTerminalClick={() => vm.setActiveTab('terminal')}
        onDebugClick={() => vm.setActiveTab('debug')}
        onCodeChange={vm.handleCodeChange}
      />
      <SnippetStatusBar
        language={snippet.language}
        activeFile={activeFile}
        filename={filename}
        lineCount={lineCount}
        namespace={namespace}
        isRunning={terminal.isRunning}
        saving={saving}
        updatedAt={snippet.updatedAt}
      />
    </>
  )
}
