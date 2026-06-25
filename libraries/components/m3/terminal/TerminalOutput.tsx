'use client'

import type { ReactNode } from 'react'

export interface TerminalLine {
  /** Type of terminal line */
  type: 'output' | 'error' | 'input-prompt' | 'input-value' | 'info' | 'warning'
  /** Line content */
  content: string
  /** Unique ID for the line */
  id: string
}

export interface TerminalOutputProps {
  /** Terminal output lines */
  lines: TerminalLine[]
  /** Whether code is currently running */
  isRunning?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Custom className */
  className?: string
  /** Disable animations */
  disableAnimations?: boolean
  /** Test ID for the component */
  testId?: string
}

/**
 * Terminal output display component with support for different line types.
 *
 * @example
 * ```tsx
 * <TerminalOutput
 *   lines={[
 *     { id: '1', type: 'output', content: 'Hello, World!' },
 *     { id: '2', type: 'error', content: 'Error: Something went wrong' },
 *   ]}
 *   isRunning={false}
 *   emptyMessage="Click Run to execute code"
 * />
 * ```
 */
export function TerminalOutput({
  lines,
  isRunning = false,
  emptyMessage = 'No output yet',
  className = '',
  disableAnimations = false,
  testId,
}: TerminalOutputProps) {
  if (lines.length === 0 && !isRunning) {
    return (
      <div
        className={`flex items-center justify-center h-full text-muted-foreground ${className}`}
        data-testid={testId ?? "terminal-empty-state"}
        role="status"
        aria-live="polite"
        aria-label="Terminal output area"
      >
        {emptyMessage}
      </div>
    )
  }

  const hasErrors = lines.some((line) => line.type === 'error')
  const lastErrorLine = [...lines].reverse().find((line) => line.type === 'error')

  return (
    <div
      className={`space-y-1 ${className}`}
      data-testid={testId ?? "terminal-output-content"}
      aria-label="Terminal output area"
      role="log"
    >
      {/* Aria-live region for error announcements */}
      {hasErrors && (
        <div
          className="sr-only"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-testid="terminal-error-alert"
        >
          Error: {lastErrorLine?.content}
        </div>
      )}

      {lines.map((line, idx) => (
        <div
          key={line.id}
          className={`leading-relaxed ${disableAnimations ? '' : 'animate-fadeIn'}`}
          style={disableAnimations ? {} : { animationDelay: `${idx * 50}ms` }}
          role={line.type === 'error' ? 'alert' : 'status'}
          aria-live={line.type === 'error' ? 'assertive' : 'off'}
        >
          {line.type === 'output' && (
            <div className="text-foreground whitespace-pre-wrap">{line.content}</div>
          )}
          {line.type === 'error' && (
            <div
              className="text-destructive whitespace-pre-wrap"
              aria-label={`Error: ${line.content}`}
            >
              {line.content}
            </div>
          )}
          {line.type === 'warning' && (
            <div className="text-yellow-500 whitespace-pre-wrap">{line.content}</div>
          )}
          {line.type === 'info' && (
            <div className="text-blue-500 whitespace-pre-wrap">{line.content}</div>
          )}
          {line.type === 'input-prompt' && (
            <div className="text-accent font-medium whitespace-pre-wrap">{line.content}</div>
          )}
          {line.type === 'input-value' && (
            <div className="text-primary whitespace-pre-wrap">{'> ' + line.content}</div>
          )}
        </div>
      ))}
    </div>
  )
}
