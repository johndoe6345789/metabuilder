'use client'

import dynamic from 'next/dynamic'
import { Snippet } from '@/lib/types'
import { DebugPanel } from './DebugPanel'
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
  const bps = dbg.state.breakpoints[activeFile] ?? []
  const curLine =
    dbg.state.currentFile === activeFile ? dbg.state.currentLine : null
  const inlineValues = computeInlineValues(dbg, activeFile, curLine)

  // Dock the debug panel beneath the code (IDE-style) whenever a session is
  // live or the Debug tab is selected, so the code — with its breakpoints and
  // current-line highlight — stays visible while you inspect debugger state.
  const docked = dbg.isActive || activeTab === 'debug'
  // The code area shows for both the 'code' and 'debug' tabs; only the
  // terminal takes over the full editor area.
  const codeVisible = activeTab !== 'terminal'

  return (
    <>
      <div
        className={`${styles.editorPanel} ${
          codeVisible ? styles.editorPanelVisible : styles.editorPanelHidden
        }`}
        role="tabpanel"
      >
        <div className={styles.editorSplit}>
          <div className={styles.editorSplitMain}>
            <SnippetViewerContent
              snippet={viewSnippet}
              canPreview={canPreview}
              showPreview={showPreview}
              isPython={snippet.language === 'Python'}
              wordWrap={wordWrap}
              onChange={onCodeChange}
              breakpoints={bps}
              currentDebugLine={curLine}
              inlineValues={inlineValues}
              onToggleBreakpoint={line =>
                dbg.toggleBreakpoint(activeFile, line)
              }
            />
          </div>
          {docked && (
            <div className={styles.debugDock}>
              <DebugPanel
                language={snippet.language}
                debugger={dbg}
                onStart={onDebugStart}
              />
            </div>
          )}
        </div>
      </div>
      <div
        className={`${styles.editorPanel} ${
          activeTab === 'terminal'
            ? styles.editorPanelVisible
            : styles.editorPanelHidden
        }`}
        role="tabpanel"
      >
        <CodeTerminal
          language={snippet.language}
          files={files}
          entryPoint={snippet.entryPoint ?? activeFile}
          controller={terminal}
        />
      </div>
    </>
  )
}

/**
 * Build the PyCharm-style inline value annotation for the stopped line: the
 * locals of the top frame rendered as `a=1, b='x'` after the current line.
 * Returns [] unless paused on a line of the active file.
 */
function computeInlineValues(
  dbg: Debugger,
  activeFile: string,
  curLine: number | null,
): { line: number; text: string }[] {
  if (curLine == null || dbg.state.currentFile !== activeFile) return []
  const { scopes, variables } = dbg.state
  const local = scopes.find(s => /local/i.test(s.name)) ?? scopes[0]
  if (!local) return []
  const vars = variables[local.variablesReference] ?? []
  if (!vars.length) return []
  const text = vars
    .slice(0, 6)
    .map(v => `${v.name} = ${truncate(v.value)}`)
    .join(',  ')
  return text ? [{ line: curLine, text }] : []
}

function truncate(s: string, max = 40): string {
  const flat = s.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}
