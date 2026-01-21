'use client'

import { useRef, useEffect } from 'react'
import { usePythonTerminal } from '@/hooks/usePythonTerminal'
import { TerminalHeader } from '@/components/features/python-runner/TerminalHeader'
import { TerminalOutput } from '@/components/features/python-runner/TerminalOutput'
import { TerminalInput } from '@/components/features/python-runner/TerminalInput'

interface PythonTerminalProps {
  code: string
}

export function PythonTerminal({ code }: PythonTerminalProps) {
  const {
    lines,
    isRunning,
    isInitializing,
    inputValue,
    waitingForInput,
    setInputValue,
    handleInputSubmit,
    handleRun,
  } = usePythonTerminal()

  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  // Determine if there are any errors in the output
  const hasErrors = lines.some((line) => line.type === 'error')

  return (
    <div className="flex flex-col h-full bg-card" data-testid="python-terminal">
      <TerminalHeader
        onRun={() => handleRun(code)}
        isRunning={isRunning}
        isInitializing={isInitializing}
        waitingForInput={waitingForInput}
      />

      {/* Aria-live region for terminal status */}
      <div
        className="sr-only"
        role="status"
        aria-live={hasErrors ? 'assertive' : 'polite'}
        aria-atomic="true"
        data-testid="terminal-status"
      >
        {isRunning && 'Code is running'}
        {isInitializing && 'Terminal is initializing'}
        {waitingForInput && 'Waiting for user input'}
        {!isRunning && !isInitializing && lines.length > 0 && `${lines.length} lines of output`}
        {hasErrors && 'Errors detected in output'}
      </div>

      <div
        className="flex-1 overflow-auto p-4 font-mono text-sm bg-background/50"
        data-testid="terminal-output-area"
        role="region"
        aria-label="Terminal output"
        aria-live="polite"
        aria-atomic="false"
      >
        <TerminalOutput lines={lines} isRunning={isRunning} />
        <TerminalInput
          waitingForInput={waitingForInput}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={handleInputSubmit}
        />
        <div ref={terminalEndRef} />
      </div>
    </div>
  )
}
