import { useState, useCallback } from 'react'

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean
  message: string
}

export interface FieldConfig<T = any> {
  name: string
  defaultValue?: T
  rules?: ValidationRule<T>[]
}

export function useFormField<T = any>(config: FieldConfig<T>) {
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

export interface FormConfig {
  fields: Record<string, FieldConfig>
  onSubmit?: (values: Record<string, any>) => void | Promise<void>
}

export function useForm(config: FormConfig) {
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
