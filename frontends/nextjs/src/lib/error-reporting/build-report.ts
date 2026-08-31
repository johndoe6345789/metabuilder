import type { ErrorReport, ErrorReportContext } from './types'
import { categorizeError } from './error-category'
import { isErrorRetryable } from './retryable'
import { getSuggestedAction } from './suggested-action'
import { extractStatusCode } from './extract-status-code'
import { generateErrorId } from './generate-id'

/** Assembles the full report from an error and its context -- one call
 *  site so `reportError` on the service stays a thin push-and-log. */
export function buildErrorReport(
  error: Error | string,
  context: ErrorReportContext
): ErrorReport {
  const contextStatusCode =
    typeof context.statusCode === 'number' ? context.statusCode : undefined
  const statusCode = contextStatusCode ?? extractStatusCode(error)
  const category = categorizeError(error, statusCode)
  const isRetryable = isErrorRetryable(category, statusCode)
  const report = {
    id: generateErrorId(),
    message: typeof error === 'string' ? error : error.message,
    code: typeof context.code === 'string' ? context.code : undefined,
    statusCode,
    category,
    stack: error instanceof Error ? error.stack : undefined,
    context: { ...context, timestamp: new Date() },
    timestamp: new Date(),
    isDevelopment: process.env.NODE_ENV === 'development',
    isRetryable,
  } as ErrorReport

  // suggestedAction reflects the current category, even if mutated after
  // creation.
  Object.defineProperty(report, 'suggestedAction', {
    get(this: ErrorReport) {
      return getSuggestedAction(this.category)
    },
    enumerable: true,
    configurable: true,
  })

  return report
}
