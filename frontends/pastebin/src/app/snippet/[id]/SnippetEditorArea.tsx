'use client'
import dynamic from 'next/dynamic'
import { Snippet } from '@/lib/types'
import { SnippetEditorTabBar } from './SnippetEditorTabBar'
import { DebugPanel } from './DebugPanel'
import styles from './snippet-view-page.module.scss'
import type { ActiveTab } from './hooks/useSnippetViewPage'

const SnippetViewerContent = dynamic(
  () => import(
    '@/components/features/snippet-viewer/SnippetViewerContent'
  ).then(mod => ({ default: mod.SnippetViewerContent })),
  { ssr: false },
)

const CodeTerminal = dynamic(
  () => import(
    '@/components/features/code-runner/CodeTerminal'
  ).then(mod => ({ default: mod.CodeTerminal })),
  { ssr: false },
)

type FileList = { name: string; content: string }[]

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
  terminal: {
    isRunning: boolean
    handleStop: () => void
    lastRunInfo: unknown
  }
  onFileTabClick: (f: string) => void
  onCloseTab: (name: string) => void
  onTerminalClick: () => void
  onDebugClick: () => void
  onCodeChange: (v: string) => void
}

export function SnippetEditorArea({
  snippet, viewSnippet, files, activeFile, activeTab, openFiles,
  canPreview, showPreview, wordWrap, terminal,
  onFileTabClick, onCloseTab, onTerminalClick, onDebugClick, onCodeChange,
}: Props) {
  const vis = (tab: ActiveTab) =>
    activeTab === tab ? styles.editorPanelVisible : styles.editorPanelHidden

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

      <div className={`${styles.editorPanel} ${vis('code')}`} role="tabpanel">
        <SnippetViewerContent
          snippet={viewSnippet}
          canPreview={canPreview}
          showPreview={showPreview}
          isPython={snippet.language === 'Python'}
          wordWrap={wordWrap}
          onChange={onCodeChange}
        />
      </div>

      <div className={`${styles.editorPanel} ${vis('terminal')}`} role="tabpanel">
        <CodeTerminal
          language={snippet.language} files={files}
          entryPoint={snippet.entryPoint ?? activeFile} controller={terminal}
        />
      </div>
      <div className={`${styles.editorPanel} ${styles.debugPanel} ${vis('debug')}`} role="tabpanel">
        <div className={styles.debugContent}>
          <DebugPanel lastRunInfo={terminal.lastRunInfo} />
        </div>
      </div>
    </div>
  )
}
