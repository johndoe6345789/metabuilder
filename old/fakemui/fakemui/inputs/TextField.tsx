import React, { forwardRef, useId } from 'react'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'
import { Input, InputProps } from './Input'
import { Select } from './Select'

export interface TextFieldProps extends Omit<InputProps, 'size' | 'label' | 'helperText'> {
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: boolean
  /** Render as a select dropdown instead of input */
  select?: boolean
  /** Children (for select mode - MenuItem components) */
  children?: React.ReactNode
  /** Input size */
  size?: 'small' | 'medium'
}

export const TextField = forwardRef<HTMLInputElement | HTMLSelectElement, TextFieldProps>(
  ({ label, helperText, error, className = '', id: providedId, select, children, size, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId ?? generatedId
    
    // Convert size prop to Input's expected format
    const inputSize = size === 'small' ? 'sm' : size === 'medium' ? 'md' : undefined
    
    return (
      <div className={`text-field ${error ? 'text-field--error' : ''} ${className}`}>
        {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
        {select ? (
          <Select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={id}
            error={error}
            className="select--full-width"
            {...(props as unknown as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {children}
          </Select>
        ) : (
          <Input ref={ref as React.Ref<HTMLInputElement>} id={id} error={error} size={inputSize} {...props} />
        )}
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
      </div>
    )
  }
)

TextField.displayName = 'TextField'
