import type { Monaco } from '@monaco-editor/react'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import type { InlineValue } from './monaco-editor.types'

type Editor = MonacoEditorNS.IStandaloneCodeEditor
type Decoration = MonacoEditorNS.IModelDeltaDecoration
type Collection = MonacoEditorNS.IEditorDecorationsCollection

/** Lazily-created decoration collections for one editor. */
export interface DecorationCollections {
  bp: Collection | null
  current: Collection | null
  inline: Collection | null
}

export function emptyCollections(): DecorationCollections {
  return { bp: null, current: null, inline: null }
}

export interface DecorationData {
  breakpoints: number[]
  currentLine: number | null | undefined
  inlineValues: InlineValue[] | undefined
}

/** Create collections on first use, then (re)set all debugger decorations. */
export function applyDebugDecorations(
  editor: Editor,
  monaco: Monaco,
  cols: DecorationCollections,
  data: DecorationData,
) {
  if (!cols.bp) cols.bp = editor.createDecorationsCollection()
  if (!cols.current) cols.current = editor.createDecorationsCollection()
  if (!cols.inline) cols.inline = editor.createDecorationsCollection()

  cols.bp.set(breakpointDecorations(monaco, data.breakpoints))
  cols.current.set(currentLineDecorations(monaco, data.currentLine))
  cols.inline.set(inlineValueDecorations(monaco, editor, data.inlineValues))
}

/** Red dot in the glyph margin for each breakpoint line. */
export function breakpointDecorations(
  monaco: Monaco,
  lines: number[],
): Decoration[] {
  return lines.map(line => ({
    range: new monaco.Range(line, 1, line, 1),
    options: {
      isWholeLine: true,
      glyphMarginClassName: 'dbg-breakpoint',
      glyphMarginHoverMessage: { value: 'Breakpoint' },
      overviewRuler: { color: '#e51400', position: 1 },
    },
  }))
}

/** Highlight + arrow + bright line number for the current execution line. */
export function currentLineDecorations(
  monaco: Monaco,
  line: number | null | undefined,
): Decoration[] {
  if (!line) return []
  return [
    {
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'dbg-current-line',
        glyphMarginClassName: 'dbg-current-arrow',
        lineNumberClassName: 'dbg-current-line-num',
        overviewRuler: { color: '#ffcc00', position: 1 },
      },
    },
  ]
}

/** Greyed-in variable values injected at the end of their line. */
export function inlineValueDecorations(
  monaco: Monaco,
  editor: Editor,
  inline: InlineValue[] | undefined,
): Decoration[] {
  const model = editor.getModel()
  return (inline ?? []).map(iv => {
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
  })
}
