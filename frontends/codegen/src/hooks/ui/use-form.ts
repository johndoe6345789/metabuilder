import { useState, useCallback } from 'react'

export interface FormField {
  value: any
  error?: string
  touched: boolean
}

export interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit?: (values: T) => void | Promise<void>
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const { initialValues, validate, onSubmit } = options

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }))
  }, [])

  const handleChange = useCallback((field: keyof T) => (event: any) => {
    const value = event.target?.value ?? event
    setValue(field, value)
  }, [setValue])

  const handleBlur = useCallback((field: keyof T) => () => {
    setFieldTouched(field, true)
    
    if (validate) {
      const validationErrors = validate(values)
      if (validationErrors[field]) {
        setFieldError(field, validationErrors[field]!)
      } else {
        setErrors(prev => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    }
  }, [values, validate, setFieldTouched, setFieldError])

  const handleSubmit = useCallback(async (event?: any) => {
    event?.preventDefault?.()
    
    setIsSubmitting(true)
    
    const allTouched = Object.keys(initialValues).reduce((acc, key) => ({
      ...acc,
      [key]: true,
    }), {})
    setTouched(allTouched)
    
    if (validate) {
      const validationErrors = validate(values)
      setErrors(validationErrors)
      
      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false)
        return
      }
    }
    
    if (onSubmit) {
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }
    
    setIsSubmitting(false)
  }, [values, initialValues, validate, onSubmit])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field],
    onChange: handleChange(field),
    onBlur: handleBlur(field),
    error: touched[field] ? errors[field] : undefined,
  }), [values, touched, errors, handleChange, handleBlur])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
  }
}
