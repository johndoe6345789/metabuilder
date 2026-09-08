/**
 * Telling "the service refused" from "nothing was listening".
 *
 * A browser and Node both report a connection that was never made as a
 * bare `TypeError: Failed to fetch` / `fetch failed`, and a timeout as an
 * aborted DOMException. Callers that write
 * `error instanceof Error ? error.message : friendlyFallback` therefore
 * show the raw text for the *most common* failure and never reach their
 * fallback at all -- which is how "Failed to fetch" ended up on screen in
 * a founder's Stream page and "fetch failed" in their Files tab.
 */
export function neverConnected(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'TimeoutError' || error.name === 'AbortError'
  }
  if (!(error instanceof TypeError)) return false
  return /failed to fetch|fetch failed|networkerror|load failed/i.test(
    error.message
  )
}

/** What to say when a service did not answer at all. */
export function unreachableMessage(service: string, url: string): string {
  return `Could not reach ${service} at ${url}. Is it running?`
}
