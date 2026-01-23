/**
 * useToggle Hook
 * Simple boolean toggle state with utility methods
 */

import { useState } from 'react'

export interface UseToggleOptions {
  initial?: boolean
}

export interface UseToggleReturn {
  value: boolean
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
  setValue: (value: boolean) => void
}

/**
 * Manages simple boolean toggle state
 * @param options - Configuration options
 */
export function useToggle(options: UseToggleOptions = {}): UseToggleReturn {
  const { initial = false } = options
  const [value, setValue] = useState(initial)

  const toggle = () => setValue(v => !v)
  const setTrue = () => setValue(true)
  const setFalse = () => setValue(false)

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  }
}
