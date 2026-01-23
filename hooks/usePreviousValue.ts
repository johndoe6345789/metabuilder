import { useRef, useEffect } from 'react'

export function usePreviousValue<T>(value: T): T | undefined {
  const prevRef = useRef<T>()
  useEffect(() => { prevRef.current = value }, [value])
  return prevRef.current
}
