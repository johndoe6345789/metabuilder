import React from 'react'

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  testId?: string
  children?: React.ReactNode
  row?: boolean
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, row, testId, className = '', ...props }) => (
  <div className={`form-group ${row ? 'form-group--row' : ''} ${className}`} role="group" data-testid={testId} {...props}>
    {children}
  </div>
)
