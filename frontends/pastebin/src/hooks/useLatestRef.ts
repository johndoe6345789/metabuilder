import { useRef } from 'react'

/**
 * A ref that always holds the latest value passed in, so stable callbacks (e.g.
 * a Monaco onMount handler that fires once) can read current props without
 * stale closures.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value)
  // eslint-disable-next-line react-hooks/refs
  ref.current = value
  return ref
}
