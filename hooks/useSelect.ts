'use client'

/**
 * useSelect Hook
 *
 * Manages select/dropdown state for single and multi-select inputs.
 * Handles value state, change events, option filtering, and validation.
 *
 * @example
 * // Single select
 * const { value, onChange, reset } = useSelect('', {
 *   options: [{ value: 'a', label: 'Option A' }]
 * })
 *
 * // Multi-select
 * const { values, onChange, isSelected, toggleOption } = useSelect([], {
 *   options: [{ value: 'a', label: 'Option A' }],
 *   isMulti: true
 * })
 */

import { ChangeEvent, useCallback, useState } from 'react'

/**
 * Option structure
 */
export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
  group?: string
}

/**
 * Configuration options for select hook
 */
interface UseSelectOptions<T, Multiple extends boolean = false> {
  /** Available options */
  options: SelectOption<T>[]
  /** Enable multi-select */
  isMulti?: Multiple
  /** Callback when value changes */
  onChange?: (value: Multiple extends true ? T[] : T) => void
  /** Validation function - returns error string or empty string */
  onValidate?: (value: Multiple extends true ? T[] : T) => string
  /** Allow clearing selection */
  clearable?: boolean
  /** Allow searching/filtering options */
  searchable?: boolean
}

/**
 * State for single select
 */
interface UseSelectSingleState<T> {
  value: T | null
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
  searchTerm: string
  filteredOptions: SelectOption<T>[]
}

/**
 * State for multi-select
 */
interface UseSelectMultiState<T> {
  values: T[]
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
  searchTerm: string
  filteredOptions: SelectOption<T>[]
  count: number
}

/**
 * Handlers for single select
 */
interface UseSelectSingleHandlers<T> {
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  setValue: (value: T | null) => void
  clear: () => void
  reset: () => void
  touch: () => void
  validate: () => boolean
  setError: (error: string) => void
  clearError: () => void
  setSearchTerm: (term: string) => void
  getOptionLabel: (value: T | null) => string
}

/**
 * Handlers for multi-select
 */
interface UseSelectMultiHandlers<T> {
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  setValues: (values: T[]) => void
  isSelected: (value: T) => boolean
  toggleOption: (value: T) => void
  addOption: (value: T) => void
  removeOption: (value: T) => void
  clearAll: () => void
  reset: () => void
  touch: () => void
  validate: () => boolean
  setError: (error: string) => void
  clearError: () => void
  setSearchTerm: (term: string) => void
}

/**
 * Single select return type
 */
interface UseSelectSingleReturn<T> extends UseSelectSingleState<T> {
  handlers: UseSelectSingleHandlers<T>
}

/**
 * Multi-select return type
 */
interface UseSelectMultiReturn<T> extends UseSelectMultiState<T> {
  handlers: UseSelectMultiHandlers<T>
}

/**
 * Hook for managing single select state
 */
export function useSelect<T = string>(
  initialValue: T | null,
  options: UseSelectOptions<T, false>
): UseSelectSingleReturn<T>

/**
 * Hook for managing multi-select state
 */
export function useSelect<T = string>(
  initialValue: T[],
  options: UseSelectOptions<T, true>
): UseSelectMultiReturn<T>

/**
 * Implementation
 */
