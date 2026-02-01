import { useState, useCallback } from 'react'

export function useCounter(initial = 0, { min, max }: { min?: number; max?: number } = {}) {
  const [count, setCount] = useState(initial)
  const increment = useCallback(() => setCount(c => max !== undefined ? Math.min(c + 1, max) : c + 1), [max])
  const decrement = useCallback(() => setCount(c => min !== undefined ? Math.max(c - 1, min) : c - 1), [min])
  const reset = useCallback(() => setCount(initial), [initial])
  const set = useCallback((val: number) => setCount(val), [])
  return { count, increment, decrement, reset, set }
}
