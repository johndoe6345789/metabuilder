/** Exponential backoff, capped at maxDelayMs -- attempt 0 waits
 *  initialDelayMs, attempt 1 waits double that, and so on. */
export function calculateRetryDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number
): number {
  const delay = initialDelayMs * Math.pow(2, attempt)
  return Math.min(delay, maxDelayMs)
}
