'use client'

import dynamic from 'next/dynamic'
import { Snippet } from '@/lib/types'
import { useResizableDock } from '@/hooks/useResizableDock'
import { computeInlineValues } from './snippetInlineValues'
import { DebugDock } from './DebugDock'
import type { Debugger } from './snippetEditorPanels.types'
import styles from './snippet-view-page.module.scss'

const SnippetViewerContent = dynamic(
  () =>
    import('@/components/features/snippet-viewer/SnippetViewerContent').then(
      mod => ({ default: mod.SnippetViewerContent }),
    ),
  { ssr: false },
)

interface Props {
  snippet: Snippet
  viewSnippet: Snippet
  activeFile: string
  canPreview: boolean
  showPreview: boolean
  wordWrap: 'on' | 'off'
  debugger: Debugger
  onDebugStart: () => void
  onCodeChange: (v: string) => void
}

export function CodeTabPanel(p: Props) {
  const { snippet, viewSnippet, activeFile, debugger: dbg } = p
  const bps = dbg.state.breakpoints[activeFile] ?? []
  const curLine =
    dbg.state.currentFile === activeFile ? dbg.state.currentLine : null
  const inlineValues = computeInlineValues(dbg, activeFile, curLine)
  const {
    containerRef,
    height: dockHeight,
    dragging: dockDragging,
    onHandleMouseDown: onDockResize,
  } = useResizableDock()

  return (
    <div
      ref={containerRef}
      className={`${styles.editorSplit} ${
        dockDragging ? styles.editorSplitDragging : ''
      }`}
    >
      <div className={styles.editorSplitMain}>
        <SnippetViewerContent
          snippet={viewSnippet}
          canPreview={p.canPreview}
          showPreview={p.showPreview}
          isPython={snippet.language === 'Python'}
          wordWrap={p.wordWrap}
          onChange={p.onCodeChange}
          breakpoints={bps}
          currentDebugLine={curLine}
          inlineValues={inlineValues}
          onToggleBreakpoint={line => dbg.toggleBreakpoint(activeFile, line)}
        />
      </div>
      {dbg.isActive && (
        <DebugDock
          language={snippet.language}
          dbg={dbg}
          height={dockHeight}
          onResize={onDockResize}
          onStart={p.onDebugStart}
        />
      )}
    </div>
  )
}
