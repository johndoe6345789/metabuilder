/**
 * useThrottled Hook
 * Throttles a value to emit at most once per interval
 */

import { useEffect, useRef, useState } from 'react'

export interface UseThrottledOptions {
  /** Call on leading edge (immediately) - default true */
  leading?: boolean
  /** Call on trailing edge (after interval) */
  trailing?: boolean
}

export interface UseThrottledReturn<T> {
  /** The throttled value */
  value: T
  /** Cancel pending throttle callback */
  cancel: () => void
  /** Check if trailing callback is pending */
  isPending: boolean
}

export function useThrottled<T>(
  value: T,
  interval: number,
  options: UseThrottledOptions = {}
): UseThrottledReturn<T> {
  const { leading = true, trailing = false } = options
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastUpdateRef = useRef(Date.now())
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const scheduleUpdate = () => {
      if (trailing) {
        setIsPending(true)
        timeoutRef.current = setTimeout(() => {
          setThrottledValue(value)
          lastUpdateRef.current = Date.now()
          setIsPending(false)
        }, interval - timeSinceLastUpdate)
      } else {
        setIsPending(false)
      }
    }

    if (timeSinceLastUpdate >= interval) {
      if (leading) {
        setThrottledValue(value)
        lastUpdateRef.current = now
      }
      scheduleUpdate()
    } else {
      scheduleUpdate()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, interval, leading, trailing])

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsPending(false)
  }

  return { value: throttledValue, cancel, isPending }
}
