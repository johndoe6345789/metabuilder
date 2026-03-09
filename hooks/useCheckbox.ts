'use client'

/**
 * useCheckbox Hook
 *
 * Manages checkbox state for single and multiple checkboxes.
 * Supports indeterminate state, validation, and group management.
 *
 * @example
 * // Single checkbox
 * const { checked, onChange, toggle, reset } = useCheckbox(false)
 * <input type="checkbox" checked={checked} onChange={onChange} />
 *
 * // Multiple checkboxes
 * const { values, onChange, isChecked, toggleAll, reset } = useCheckbox(
 *   { admin: false, user: false, guest: false }
 * )
 * <input type="checkbox" checked={values.admin} onChange={onChange} name="admin" />
 */

import { ChangeEvent, useCallback, useState } from 'react'

/**
 * Configuration options for checkbox hook
 */
interface UseCheckboxOptions<T> {
  /** Callback when checkbox state changes */
  onChange?: (value: T) => void
  /** Validation function - returns error string or empty string */
  onValidate?: (value: T) => string
  /** Reset value on submit */
  resetOnSubmit?: boolean
}

/**
 * State for single checkbox
 */
interface UseCheckboxSingleState {
  checked: boolean
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
}

/**
 * State for multiple checkboxes
 */
interface UseCheckboxMultiState<T extends Record<string, boolean>> {
  values: T
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
  count: number
  isAllChecked: boolean
  isIndeterminate: boolean
}

/**
 * Handlers for single checkbox
 */
interface UseCheckboxSingleHandlers {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  setChecked: (checked: boolean) => void
  toggle: () => void
  reset: () => void
  touch: () => void
  validate: () => boolean
  setError: (error: string) => void
  clearError: () => void
}

/**
 * Handlers for multiple checkboxes
 */
interface UseCheckboxMultiHandlers<T extends Record<string, boolean>> {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  setValues: (values: T) => void
  isChecked: (field: keyof T) => boolean
  toggle: (field: keyof T) => void
  toggleAll: (checked: boolean) => void
  uncheckAll: () => void
  checkAll: () => void
  reset: () => void
  touch: () => void
  validate: () => boolean
  setError: (error: string) => void
  clearError: () => void
}

/**
 * Single checkbox return type
 */
interface UseCheckboxSingleReturn extends UseCheckboxSingleState {
  handlers: UseCheckboxSingleHandlers
}

/**
 * Multiple checkboxes return type
 */
interface UseCheckboxMultiReturn<T extends Record<string, boolean>> extends UseCheckboxMultiState<T> {
  handlers: UseCheckboxMultiHandlers<T>
}

/**
 * Hook for managing single checkbox state
 *
 * @param initialChecked Initial checked state
 * @param options Configuration options
 * @returns Checkbox state and handlers
 */
export function useCheckbox(
  initialChecked: boolean,
  options?: UseCheckboxOptions<boolean>
): UseCheckboxSingleReturn

/**
 * Hook for managing multiple checkbox state
 *
 * @param initialValues Initial checkbox values
 * @param options Configuration options
 * @returns Checkbox state and handlers
 */
export function useCheckbox<T extends Record<string, boolean>>(
  initialValues: T,
  options?: UseCheckboxOptions<T>
): UseCheckboxMultiReturn<T>

/**
 * Implementation
 */
