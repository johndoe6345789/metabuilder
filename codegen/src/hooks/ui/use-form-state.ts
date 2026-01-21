import { useState, useCallback } from 'react'

export interface FormFieldConfig<T = any> {
  name: string
  defaultValue: T
  validate?: (value: T) => string | null
  required?: boolean
}

export interface FormState<T extends Record<string, any>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValid: boolean
  isDirty: boolean
}

export function useFormState<T extends Record<string, any>>(
  fields: FormFieldConfig[],
  initialValues?: Partial<T>
) {
  const defaultValues: any = fields.reduce((acc: any, field) => {
    acc[field.name] = initialValues?.[field.name] ?? field.defaultValue
    return acc
  }, {})

  const [state, setState] = useState<FormState<T>>({
    values: defaultValues,
    errors: {},
    touched: {},
    isValid: true,
    isDirty: false,
  })

  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const field = fields.find((f) => f.name === name)
      if (!field) return null

      if (field.required && !value) {
        return 'This field is required'
      }

      if (field.validate) {
        return field.validate(value)
      }

      return null
    },
    [fields]
  )

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    fields.forEach((field) => {
      const error = validateField(field.name as keyof T, state.values[field.name])
      if (error) {
        newErrors[field.name as keyof T] = error
        isValid = false
      }
    })

    setState((prev) => ({ ...prev, errors: newErrors, isValid }))
    return isValid
  }, [fields, state.values, validateField])

  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setState((prev) => {
        const newValues = { ...prev.values, [name]: value }
        const error = validateField(name, value)
        const newErrors = { ...prev.errors }

        if (error) {
          newErrors[name] = error
        } else {
          delete newErrors[name]
        }

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          isDirty: true,
          isValid: Object.keys(newErrors).length === 0,
        }
      })
    },
    [validateField]
  )

  const setTouched = useCallback((name: keyof T) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      values: defaultValues,
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false,
    })
  }, [defaultValues])

  const setValues = useCallback((newValues: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, ...newValues },
      isDirty: true,
    }))
  }, [])

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isDirty: state.isDirty,
    setValue,
    setTouched,
    setValues,
    reset,
    validateAll,
  }
}
