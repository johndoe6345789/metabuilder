import React, { forwardRef, useId } from 'react'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'
import { Input, InputProps } from './Input'
import { Select } from './Select'
import { useAccessible } from '../../../src/utils/useAccessible'

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
  /** Unique identifier for testing and accessibility */
  testId?: string
}

export const TextField = forwardRef<HTMLInputElement | HTMLSelectElement, TextFieldProps>(
  ({ label, helperText, error, className = '', id: providedId, select, children, size, testId: customTestId, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId ?? generatedId
    const helperTextId = `${id}-helper-text`

    // Convert size prop to Input's expected format
    const inputSize = size === 'small' ? 'sm' : size === 'medium' ? 'md' : undefined

    const accessible = useAccessible({
      feature: 'form',
      component: select ? 'select' : 'input',
      identifier: customTestId || String(label)?.substring(0, 20),
      ariaDescribedBy: helperText ? helperTextId : undefined,
    })

    return (
      <div className={`text-field ${error ? 'text-field--error' : ''} ${className}`}>
        {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
        {select ? (
          <Select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={id}
            error={error}
            className="select--full-width"
            data-testid={accessible['data-testid']}
            aria-invalid={error}
            aria-describedby={helperText ? helperTextId : undefined}
            {...(props as unknown as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {children}
          </Select>
        ) : (
          <Input
            ref={ref as React.Ref<HTMLInputElement>}
            id={id}
            error={error}
            size={inputSize}
            data-testid={accessible['data-testid']}
            aria-invalid={error}
            aria-describedby={helperText ? helperTextId : undefined}
            {...props}
          />
        )}
        {helperText && (
          <FormHelperText error={error} id={helperTextId} role="status">
            {helperText}
          </FormHelperText>
        )}
      </div>
    )
  }
)

TextField.displayName = 'TextField'
