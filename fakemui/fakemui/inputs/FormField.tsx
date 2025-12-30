import React from 'react'

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
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
 * Compatible with Lua package declarative rendering
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
  className = '',
  ...props
}) => (
  <div
    className={`form-field ${error ? 'form-field--error' : ''} ${disabled ? 'form-field--disabled' : ''} ${fullWidth ? 'form-field--full-width' : ''} ${className}`}
    {...props}
  >
    {label && (
      <label className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
    )}
    <div className="form-field__control">
      {children}
    </div>
    {(helperText || errorMessage) && (
      <div className={`form-field__helper ${error ? 'form-field__helper--error' : ''}`}>
        {error ? errorMessage : helperText}
      </div>
    )}
  </div>
)

export default FormField
