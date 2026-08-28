'use client'

/** How many times this has failed, and when the next retry lands. */

import type { CategoryColors } from './error-boundary-presentation'

export function ErrorStatus({
  colors,
  errorCount,
  retryCount,
  maxAutoRetries,
  autoRetryScheduled,
  nextRetryIn,
}: {
  colors: CategoryColors
  errorCount: number
  retryCount: number
  maxAutoRetries?: number
  autoRetryScheduled: boolean
  nextRetryIn: number
}) {
  return (
    <>
          {/* Error count indicator */}
          {errorCount > 1 && (
            <p
              style={{
                color: colors.text,
                fontSize: '12px',
                margin: '8px 0',
                fontWeight: 500,
              }}
            >
              Error occurred {errorCount} times
            </p>
          )}

          {/* Retry count and auto-retry status */}
          {retryCount > 0 && (
            <p
              style={{
                color: '#666',
                fontSize: '12px',
                margin: '4px 0',
              }}
            >
              Retry attempt: {retryCount} of{' '}
              {maxAutoRetries ?? 3}
            </p>
          )}

          {/* Auto-retry countdown */}
          {autoRetryScheduled && (
            <div
              style={{
                padding: '8px',
                margin: '8px 0',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                borderLeft: '3px solid #4a90e2',
                borderRadius: '1rem',
                fontSize: '13px',
                color: '#1971c2',
              }}
            >
              Retrying in {nextRetryIn}s... (automatic)
            </div>
          )}
    </>
  )
}
