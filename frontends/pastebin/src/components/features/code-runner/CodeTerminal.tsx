'use client'

// eslint-disable-next-line max-len
import { TerminalOutput } from '@/components/features/python-runner/TerminalOutput'
// eslint-disable-next-line max-len
import { TerminalInput } from '@/components/features/python-runner/TerminalInput'
import { type SnippetFile } from '@/lib/types'
import { type UseCodeTerminalReturn } from '@/hooks/useCodeTerminal'
import { isInteractiveRunner } from './runnerKey'
import { useTerminalScroll } from './hooks/useTerminalScroll'
import { debugTerminalLines } from './debugTerminalLines'
import { TerminalStatus } from './TerminalStatus'
import styles from './CodeTerminal.module.scss'

interface CodeTerminalProps {
  language: string
  files: SnippetFile[]
  entryPoint?: string
  controller: UseCodeTerminalReturn
  debugOutput?: { category: string; text: string }[]
  debugActive?: boolean
}

export function CodeTerminal({
  language,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  files,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  entryPoint,
  controller,
  debugOutput,
  debugActive,
}: CodeTerminalProps) {
  const {
    lines: runLines,
    isRunning,
    inputValue,
    waitingForInput,
    setInputValue,
    handleInputSubmit,
  } = controller

  // While a debug session is live the Terminal tab mirrors the debuggee's
  // stdout/stderr so output is visible while stepping; otherwise it shows the
  // normal "Run" output.
  const lines = debugActive ? debugTerminalLines(debugOutput ?? []) : runLines
  const terminalEndRef = useTerminalScroll(lines)
  const hasErrors = lines.some(line => line.type === 'error')
  const supportsInteractive = isInteractiveRunner(language)

  return (
    <div className={styles.terminal} data-testid="code-terminal">
      <TerminalStatus
        isRunning={isRunning}
        waitingForInput={waitingForInput && supportsInteractive}
        lineCount={lines.length}
        hasErrors={hasErrors}
      />
      <div
        className={styles.output}
        data-testid="terminal-output-area"
        role="region"
        aria-label="Terminal output"
        aria-live="polite"
        aria-atomic="false"
      >
        <TerminalOutput lines={lines} isRunning={isRunning} />
        {supportsInteractive && (
          <TerminalInput
            waitingForInput={waitingForInput}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={handleInputSubmit}
          />
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  )
}
