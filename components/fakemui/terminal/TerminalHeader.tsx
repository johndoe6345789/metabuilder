'use client'

import { type ReactNode } from 'react'
import { Button } from '../inputs/Button'
// Use inline spinner for loading states

export interface TerminalHeaderProps {
  /** Called when run button is clicked */
  onRun: () => void
  /** Whether code is currently running */
  isRunning?: boolean
  /** Whether terminal is initializing */
  isInitializing?: boolean
  /** Whether terminal is waiting for input */
  waitingForInput?: boolean
  /** Terminal title */
  title?: string
  /** Custom icon for the title */
  titleIcon?: ReactNode
  /** Custom run button label */
  runLabel?: string
  /** Custom running label */
  runningLabel?: string
  /** Custom initializing label */
  initializingLabel?: string
  /** Custom run icon */
  runIcon?: ReactNode
  /** Custom className */
  className?: string
  /** Additional actions to render */
  actions?: ReactNode
  /** Test ID for the component */
  testId?: string
}

/**
 * Terminal header with run button and status indicators.
 *
 * @example
 * ```tsx
 * <TerminalHeader
 *   onRun={handleRun}
 *   isRunning={isRunning}
 *   title="Python Terminal"
 *   runLabel="Run"
 *   runningLabel="Running..."
 * />
 * ```
 */
export function TerminalHeader({
  onRun,
  isRunning = false,
  isInitializing = false,
  waitingForInput = false,
  title = 'Terminal',
  titleIcon,
  runLabel = 'Run',
  runningLabel = 'Running...',
  initializingLabel = 'Loading...',
  runIcon,
  className = '',
  actions,
  testId,
}: TerminalHeaderProps) {
  const isDisabled = isRunning || isInitializing || waitingForInput

  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-border bg-muted/30 ${className}`}
      data-testid={testId ?? "terminal-header"}
    >
      <div className="flex items-center gap-2">
        {titleIcon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Button
          onClick={onRun}
          disabled={isDisabled}
          size="sm"
          className="gap-2"
          data-testid="run-terminal-btn"
          aria-label={
            isRunning
              ? 'Running code'
              : isInitializing
              ? 'Loading terminal'
              : `${runLabel} code`
          }
          aria-busy={isRunning || isInitializing}
        >
          {isRunning || isInitializing ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
              {isInitializing ? initializingLabel : runningLabel}
            </>
          ) : (
            <>
              {runIcon}
              {runLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
