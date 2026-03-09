import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/form.module.scss'

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  testId?: string
  children?: React.ReactNode
  label?: string
  helperText?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

/**
 * FormField wraps form inputs with label, helper text, and error handling
 * Compatible with declarative package rendering
 */
export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  helperText,
  error,
  errorMessage,
  required,
  disabled,
  fullWidth,
  testId,
  className = '',
  ...props
}) => (
  <div
    className={classNames(
      styles.formField,
      error && styles.formFieldError,
      disabled && styles.formFieldDisabled,
      fullWidth && styles.formFieldFullWidth,
      className
    )}
    data-testid={testId}
    {...props}
  >
    {label && (
      <label className={styles.formFieldLabel}>
        {label}
        {required && <span className={styles.formFieldRequired}>*</span>}
      </label>
    )}
    <div className={styles.formFieldControl}>
      {children}
    </div>
    {(helperText || errorMessage) && (
      <div className={classNames(styles.formFieldHelper, error && styles.formFieldHelperError)}>
        {error ? errorMessage : helperText}
      </div>
    )}
  </div>
)

export default FormField
