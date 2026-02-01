import { useRef, useEffect, useState } from 'react'

export function useDifferent<T>(value: T) {
  const prevRef = useRef(value)
  const [isDifferent, setIsDifferent] = useState(false)

  useEffect(() => {
    if (prevRef.current !== value) {
      setIsDifferent(true)
      prevRef.current = value
    }
  }, [value])

  return isDifferent
}
