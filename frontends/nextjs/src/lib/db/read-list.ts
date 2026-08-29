/**
 * Reading rows out of a DBAL response.
 *
 * DBAL's list endpoints answer `{ success, data: { data: [...], total } }`,
 * but callers see the simpler shapes too: an already-unwrapped
 * `{ data: [...] }` from code that stripped one level, and a bare array from
 * the older routes. Five separate readers grew up around this, each
 * accepting a different subset -- and two of them accepted the wrong one, so
 * they silently answered an empty list against a real DBAL rather than
 * failing. `useInstalledPackages` showed every package as uninstalled and
 * `usePageRoutes` needed a `success` key its callers did not always send.
 *
 * This is the one reader. It accepts every shape DBAL actually produces and
 * answers [] for anything else, because a caller that cannot tell an empty
 * table from a misread envelope is exactly how those bugs stayed hidden --
 * use `readListStrict` when the difference matters.
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

/** Rows from any DBAL list envelope; [] when there are none to find. */
export function readList<T>(raw: unknown): T[] {
  return readListStrict<T>(raw) ?? []
}

/**
 * Rows from any DBAL list envelope, or null when the payload is not one.
 *
 * Distinguishes "the table is empty" (`[]`) from "this is not a list
 * response" (`null`), which the permissive reader above cannot.
 */
export function readListStrict<T>(raw: unknown): T[] | null {
  if (Array.isArray(raw)) return raw as T[]

  const outer = asRecord(raw)
  if (outer === null) return null

  // `{ success, data: ... }` -- unwrap the envelope and look again.
  const body = 'success' in outer && 'data' in outer ? outer.data : outer
  if (Array.isArray(body)) return body as T[]

  const inner = asRecord(body)
  if (inner === null) return null

  if (Array.isArray(inner.data)) return inner.data as T[]

  // `{ data: { data: [...] } }` where the outer had no `success` key.
  const nested = asRecord(inner.data)
  if (nested !== null && Array.isArray(nested.data)) {
    return nested.data as T[]
  }
  return null
}

/** The first row of a list response, or null. */
export function readOne<T>(raw: unknown): T | null {
  return readList<T>(raw)[0] ?? null
}
