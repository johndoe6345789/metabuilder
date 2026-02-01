import { useRef, useEffect, useState } from 'react'

export function useChange<T>(value: T, onChange?: (prev: T, curr: T) => void) {
  const prevRef = useRef(value)
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    if (prevRef.current !== value) {
      onChange?.(prevRef.current, value)
      setChanged(true)
      prevRef.current = value
    }
  }, [value, onChange])

  return changed
}
