'use client'

/**
 * useValidation Hook
 *
 * Generic schema-based validation wrapper supporting multiple validation libraries.
 * Provides centralized validation logic with field-level error tracking.
 *
 * @example
 * const schema = {
 *   username: (value) => value.length >= 3 ? '' : 'Min 3 chars',
 *   email: (value) => validateEmail(value)
 * }
 *
 * const { errors, isValid, validate, validateField, clearErrors } = useValidation(schema)
 *
 * validate({ username: 'john', email: 'john@example.com' })
 */

import { useCallback, useState } from 'react'

/**
 * Validation schema type: field -> validator function
 * Validator function receives field value and returns error string or empty string
 */
export type ValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: (value: T[K]) => string
}

/**
 * Validation errors by field
 */
export type ValidationErrors<T extends Record<string, any>> = Partial<Record<keyof T, string>>

interface UseValidationReturn<T extends Record<string, any>> {
  errors: ValidationErrors<T>
  isValid: boolean
  hasError: (field: keyof T) => boolean
  getFieldError: (field: keyof T) => string | undefined
  validate: (data: Partial<T>) => boolean
  validateField: (field: keyof T, value: T[keyof T]) => boolean
  setFieldError: (field: keyof T, error: string) => void
  setErrors: (errors: ValidationErrors<T>) => void
  clearError: (field: keyof T) => void
  clearErrors: () => void
}

/**
 * Hook for schema-based form validation
 *
 * @param schema Validation schema with field validators
 * @returns Validation state and handlers
 */
export function useValidation<T extends Record<string, any>>(
  schema: ValidationSchema<T>
): UseValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationErrors<T>>({})

  // Determine if form is valid (no errors)
  const isValid = Object.keys(errors).length === 0

  /**
   * Check if a specific field has an error
   */
  const hasError = useCallback(
    (field: keyof T): boolean => {
      return Boolean(errors[field])
    },
    [errors]
  )

  /**
   * Get error message for a specific field
   */
  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return errors[field]
    },
    [errors]
  )

  /**
   * Validate a single field against its validator
   */
  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): boolean => {
      const validator = schema[field]

      if (!validator) {
        // No validator defined for this field - consider it valid
        return true
      }

      try {
        const error = validator(value)

        if (error) {
          setErrors((prev) => ({
            ...prev,
            [field]: error,
          }))
          return false
        } else {
          // Clear error if validation passes
          setErrors((prev) => {
            const next = { ...prev }
            delete next[field]
            return next
          })
          return true
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Validation error'
        setErrors((prev) => ({
          ...prev,
          [field]: errorMessage,
        }))
        return false
      }
    },
    [schema]
  )

  /**
   * Validate entire data object against schema
   */
  const validate = useCallback(
    (data: Partial<T>): boolean => {
      const newErrors: ValidationErrors<T> = {}

      for (const field in schema) {
        const value = data[field]

        if (value !== undefined) {
          const validator = schema[field]

          if (validator) {
            try {
              const error = validator(value)
              if (error) {
                newErrors[field] = error
              }
            } catch (err) {
              newErrors[field] = err instanceof Error ? err.message : 'Validation error'
            }
          }
        }
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [schema]
  )

  /**
   * Set error for a specific field
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }))
  }, [])

  /**
   * Clear error for a specific field
   */
  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  return {
    errors,
    isValid,
    hasError,
    getFieldError,
    validate,
    validateField,
    setFieldError,
    setErrors,
    clearError,
    clearErrors,
  }
}

export default useValidation
