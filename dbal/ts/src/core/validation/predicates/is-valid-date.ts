export function isValidDate(value: unknown): boolean {
  if (value instanceof Date) {
    return !Number.isNaN(value.valueOf())
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    return !Number.isNaN(parsed.valueOf())
  }

  return false
}
