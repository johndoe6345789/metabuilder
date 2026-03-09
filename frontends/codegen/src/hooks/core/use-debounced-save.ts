import { useEffect, useRef } from 'react'

export function useDebouncedSave<T>(
  value: T,
  onSave: (value: T) => void,
  delay: number = 1000
) {
  const timeoutRef = useRef<number>(0)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      onSave(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, onSave, delay])
}
