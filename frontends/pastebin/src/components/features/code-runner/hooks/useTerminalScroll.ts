import { useRef, useEffect } from 'react';
import { type TerminalLine } from '@/hooks/useCodeTerminal';

export function useTerminalScroll(lines: TerminalLine[]) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = terminalEndRef.current;
    if (el) {
      const container = el.closest(
        '[data-testid="terminal-output-area"]'
      );
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [lines]);

  return terminalEndRef;
}
