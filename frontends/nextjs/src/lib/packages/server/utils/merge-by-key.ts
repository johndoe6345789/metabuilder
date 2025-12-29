export const mergeByKey = <T>(existing: T[], incoming: T[], getKey: (item: T) => string): T[] => {
  const merged = new Map<string, T>()

  for (const item of existing) {
    merged.set(getKey(item), item)
  }

  for (const item of incoming) {
    merged.set(getKey(item), item)
  }

  return Array.from(merged.values())
}
