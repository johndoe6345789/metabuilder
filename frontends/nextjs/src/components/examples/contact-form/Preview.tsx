import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from '@/components/ui'

import {
  contactFormConfig,
  ContactFormField,
  ContactFormState,
  createInitialContactFormState,
} from './FormConfig'

type ValidationErrors = Partial<Record<ContactFormField['name'], string>>

function validateContactForm(values: ContactFormState): ValidationErrors {
  const errors: ValidationErrors = {}
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  contactFormConfig.fields.forEach(field => {
    const value = values[field.name]?.trim() ?? ''

    if (field.required && !value) {
      errors[field.name] = `${field.label} is required`
      return
    }

    if (field.type === 'email' && value && !emailPattern.test(value)) {
      errors[field.name] = 'Enter a valid email address'
    }
  })

  return errors
}

export function ContactFormPreview() {
  const [formValues, setFormValues] = useState<ContactFormState>(
    createInitialContactFormState()
  )
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateContactForm(formValues)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSubmitted(false)
      return
    }

    setErrors({})
    setSubmitted(true)
    setFormValues(createInitialContactFormState())
    setTimeout(() => setSubmitted(false), 3200)
  }

  const renderField = (field: ContactFormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formValues[field.name],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = event.target
        setFormValues(current => ({ ...current, [field.name]: value }))
      },
      'aria-describedby': errors[field.name] ? `${field.name}-error` : undefined,
      placeholder: field.placeholder,
    }

    if (field.type === 'textarea') {
      return (
        <Textarea
          rows={4}
          {...commonProps}
        />
      )
    }

    return (
      <Input
        type={field.type}
        {...commonProps}
      />
    )
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{contactFormConfig.title}</CardTitle>
        <CardDescription>{contactFormConfig.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {contactFormConfig.fields.map(field => (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium" htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-600">*</span>}
                </label>
                {field.helperText && (
                  <span className="text-xs text-muted-foreground">{field.helperText}</span>
                )}
              </div>
              {renderField(field)}
              {errors[field.name] && (
                <p
                  id={`${field.name}-error`}
                  className="text-xs text-red-600"
                  role="alert"
                >
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Button className="w-full" type="submit">
              {contactFormConfig.submitLabel}
            </Button>
            {submitted && !hasErrors && (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <strong className="mr-1">{contactFormConfig.successTitle}.</strong>
                {contactFormConfig.successMessage}
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
