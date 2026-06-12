'use client'

import dynamic from 'next/dynamic'
import { Snippet } from '@/lib/types'
import { DebugTabPanel } from './DebugTabPanel'
import styles from './snippet-view-page.module.scss'
import type { ActiveTab } from './hooks/useSnippetViewPage'
import type { useDebugger } from '@/hooks/useDebugger'
import type { UseCodeTerminalReturn } from '@/hooks/useCodeTerminal'

const SnippetViewerContent = dynamic(
  () =>
    import('@/components/features/snippet-viewer/SnippetViewerContent').then(
      mod => ({ default: mod.SnippetViewerContent }),
    ),
  { ssr: false },
)
const CodeTerminal = dynamic(
  () =>
    import('@/components/features/code-runner/CodeTerminal').then(mod => ({
      default: mod.CodeTerminal,
    })),
  { ssr: false },
)

type FileList = { name: string; content: string }[]
type Debugger = ReturnType<typeof useDebugger>

interface Props {
  snippet: Snippet
  viewSnippet: Snippet
  files: FileList
  activeFile: string
  activeTab: ActiveTab
  canPreview: boolean
  showPreview: boolean
  wordWrap: 'on' | 'off'
  debugger: Debugger
  onDebugStart: () => void
  terminal: UseCodeTerminalReturn
  onCodeChange: (v: string) => void
}

export function SnippetEditorPanels({
  snippet,
  viewSnippet,
  files,
  activeFile,
  activeTab,
  canPreview,
  showPreview,
  wordWrap,
  debugger: dbg,
  onDebugStart,
  terminal,
  onCodeChange,
}: Props) {
  const vis = (tab: ActiveTab) => activeTab === tab
  const bps = dbg.state.breakpoints[activeFile] ?? []
  const curLine =
    dbg.state.currentFile === activeFile ? dbg.state.currentLine : null
  const panelCls = (tab: ActiveTab) =>
    `${styles.editorPanel} ${
      vis(tab) ? styles.editorPanelVisible : styles.editorPanelHidden
    }`

  return (
    <>
      <div className={panelCls('code')} role="tabpanel">
        <SnippetViewerContent
          snippet={viewSnippet}
          canPreview={canPreview}
          showPreview={showPreview}
          isPython={snippet.language === 'Python'}
          wordWrap={wordWrap}
          onChange={onCodeChange}
          breakpoints={bps}
          currentDebugLine={curLine}
          onToggleBreakpoint={line => dbg.toggleBreakpoint(activeFile, line)}
        />
      </div>
      <div className={panelCls('terminal')} role="tabpanel">
        <CodeTerminal
          language={snippet.language}
          files={files}
          entryPoint={snippet.entryPoint ?? activeFile}
          controller={terminal}
        />
      </div>
      <DebugTabPanel
        visible={vis('debug')}
        language={snippet.language}
        debugger={dbg}
        onStart={onDebugStart}
      />
    </>
  )
}
