import type { ErrorReport } from './types'
import { sendToMonitoring } from './send-to-monitoring'

/** Logs a freshly-built report to whichever channel fits the
 *  environment: full detail on the dev console, or the production
 *  monitoring sink. */
export function logReport(report: ErrorReport): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorReporting]', {
      id: report.id,
      message: report.message,
      category: report.category,
      isRetryable: report.isRetryable,
      suggestedAction: report.suggestedAction,
      context: report.context,
      stack: report.stack,
    })
  }
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoring(report)
  }
}
