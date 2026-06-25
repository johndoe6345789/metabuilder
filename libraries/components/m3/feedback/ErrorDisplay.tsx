'use client'

import { useState, type ReactNode } from 'react'
import { Alert, AlertTitle } from './Alert'
import { Button } from '../inputs/Button'

export interface ErrorDisplayProps {
  /** The error to display */
  error: Error | string
  /** Error title */
  title?: string
  /** Whether to show stack trace toggle */
  showStackTrace?: boolean
  /** Whether to show copy button */
  showCopyButton?: boolean
  /** Whether to show reload button */
  showReloadButton?: boolean
  /** Custom reload handler */
  onReload?: () => void
  /** Custom icon */
  icon?: ReactNode
  /** Additional content to render */
  children?: ReactNode
  /** Custom className */
  className?: string
  /** Test ID for testing */
  testId?: string
}

/**
 * Error display component with stack trace toggle and copy functionality.
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   error={error}
 *   title="Something went wrong"
 *   showStackTrace
 *   showCopyButton
 *   showReloadButton
 * />
 * ```
 */
export function ErrorDisplay({
  error,
  title = 'An error occurred',
  showStackTrace = true,
  showCopyButton = true,
  showReloadButton = false,
  onReload,
  icon,
  children,
  className = '',
  testId,
}: ErrorDisplayProps) {
  const [isStackOpen, setIsStackOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? undefined : error.stack

  const errorDetails = `Error: ${errorMessage}\n\nStack Trace:\n${errorStack || 'No stack trace available'}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(errorDetails)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  const handleReload = () => {
    if (onReload) {
      onReload()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className={`space-y-4 ${className}`} data-testid={testId ?? "error-display"} role="alert">
      <Alert severity="error" data-testid="error-alert" role="alert">
        {icon}
        <AlertTitle>{title}</AlertTitle>
        <div className="mt-3 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <code
              className="text-sm bg-destructive/20 px-2 py-1 rounded flex-1 break-all"
              data-testid="error-message"
            >
              {errorMessage}
            </code>
            {showCopyButton && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
                data-testid="copy-error-btn"
                aria-label="Copy error details"
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </div>

          {showStackTrace && errorStack && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStackOpen(!isStackOpen)}
                className="w-full justify-between"
                aria-expanded={isStackOpen}
                data-testid="stack-trace-trigger"
              >
                {isStackOpen ? 'Hide Stack Trace' : 'Show Stack Trace'}
              </Button>
              {isStackOpen && (
                <div className="mt-4" data-testid="stack-trace-content">
                  <pre className="text-xs bg-destructive/10 p-3 rounded overflow-auto max-h-60" data-testid="error-stack-trace">
                    {errorStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </Alert>

      {children}

      {showReloadButton && (
        <Button
          onClick={handleReload}
          className="w-full"
          variant="outline"
          data-testid="reload-btn"
          aria-label="Try reloading the page"
        >
          Try Reloading
        </Button>
      )}
    </div>
  )
}
