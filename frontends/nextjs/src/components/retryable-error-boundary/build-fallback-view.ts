/** Assembles the plain view object the fallback renders from, so the
 *  class's `render()` stays a thin dispatch rather than an object literal. */

import { errorReporting } from '@/lib/error-reporting'
import { colorsFor, iconFor } from '../error-boundary/error-boundary-presentation'
import type { ErrorView } from '../error-boundary/error-view'
import type {
  RetryableErrorBoundaryProps,
  RetryableErrorBoundaryState,
} from './types'

export function buildFallbackView(
  props: RetryableErrorBoundaryProps,
  state: RetryableErrorBoundaryState
): ErrorView {
  const { category, error } = state
  return {
    error,
    category,
    icon: iconFor(category),
    colors: colorsFor(category),
    userMessage:
      error !== null
        ? errorReporting.getUserMessage(error, category)
        : 'An error occurred while rendering this component.',
    errorCount: state.errorCount,
    retryCount: state.retryCount,
    nextRetryIn: state.nextRetryIn,
    autoRetryScheduled: state.autoRetryScheduled,
    maxAutoRetries: props.maxAutoRetries,
    showSupportInfo: props.showSupportInfo ?? true,
    supportEmail: props.supportEmail ?? 'support@metabuilder.dev',
  }
}
