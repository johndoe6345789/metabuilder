import type { Monaco } from '@monaco-editor/react'
import type { editor as MonacoEditorNS } from 'monaco-editor'

/**
 * Toggle a breakpoint when the glyph margin or line-number gutter is clicked.
 * `getToggle` is read lazily on each click so the latest callback is used —
 * @monaco-editor/react only fires onMount once, so a captured prop would stale.
 */
export function attachBreakpointToggle(
  editor: MonacoEditorNS.IStandaloneCodeEditor,
  monaco: Monaco,
  getToggle: () => ((line: number) => void) | undefined,
) {
  editor.onMouseDown(e => {
    const toggle = getToggle()
    if (!toggle) return
    const { type, position } = e.target
    const { GUTTER_GLYPH_MARGIN, GUTTER_LINE_NUMBERS } =
      monaco.editor.MouseTargetType
    if (
      (type === GUTTER_GLYPH_MARGIN || type === GUTTER_LINE_NUMBERS) &&
      position
    ) {
      toggle(position.lineNumber)
    }
  })
}
