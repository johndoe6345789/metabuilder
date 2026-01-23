/**
 * useDebounced Hook
 * Debounces a value with optional leading/trailing edge control
 */

import { useEffect, useRef, useState } from 'react'

export interface UseDebouncedOptions {
  /** Call on leading edge (before delay) */
  leading?: boolean
  /** Call on trailing edge (after delay) - default true */
  trailing?: boolean
}

export interface UseDebouncedReturn<T> {
  /** The debounced value */
  value: T
  /** Cancel pending debounce */
  cancel: () => void
  /** Check if debounce is pending */
  isPending: boolean
}

export function useDebounced<T>(
  value: T,
  delay: number,
  options: UseDebouncedOptions = {}
): UseDebouncedReturn<T> {
  const { leading = false, trailing = true } = options
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leadingCallRef = useRef(false)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (leading && !leadingCallRef.current) {
      setDebouncedValue(value)
      leadingCallRef.current = true
    }

    if (trailing) {
      setIsPending(true)
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value)
        leadingCallRef.current = false
        setIsPending(false)
      }, delay)
    } else if (leading) {
      setDebouncedValue(value)
      leadingCallRef.current = false
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay, leading, trailing])

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    leadingCallRef.current = false
    setIsPending(false)
  }

  return { value: debouncedValue, cancel, isPending }
}
