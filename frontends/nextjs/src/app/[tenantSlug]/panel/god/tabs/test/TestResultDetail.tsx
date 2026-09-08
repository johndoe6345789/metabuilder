'use client'

import type { TestResult } from './use-test-runner'
import s from './TestRunnerTab.module.scss'

/** How many rows the run would have written, across every entity. */
function rowCount(rows: TestResult['rows']): number {
  if (rows === undefined) return 0
  return Object.values(rows).reduce((n, list) => n + list.length, 0)
}

/**
 * What the run actually did, beside what it produced.
 *
 * The steps are run for real now, so a failing test can be read: which
 * step stopped it, what it would have written, what it would have done to
 * the page. Without this the only evidence was the merged output, which
 * is exactly what made the old runner look like it was working.
 */
export function TestResultDetail({ result }: { result: TestResult }) {
  const effects = result.effects ?? []
  const rows = rowCount(result.rows)
  const logs = result.logs ?? []

  return (
    <div className={s.detail}>
      {result.stopped != null && (
        <div className={s.stopped}>
          Stopped at &ldquo;{result.stopped.step}&rdquo; &mdash;{' '}
          {result.stopped.because}. The steps after it did not run.
        </div>
      )}

      {result.actual !== undefined && (
        <pre className={s.actual}>
          actual → {JSON.stringify(result.actual)}
        </pre>
      )}

      {rows > 0 && (
        <div className={s.note}>
          {rows} row{rows === 1 ? '' : 's'} would be written:{' '}
          {Object.keys(result.rows ?? {}).join(', ')} (nothing was)
        </div>
      )}

      {effects.length > 0 && (
        <div className={s.note}>
          The page would be asked to: {effects.map(e => e.do).join(', ')}
        </div>
      )}

      {logs.length > 0 && <pre className={s.actual}>{logs.join('\n')}</pre>}
    </div>
  )
}
