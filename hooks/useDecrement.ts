import { useState, useCallback } from 'react'

export function useDecrement(initial = 0, min = -Infinity) {
  const [value, setValue] = useState(initial)
  const decrement = useCallback(() => setValue(v => Math.max(v - 1, min)), [min])
  const reset = useCallback(() => setValue(initial), [initial])
  return [value, { decrement, reset }] as const
}
