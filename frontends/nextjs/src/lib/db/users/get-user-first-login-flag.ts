/**
 * Resolve the first-login flag from a raw user record.
 * Defaults to true when the field is missing to be safe.
 */
export function getUserFirstLoginFlag(record: Record<string, unknown>): boolean {
  if (!('firstLogin' in record)) {
    return true
  }

  const value = record.firstLogin
  if (value === null || value === undefined) {
    return true
  }

  return Boolean(value)
}
