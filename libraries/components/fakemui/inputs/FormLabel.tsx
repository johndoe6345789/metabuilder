import React from 'react'

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  testId?: string
  children?: React.ReactNode
  required?: boolean
}

export const FormLabel: React.FC<FormLabelProps> = ({ children, required, testId, className = '', ...props }) => (
  <label className={`form-label ${required ? 'form-label--required' : ''} ${className}`} data-testid={testId} {...props}>
    {children}
  </label>
)