export function useCheckbox<T extends boolean | Record<string, boolean>>(
  initialValue: T,
  options?: UseCheckboxOptions<T>
): UseCheckboxSingleReturn | UseCheckboxMultiReturn<any> {
  // Check if single or multiple
  const isSingle = typeof initialValue === 'boolean'

  const [value, setValue] = useState<T>(initialValue)
  const [isDirty, setIsDirty] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [error, setError] = useState('')

  // Calculate validity
  const isValid = !error

  if (isSingle) {
    const checked = value as boolean

    /**
     * Handle single checkbox change
     */
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked

        setValue(newChecked as T)
        setIsDirty(newChecked !== initialValue)

        // Clear error when user makes a change
        if (error) {
          setError('')
        }

        // Validate if validator provided
        if (options?.onValidate) {
          const validationError = options.onValidate(newChecked as T)
          if (validationError) {
            setError(validationError)
          }
        }

        // Call user's onChange callback
        options?.onChange?.(newChecked as T)
      },
      [initialValue, error, options]
    )

    /**
     * Set checked state programmatically
     */
    const setChecked = useCallback((newChecked: boolean) => {
      setValue(newChecked as T)
      setIsDirty(newChecked !== initialValue)
    }, [initialValue])

    /**
     * Toggle checkbox state
     */
    const toggle = useCallback(() => {
      const newChecked = !checked
      setChecked(newChecked)
      options?.onChange?.(newChecked as T)
    }, [checked, setChecked, options])

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
     * Mark as touched
     */
    const touch = useCallback(() => {
      setIsTouched(true)
    }, [])

    /**
     * Validate current state
     */
    const validate = useCallback((): boolean => {
      if (options?.onValidate) {
        const validationError = options.onValidate(checked as T)
        if (validationError) {
          setError(validationError)
          return false
        }
      }

      setError('')
      return true
    }, [checked, options])

    return {
      checked,
      isDirty,
      isTouched,
      error,
      isValid,
      handlers: {
        onChange: handleChange,
        setChecked,
        toggle,
        reset,
        touch,
        validate,
        setError,
        clearError: () => setError(''),
      },
    }
  } else {
    const values = value as Record<string, boolean>

    /**
     * Handle checkbox group change
     */
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const checked = e.target.checked

        const newValues = {
          ...values,
          [name]: checked,
        } as T

        setValue(newValues)
        setIsDirty(JSON.stringify(newValues) !== JSON.stringify(initialValue))

        // Clear error when user makes a change
        if (error) {
          setError('')
        }

        // Validate if validator provided
        if (options?.onValidate) {
          const validationError = options.onValidate(newValues)
          if (validationError) {
            setError(validationError)
          }
        }

        // Call user's onChange callback
        options?.onChange?.(newValues)
      },
      [values, initialValue, error, options]
    )

    /**
     * Set values programmatically
     */
    const setValues = useCallback(
      (newValues: Record<string, boolean>) => {
        setValue(newValues as T)
        setIsDirty(JSON.stringify(newValues) !== JSON.stringify(initialValue))
      },
      [initialValue]
    )

    /**
     * Check if a specific checkbox is checked
     */
    const isChecked = useCallback((field: keyof typeof values): boolean => {
      return values[field as string] ?? false
    }, [values])

    /**
     * Toggle a specific checkbox
     */
    const toggle = useCallback(
      (field: keyof typeof values) => {
        const newValues = {
          ...values,
          [field]: !values[field as string],
        } as T

        setValues(newValues as Record<string, boolean>)
        options?.onChange?.(newValues)
      },
      [values, setValues, options]
    )

    /**
     * Toggle all checkboxes
     */
    const toggleAll = useCallback(
      (checked: boolean) => {
        const newValues = Object.keys(values).reduce(
          (acc, key) => {
            acc[key] = checked
            return acc
          },
          { ...values } as Record<string, boolean>
        ) as T

        setValues(newValues as Record<string, boolean>)
        options?.onChange?.(newValues)
      },
      [values, setValues, options]
    )

    /**
     * Uncheck all checkboxes
     */
    const uncheckAll = useCallback(() => {
      toggleAll(false)
    }, [toggleAll])

    /**
     * Check all checkboxes
     */
    const checkAll = useCallback(() => {
      toggleAll(true)
    }, [toggleAll])

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
     * Mark as touched
     */
    const touch = useCallback(() => {
      setIsTouched(true)
    }, [])

    /**
     * Validate current state
     */
    const validate = useCallback((): boolean => {
      if (options?.onValidate) {
        const validationError = options.onValidate(values as T)
        if (validationError) {
          setError(validationError)
          return false
        }
      }

      setError('')
      return true
    }, [values, options])

    // Calculate group state
    const count = Object.values(values).filter((v) => v).length
    const isAllChecked = count === Object.keys(values).length && count > 0
    const isIndeterminate = count > 0 && count < Object.keys(values).length

    return {
      values,
      isDirty,
      isTouched,
      error,
      isValid,
      count,
      isAllChecked,
      isIndeterminate,
      handlers: {
        onChange: handleChange,
        setValues,
        isChecked,
        toggle,
        toggleAll,
        uncheckAll,
        checkAll,
        reset,
        touch,
        validate,
        setError,
        clearError: () => setError(''),
      },
    }
  }
}

export default useCheckbox
