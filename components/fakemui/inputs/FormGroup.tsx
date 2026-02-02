import React from 'react'

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  row?: boolean
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, row, className = '', ...props }) => (
  <div className={`form-group ${row ? 'form-group--row' : ''} ${className}`} {...props}>
    {children}
  </div>
)
