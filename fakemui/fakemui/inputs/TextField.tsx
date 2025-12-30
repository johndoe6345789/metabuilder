import React, { forwardRef } from 'react'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'
import { Input, InputProps } from './Input'

export interface TextFieldProps extends InputProps {
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: boolean
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, helperText, error, className = '', ...props }, ref) => (
    <div className={`text-field ${error ? 'text-field--error' : ''} ${className}`}>
      {label && <FormLabel>{label}</FormLabel>}
      <Input ref={ref} error={error} {...props} />
      {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
    </div>
  )
)

TextField.displayName = 'TextField'
