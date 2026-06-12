'use client'

import { Snippet } from '@/lib/types'
import { SnippetEditorTabBar } from './SnippetEditorTabBar'
import { SnippetEditorPanels } from './SnippetEditorPanels'
import styles from './snippet-view-page.module.scss'
import type { ActiveTab } from './hooks/useSnippetViewPage'
import type { useDebugger } from '@/hooks/useDebugger'
import type { UseCodeTerminalReturn } from '@/hooks/useCodeTerminal'

type FileList = { name: string; content: string }[]
type Debugger = ReturnType<typeof useDebugger>

interface Props {
  snippet: Snippet
  viewSnippet: Snippet
  files: FileList
  activeFile: string
  activeTab: ActiveTab
  openFiles: string[]
  canPreview: boolean
  showPreview: boolean
  wordWrap: 'on' | 'off'
  debugger: Debugger
  onDebugStart: () => void
  terminal: UseCodeTerminalReturn
  onFileTabClick: (f: string) => void
  onCloseTab: (name: string) => void
  onTerminalClick: () => void
  onDebugClick: () => void
  onCodeChange: (v: string) => void
}

export function SnippetEditorArea({
  snippet,
  viewSnippet,
  files,
  activeFile,
  activeTab,
  openFiles,
  canPreview,
  showPreview,
  wordWrap,
  debugger: dbg,
  onDebugStart,
  terminal,
  onFileTabClick,
  onCloseTab,
  onTerminalClick,
  onDebugClick,
  onCodeChange,
}: Props) {
  return (
    <div className={styles.editorColumn}>
      <SnippetEditorTabBar
        openFiles={openFiles}
        activeFile={activeFile}
        activeTab={activeTab}
        isRunning={terminal.isRunning}
        onFileTabClick={onFileTabClick}
        onCloseTab={onCloseTab}
        onTerminalClick={onTerminalClick}
        onDebugClick={onDebugClick}
      />
      <SnippetEditorPanels
        snippet={snippet}
        viewSnippet={viewSnippet}
        files={files}
        activeFile={activeFile}
        activeTab={activeTab}
        canPreview={canPreview}
        showPreview={showPreview}
        wordWrap={wordWrap}
        debugger={dbg}
        onDebugStart={onDebugStart}
        terminal={terminal}
        onCodeChange={onCodeChange}
      />
    </div>
  )
}
