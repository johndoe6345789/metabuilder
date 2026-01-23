import { useState, useCallback } from 'react'

export function useIncrement(initial = 0, max = Infinity) {
  const [value, setValue] = useState(initial)
  const increment = useCallback(() => setValue(v => Math.min(v + 1, max)), [max])
  const reset = useCallback(() => setValue(initial), [initial])
  return [value, { increment, reset }] as const
}
