// fakemui/react/components/email/inputs/EmailAddressInput.tsx
import React, { forwardRef } from 'react'
import { TextField, TextFieldProps } from '../../inputs/TextField'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface EmailAddressInputProps extends Omit<TextFieldProps, 'type'> {
  onValidate?: (valid: boolean) => void
  allowMultiple?: boolean
}

export const EmailAddressInput = forwardRef<HTMLInputElement, EmailAddressInputProps>(
  ({ onValidate, allowMultiple = false, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'email-input',
      identifier: customTestId || 'email'
    })

    const validateEmail = (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (allowMultiple) {
        const emails = value.split(',').map(e => e.trim())
        return emails.every(e => emailRegex.test(e) || e === '')
      }
      return emailRegex.test(value) || value === ''
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valid = validateEmail(e.target.value)
      onValidate?.(valid)
      props.onChange?.(e)
    }

    return (
      <TextField
        ref={ref}
        type="email"
        label={props.label || (allowMultiple ? 'Recipients' : 'Email Address')}
        placeholder={allowMultiple ? 'user@example.com, another@example.com' : 'user@example.com'}
        {...accessible}
        {...props}
        onChange={handleChange}
      />
    )
  }
)

EmailAddressInput.displayName = 'EmailAddressInput'
