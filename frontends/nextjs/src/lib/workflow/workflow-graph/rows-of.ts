/** Unwraps the DBAL list envelope down to its row array, or an empty
 *  array for any shape that isn't one. */
export function rowsOf(payload: unknown): Record<string, unknown>[] {
  const data = (payload as { data?: { data?: unknown } } | null)?.data?.data
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : []
}
