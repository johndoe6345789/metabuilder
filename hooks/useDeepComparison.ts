import { useRef, useEffect } from 'react'

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false
  const keysA = Object.keys(a || {})
  const keysB = Object.keys(b || {})
  if (keysA.length !== keysB.length) return false
  return keysA.every(key => deepEqual(a[key], b[key]))
}

export function useDeepComparison<T>(value: T) {
  const prevRef = useRef(value)
  useEffect(() => { prevRef.current = value }, [value])
  return deepEqual(prevRef.current, value)
}
