import { type TerminalLine } from '@/hooks/useCodeTerminal'

type DebugOutput = { category: string; text: string }[]

/**
 * Map debugger DAP output events to terminal lines so a live debug session's
 * stdout/stderr shows on the Terminal tab. stderr renders as an error row.
 */
export function debugTerminalLines(output: DebugOutput): TerminalLine[] {
  return output.map((o, i) => ({
    type: o.category === 'stderr' ? 'error' : 'output',
    content: o.text,
    id: `dbg-${i}`,
  }))
}
