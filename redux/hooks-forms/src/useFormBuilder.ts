/**
 * useFormBuilder Hook
 * Complete form state management with validation and field array support
 *
 * Features:
 * - Strongly typed form state
 * - Field-level and form-level validation
 * - Touched/dirty tracking per field
 * - Field array operations (add, remove, reorder)
 * - Submit state and error handling
 * - Reset to initial values
 * - Optimized re-renders with field selectors
 *
 * @example
 * const form = useFormBuilder<LoginForm>({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (values) => {
 *     await loginApi(values)
 *   },
 *   validation: (values) => {
 *     const errors: ValidationErrors<LoginForm> = {}
 *     if (!values.email) errors.email = 'Email required'
 *     if (values.password.length < 8) errors.password = 'Min 8 chars'
 *     return errors
 *   }
 * })
 *
 * // In component:
 * <input
 *   value={form.values.email}
 *   onChange={(e) => form.setFieldValue('email', e.target.value)}
 *   onBlur={() => form.setFieldTouched('email')}
 * />
 * {form.touched.email && form.errors.email && (
 *   <span>{form.errors.email}</span>
 * )}
 * <button onClick={form.submit} disabled={form.isSubmitting}>
 *   {form.isSubmitting ? 'Loading...' : 'Submit'}
 * </button>
 */

import { useCallback, useState, useRef } from 'react'

export type ValidationErrors<T> = Partial<Record<keyof T, string>>

export interface FormFieldArray<T> {
  values: T[]
  add: (value: T) => void
  remove: (index: number) => void
  insert: (index: number, value: T) => void
  move: (fromIndex: number, toIndex: number) => void
  clear: () => void
}

export interface UseFormBuilderOptions<T> {
  /** Initial form values */
  initialValues: T
  /** Function to validate form - return errors object */
  validation?: (values: T) => ValidationErrors<T>
  /** Called on form submission */
  onSubmit: (values: T) => Promise<void> | void
  /** Validate on blur - default true */
  validateOnBlur?: boolean
  /** Validate on change - default false */
  validateOnChange?: boolean
}

export interface UseFormBuilderReturn<T> {
  // Values
  values: T
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void
  setValues: (values: Partial<T>) => void

  // Errors
  errors: ValidationErrors<T>
  getFieldError: <K extends keyof T>(field: K) => string | undefined
  hasError: <K extends keyof T>(field: K) => boolean

  // Touched state
  touched: Partial<Record<keyof T, boolean>>
  setFieldTouched: <K extends keyof T>(field: K, isTouched?: boolean) => void
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void

  // Dirty state
  isDirty: boolean
  dirty: Partial<Record<keyof T, boolean>>
  resetField: <K extends keyof T>(field: K) => void

  // Submission
  submit: () => Promise<void>
  isSubmitting: boolean
  submitError: string | null

  // Form state
  reset: () => void
  isValid: boolean
  isValidating: boolean

  // Field array helpers
  getFieldArray: <K extends keyof T>(
    field: K
  ) => FormFieldArray<any>
}

export function useFormBuilder<T extends Record<string, any>>(
  options: UseFormBuilderOptions<T>
): UseFormBuilderReturn<T> {
  const {
    initialValues,
    validation,
    onSubmit,
    validateOnBlur = true,
    validateOnChange = false,
  } = options

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationErrors<T>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const initialValuesRef = useRef(initialValues)

  // Validation
  const validate = useCallback(
    (valuesToValidate: T = values): ValidationErrors<T> => {
      if (!validation) return {}
      setIsValidating(true)
      const validationErrors = validation(valuesToValidate)
      setIsValidating(false)
      return validationErrors
    },
    [validation, values]
  )

  // Field value change
  const handleSetFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }))

      if (validateOnChange) {
        const newValues = { ...values, [field]: value }
        const newErrors = validate(newValues)
        setErrors(newErrors)
      }
    },
    [validateOnChange, validate, values]
  )

  // Bulk set values
  const handleSetValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }))
  }, [])

  // Mark field as touched
  const handleSetFieldTouched = useCallback(
    <K extends keyof T>(field: K, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [field]: isTouched }))

      if (validateOnBlur && isTouched) {
        const newErrors = validate()
        setErrors(newErrors)
      }
    },
    [validateOnBlur, validate]
  )

  // Mark multiple fields as touched
  const handleSetTouched = useCallback((newTouched: Partial<Record<keyof T, boolean>>) => {
    setTouched((prev) => ({ ...prev, ...newTouched }))
  }, [])

  // Reset field to initial value
  const handleResetField = useCallback(<K extends keyof T>(field: K) => {
    setValues((prev) => ({
      ...prev,
      [field]: initialValuesRef.current[field],
    }))
    setTouched((prev) => ({ ...prev, [field]: false }))
  }, [])

  // Reset entire form
  const handleReset = useCallback(() => {
    setValues(initialValuesRef.current)
    setErrors({})
    setTouched({})
    setSubmitError(null)
  }, [])

  // Submit form
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Validate before submit
      const validationErrors = validate(values)
      setErrors(validationErrors)
      setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}))

      // Stop if validation failed
      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false)
        return
      }

      // Call submit handler
      await onSubmit(values)
      setIsSubmitting(false)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed')
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  // Get field array helper
  const getFieldArray = useCallback(
    <K extends keyof T>(field: K): FormFieldArray<T[K][number]> => {
      const fieldValue = values[field]

      if (!Array.isArray(fieldValue)) {
        throw new Error(`Field ${String(field)} is not an array`)
      }

      return {
        values: fieldValue,
        add: (value) => {
          handleSetFieldValue(field, [...fieldValue, value] as T[K])
        },
        remove: (index) => {
          handleSetFieldValue(
            field,
            fieldValue.filter((_item: unknown, i: number) => i !== index) as T[K]
          )
        },
        insert: (index, value) => {
          const newArray = [...fieldValue]
          newArray.splice(index, 0, value)
          handleSetFieldValue(field, newArray as T[K])
        },
        move: (fromIndex, toIndex) => {
          const newArray = [...fieldValue]
          const [removed] = newArray.splice(fromIndex, 1)
          newArray.splice(toIndex, 0, removed)
          handleSetFieldValue(field, newArray as T[K])
        },
        clear: () => {
          handleSetFieldValue(field, [] as T[K])
        },
      }
    },
    [values, handleSetFieldValue]
  )

  // Dirty tracking
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current)
  const dirty = Object.keys(values).reduce((acc, key) => {
    const k = key as keyof T
    acc[k] = values[k] !== initialValuesRef.current[k]
    return acc
  }, {} as Partial<Record<keyof T, boolean>>)

  // Validity
  const isValid = Object.keys(errors).length === 0

  return {
    values,
    setFieldValue: handleSetFieldValue,
    setValues: handleSetValues,
    errors,
    getFieldError: (field) => errors[field],
    hasError: (field) => Boolean(errors[field]),
    touched,
    setFieldTouched: handleSetFieldTouched,
    setTouched: handleSetTouched,
    isDirty,
    dirty,
    resetField: handleResetField,
    submit: handleSubmit,
    isSubmitting,
    submitError,
    reset: handleReset,
    isValid,
    isValidating,
    getFieldArray,
  }
}
