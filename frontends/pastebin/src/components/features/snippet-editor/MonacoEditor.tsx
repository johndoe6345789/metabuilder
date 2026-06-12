import { lazy, Suspense, useEffect, useRef, type CSSProperties } from 'react'
import { Skeleton } from '@metabuilder/components/fakemui'
import {
  configureMonacoTypeScript,
  getMonacoLanguage,
} from '@/lib/monaco-config'
import type { Monaco } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { useAppSelector } from '@/store/hooks'
import { selectTheme } from '@/store/selectors'

const Editor = lazy(() => import('@monaco-editor/react'))

const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
}

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  readOnly?: boolean
  wordWrap?: 'on' | 'off'
  /** 1-indexed line numbers with active breakpoints for the current file. */
  breakpoints?: number[]
  /** Called when the user clicks the glyph margin to toggle a breakpoint. */
  onToggleBreakpoint?: (line: number) => void
  /** 1-indexed line to highlight as the current debug execution point. */
  currentDebugLine?: number | null
}

function EditorLoadingSkeleton({ height = '400px' }: { height?: string }) {
  return (
    <div
      style={{ height, display: 'flex', flexDirection: 'column', gap: 8 }}
      data-testid="monaco-editor-skeleton"
      role="status"
      aria-busy="true"
    >
      <Skeleton style={{ flex: 1, width: '100%', borderRadius: 6 }} />
    </div>
  )
}

function handleEditorBeforeMount(monaco: Monaco) {
  configureMonacoTypeScript(monaco)
}

export function MonacoEditor({
  value,
  onChange,
  language,
  height = '400px',
  readOnly = false,
  wordWrap = 'on',
  breakpoints,
  onToggleBreakpoint,
  currentDebugLine,
}: MonacoEditorProps) {
  const monacoLanguage = getMonacoLanguage(language)
  const theme = useAppSelector(selectTheme)
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const bpDeclIds = useRef<string[]>([])
  const currDeclId = useRef<string[]>([])

  // Re-render breakpoint and current-line decorations whenever they change
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    bpDeclIds.current = editor.deltaDecorations(
      bpDeclIds.current,
      (breakpoints ?? []).map(line => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          glyphMarginClassName: 'dbg-breakpoint',
          glyphMarginHoverMessage: { value: 'Breakpoint' },
          overviewRuler: { color: '#e51400', position: 1 },
        },
      })),
    )

    currDeclId.current = editor.deltaDecorations(
      currDeclId.current,
      currentDebugLine
        ? [
            {
              range: new monaco.Range(currentDebugLine, 1, currentDebugLine, 1),
              options: {
                isWholeLine: true,
                className: 'dbg-current-line',
                glyphMarginClassName: 'dbg-current-arrow',
                overviewRuler: { color: '#ffcc00', position: 1 },
              },
            },
          ]
        : [],
    )
  }, [breakpoints, currentDebugLine])

  const handleMount = (
    editor: MonacoEditor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor
    monacoRef.current = monaco

    editor.onMouseDown(e => {
      if (!onToggleBreakpoint) return
      const { type, position } = e.target
      // GUTTER_GLYPH_MARGIN = 2, GUTTER_LINE_NUMBERS = 3
      if ((type === 2 || type === 3) && position) {
        onToggleBreakpoint(position.lineNumber)
      }
    })
  }

  const editorLabel =
    `Code editor (${readOnly ? 'read-only' : 'editable'}` +
    `, ${monacoLanguage} language)`

  return (
    <Suspense fallback={<EditorLoadingSkeleton height={height} />}>
      <style>{`
        .dbg-breakpoint       { background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='6' fill='%23e51400'/></svg>") center/12px no-repeat; }
        .dbg-current-arrow    { background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><polygon points='2,4 12,8 2,12' fill='%23ffcc00'/></svg>") center/12px no-repeat; }
        .dbg-current-line     { background: rgba(255,204,0,0.12) !important; }
      `}</style>
      <div
        data-testid="monaco-editor-container"
        style={{ height }}
        role="region"
        aria-label={editorLabel}
      >
        <div
          style={srOnly}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="monaco-editor-status"
        >
          {`Code editor loaded with ${monacoLanguage} syntax highlighting. `}
          {readOnly ? 'Read-only mode' : 'Editable mode'}.
        </div>
        <Editor
          height={height}
          language={monacoLanguage}
          value={value}
          onChange={newValue => onChange(newValue || '')}
          theme={monacoTheme}
          beforeMount={handleEditorBeforeMount}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            glyphMargin: !!(
              onToggleBreakpoint ||
              breakpoints?.length ||
              currentDebugLine
            ),
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap,
            readOnly,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
            },
            padding: { top: 12, bottom: 12 },
            fontFamily: 'JetBrains Mono, monospace',
            fontLigatures: true,
          }}
        />
      </div>
    </Suspense>
  )
}
