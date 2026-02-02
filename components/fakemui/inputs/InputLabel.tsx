'use client'

import React, { forwardRef } from 'react'
import { useFormControl } from './FormControl'

/**
 * Props for InputLabel component (MUI-compatible)
 */
export interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode
  /** Whether the label should be shrunk (positioned above the input) */
  shrink?: boolean
  /** Whether the field is required - shows asterisk */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field has an error */
  error?: boolean
  /** Visual variant */
  variant?: 'standard' | 'outlined' | 'filled'
  /** Size of the label */
  size?: 'small' | 'medium'
  /** MUI sx prop for styling compatibility */
  sx?: Record<string, unknown>
}

/**
 * InputLabel - A label component for form inputs (MUI-compatible)
 *
 * @example
 * ```tsx
 * <FormControl>
 *   <InputLabel>Email</InputLabel>
 *   <Select value={value} onChange={handleChange}>
 *     <MenuItem value="one">One</MenuItem>
 *   </Select>
 * </FormControl>
 * ```
 */
export const InputLabel = forwardRef<HTMLLabelElement, InputLabelProps>(
  (
    {
      children,
      shrink = false,
      required: requiredProp,
      disabled: disabledProp,
      error: errorProp,
      variant = 'outlined',
      size = 'medium',
      className = '',
      sx,
      ...props
    },
    ref
  ) => {
    // Get context from FormControl if available
    const formControl = useFormControl()

    const required = requiredProp ?? formControl.required
    const disabled = disabledProp ?? formControl.disabled
    const error = errorProp ?? formControl.error
    const id = formControl.id

    return (
      <label
        ref={ref}
        htmlFor={id}
        className={`
          input-label
          input-label--${variant}
          input-label--${size}
          ${shrink ? 'input-label--shrink' : ''}
          ${required ? 'input-label--required' : ''}
          ${disabled ? 'input-label--disabled' : ''}
          ${error ? 'input-label--error' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {children}
        {required && <span className="input-label__asterisk">&nbsp;*</span>}
      </label>
    )
  }
)

InputLabel.displayName = 'InputLabel'
