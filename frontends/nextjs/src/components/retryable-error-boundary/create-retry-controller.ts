/**
 * The retry lifecycle (schedule -> countdown -> auto-retry, or a manual
 * retry/reload) extracted from the boundary class so the class itself only
 * wires these to its own state and lifecycle, not the timer bookkeeping.
 * Deals only in whole `RetryableErrorBoundaryState` values (never a partial
 * patch), so every `setState` call here is a plain, unambiguous assignment.
 */

import { RetryScheduler } from './retry-scheduler'
import { calculateRetryDelay } from './retry-delay'
import type { RetryableErrorBoundaryState as State } from './types'

export interface RetryControllerDeps {
  isMounted: () => boolean
  getState: () => State
  getInitialRetryDelayMs: () => number
  getMaxRetryDelayMs: () => number
  setState: (patch: State | ((prev: State) => State)) => void
}

/** The shared shape of "give the child another chance", whether that
 *  chance came from the countdown finishing or a manual click. */
function resetState(current: State, retryCount: number): State {
  return {
    ...current,
    hasError: false,
    error: null,
    retryCount,
    isRetrying: false,
    autoRetryScheduled: false,
    nextRetryIn: 0,
  }
}

export function createRetryController(deps: RetryControllerDeps) {
  const scheduler = new RetryScheduler()

  const handleAutoRetry = () => {
    if (!deps.isMounted()) return
    deps.setState(prev => resetState(prev, prev.retryCount + 1))
  }

  const scheduleAutoRetry = () => {
    if (!deps.isMounted()) return
    const delay = calculateRetryDelay(
      deps.getState().retryCount,
      deps.getInitialRetryDelayMs(),
      deps.getMaxRetryDelayMs()
    )
    deps.setState(prev => ({ ...prev, autoRetryScheduled: true }))
    scheduler.start(
      delay,
      remainingSeconds => {
        if (deps.isMounted()) {
          deps.setState(prev => ({ ...prev, nextRetryIn: remainingSeconds }))
        }
      },
      () => {
        if (deps.isMounted() && deps.getState().hasError) handleAutoRetry()
      }
    )
  }

  const handleManualRetry = () => {
    scheduler.cancel()
    deps.setState(prev => resetState(prev, 0))
  }

  const handleReload = () => {
    scheduler.cancel()
    window.location.reload()
  }

  return {
    scheduleAutoRetry,
    handleManualRetry,
    handleReload,
    cancel: scheduler.cancel.bind(scheduler),
  }
}
