export function omitRecordKeys<T>(record: Record<string, T>, keys: Set<string>): Record<string, T> {
  const next: Record<string, T> = {}
  for (const [key, value] of Object.entries(record)) {
    if (!keys.has(key)) {
      next[key] = value
    }
  }
  return next
}
