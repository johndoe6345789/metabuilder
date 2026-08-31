/**
 * The timer bookkeeping behind an automatic retry countdown, kept apart
 * from React so it can be unit-tested with fake timers directly and so
 * the component only owns which state to set, not how the two timers
 * (the tick and the final retry) stay in sync.
 */
export class RetryScheduler {
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null

  /** Counts down from `delayMs` in 100ms ticks (reporting whole seconds
   *  remaining to `onTick`), then calls `onComplete` once it elapses. */
  start(
    delayMs: number,
    onTick: (remainingSeconds: number) => void,
    onComplete: () => void
  ): void {
    this.cancel()
    let remainingMs = delayMs
    onTick(Math.ceil(remainingMs / 1000))

    this.intervalId = setInterval(() => {
      remainingMs -= 100
      if (remainingMs > 0) onTick(Math.ceil(remainingMs / 1000))
    }, 100)

    this.timeoutId = setTimeout(() => {
      this.cancel()
      onComplete()
    }, delayMs)
  }

  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
