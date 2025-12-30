import React, { forwardRef, useId } from 'react'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'
import { Input, InputProps } from './Input'

export interface TextFieldProps extends InputProps {
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: boolean
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, helperText, error, className = '', id: providedId, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId ?? generatedId
    
    return (
      <div className={`text-field ${error ? 'text-field--error' : ''} ${className}`}>
        {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
        <Input ref={ref} id={id} error={error} {...props} />
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
      </div>
    )
  }
)

TextField.displayName = 'TextField'
