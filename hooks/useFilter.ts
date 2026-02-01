import { useState, useMemo } from 'react'

export function useFilter<T>(items: T[], predicate: (item: T) => boolean) {
  const [enabled, setEnabled] = useState(true)
  const filtered = useMemo(() => (enabled ? items.filter(predicate) : items), [items, predicate, enabled])
  return { filtered, enabled, setEnabled }
}
