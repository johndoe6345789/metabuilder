'use client'

import { useRef, useEffect, type ReactNode, type FormEvent } from 'react'
import { TerminalHeader } from './TerminalHeader'
import { TerminalOutput, type TerminalLine } from './TerminalOutput'
import { TerminalInput } from './TerminalInput'

export interface TerminalProps {
  /** Terminal output lines */
  lines: TerminalLine[]
  /** Whether code is currently running */
  isRunning?: boolean
  /** Whether terminal is initializing */
  isInitializing?: boolean
  /** Whether terminal is waiting for input */
  waitingForInput?: boolean
  /** Current input value */
  inputValue?: string
  /** Called when input value changes */
  onInputChange?: (value: string) => void
  /** Called when input is submitted */
  onInputSubmit?: (e: FormEvent) => void
  /** Called when run button is clicked */
  onRun?: () => void
  /** Terminal title */
  title?: string
  /** Custom title icon */
  titleIcon?: ReactNode
  /** Run button label */
  runLabel?: string
  /** Empty state message */
  emptyMessage?: string
  /** Input placeholder */
  inputPlaceholder?: string
  /** Custom run icon */
  runIcon?: ReactNode
  /** Custom className */
  className?: string
  /** Auto-scroll to bottom on new output */
  autoScroll?: boolean
  /** Hide the header */
  hideHeader?: boolean
  /** Additional header actions */
  headerActions?: ReactNode
  /** Test ID for the component */
  testId?: string
}

/**
 * Complete terminal component with header, output, and input.
 *
 * @example
 * ```tsx
 * <Terminal
 *   lines={lines}
 *   isRunning={isRunning}
 *   waitingForInput={waitingForInput}
 *   inputValue={inputValue}
 *   onInputChange={setInputValue}
 *   onInputSubmit={handleSubmit}
 *   onRun={handleRun}
 *   title="Python Terminal"
 * />
 * ```
 */
export function Terminal({
  lines,
  isRunning = false,
  isInitializing = false,
  waitingForInput = false,
  inputValue = '',
  onInputChange,
  onInputSubmit,
  onRun,
  title = 'Terminal',
  titleIcon,
  runLabel = 'Run',
  emptyMessage = 'Click "Run" to execute code',
  inputPlaceholder = 'Enter input...',
  runIcon,
  className = '',
  autoScroll = true,
  hideHeader = false,
  headerActions,
  testId,
}: TerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lines, autoScroll])

  const hasErrors = lines.some((line) => line.type === 'error')

  return (
    <div className={`flex flex-col h-full bg-card ${className}`} data-testid={testId ?? "terminal"} role="region" aria-label="Terminal">
      {!hideHeader && onRun && (
        <TerminalHeader
          onRun={onRun}
          isRunning={isRunning}
          isInitializing={isInitializing}
          waitingForInput={waitingForInput}
          title={title}
          titleIcon={titleIcon}
          runLabel={runLabel}
          runIcon={runIcon}
          actions={headerActions}
        />
      )}

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
        <TerminalOutput
          lines={lines}
          isRunning={isRunning}
          emptyMessage={emptyMessage}
        />
        {onInputChange && onInputSubmit && (
          <TerminalInput
            waitingForInput={waitingForInput}
            inputValue={inputValue}
            onInputChange={onInputChange}
            onSubmit={onInputSubmit}
            placeholder={inputPlaceholder}
          />
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  )
}

// Re-export types and sub-components
export type { TerminalLine } from './TerminalOutput'
export { TerminalHeader } from './TerminalHeader'
export { TerminalOutput } from './TerminalOutput'
export { TerminalInput } from './TerminalInput'
