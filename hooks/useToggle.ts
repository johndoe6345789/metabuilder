/**
 * useToggle Hook
 * Enhanced boolean state management with multiple toggle options
 *
 * Features:
 * - Boolean state with toggle, set, and explicit setters
 * - Generic return type for state management
 * - Performance optimized with useCallback
 * - Simple and intuitive API
 *
 * @example
 * const { value, toggle, setValue, setTrue, setFalse } = useToggle(false)
 *
 * // Use in component
 * <Button onClick={toggle}>Toggle: {value.toString()}</Button>
 * <Button onClick={setTrue}>Show</Button>
 * <Button onClick={setFalse}>Hide</Button>
 * <Button onClick={() => setValue(prev => !prev)}>Custom Toggle</Button>
 *
 * @example
 * // With initial true state
 * const { value: isMenuOpen, toggle: toggleMenu } = useToggle(true)
 */

import { useState, useCallback } from 'react'

export interface UseToggleReturn {
  /** Current boolean value */
  value: boolean
  /** Toggle the value between true and false */
  toggle: () => void
  /** Set the value directly */
  setValue: (value: boolean | ((prev: boolean) => boolean)) => void
  /** Set value to true */
  setTrue: () => void
  /** Set value to false */
  setFalse: () => void
}

/**
 * Hook for managing boolean state with common toggle operations
 * @param initialValue - Initial boolean state (default: false)
 * @returns Object containing boolean state and operation methods
 */
export function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [value, setValue] = useState<boolean>(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  const handleSetValue = useCallback((newValue: boolean | ((prev: boolean) => boolean)) => {
    setValue(newValue)
  }, [])

  return {
    value,
    toggle,
    setValue: handleSetValue,
    setTrue,
    setFalse,
  }
}
