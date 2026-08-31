'use client'

/**
 * What a caught error looks like on screen.
 *
 * Split out of RetryableErrorBoundary so that file is about when to retry
 * and this one is about what the user sees. Takes plain props rather than
 * reading the boundary's state, so it renders in isolation.
 */

import type { ErrorView } from './error-view'
import { ErrorHeader } from './ErrorHeader'
import { ErrorDetails } from './error-boundary-details'
import { ErrorStatus } from './error-boundary-status'
import { ErrorActions } from './error-boundary-actions'
import { ErrorSupport } from './error-boundary-support'
import { fallbackWrapperStyle } from './fallback-wrapper-style'

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
    <div style={fallbackWrapperStyle(colors)}>
      <ErrorHeader
        icon={icon}
        category={category}
        colors={colors}
        userMessage={userMessage}
      >
        <ErrorDetails error={error} category={category} />
        <ErrorStatus
          colors={colors}
          errorCount={errorCount}
          retryCount={retryCount}
          maxAutoRetries={maxAutoRetries}
          autoRetryScheduled={autoRetryScheduled}
          nextRetryIn={nextRetryIn}
        />
        <ErrorActions colors={colors} onRetry={onRetry} onReload={onReload} />
        <ErrorSupport
          category={category}
          colors={colors}
          showSupportInfo={showSupportInfo}
          supportEmail={supportEmail}
        />
      </ErrorHeader>
    </div>
  )
}
