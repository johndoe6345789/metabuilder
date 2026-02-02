import React from 'react'

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode
  required?: boolean
}

export const FormLabel: React.FC<FormLabelProps> = ({ children, required, className = '', ...props }) => (
  <label className={`form-label ${required ? 'form-label--required' : ''} ${className}`} {...props}>
    {children}
  </label>
)
