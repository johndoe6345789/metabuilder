import React, { forwardRef, useId } from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/form.module.scss'

/**
 * Valid input sizes
 */
export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  testId?: string
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
      testId,
      className = '',
      id: idProp,
      'aria-describedby': ariaDescribedBy,
      ...restProps
    } = props

    const generatedId = useId()
    const id = idProp ?? generatedId
    const helperId = `${id}-helper`
    const errorId = `${id}-error`

    const classes = classNames(
      styles.input,
      getSizeClass(props) && styles[getSizeClass(props).replace('input--', 'input')],
      error && styles.inputError,
      fullWidth && styles.inputFullWidth,
      className
    )

    // Build aria-describedby
    const describedByParts: string[] = []
    if (ariaDescribedBy) describedByParts.push(ariaDescribedBy)
    if (error && errorMessage) describedByParts.push(errorId)
    if (helperText && !error) describedByParts.push(helperId)
    const describedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined

    const inputElement = (
      <div className={classNames(styles.inputWrapper, fullWidth && styles.inputWrapperFullWidth)}>
        {startAdornment && <span className={classNames(styles.inputAdornment, styles.inputAdornmentStart)}>{startAdornment}</span>}
        <input
          ref={ref}
          id={id}
          className={classes}
          aria-invalid={error}
          aria-describedby={describedBy}
          data-testid={testId}
          {...restProps}
        />
        {endAdornment && <span className={classNames(styles.inputAdornment, styles.inputAdornmentEnd)}>{endAdornment}</span>}
      </div>
    )

    // If no label or helper text, return just the input
    if (!label && !helperText && !errorMessage) {
      return inputElement
    }

    return (
      <div className={classNames(styles.inputField, fullWidth && styles.inputFieldFullWidth)}>
        {label && (
          <label htmlFor={id} className={styles.inputLabel}>
            {label}
            {restProps.required && <span className={styles.inputRequired} aria-hidden="true"> *</span>}
          </label>
        )}
        {inputElement}
        {error && errorMessage && (
          <span id={errorId} className={styles.inputErrorMessage} role="alert">
            {errorMessage}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className={styles.inputHelperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
