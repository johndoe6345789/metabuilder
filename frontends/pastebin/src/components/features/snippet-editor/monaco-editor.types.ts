/** An inline variable value rendered greyed-in at the end of a code line. */
export interface InlineValue {
  line: number
  text: string
}

export interface MonacoEditorProps {
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
  inlineValues?: InlineValue[]
}
