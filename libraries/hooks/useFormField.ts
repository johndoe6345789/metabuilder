/**
 * useFormField Hook
 * Individual form field state management with validation
 *
 * @example
 * const emailField = useFormField({
 *   name: 'email',
 *   defaultValue: '',
 *   rules: [
 *     { validate: (v) => v.length > 0, message: 'Email is required' },
 *     { validate: (v) => v.includes('@'), message: 'Invalid email format' }
 *   ]
 * })
 *
 * <input
 *   value={emailField.value}
 *   onChange={(e) => emailField.onChange(e.target.value)}
 *   onBlur={emailField.onBlur}
 * />
 * {emailField.error && <span className="error">{emailField.error}</span>}
 */

import { useState, useCallback } from 'react'

export interface ValidationRule<T = any> {
  /** Validation function returning true if valid */
  validate: (value: T) => boolean
  /** Error message to display when validation fails */
  message: string
}

export interface FieldConfig<T = any> {
  /** Field name identifier */
  name: string
  /** Default/initial value */
  defaultValue?: T
  /** Array of validation rules */
  rules?: ValidationRule<T>[]
}

export interface UseFormFieldReturn<T> {
  /** Current field value */
  value: T | undefined
  /** Current error message, or null if valid */
  error: string | null
  /** Whether the field has been touched (blurred) */
  touched: boolean
  /** Handle value change */
  onChange: (newValue: T) => void
  /** Handle blur event */
  onBlur: () => void
  /** Reset field to initial state */
  reset: () => void
  /** Validate the field and return validity */
  validate: () => boolean
  /** Whether the field is currently valid */
  isValid: boolean
  /** Whether the value differs from default */
  isDirty: boolean
}

/**
 * Hook for managing individual form field state
 * @param config - Field configuration
 * @returns Object containing field state and control methods
 */
export function useFormField<T = any>(config: FieldConfig<T>): UseFormFieldReturn<T> {
  const [value, setValue] = useState<T | undefined>(config.defaultValue)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const validate = useCallback(() => {
    if (!config.rules || !touched) return true

    for (const rule of config.rules) {
      if (!rule.validate(value as T)) {
        setError(rule.message)
        return false
      }
    }
    setError(null)
    return true
  }, [value, config.rules, touched])

  const onChange = useCallback((newValue: T) => {
    setValue(newValue)
    if (touched) {
      setError(null)
    }
  }, [touched])

  const onBlur = useCallback(() => {
    setTouched(true)
    validate()
  }, [validate])

  const reset = useCallback(() => {
    setValue(config.defaultValue)
    setError(null)
    setTouched(false)
  }, [config.defaultValue])

  return {
    value,
    error,
    touched,
    onChange,
    onBlur,
    reset,
    validate,
    isValid: error === null,
    isDirty: value !== config.defaultValue,
  }
}

/**
 * useForm Hook
 * Form submission state management
 */
export interface FormConfig {
  /** Field configurations keyed by field name */
  fields: Record<string, FieldConfig>
  /** Submit handler */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>
}

export interface UseFormReturn {
  /** Submit the form */
  submit: (values: Record<string, any>) => Promise<void>
  /** Whether form is currently submitting */
  isSubmitting: boolean
}

/**
 * Hook for managing form submission state
 * @param config - Form configuration
 * @returns Object containing form state and submit method
 */
export function useForm(config: FormConfig): UseFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(async (values: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      await config.onSubmit?.(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [config])

  return {
    submit,
    isSubmitting,
  }
}
