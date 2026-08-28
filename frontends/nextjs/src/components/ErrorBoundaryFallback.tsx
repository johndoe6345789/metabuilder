'use client'

/**
 * What a caught error looks like on screen.
 *
 * Split out of RetryableErrorBoundary so that file is about when to retry
 * and this one is about what the user sees. Takes plain props rather than
 * reading the boundary's state, so it renders in isolation.
 */

import type { ErrorView } from './error-view'
import { ErrorDetails } from './error-boundary-details'
import { ErrorStatus } from './error-boundary-status'
import { ErrorActions } from './error-boundary-actions'
import { ErrorSupport } from './error-boundary-support'

export type { ErrorView } from './error-view'

export interface ErrorBoundaryFallbackProps {
  view: ErrorView
  onRetry: () => void
  onReload: () => void
}

/** One `view` object rather than fifteen props: the boundary hands over what
 *  it knows, and this decides how it looks. */
export function ErrorBoundaryFallback({
  view,
  onRetry,
  onReload,
}: ErrorBoundaryFallbackProps) {
  const {
    error,
    category,
    icon,
    colors,
    userMessage,
    errorCount,
    retryCount,
    nextRetryIn,
    autoRetryScheduled,
    maxAutoRetries,
    showSupportInfo,
    supportEmail,
  } = view

  return (
    <div
      style={{
        padding: '24px',
        margin: '16px',
        border: `1px solid ${colors.border}`,
        borderRadius: '1.25rem',
        backgroundColor: colors.bg,
        boxShadow: `0 2px 4px rgba(0, 0, 0, 0.05)`,
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
      >
        <div
          style={{
            fontSize: '28px',
            flexShrink: 0,
            marginTop: '4px',
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              color: colors.text,
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            {category === 'not-found'
              ? 'Not Found'
              : 'Something went wrong'}
          </h2>
          <p
            style={{
              color: '#495057',
              margin: '0 0 12px 0',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            {userMessage}
          </p>

          <ErrorDetails error={error} category={category} />
          <ErrorStatus
            colors={colors}
            errorCount={errorCount}
            retryCount={retryCount}
            maxAutoRetries={maxAutoRetries}
            autoRetryScheduled={autoRetryScheduled}
            nextRetryIn={nextRetryIn}
          />
          <ErrorActions
            colors={colors}
            onRetry={onRetry}
            onReload={onReload}
          />
          <ErrorSupport
            category={category}
            colors={colors}
            showSupportInfo={showSupportInfo}
            supportEmail={supportEmail}
          />
        </div>
      </div>
    </div>
  )
}
