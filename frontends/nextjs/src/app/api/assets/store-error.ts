/** Turning a failed call to the object store into a sentence. */

const STORE_URL = process.env.OBJECT_STORE_URL ?? 'http://localhost:9000'

/** Node's fetch reports a connection it never made as a bare TypeError
 *  reading "fetch failed"; a timeout is an aborted DOMException. */
function neverConnected(error: unknown): boolean {
  if (error instanceof TypeError) return error.message === 'fetch failed'
  return error instanceof DOMException && error.name === 'TimeoutError'
}

/**
 * What to tell the founder. A store that answered is quoted as-is; one
 * that never answered is named, with the variable that points at it --
 * "fetch failed" on its own sent people looking at the wrong thing.
 */
export function storeErrorMessage(error: unknown, doing: string): string {
  if (neverConnected(error)) {
    return (
      `Could not reach the file store at ${STORE_URL} -- is ` +
      'OBJECT_STORE_URL right and the store running?'
    )
  }
  return error instanceof Error ? error.message : `${doing} failed`
}
