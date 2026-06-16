import type { Debugger, InlineValue } from './snippetEditorPanels.types'

/**
 * Build the PyCharm-style inline value annotation for the stopped line: the
 * locals of the top frame rendered as `a=1, b='x'` after the current line.
 * Returns [] unless paused on a line of the active file.
 */
export function computeInlineValues(
  dbg: Debugger,
  activeFile: string,
  curLine: number | null,
): InlineValue[] {
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
