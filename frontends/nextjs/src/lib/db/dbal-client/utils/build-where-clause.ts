/**
 * Build where clause from filter
 */
export function buildWhereClause(filter: Record<string, unknown>): Record<string, unknown> {
  const where: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined) {
      where[key] = value
    }
  }
  return where
}
