import { useEffect, useRef } from 'react'
import type { Monaco } from '@monaco-editor/react'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import type { InlineValue } from
  '@/components/features/snippet-editor/monaco-editor.types'
import {
  applyDebugDecorations,
  emptyCollections,
} from '@/components/features/snippet-editor/monaco-decorations'
import { attachBreakpointToggle } from
  '@/components/features/snippet-editor/monaco-gutter-click'
import { useLatestRef } from './useLatestRef'

interface Args {
  breakpoints?: number[]
  currentDebugLine?: number | null
  inlineValues?: InlineValue[]
  onToggleBreakpoint?: (line: number) => void
}

type Editor = MonacoEditorNS.IStandaloneCodeEditor

/**
 * Debugger decorations for a Monaco editor: breakpoint glyphs, the current
 * execution line (highlight + arrow + bright line number), and inline variable
 * values — plus the glyph-margin/line-number click that toggles breakpoints.
 * Returns `onEditorMount` to wire to @monaco-editor/react's `onMount`.
 *
 * @monaco-editor/react only fires onMount once, so the click handler and the
 * mount-time decoration pass read the latest props through refs.
 */
export function useMonacoDebugDecorations({
  breakpoints,
  currentDebugLine,
  inlineValues,
  onToggleBreakpoint,
}: Args) {
  const editorRef = useRef<Editor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const colsRef = useRef(emptyCollections())

  const onToggleRef = useLatestRef(onToggleBreakpoint)
  const breakpointsRef = useLatestRef(breakpoints)
  const currentDebugLineRef = useLatestRef(currentDebugLine)
  const inlineValuesRef = useLatestRef(inlineValues)

  function reveal(line: number | null | undefined) {
    if (line) editorRef.current?.revealLineInCenterIfOutsideViewport(line)
  }

  // Re-render decorations when they change; scroll the stopped line into view.
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return
    applyDebugDecorations(editor, monaco, colsRef.current, {
      breakpoints: breakpoints ?? [],
      currentLine: currentDebugLine,
      inlineValues,
    })
    reveal(currentDebugLine)
  }, [breakpoints, currentDebugLine, inlineValues])

  const onEditorMount = (editor: Editor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    applyDebugDecorations(editor, monaco, colsRef.current, {
      breakpoints: breakpointsRef.current ?? [],
      currentLine: currentDebugLineRef.current,
      inlineValues: inlineValuesRef.current,
    })
    reveal(currentDebugLineRef.current)

    attachBreakpointToggle(editor, monaco, () => onToggleRef.current)
  }

  return { onEditorMount }
}
