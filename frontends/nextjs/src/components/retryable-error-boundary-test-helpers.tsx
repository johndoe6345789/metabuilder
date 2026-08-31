import { render } from '@testing-library/react'
import { RetryableErrorBoundary } from './RetryableErrorBoundary'

/** Throws while `gate.fail` is set, so a test controls recovery directly
 *  rather than depending on how many times React chooses to render.
 *  Shared across RetryableErrorBoundary.test.tsx and its .retry split --
 *  each file resets `gate.fail = true` in its own beforeEach. */
export const gate = { fail: true }

export function Flaky({ error }: { error: Error }) {
  if (gate.fail) throw error
  return <div>recovered</div>
}

export const netError = () => new Error('network request failed')
export const permError = () => new Error('permission denied')

export function renderBoundary(
  error: Error,
  props: Record<string, unknown> = {}
) {
  return render(
    <RetryableErrorBoundary {...props}>
      <Flaky error={error} />
    </RetryableErrorBoundary>
  )
}
