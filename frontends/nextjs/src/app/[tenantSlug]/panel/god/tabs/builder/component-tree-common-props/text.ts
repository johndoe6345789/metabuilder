export const text = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : ''

/** A DOM id must be non-empty and contain no whitespace. */
export function idError(value: string): string | null {
  if (value === '') return null
  if (/\s/.test(value)) return 'No spaces allowed'
  return null
}
