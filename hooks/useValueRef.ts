import { useRef, useEffect } from 'react'

export function useValueRef<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => { ref.current = value }, [value])
  return ref
}
