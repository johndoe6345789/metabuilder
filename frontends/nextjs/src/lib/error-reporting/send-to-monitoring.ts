import type { ErrorReport } from './types'

/**
 * Sends a production error to this stack's actual observability channel:
 * structured stderr, which every deployment here already captures (see
 * `docker logs -f metabuilder-dbal` and friends in the repo's CLAUDE.md).
 * This used to be a commented-out `fetch('/api/monitoring/errors', ...)`
 * that called nothing -- no such route, and no Sentry/DataDog account or
 * DSN is configured anywhere in this repo, so pretending to call one
 * would be a second stub wearing a real-looking name. Routing to a
 * specific APM later is a deliberate provider choice (needs credentials
 * this repo has never had), not something to fabricate here.
 */
export function sendToMonitoring(report: ErrorReport): void {
  console.error(
    '[monitoring]',
    JSON.stringify({
      id: report.id,
      message: report.message,
      category: report.category,
      statusCode: report.statusCode,
      isRetryable: report.isRetryable,
      context: report.context,
      stack: report.stack,
    })
  )
}
