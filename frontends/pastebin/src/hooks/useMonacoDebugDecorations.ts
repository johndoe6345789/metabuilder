import { useEffect, useRef } from 'react'
import type { Monaco } from '@monaco-editor/react'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import type { InlineValue } from
  '@/components/features/snippet-editor/monaco-editor.types'

interface Args {
  breakpoints?: number[]
  currentDebugLine?: number | null
  inlineValues?: InlineValue[]
  onToggleBreakpoint?: (line: number) => void
}

type Editor = MonacoEditorNS.IStandaloneCodeEditor
type Collection = MonacoEditorNS.IEditorDecorationsCollection

/**
 * Debugger decorations for a Monaco editor: breakpoint glyphs, the current
 * execution line (highlight + arrow + bright line number), and inline variable
 * values — plus the glyph-margin/line-number click that toggles breakpoints.
 * Returns `onEditorMount` to wire to @monaco-editor/react's `onMount`.
 *
 * @monaco-editor/react only fires onMount once, so the click handler reads the
 * latest props through refs to avoid stale closures.
 */
export function useMonacoDebugDecorations({
  breakpoints,
  currentDebugLine,
  inlineValues,
  onToggleBreakpoint,
}: Args) {
  const editorRef = useRef<Editor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const bpCollection = useRef<Collection | null>(null)
  const currCollection = useRef<Collection | null>(null)
  const inlineCollection = useRef<Collection | null>(null)

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
    editor: Editor,
    monaco: Monaco,
    bps: number[],
    curLine: number | null | undefined,
    inline: InlineValue[] | undefined,
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
                lineNumberClassName: 'dbg-current-line-num',
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

  // Re-render decorations when they change; scroll the stopped line into view.
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

  const onEditorMount = (editor: Editor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

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
      if (
        (type === GUTTER_GLYPH_MARGIN || type === GUTTER_LINE_NUMBERS) &&
        position
      ) {
        onToggleRef.current(position.lineNumber)
      }
    })
  }

  return { onEditorMount }
}