export function useSelect<T = string, Multiple extends boolean = false>(
  initialValue: Multiple extends true ? T[] : T | null,
  options: UseSelectOptions<T, Multiple>
): UseSelectSingleReturn<T> | UseSelectMultiReturn<T> {
  const isMulti = options.isMulti ?? false
  const [value, setValue] = useState<Multiple extends true ? T[] : T | null>(initialValue)
  const [isDirty, setIsDirty] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const isValid = !error

  /**
   * Filter options based on search term
   */
  const getFilteredOptions = useCallback((): SelectOption<T>[] => {
    if (!options.searchable || !searchTerm) {
      return options.options
    }

    const lowerSearch = searchTerm.toLowerCase()
    return options.options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerSearch) ||
        String(opt.value).toLowerCase().includes(lowerSearch)
    )
  }, [options.options, options.searchable, searchTerm])

  /**
   * Get label for a value
   */
  const getOptionLabel = useCallback(
    (val: T | null): string => {
      if (val === null) return ''
      const option = options.options.find((opt) => opt.value === val)
      return option?.label ?? String(val)
    },
    [options.options]
  )

  if (isMulti) {
    const values = value as T[]

    /**
     * Handle multi-select change
     */
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (opt) => {
          // Find the actual value from options
          const matchedOption = options.options.find((o) => o.label === opt.value)
          return matchedOption ? matchedOption.value : (opt.value as T)
        })

        setValue(selectedOptions as any)
        setIsDirty(JSON.stringify(selectedOptions) !== JSON.stringify(initialValue))

        // Clear error when user makes a change
        if (error) {
          setError('')
        }

        // Validate if validator provided
        if (options.onValidate) {
          const validationError = options.onValidate(selectedOptions as any)
          if (validationError) {
            setError(validationError)
          }
        }

        // Call user's onChange callback
        options.onChange?.(selectedOptions as any)
      },
      [initialValue, error, options]
    )

    /**
     * Set values programmatically
     */
    const setValues = useCallback(
      (newValues: T[]) => {
        setValue(newValues as any)
        setIsDirty(JSON.stringify(newValues) !== JSON.stringify(initialValue))
      },
      [initialValue]
    )

    /**
     * Check if a value is selected
     */
    const isSelected = useCallback(
      (val: T): boolean => {
        return values.includes(val)
      },
      [values]
    )

    /**
     * Toggle a value
     */
    const toggleOption = useCallback(
      (val: T) => {
        const newValues = isSelected(val) ? values.filter((v) => v !== val) : [...values, val]

        setValues(newValues)
        options.onChange?.(newValues as any)
      },
      [values, isSelected, setValues, options]
    )

    /**
     * Add a value
     */
    const addOption = useCallback(
      (val: T) => {
        if (!isSelected(val)) {
          const newValues = [...values, val]
          setValues(newValues)
          options.onChange?.(newValues as any)
        }
      },
      [values, isSelected, setValues, options]
    )

    /**
     * Remove a value
     */
    const removeOption = useCallback(
      (val: T) => {
        if (isSelected(val)) {
          const newValues = values.filter((v) => v !== val)
          setValues(newValues)
          options.onChange?.(newValues as any)
        }
      },
      [values, isSelected, setValues, options]
    )

    /**
     * Clear all selections
     */
    const clearAll = useCallback(() => {
      setValues([])
      options.onChange?.([] as any)
    }, [setValues, options])

    /**
     * Reset to initial state
     */
    const reset = useCallback(() => {
      setValue(initialValue as any)
      setIsDirty(false)
      setIsTouched(false)
      setError('')
      setSearchTerm('')
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
      if (options.onValidate) {
        const validationError = options.onValidate(values as any)
        if (validationError) {
          setError(validationError)
          return false
        }
      }

      setError('')
      return true
    }, [values, options])

    return {
      values,
      isDirty,
      isTouched,
      error,
      isValid,
      searchTerm,
      filteredOptions: getFilteredOptions(),
      count: values.length,
      handlers: {
        onChange: handleChange,
        setValues,
        isSelected,
        toggleOption,
        addOption,
        removeOption,
        clearAll,
        reset,
        touch,
        validate,
        setError,
        clearError: () => setError(''),
        setSearchTerm,
      },
    }
  } else {
    const singleValue = value as T | null

    /**
     * Handle single select change
     */
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value

        // Find the actual value from options
        const matchedOption = options.options.find((o) => o.label === selectedValue)
        const newValue: T | null = matchedOption ? matchedOption.value : (selectedValue as T)

        setValue(newValue as any)
        setIsDirty(newValue !== initialValue)

        // Clear error when user makes a change
        if (error) {
          setError('')
        }

        // Validate if validator provided
        if (options.onValidate) {
          const validationError = options.onValidate(newValue as any)
          if (validationError) {
            setError(validationError)
          }
        }

        // Call user's onChange callback
        options.onChange?.(newValue as any)
      },
      [initialValue, error, options]
    )

    /**
     * Set value programmatically
     */
    const setProgrammaticValue = useCallback(
      (newValue: T | null) => {
        setValue(newValue as any)
        setIsDirty(newValue !== initialValue)
      },
      [initialValue]
    )

    /**
     * Clear selection
     */
    const clear = useCallback(() => {
      setProgrammaticValue(null)
      options.onChange?.(null as any)
    }, [setProgrammaticValue, options])

    /**
     * Reset to initial state
     */
    const reset = useCallback(() => {
      setValue(initialValue as any)
      setIsDirty(false)
      setIsTouched(false)
      setError('')
      setSearchTerm('')
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
      if (options.onValidate) {
        const validationError = options.onValidate(singleValue as any)
        if (validationError) {
          setError(validationError)
          return false
        }
      }

      setError('')
      return true
    }, [singleValue, options])

    return {
      value: singleValue,
      isDirty,
      isTouched,
      error,
      isValid,
      searchTerm,
      filteredOptions: getFilteredOptions(),
      handlers: {
        onChange: handleChange,
        setValue: setProgrammaticValue,
        clear,
        reset,
        touch,
        validate,
        setError,
        clearError: () => setError(''),
        setSearchTerm,
        getOptionLabel,
      },
    }
  }
}

export default useSelect
