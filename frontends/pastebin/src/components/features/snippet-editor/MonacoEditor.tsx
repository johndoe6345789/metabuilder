import { lazy, Suspense, useEffect, useRef, type CSSProperties } from 'react'
import { Skeleton } from '@metabuilder/components/fakemui'
import {
  configureMonacoTypeScript,
  getMonacoLanguage,
} from '@/lib/monaco-config'
import type { Monaco } from '@monaco-editor/react'
import type { editor as MonacoEditorNS } from 'monaco-editor'
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
  /** Inline variable values rendered greyed-in at the end of a line. */
  inlineValues?: { line: number; text: string }[]
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
  inlineValues,
}: MonacoEditorProps) {
  const monacoLanguage = getMonacoLanguage(language)
  const theme = useAppSelector(selectTheme)
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const bpCollection =
    useRef<MonacoEditorNS.IEditorDecorationsCollection | null>(null)
  const currCollection =
    useRef<MonacoEditorNS.IEditorDecorationsCollection | null>(null)
  const inlineCollection =
    useRef<MonacoEditorNS.IEditorDecorationsCollection | null>(null)

  // Refs give the stable onMouseDown handler access to the latest prop values
  // without stale closures — @monaco-editor/react only calls onMount once.
  const onToggleRef = useRef(onToggleBreakpoint)
  // eslint-disable-next-line react-hooks/refs
  onToggleRef.current = onToggleBreakpoint
  const breakpointsRef = useRef(breakpoints)
  // eslint-disable-next-line react-hooks/refs
  breakpointsRef.current = breakpoints
  const currentDebugLineRef = useRef(currentDebugLine)
  // eslint-disable-next-line react-hooks/refs
  currentDebugLineRef.current = currentDebugLine
  const inlineValuesRef = useRef(inlineValues)
  // eslint-disable-next-line react-hooks/refs
  inlineValuesRef.current = inlineValues

  function applyDecorations(
    editor: MonacoEditorNS.IStandaloneCodeEditor,
    monaco: Monaco,
    bps: number[],
    curLine: number | null | undefined,
    inline: { line: number; text: string }[] | undefined,
  ) {
    if (!bpCollection.current) {
      bpCollection.current = editor.createDecorationsCollection()
    }
    if (!currCollection.current) {
      currCollection.current = editor.createDecorationsCollection()
    }
    if (!inlineCollection.current) {
      inlineCollection.current = editor.createDecorationsCollection()
    }

    bpCollection.current.set(
      bps.map(line => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          glyphMarginClassName: 'dbg-breakpoint',
          glyphMarginHoverMessage: { value: 'Breakpoint' },
          overviewRuler: { color: '#e51400', position: 1 },
        },
      })),
    )

    currCollection.current.set(
      curLine
        ? [
            {
              range: new monaco.Range(curLine, 1, curLine, 1),
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

    // Inline variable values: greyed-in text injected at the end of the line,
    // PyCharm/VS-Code style. Anchored at the line's last column.
    const model = editor.getModel()
    inlineCollection.current.set(
      (inline ?? []).map(iv => {
        const col = model?.getLineMaxColumn(iv.line) ?? 1
        return {
          range: new monaco.Range(iv.line, col, iv.line, col),
          options: {
            after: {
              content: `    ${iv.text}`,
              inlineClassName: 'dbg-inline-value',
            },
          },
        }
      }),
    )
  }

  // Re-render breakpoint, current-line, and inline-value decorations whenever
  // they change; scroll the stopped line into view like a real debugger.
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return
    applyDecorations(
      editor,
      monaco,
      breakpoints ?? [],
      currentDebugLine,
      inlineValues,
    )
    if (currentDebugLine) {
      editor.revealLineInCenterIfOutsideViewport(currentDebugLine)
    }
  }, [breakpoints, currentDebugLine, inlineValues])

  const handleMount = (
    editor: MonacoEditorNS.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Apply any decorations that were set before the editor mounted
    applyDecorations(
      editor,
      monaco,
      breakpointsRef.current ?? [],
      currentDebugLineRef.current,
      inlineValuesRef.current,
    )
    if (currentDebugLineRef.current) {
      editor.revealLineInCenterIfOutsideViewport(currentDebugLineRef.current)
    }

    editor.onMouseDown(e => {
      if (!onToggleRef.current) return
      const { type, position } = e.target
      const { GUTTER_GLYPH_MARGIN, GUTTER_LINE_NUMBERS } =
        monaco.editor.MouseTargetType
      if ((type === GUTTER_GLYPH_MARGIN || type === GUTTER_LINE_NUMBERS) &&
          position) {
        onToggleRef.current(position.lineNumber)
      }
    })
  }

  const editorLabel =
    `Code editor (${readOnly ? 'read-only' : 'editable'}` +
    `, ${monacoLanguage} language)`

  return (
    <Suspense fallback={<EditorLoadingSkeleton height={height} />}>
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
