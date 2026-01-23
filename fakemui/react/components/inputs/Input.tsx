import React, { forwardRef, useId } from 'react'

/**
 * Valid input sizes
 */
export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: InputSize
  /** @deprecated Use size="sm" instead */
  sm?: boolean
  /** @deprecated Use size="md" instead */
  md?: boolean
  /** @deprecated Use size="lg" instead */
  lg?: boolean
  /** Error state styling */
  error?: boolean
  /** Error message to display */
  errorMessage?: string
  /** Label for the input */
  label?: string
  /** Helper text displayed below input */
  helperText?: string
  /** Full width input */
  fullWidth?: boolean
  /** Start adornment element */
  startAdornment?: React.ReactNode
  /** End adornment element */
  endAdornment?: React.ReactNode
}

/**
 * Get size class from props
 */
const getSizeClass = (props: InputProps): string => {
  if (props.size) return `input--${props.size}`
  if (props.sm) return 'input--sm'
  if (props.lg) return 'input--lg'
  if (props.md) return 'input--md'
  return ''
}

/**
 * Input component with label and error support
 * 
 * @example
 * ```tsx
 * <Input label="Email" type="email" placeholder="Enter email" />
 * <Input error errorMessage="This field is required" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const {
      size,
      sm,
      md,
      lg,
      error,
      errorMessage,
      label,
      helperText,
      fullWidth,
      startAdornment,
      endAdornment,
      className = '',
      id: idProp,
      'aria-describedby': ariaDescribedBy,
      ...restProps
    } = props

    const generatedId = useId()
    const id = idProp ?? generatedId
    const helperId = `${id}-helper`
    const errorId = `${id}-error`

    const classes = [
      'input',
      getSizeClass(props),
      error ? 'input--error' : '',
      fullWidth ? 'input--full-width' : '',
      startAdornment ? 'input--has-start' : '',
      endAdornment ? 'input--has-end' : '',
      className,
    ].filter(Boolean).join(' ')

    // Build aria-describedby
    const describedByParts: string[] = []
    if (ariaDescribedBy) describedByParts.push(ariaDescribedBy)
    if (error && errorMessage) describedByParts.push(errorId)
    if (helperText && !error) describedByParts.push(helperId)
    const describedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined

    const inputElement = (
      <div className={`input-wrapper ${fullWidth ? 'input-wrapper--full-width' : ''}`}>
        {startAdornment && <span className="input__adornment input__adornment--start">{startAdornment}</span>}
        <input
          ref={ref}
          id={id}
          className={classes}
          aria-invalid={error}
          aria-describedby={describedBy}
          {...restProps}
        />
        {endAdornment && <span className="input__adornment input__adornment--end">{endAdornment}</span>}
      </div>
    )

    // If no label or helper text, return just the input
    if (!label && !helperText && !errorMessage) {
      return inputElement
    }

    return (
      <div className={`input-field ${fullWidth ? 'input-field--full-width' : ''}`}>
        {label && (
          <label htmlFor={id} className="input__label">
            {label}
            {restProps.required && <span className="input__required" aria-hidden="true"> *</span>}
          </label>
        )}
        {inputElement}
        {error && errorMessage && (
          <span id={errorId} className="input__error-message" role="alert">
            {errorMessage}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className="input__helper-text">
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
