'use client'

/**
 * useInput Hook
 *
 * Manages controlled input state for text fields, textareas, and other text-based inputs.
 * Handles value state, change events, blur events, and integration with validation.
 *
 * @example
 * const { value, onChange, onBlur, setValue, reset } = useInput('', {
 *   onValidate: (v) => v.trim().length > 0
 * })
 *
 * <input value={value} onChange={onChange} onBlur={onBlur} />
 */

import { ChangeEvent, FocusEvent, useCallback, useState } from 'react'

interface UseInputOptions {
  /** Initial value for the input */
  initialValue?: string
  /** Callback when input changes */
  onChange?: (value: string) => void
  /** Callback when input blurs */
  onBlur?: (value: string) => void
  /** Validation function - returns error string or empty string */
  onValidate?: (value: string) => string
  /** Trim whitespace on change */
  trim?: boolean
  /** Transform value on change */
  transform?: (value: string) => string
}

interface UseInputState {
  value: string
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
}

interface UseInputHandlers {
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  setValue: (value: string) => void
  setError: (error: string) => void
  clearError: () => void
  reset: () => void
  touch: () => void
  validate: () => boolean
}

interface UseInputReturn extends UseInputState {
  handlers: UseInputHandlers
}

/**
 * Hook for managing controlled input state
 *
 * @param initialValue Initial value
 * @param options Configuration options
 * @returns Input state and handlers
 */
export function useInput(initialValue: string = '', options?: UseInputOptions): UseInputReturn {
  const [value, setValue] = useState(initialValue)
  const [isDirty, setIsDirty] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [error, setError] = useState('')

  // Determine if input is valid (no error and has changed from initial)
  const isValid = !error && isDirty

  /**
   * Handle input change event
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let newValue = e.target.value

      // Apply transformations
      if (options?.trim) {
        newValue = newValue.trim()
      }

      if (options?.transform) {
        newValue = options.transform(newValue)
      }

      setValue(newValue)
      setIsDirty(newValue !== initialValue)

      // Clear error when user starts typing
      if (error) {
        setError('')
      }

      // Call user's onChange callback
      options?.onChange?.(newValue)
    },
    [initialValue, error, options]
  )

  /**
   * Handle input blur event
   */
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsTouched(true)

      // Validate on blur if validator provided
      if (options?.onValidate) {
        const validationError = options.onValidate(value)
        if (validationError) {
          setError(validationError)
        }
      }

      // Call user's onBlur callback
      options?.onBlur?.(value)
    },
    [value, options]
  )

  /**
   * Set value programmatically
   */
  const setProgrammaticValue = useCallback((newValue: string) => {
    setValue(newValue)
    setIsDirty(newValue !== initialValue)
  }, [initialValue])

  /**
   * Set error message
   */
  const setErrorMessage = useCallback((errorMsg: string) => {
    setError(errorMsg)
  }, [])

  /**
   * Clear error message
   */
  const clearErrorMessage = useCallback(() => {
    setError('')
  }, [])

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setValue(initialValue)
    setIsDirty(false)
    setIsTouched(false)
    setError('')
  }, [initialValue])

  /**
   * Mark input as touched
   */
  const touch = useCallback(() => {
    setIsTouched(true)
  }, [])

  /**
   * Manually validate current value
   */
  const validate = useCallback((): boolean => {
    if (options?.onValidate) {
      const validationError = options.onValidate(value)
      if (validationError) {
        setError(validationError)
        return false
      }
    }

    clearErrorMessage()
    return true
  }, [value, options])

  return {
    value,
    isDirty,
    isTouched,
    error,
    isValid,
    handlers: {
      onChange: handleChange,
      onBlur: handleBlur,
      setValue: setProgrammaticValue,
      setError: setErrorMessage,
      clearError: clearErrorMessage,
      reset,
      touch,
      validate,
    },
  }
}

export default useInput
