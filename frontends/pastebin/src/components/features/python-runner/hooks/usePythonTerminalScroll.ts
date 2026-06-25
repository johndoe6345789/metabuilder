import { useRef, useEffect } from 'react'

interface TerminalLine { type: string; content: string; id: string }

export function usePythonTerminalScroll(lines: TerminalLine[]) {
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = terminalEndRef.current
    if (el) {
      const container = el.closest('[data-testid="terminal-output-area"]')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [lines])

  return terminalEndRef
}
